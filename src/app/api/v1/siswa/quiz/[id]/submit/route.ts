import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { quizAttempt, quizPublished, quizSession, soalPublished, siswaKursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { cacheGet, cacheDel } from "@/lib/cache-layer";
import { appendEvent } from "@/lib/event-store";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { soal } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { processQuizResults } from "@/lib/analytics/quiz-processor";

export const runtime = "nodejs";

const SubmitSchema = z.object({
  durasiDetik: z.number().int().min(0).max(60 * 60 * 4),
  jawaban: z.record(
    z.string(),
    z.union([z.string(), z.array(z.string())]).optional(),
  ),
  waktuJawabMs: z.record(z.string(), z.number()).optional(),
});

function hitungWaktuJawabPerSoal(
  soals: { id: string }[],
  waktuJawabMs: Record<string, number> | undefined,
  durasiDetik: number,
): Record<string, number> {
  const estimasi = Math.round(durasiDetik / Math.max(1, soals.length));
  const fallback: Record<string, number> = {};
  for (const s of soals) {
    fallback[s.id] = Math.max(1, estimasi);
  }
  const entries = soals
    .map((s) => ({ id: s.id, ts: waktuJawabMs?.[s.id] }))
    .filter(
      (e): e is { id: string; ts: number } =>
        typeof e.ts === "number" && Number.isFinite(e.ts) && e.ts > 0,
    );
  if (entries.length === 0) return fallback;
  entries.sort((a, b) => a.ts - b.ts);
  const durasiMs = durasiDetik * 1000;
  const hasil = { ...fallback };
  if (entries.length === 1) {
    hasil[entries[0].id] = Math.max(1, Math.round(durasiDetik));
    return hasil;
  }
  for (let i = 0; i < entries.length; i++) {
    const cur = entries[i];
    const next = entries[i + 1];
    const durasiMsSoal = next ? next.ts - cur.ts : durasiMs - cur.ts;
    hasil[cur.id] = Math.max(1, Math.round(durasiMsSoal / 1000));
  }
  return hasil;
}

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

    // Fetch original soal records for algorithm data
    const soalIds = ((quiz as any).soalIds as string[]) || [];
    const soalRecords = soalIds.length > 0
      ? await db.select().from(soal).where(inArray(soal.id, soalIds))
      : [];
    const soalMap = new Map(soalRecords.map(s => [s.id, s]));

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
    const startKey = `quiz:start:${session.userId}:${id}`;
    const serverStartAt = await cacheGet<number>(startKey);
    if (serverStartAt) {
      const elapsed = Math.floor((Date.now() - serverStartAt) / 1000);
      if (elapsed > maxDuration) {
        await cacheDel(startKey);
        return apiError("Waktu pengerjaan sudah habis", 400);
      }
    }
    if (parsed.data.durasiDetik > maxDuration) {
      return apiError("Waktu pengerjaan melebihi batas evaluasi", 400);
    }

    await cacheDel(startKey);

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
      const userAnswer = parsed.data.jawaban[s.id];
      const correctAnswer = s.kunci;
      let isCorrect = false;
      if (s.tipe === "PG") {
        totalPoin += s.poin || 1;
        isCorrect = typeof userAnswer === "string" && userAnswer.toUpperCase() === correctAnswer.toUpperCase();
      } else if (s.tipe === "ISIAN") {
        totalPoin += s.poin || 1;
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
      } else if (s.tipe === "PG" || s.tipe === "ISIAN") {
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

    const attemptStatus = quiz.modeEvaluasi === "BELAJAR" ? "BELAJAR" : "SELESAI";

    const [attempt] = await db
      .insert(quizAttempt)
      .values({
        quizPublishedId: id,
        siswaId: session.userId!,
        status: attemptStatus,
        nilai,
        jumlahBenar,
        jumlahSalah,
        waktuMulai: new Date(Date.now() - parsed.data.durasiDetik * 1000),
        waktuSelesai: new Date(),
        durasiDetik: parsed.data.durasiDetik,
        jawaban: parsed.data.jawaban,
      })
      .returning();

    // Fire-and-forget: process quiz results for analytics
    const waktuJawabMap = hitungWaktuJawabPerSoal(
      soals,
      parsed.data.waktuJawabMs,
      parsed.data.durasiDetik,
    );
    const answersForProcessor = soals.map((s, i) => {
      const soalId = soalIds[i];
      const soalRecord = soalId ? soalMap.get(soalId) : null;
      const userAnswer = parsed.data.jawaban[s.id];
      let isCorrect = false;
      if (s.tipe === "PG") {
        isCorrect = typeof userAnswer === "string" && userAnswer.toUpperCase() === s.kunci.toUpperCase();
      } else if (s.tipe === "ISIAN") {
        const u = typeof userAnswer === "string" ? userAnswer.trim().toLowerCase() : "";
        const c = s.kunci.trim().toLowerCase();
        isCorrect = u === c;
      }
      return {
        soalId: soalId || s.id,
        isCorrect,
        jawabanSiswa: typeof userAnswer === "string" ? userAnswer : JSON.stringify(userAnswer || ""),
        waktuJawabDetik: waktuJawabMap[s.id],
        irtA: soalRecord?.irtA ?? 1.0,
        irtB: soalRecord?.irtB ?? 0.0,
        irtC: soalRecord?.irtC ?? 0.25,
        eloRating: soalRecord?.eloRating ?? 1000,
        skillId: soalRecord?.skillId ?? null,
      };
    });

    // Buat quizSession row untuk analytics FK
    const [quizSessionRow] = await db
      .insert(quizSession)
      .values({
        kursusId: quiz.kursusId,
        judul: `Sesi ${quiz.judul}`,
        durasiMenit: Math.ceil(parsed.data.durasiDetik / 60),
        soalIds: Object.keys(parsed.data.jawaban),
        isActive: false,
        createdAt: new Date(),
      })
      .returning();

    after(() => {
      processQuizResults({
        siswaId: session.userId!,
        kursusId: quiz.kursusId,
        quizSessionId: quizSessionRow.id,
        answers: answersForProcessor,
        totalSoal: soals.length,
      }).catch(err => console.error("Quiz processor failed:", err));
    });
    // invalidate analytics cache (TTL 30s already, but clear stale guru entries on new attempt)
    after(async () => {
      try {
        const { getRedis } = await import("@/lib/redis");
        const r = getRedis();
        if (!r) return;
        const keys = await (r as unknown as { keys: (p: string) => Promise<string[]> }).keys("cache:analytics:guru:*");
        if (keys.length) await r.del(...keys);
      } catch {}
    });

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
        // PATCH: kunci jawaban HANYA untuk mode BELAJAR (formatif). ULANGAN/CBT = sumatif,
        // kunci tidak boleh dibocorkan ke siswa.
        jawabanBenar: quiz.modeEvaluasi === "BELAJAR" ? jawabanBenar : undefined,
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
