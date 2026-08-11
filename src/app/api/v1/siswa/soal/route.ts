import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { soalPublished, siswaKursus, kursus, aiGeneration, jawabanLog } from "@/lib/db/schema";
import { and, eq, isNull, count, inArray } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);
    const rl = await checkRateLimit(`siswa-soal:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const enrolled = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")));

    if (enrolled.length === 0) {
      return NextResponse.json({ data: [] }, { headers: { "Cache-Control": "private, max-age=30" } });
    }

    const enrolledIds = enrolled.map((e) => e.kursusId!).filter(Boolean);

    const batches = await db
      .select({
        aiGenerationId: soalPublished.aiGenerationId,
        kursusJudul: kursus.judul,
        totalSoal: count(soalPublished.id),
      })
      .from(soalPublished)
      .innerJoin(aiGeneration, eq(aiGeneration.id, soalPublished.aiGenerationId))
      .innerJoin(kursus, eq(kursus.id, aiGeneration.kursusId))
      .where(
        and(
          isNull(soalPublished.quizPublishedId),
        ),
      )
      .groupBy(soalPublished.aiGenerationId, kursus.judul);

    // Filter by enrolled courses
    const filtered = [];
    const batchIds: string[] = [];
    for (const b of batches) {
      const [ag] = await db
        .select({ kursusId: aiGeneration.kursusId })
        .from(aiGeneration)
        .where(eq(aiGeneration.id, b.aiGenerationId))
        .limit(1);
      if (ag && ag.kursusId && enrolledIds.includes(ag.kursusId)) {
        // Get the materi judul as the batch name
        const [materi] = await db
          .select({ judul: aiGeneration.materiJudul })
          .from(aiGeneration)
          .where(eq(aiGeneration.id, b.aiGenerationId))
          .limit(1);

        batchIds.push(b.aiGenerationId);
        filtered.push({
          aiGenerationId: b.aiGenerationId,
          judul: materi?.judul ? `Soal: ${materi.judul}` : "Soal Latihan",
          kursusJudul: b.kursusJudul,
          totalSoal: Number(b.totalSoal),
          sudahDikerjakan: 0,
          nilaiTerbaik: 0,
          publishedAt: new Date().toISOString(),
        });
      }
    }

    // Aggregate student answers across all batches in one query
    if (batchIds.length > 0) {
      const answers = await db
        .select({
          aiGenerationId: soalPublished.aiGenerationId,
          soalId: jawabanLog.soalId,
          isBenar: jawabanLog.isBenar,
        })
        .from(jawabanLog)
        .innerJoin(soalPublished, eq(soalPublished.id, jawabanLog.soalId))
        .where(
          and(
            eq(jawabanLog.siswaId, session.userId!),
            isNull(soalPublished.quizPublishedId),
            inArray(soalPublished.aiGenerationId, batchIds),
          ),
        );

      const stats = new Map<string, { answered: Set<string>; correct: Set<string> }>();
      for (const a of answers) {
        let s = stats.get(a.aiGenerationId);
        if (!s) {
          s = { answered: new Set<string>(), correct: new Set<string>() };
          stats.set(a.aiGenerationId, s);
        }
        s.answered.add(a.soalId);
        if (a.isBenar) s.correct.add(a.soalId);
      }

      for (const f of filtered) {
        const s = stats.get(f.aiGenerationId);
        f.sudahDikerjakan = s ? s.answered.size : 0;
        f.nilaiTerbaik = s && s.answered.size > 0 ? Math.round((100 * s.correct.size) / s.answered.size) : 0;
      }
    }

    return NextResponse.json(
      { data: filtered },
      { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } }
    );
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Soal list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}