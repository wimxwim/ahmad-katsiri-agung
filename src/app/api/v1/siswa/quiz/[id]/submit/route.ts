import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { quizAttempt, quizPublished, soalPublished, siswaKursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";

const SubmitSchema = z.object({
  durasiDetik: z.number().int().min(0).max(60 * 60 * 4),
  jawaban: z.record(
    z.string(),
    z.union([z.string(), z.array(z.string())]).optional(),
  ),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
    const session = await requireSiswa(request);

    const { id } = await params;
    const rl = await checkRateLimit(`siswa-quiz-submit:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [quiz] = await db
      .select()
      .from(quizPublished)
      .where(eq(quizPublished.id, id))
      .limit(1);
    if (!quiz) return apiError("Kuis tidak ditemukan", 404);

    const [enroll] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, quiz.kursusId),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enroll) return apiError("Anda belum terdaftar di kursus ini", 403);

    const body = await request.json();
    const parsed = SubmitSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);
    }

    if (quiz.modeEvaluasi === "CBT" || quiz.modeEvaluasi === "ULANGAN") {
      const [existingAttempt] = await db
        .select({ id: quizAttempt.id })
        .from(quizAttempt)
        .where(
          and(
            eq(quizAttempt.siswaId, session.userId!),
            eq(quizAttempt.quizPublishedId, id),
            eq(quizAttempt.status, "SELESAI"),
          ),
        )
        .limit(1);
      if (existingAttempt) return apiError("Evaluasi ini sudah dikerjakan", 409);
    }

    const maxDuration = quiz.durasiMenit * 60 + 60;
    if (parsed.data.durasiDetik > maxDuration) {
      return apiError("Waktu pengerjaan melebihi batas evaluasi", 400);
    }

    const soals = await db
      .select()
      .from(soalPublished)
      .where(eq(soalPublished.quizPublishedId, id));

    let jumlahBenar = 0;
    let jumlahSalah = 0;
    let totalPoin = 0;
    let totalPoinDiperoleh = 0;
    let essayCount = 0;
    const weakAreas: number[] = [];

    for (const s of soals) {
      const questionNumber = s.urutan || soals.indexOf(s) + 1;
      totalPoin += s.poin || 1;
      const userAnswer = parsed.data.jawaban[s.id];
      const correctAnswer = s.kunci;
      let isCorrect = false;
      if (s.tipe === "PG") {
        isCorrect = typeof userAnswer === "string" && userAnswer === correctAnswer;
      } else if (s.tipe === "ISIAN") {
        const u = typeof userAnswer === "string" ? userAnswer.trim().toLowerCase() : "";
        const c = correctAnswer.trim().toLowerCase();
        isCorrect = u === c;
      } else {
        essayCount += 1;
        isCorrect = false;
      }
      if (isCorrect) {
        jumlahBenar += 1;
        totalPoinDiperoleh += s.poin || 1;
      } else if (s.tipe !== "PG" && s.tipe !== "ISIAN") {
        jumlahSalah += 0;
      } else {
        jumlahSalah += 1;
        weakAreas.push(questionNumber);
      }
    }

    const nilai = totalPoin > 0 ? Math.round((totalPoinDiperoleh / totalPoin) * 100) : 0;

    const recommendation =
      nilai >= 80
        ? "Luar biasa! Kamu sudah menguasai materi ini. Coba materi selanjutnya."
        : nilai >= 60
          ? "Bagus! Sedikit lagi. Coba ulangi materi yang masih salah."
          : "Semangat! Yuk pelajari lagi materinya. Jangan menyerah!";

    const jawabanBenar: Record<string, string> = {};
    for (const s of soals) {
      jawabanBenar[s.id] = s.kunci;
    }

    const [attempt] = await db
      .insert(quizAttempt)
      .values({
        quizPublishedId: id,
        siswaId: session.userId!,
        status: "SELESAI",
        nilai,
        jumlahBenar,
        jumlahSalah,
        waktuMulai: new Date(Date.now() - parsed.data.durasiDetik * 1000),
        waktuSelesai: new Date(),
        durasiDetik: parsed.data.durasiDetik,
        jawaban: parsed.data.jawaban,
      })
      .returning();

    await appendEvent(`quiz:${id}`, "quiz.attempt_submitted", {
      siswaId: session.userId,
      attemptId: attempt.id,
      nilai,
      mode: quiz.modeEvaluasi,
    });

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        nilai,
        jumlahBenar,
        jumlahSalah,
        totalSoal: soals.length,
        mode: quiz.modeEvaluasi,
        essayCount,
        needsManualReview: essayCount > 0,
        tampilkanNilai: quiz.modeEvaluasi !== "CBT",
        jawabanBenar: quiz.modeEvaluasi !== "CBT" ? jawabanBenar : undefined,
        recommendation,
        weakAreas,
        timeSpent: parsed.data.durasiDetik,
        materialLink: {
          url: "/siswa/materi",
          label: "Pelajari ulang materi",
        },
        ringkasan: essayCount > 0
          ? `Kamu menjawab ${jumlahBenar} dari ${soals.length - essayCount} soal PG/ISIAN dengan benar. ${essayCount} essay menunggu penilaian guru.`
          : `Kamu menjawab ${jumlahBenar} dari ${soals.length} soal dengan benar.`,
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Quiz submit error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
