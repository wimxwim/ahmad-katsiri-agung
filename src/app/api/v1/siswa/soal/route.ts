import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { soalPublished, siswaKursus, kursus, aiGeneration } from "@/lib/db/schema";
import { and, eq, isNull, count } from "drizzle-orm";
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

        filtered.push({
          aiGenerationId: b.aiGenerationId,
          judul: materi?.judul ? `Soal: ${materi.judul}` : "Soal Latihan",
          kursusJudul: b.kursusJudul,
          totalSoal: Number(b.totalSoal),
          sudahDikerjakan: 0,
          publishedAt: new Date().toISOString(),
        });
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