import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { eq, and, lt, isNull, or } from "drizzle-orm";
import { apiError } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
  const ip = ipFromRequest(request);
  const rl = await checkRateLimit(`cron:${ip}`, 10, 60000);
  if (!rl.allowed) return apiError("Rate limit", 429);
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return apiError("CRON_SECRET tidak dikonfigurasi", 500);
  }
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return apiError("Unauthorized", 401);
  }

  const now = new Date();
  const results: Record<string, number> = {};

  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const stuckQueued = await db
    .update(aiGeneration)
    .set({
      status: "failed",
      errorMessage: "[CRON CLEANUP] Stuck in queued > 24 jam",
      leaseUntil: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(aiGeneration.status, "queued"),
        lt(aiGeneration.createdAt, oneDayAgo),
      ),
    );
  results["stuck_queued→failed"] = stuckQueued.rowCount ?? 0;

  const stuckGenerating = await db
    .update(aiGeneration)
    .set({
      status: "failed",
      errorMessage: "[CRON CLEANUP] Stuck in generating > 24 jam",
      leaseUntil: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(aiGeneration.status, "generating"),
        lt(aiGeneration.updatedAt, oneDayAgo),
      ),
    );
  results["stuck_generating→failed"] = stuckGenerating.rowCount ?? 0;

  const stuckExtracting = await db
    .update(aiGeneration)
    .set({
      status: "failed",
      errorMessage: "[CRON CLEANUP] Stuck in extracting > 24 jam",
      leaseUntil: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(aiGeneration.status, "extracting"),
        lt(aiGeneration.updatedAt, oneDayAgo),
      ),
    );
  results["stuck_extracting→failed"] = stuckExtracting.rowCount ?? 0;

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const deletedFailed = await db
    .delete(aiGeneration)
    .where(
      and(
        eq(aiGeneration.status, "failed"),
        lt(aiGeneration.updatedAt, sevenDaysAgo),
      ),
    );
  results["deleted_failed_7d"] = deletedFailed.rowCount ?? 0;

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const deletedOrphanFiles = await db
    .delete(fileMateri)
    .where(
      and(
        or(
          eq(fileMateri.status, "uploading"),
          eq(fileMateri.status, "extracting"),
        ),
        lt(fileMateri.createdAt, oneDayAgo),
        isNull(fileMateri.extractionText),
      ),
    );
  results["deleted_orphan_files"] = deletedOrphanFiles.rowCount ?? 0;

  const deletedOldFiles = await db
    .delete(fileMateri)
    .where(
      and(
        lt(fileMateri.createdAt, thirtyDaysAgo),
        isNull(fileMateri.extractionText),
      ),
    );
  results["deleted_old_empty_files"] = deletedOldFiles.rowCount ?? 0;

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    results,
  });
  } catch (e) {
    console.error("Cleanup cron error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}