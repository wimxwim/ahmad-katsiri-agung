import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, materiDiskusi, materiPublished } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`guru-diskusi:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const rows = await db
      .select({
        id: materiDiskusi.id,
        materiId: materiDiskusi.materiId,
        aiGenerationId: aiGeneration.id,
        userName: materiDiskusi.userName,
        role: materiDiskusi.role,
        pertanyaan: materiDiskusi.pertanyaan,
        jawaban: materiDiskusi.jawaban,
        createdAt: materiDiskusi.createdAt,
        judulMateri: materiPublished.judul,
      })
      .from(materiDiskusi)
      .innerJoin(materiPublished, eq(materiDiskusi.materiId, materiPublished.id))
      .innerJoin(aiGeneration, eq(materiPublished.aiGenerationId, aiGeneration.id))
      .where(eq(aiGeneration.guruId, session.userId))
      .orderBy(
        sql`${materiDiskusi.jawaban} IS NULL DESC`,
        desc(materiDiskusi.createdAt),
      );

    const belumDijawab = rows.filter((r) => r.jawaban === null).length;

    return NextResponse.json(
      { data: rows, total: rows.length, belumDijawab },
      { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } },
    );
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru diskusi error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}