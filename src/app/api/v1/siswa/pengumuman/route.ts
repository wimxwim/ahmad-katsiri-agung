import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { pengumuman, siswaKursus, users } from "@/lib/db/schema";
import { desc, eq, inArray, or } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success) return apiError("Sesi tidak valid", 401);
    const session = _ar.data;
    if (session.role !== "murid" && session.role !== "orang_tua") {
      return apiError("Hanya siswa yang dapat melihat pengumuman", 403);
    }

    const rl = await checkRateLimit(`siswa-pengumuman:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(eq(siswaKursus.siswaId, session.userId!));
    const enrolledIds = enrollments.map((e) => e.kursusId);

    if (enrolledIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const rows = await db
      .select({
        id: pengumuman.id,
        judul: pengumuman.judul,
        konten: pengumuman.konten,
        target: pengumuman.target,
        kursusId: pengumuman.kursusId,
        guruId: pengumuman.guruId,
        publishedAt: pengumuman.publishedAt,
        isPinned: pengumuman.isPinned,
        guruNama: users.nama,
      })
      .from(pengumuman)
      .leftJoin(users, eq(pengumuman.guruId, users.id))
      .where(
        or(
          eq(pengumuman.target, "SEMUA"),
          inArray(pengumuman.kursusId, enrolledIds),
        ),
      )
      .orderBy(desc(pengumuman.isPinned), desc(pengumuman.publishedAt))
      .limit(20);

    return NextResponse.json({ data: rows });
  } catch (e) {
    console.error("Siswa pengumuman error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
