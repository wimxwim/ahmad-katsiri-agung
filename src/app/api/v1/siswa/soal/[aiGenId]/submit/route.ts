import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { soalPublished, siswaKursus, aiGeneration, quizSession, jawabanLog } from "@/lib/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { processQuizResults } from "@/lib/analytics/quiz-processor";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ aiGenId: string }> },
) {
  try {
    const session = await requireSiswa(request);
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { aiGenId } = await params;
    const rl = await checkRateLimit(`siswa-soal-submit:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [ag] = await db
      .select({ id: aiGeneration.id, kursusId: aiGeneration.kursusId })
      .from(aiGeneration)
      .where(eq(aiGeneration.id, aiGenId))
      .limit(1);
    if (!ag) return apiError("Batch soal tidak ditemukan", 404);

    const [enrolled] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, ag.kursusId!),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enrolled) return apiError("Anda belum terdaftar di kursus ini", 403);

    const body = await request.json().catch(() => ({}));
    const jawaban: Record<string, string> = body.jawaban || {};

    const soals = await db
      .select({ id: soalPublished.id, kunci: soalPublished.kunci })
      .from(soalPublished)
      .where(
        and(
          eq(soalPublished.aiGenerationId, aiGenId),
          isNull(soalPublished.quizPublishedId),
        ),
      )
      .orderBy(asc(soalPublished.urutan));

    let benar = 0;
    let salah = 0;
    const detail = soals.map((s) => {
      const jwb = jawaban[s.id] || "";
      const correct = jwb === s.kunci;
      if (correct) benar++;
      else salah++;
      return { soalId: s.id, jawaban: jwb, kunci: s.kunci, benar: correct };
    });

    const nilai = soals.length > 0 ? Math.round((benar / soals.length) * 100) : 0;

    // Step 1: INSERT quizSession
    const [qs] = await db
      .insert(quizSession)
      .values({
        kursusId: ag.kursusId!,
        judul: `Latihan Soal`,
        durasiMenit: 0,
        soalIds: soals.map(s => s.id),
        isActive: false,
        createdAt: new Date(),
      })
      .returning();

    // Step 2: INSERT jawaban_log (batch 50)
    const jawabanLogEntries = soals.map((s) => {
      const jwb = jawaban[s.id] || "";
      return {
        siswaId: session.userId!,
        soalId: s.id,
        jawabanSiswa: jwb,
        isBenar: jwb === s.kunci,
        waktuJawabDetik: 0,
        quizSessionId: qs.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    for (let i = 0; i < jawabanLogEntries.length; i += 50) {
      await db.insert(jawabanLog).values(jawabanLogEntries.slice(i, i + 50));
    }

    // Step 3: processQuizResults (fire-and-forget)
    const answersForProcessor = soals.map((s) => {
      const jwb = jawaban[s.id] || "";
      return {
        soalId: s.id,
        isCorrect: jwb === s.kunci,
        jawabanSiswa: jwb,
        waktuJawabDetik: 0,
        irtA: 1.0,
        irtB: 0.0,
        irtC: 0.25,
        eloRating: 1000,
        skillId: null as string | null,
      };
    });

    processQuizResults({
      siswaId: session.userId!,
      kursusId: ag.kursusId!,
      quizSessionId: qs.id,
      answers: answersForProcessor,
    }).catch(err => console.error("Soal practice processor failed:", err));

    return NextResponse.json({
      data: { nilai, jumlahBenar: benar, jumlahSalah: salah, totalSoal: soals.length, detail },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Soal submit error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}