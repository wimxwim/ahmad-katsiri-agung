import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, kursus, siswaKursus, quizPublished, quizAttempt, jawabanLog, soalPublished, aiGeneration } from "@/lib/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
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

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .innerJoin(kursus, and(
        eq(siswaKursus.kursusId, kursus.id),
        eq(kursus.guruId, session.userId!)
      ))
      .where(
        and(
          eq(siswaKursus.siswaId, id),
          eq(siswaKursus.status, "AKTIF"),
        ),
      );

    const enrolledKursusIds = enrollments.map((e) => e.kursusId);

    if (enrolledKursusIds.length === 0) {
      return apiError("Siswa tidak terdaftar di kursus Anda", 403);
    }

    const enrolledKursus = await db
      .select({ id: kursus.id, judul: kursus.judul })
      .from(kursus)
      .where(inArray(kursus.id, enrolledKursusIds));

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

    const completedAttempts = attempts.filter((a) => a.status === "SELESAI" || a.status === "BELAJAR");
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

    // Soal paling sering salah siswa ini (hanya dari jawaban milik guru yang sama)
    const seringSalah = quizPubIds.length
      ? await db
          .select({
            soalId: jawabanLog.soalId,
            pertanyaan: soalPublished.pertanyaan,
            tipe: soalPublished.tipe,
            materiJudul: aiGeneration.materiJudul,
            totalJawab: sql<number>`cast(count(*) as integer)`,
            totalBenar: sql<number>`cast(sum(case when ${jawabanLog.isBenar} then 1 else 0 end) as integer)`,
            totalSalah: sql<number>`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as integer)`,
          })
          .from(jawabanLog)
          .innerJoin(soalPublished, eq(jawabanLog.soalId, soalPublished.id))
          .innerJoin(aiGeneration, eq(soalPublished.aiGenerationId, aiGeneration.id))
          .where(
            and(
              eq(jawabanLog.siswaId, id),
              eq(aiGeneration.guruId, session.userId!),
            ),
          )
          .groupBy(
            jawabanLog.soalId,
            soalPublished.pertanyaan,
            soalPublished.tipe,
            aiGeneration.materiJudul,
          )
          .having(sql`sum(case when ${jawabanLog.isBenar} then 0 else 1 end) > 0`)
          .orderBy(
            desc(sql`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as integer)`),
          )
          .limit(5)
      : [];

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
        seringSalah: seringSalah.map((s) => ({
          soalId: s.soalId,
          pertanyaan: s.pertanyaan,
          tipe: s.tipe,
          materiJudul: s.materiJudul,
          totalJawab: s.totalJawab,
          totalBenar: s.totalBenar,
          totalSalah: s.totalSalah,
          errorRate: s.totalJawab > 0 ? Math.round((s.totalSalah / s.totalJawab) * 100) : 0,
        })),
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru siswa detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
