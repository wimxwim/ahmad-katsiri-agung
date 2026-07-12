import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { users, siswaKursus, materiPublished, materiRead, quizAttempt, quizPublished, pengumuman } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);
    const siswaId = session.userId;

    const rl = await checkRateLimitPerUser(`ortu-dashboard:${siswaId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [siswaData] = await db
      .select({ nama: users.nama, kelas: users.kelas })
      .from(users)
      .where(eq(users.id, siswaId))
      .limit(1);

    if (!siswaData) {
      return NextResponse.json({ data: null });
    }

    const enrolledKursus = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(eq(siswaKursus.siswaId, siswaId));

    const kursusIds = enrolledKursus.map((k) => k.kursusId);

    let totalMateri = 0;
    let totalSelesai = 0;

    if (kursusIds.length > 0) {
      const [mt] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(materiPublished)
        .where(sql`${materiPublished.kursusId} = any(${kursusIds})`);
      totalMateri = mt?.count ?? 0;

      const [mr] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(materiRead)
        .where(eq(materiRead.siswaId, siswaId));
      totalSelesai = mr?.count ?? 0;
    }

    let nilaiRata: number | null = null;
    let quizTerakhir: { judul: string; nilai: number; tanggal: string } | null = null;

    if (kursusIds.length > 0) {
      const [nr] = await db
        .select({ avg: sql<number>`round(avg(${quizAttempt.nilai}))`.mapWith(Number) })
        .from(quizAttempt)
        .where(eq(quizAttempt.siswaId, siswaId));
      nilaiRata = nr?.avg ?? null;

      const [qt] = await db
        .select({
          judul: quizPublished.judul,
          nilai: quizAttempt.nilai,
          tanggal: quizAttempt.waktuMulai,
        })
        .from(quizAttempt)
        .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
        .where(eq(quizAttempt.siswaId, siswaId))
        .orderBy(desc(quizAttempt.waktuMulai))
        .limit(1);

      if (qt) {
        quizTerakhir = {
          judul: qt.judul,
          nilai: qt.nilai ?? 0,
          tanggal: qt.tanggal.toISOString(),
        };
      }
    }

    const pengumumanList = await db
      .select({
        id: pengumuman.id,
        judul: pengumuman.judul,
        ringkasan: pengumuman.konten,
        tanggal: pengumuman.publishedAt,
      })
      .from(pengumuman)
      .orderBy(desc(pengumuman.publishedAt))
      .limit(5);

    return NextResponse.json({
      data: {
        namaAnak: siswaData.nama || "Siswa",
        kelas: siswaData.kelas || "—",
        totalMateri,
        totalSelesai,
        nilaiRata,
        quizTerakhir,
        pengumuman: pengumumanList.map((p) => ({
          ...p,
          ringkasan: (p.ringkasan || "").slice(0, 150),
        })),
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Orang tua dashboard error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}