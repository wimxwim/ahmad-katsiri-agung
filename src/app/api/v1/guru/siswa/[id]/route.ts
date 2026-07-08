import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, kursus, siswaKursus, quizPublished, quizAttempt } from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

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
      return apiError("Hanya guru yang dapat melihat detail siswa", 403);
    }

    const rl = await checkRateLimit(`guru-siswa-detail:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [siswa] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.role, "SISWA")));

    if (!siswa) return apiError("Siswa tidak ditemukan", 404);

    const guruKursus = await db
      .select({ id: kursus.id, judul: kursus.judul })
      .from(kursus)
      .where(eq(kursus.guruId, session.userId!));

    const guruKursusIds = guruKursus.map((k) => k.id);

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, id),
          inArray(siswaKursus.kursusId, guruKursusIds),
          eq(siswaKursus.status, "AKTIF"),
        ),
      );

    const enrolledKursusIds = enrollments.map((e) => e.kursusId);
    const enrolledKursus = guruKursus.filter((k) => enrolledKursusIds.includes(k.id));

    const quizPubs = await db
      .select()
      .from(quizPublished)
      .where(inArray(quizPublished.kursusId, enrolledKursusIds));

    const quizPubIds = quizPubs.map((q) => q.id);

    const attempts = quizPubIds.length
      ? await db
          .select()
          .from(quizAttempt)
          .where(
            and(
              eq(quizAttempt.siswaId, id),
              inArray(quizAttempt.quizPublishedId, quizPubIds),
            ),
          )
          .orderBy(desc(quizAttempt.waktuMulai))
      : [];

    const completedAttempts = attempts.filter((a) => a.status === "SELESAI");
    const nilaiList = completedAttempts.map((a) => a.nilai).filter((n): n is number => n !== null);
    const rataNilai = nilaiList.length > 0
      ? Math.round(nilaiList.reduce((s, n) => s + n, 0) / nilaiList.length)
      : null;

    const KKM = 70;

    const attemptsEnriched = attempts.map((a) => {
      const quiz = quizPubs.find((q) => q.id === a.quizPublishedId);
      const kursusInfo = quiz ? enrolledKursus.find((k) => k.id === quiz.kursusId) : null;
      return {
        id: a.id,
        quizJudul: quiz?.judul ?? "Kuis",
        kursusJudul: kursusInfo?.judul ?? null,
        modeEvaluasi: quiz?.modeEvaluasi ?? "BELAJAR",
        nilai: a.nilai,
        jumlahBenar: a.jumlahBenar,
        jumlahSalah: a.jumlahSalah,
        durasiDetik: a.durasiDetik,
        waktuMulai: a.waktuMulai,
        status: a.status,
      };
    });

    return NextResponse.json({
      data: {
        siswa: {
          id: siswa.id,
          nama: siswa.nama,
          email: siswa.email,
          kelas: siswa.kelas,
          noAbsen: siswa.noAbsen,
        },
        kursus: enrolledKursus,
        totalAttempt: attempts.length,
        totalSelesai: completedAttempts.length,
        rataNilai,
        tuntas: rataNilai !== null ? rataNilai >= KKM : null,
        attempts: attemptsEnriched,
      },
    });
  } catch (e) {
    console.error("Guru siswa detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
