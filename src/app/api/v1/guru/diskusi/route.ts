import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, materiDiskusi, materiPublished } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { cacheGet, cacheSet } from "@/lib/cache-layer";

export const runtime = "nodejs";

const DiskusiQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`guru-diskusi:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const parsed = DiskusiQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Parameter tidak valid", 400);
    const { limit } = parsed.data;

    const cacheKey = `diskusi:guru:${session.userId}:limit:${limit}`;
    const cached = await cacheGet<{ data: unknown[]; total: number; belumDijawab: number }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } });
    }

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
      )
      .limit(100);

    // Apply requested limit (default 50) after hard cap 100
    const limited = rows.slice(0, Math.min(limit, 100));
    const belumDijawab = limited.filter((r) => r.jawaban === null).length;

    const result = { data: limited, total: limited.length, belumDijawab };
    await cacheSet(cacheKey, result, 15);
    return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru diskusi error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
