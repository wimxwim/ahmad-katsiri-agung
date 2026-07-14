import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { quizPublished, soalPublished, siswaKursus } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);
    const { id } = await params;
    const rl = await checkRateLimit(`siswa-quiz-detail:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [quiz] = await db
      .select({
        id: quizPublished.id,
        aiGenerationId: quizPublished.aiGenerationId,
        guruId: quizPublished.guruId,
        kursusId: quizPublished.kursusId,
        judul: quizPublished.judul,
        modeEvaluasi: quizPublished.modeEvaluasi,
        durasiMenit: quizPublished.durasiMenit,
        publishedAt: quizPublished.publishedAt,
      })
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

    const soals = await db
      .select({
        id: soalPublished.id,
        pertanyaan: soalPublished.pertanyaan,
        tipe: soalPublished.tipe,
        pilihanGanda: soalPublished.pilihanGanda,
        poin: soalPublished.poin,
        urutan: soalPublished.urutan,
      })
      .from(soalPublished)
      .where(eq(soalPublished.quizPublishedId, id))
      .orderBy(asc(soalPublished.urutan));

    const safe = soals.map((s) => ({
      id: s.id,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      pilihanGanda: s.pilihanGanda,
      poin: s.poin,
    }));

    return NextResponse.json({ data: { ...quiz, soal: safe } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Quiz detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
