import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kursus, siswaKursus } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { GuardError } from "@/lib/route-guard-v2";

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
    deskripsi: kursus.deskripsi, harga: kursus.harga, isPublic: kursus.isPublic,
    statusPublikasi: kursus.statusPublikasi, publishedAt: kursus.publishedAt,
    createdAt: kursus.createdAt, updatedAt: kursus.updatedAt,
  }).from(kursus).where(eq(kursus.id, id)).limit(1);
    if (!result.length) {
      return apiError("Kursus tidak ditemukan", 404);
    }
    const k = result[0];

    const isOwner = session?.role === "owner";
    const isGuruPemilik = session?.role === "guru" && k.guruId === session?.userId;
    const isSiswaPublic = session?.role === "murid" && k.isPublic;
    const isPublicCourse = k.isPublic && k.statusPublikasi === "PUBLIK";

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
    return NextResponse.json({ data: { ...k, enrolledCount, quizSelesaiCount } }, { headers: { "Cache-Control": cc, "Vary": "Cookie" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kursus detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
