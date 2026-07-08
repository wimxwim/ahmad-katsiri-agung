import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, kursus, siswaKursus, quizPublished, quizAttempt } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success) return apiError("Sesi tidak valid", 401);
    const session = _ar.data;
    if (session.role !== "guru" && session.role !== "owner") {
      return apiError("Hanya guru yang dapat melihat progres kursus", 403);
    }

    const rl = await checkRateLimit(`guru-kursus-progres:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id: kursusId } = await params;

    const [kursusData] = await db
      .select()
      .from(kursus)
      .where(and(eq(kursus.id, kursusId), eq(kursus.guruId, session.userId!)));

    if (!kursusData) return apiError("Kursus tidak ditemukan", 404);

    const enrolled = await db
      .select({ siswaId: siswaKursus.siswaId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.kursusId, kursusId), eq(siswaKursus.status, "AKTIF")));

    const siswaIds = enrolled.map((e) => e.siswaId);

    const siswaList = siswaIds.length
      ? await db
          .select({ id: users.id, nama: users.nama, kelas: users.kelas, noAbsen: users.noAbsen })
          .from(users)
          .where(inArray(users.id, siswaIds))
      : [];

    const quizPubs = await db
      .select()
      .from(quizPublished)
      .where(eq(quizPublished.kursusId, kursusId));

    const quizPubIds = quizPubs.map((q) => q.id);

    const allAttempts = quizPubIds.length
      ? await db
          .select()
          .from(quizAttempt)
          .where(inArray(quizAttempt.quizPublishedId, quizPubIds))
      : [];

    const KKM = 70;

    const siswaProgres = siswaList.map((s) => {
      const attempts = allAttempts.filter((a) => a.siswaId === s.id);
      const completed = attempts.filter((a) => a.status === "SELESAI");
      const nilaiList = completed.map((a) => a.nilai).filter((n): n is number => n !== null);
      const rataNilai = nilaiList.length > 0
        ? Math.round(nilaiList.reduce((sum, n) => sum + n, 0) / nilaiList.length)
        : null;

      return {
        siswaId: s.id,
        nama: s.nama,
        kelas: s.kelas,
        noAbsen: s.noAbsen,
        totalAttempt: attempts.length,
        totalSelesai: completed.length,
        rataNilai,
        tuntas: rataNilai !== null ? rataNilai >= KKM : false,
        latestAttempt: attempts.length > 0
          ? attempts.sort((a, b) => new Date(b.waktuMulai).getTime() - new Date(a.waktuMulai).getTime())[0].waktuMulai
          : null,
      };
    });

    siswaProgres.sort((a, b) => {
      if ((a.rataNilai ?? -1) !== (b.rataNilai ?? -1)) {
        return (a.rataNilai ?? -1) - (b.rataNilai ?? -1);
      }
      return a.nama.localeCompare(b.nama);
    });

    return NextResponse.json({
      data: {
        kursus: { id: kursusData.id, judul: kursusData.judul },
        totalSiswa: siswaList.length,
        totalQuiz: quizPubs.length,
        totalAttempt: allAttempts.length,
        siswaProgres,
      },
    });
  } catch (e) {
    console.error("Kursus progres error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
