import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { pengumuman, siswaKursus, users } from "@/lib/db/schema";
import { and, desc, eq, gte, inArray, isNull, or } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

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

    const now = new Date();

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
        and(
          or(eq(pengumuman.target, "SEMUA"), eq(pengumuman.target, "SISWA")),
          or(isNull(pengumuman.expiresAt), gte(pengumuman.expiresAt, now)),
          or(isNull(pengumuman.kursusId), inArray(pengumuman.kursusId, enrolledIds)),
        ),
      )
      .orderBy(desc(pengumuman.isPinned), desc(pengumuman.publishedAt))
      .limit(20);

    return NextResponse.json({ data: rows });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa pengumuman error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
