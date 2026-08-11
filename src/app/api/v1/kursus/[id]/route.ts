import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kursus, siswaKursus, users } from "@/lib/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { sanitizeText } from "@/lib/sanitize";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const sessionResult = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    const session = sessionResult?.success ? sessionResult.data : null;

    const uid = session?.userId || "anon";
    const rl = await checkRateLimit(`kursus-detail:${uid}`, 30, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return apiError("Format ID tidak valid", 400);
    }
    const result = await db.select({
    id: kursus.id, guruId: kursus.guruId, judul: kursus.judul, slug: kursus.slug,
    deskripsi: kursus.deskripsi, harga: kursus.harga,
    statusPublikasi: kursus.statusPublikasi, publishedAt: kursus.publishedAt,
    createdAt: kursus.createdAt, updatedAt: kursus.updatedAt,
  }).from(kursus).where(and(eq(kursus.id, id), isNull(kursus.deletedAt))).limit(1);
    if (!result.length) {
      return apiError("Kursus tidak ditemukan", 404);
    }
    const k = result[0];

    const isOwner = session?.role === "owner";
    const isGuruPemilik = session?.role === "guru" && k.guruId === session?.userId;
    const isSiswaPublic = session?.role === "murid" && k.statusPublikasi === "PUBLIK";
    const isPublicCourse = k.statusPublikasi === "PUBLIK";

    if (!isOwner && !isGuruPemilik && !isSiswaPublic && !isPublicCourse) {
      return apiError("Anda tidak punya akses ke kursus ini", 403);
    }

    let enrolledCount = 0;
    try {
      const [count] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(siswaKursus)
        .where(and(eq(siswaKursus.kursusId, id), eq(siswaKursus.status, "AKTIF")));
      enrolledCount = count?.count ?? 0;
    } catch (e) {
      console.error("enrolledCount query failed:", e);
    }

    let enrolledStudents: { siswaId: string; nama: string | null; email: string | null; status: string | null; tanggalDaftar: Date | null }[] = [];
    try {
      enrolledStudents = await db
        .select({
          siswaId: siswaKursus.siswaId,
          nama: users.nama,
          email: users.email,
          status: siswaKursus.status,
          tanggalDaftar: siswaKursus.tanggalDaftar,
        })
        .from(siswaKursus)
        .leftJoin(users, and(eq(siswaKursus.siswaId, users.id), isNull(users.deletedAt)))
        .where(and(eq(siswaKursus.kursusId, id), eq(siswaKursus.status, "AKTIF")));
    } catch (e) {
      console.error("enrolledStudents query failed:", e);
    }

    const sanitizedStudents =
      !isOwner && !isGuruPemilik
        ? enrolledStudents.map(({ email: _email, ...rest }) => rest)
        : enrolledStudents;

    let quizSelesaiCount = 0;
    try {
      const [count] = await db
        .select({ count: sql<number>`count(distinct ${siswaKursus.siswaId})::int` })
        .from(siswaKursus)
        .innerJoin(sql`quiz_attempt qa`, sql`qa.siswa_id = ${siswaKursus.siswaId}`)
        .where(and(eq(siswaKursus.kursusId, id), eq(siswaKursus.status, "AKTIF"), sql`qa.status IN ('SELESAI', 'BELAJAR')`));
      quizSelesaiCount = count?.count ?? 0;
    } catch (e) {
      console.error("quizSelesaiCount query failed:", e);
    }

    const cc = session ? "private, max-age=30, stale-while-revalidate=60" : "public, max-age=60, stale-while-revalidate=120";
    return NextResponse.json({ data: { ...k, enrolledCount, enrolledStudents: sanitizedStudents, quizSelesaiCount } }, { headers: { "Cache-Control": cc, "Vary": "Cookie" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kursus detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const { id } = await params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return apiError("Format ID tidak valid", 400);
    }

    const [existing] = await db
      .select({ id: kursus.id, guruId: kursus.guruId })
      .from(kursus)
      .where(eq(kursus.id, id))
      .limit(1);

    if (!existing) return apiError("Kursus tidak ditemukan", 404);
    if (existing.guruId !== session.userId && session.role !== "owner") {
      return apiError("Anda tidak punya akses ke kursus ini", 403);
    }

    const now = new Date();
    await db
      .update(kursus)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(kursus.id, id));

    return NextResponse.json({ success: true, data: { id, deletedAt: now.toISOString() } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kursus DELETE error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

const EditKursusSchema = z.object({
  judul: z.string().min(1).max(200).optional(),
  deskripsi: z.string().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const { id } = await params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return apiError("Format ID tidak valid", 400);
    }

    const body = await request.json();
    const parsed = EditKursusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const [existing] = await db
      .select({ id: kursus.id, guruId: kursus.guruId, judul: kursus.judul })
      .from(kursus)
      .where(eq(kursus.id, id))
      .limit(1);

    if (!existing) return apiError("Kursus tidak ditemukan", 404);
    if (existing.guruId !== session.userId && session.role !== "owner") {
      return apiError("Anda tidak punya akses ke kursus ini", 403);
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.judul !== undefined) {
      updateData.judul = sanitizeText(parsed.data.judul, 200);
    }
    if (parsed.data.deskripsi !== undefined) {
      updateData.deskripsi = sanitizeText(parsed.data.deskripsi, 500);
    }

    const [updated] = await db
      .update(kursus)
      .set(updateData)
      .where(eq(kursus.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kursus PATCH error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
