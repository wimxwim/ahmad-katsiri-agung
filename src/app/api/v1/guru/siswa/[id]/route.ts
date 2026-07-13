import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, kursus, siswaKursus, quizPublished, quizAttempt } from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireRole, GuardError } from "@/lib/route-guard-v2";
import { KKM } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole(request, ["guru", "owner"]);

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

    if (enrolledKursusIds.length === 0) {
      return apiError("Siswa tidak terdaftar di kursus Anda", 403);
    }

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
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru siswa detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
