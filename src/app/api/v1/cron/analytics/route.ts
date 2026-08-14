import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { refreshGuruAnalytics } from "@/lib/dashboard-cache";
import { apiError } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const ip = ipFromRequest(request);
  const rl = await checkRateLimit(`cron:${ip}`, 10, 60000);
  if (!rl.allowed) return apiError("Rate limit", 429);
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return apiError("CRON_SECRET tidak dikonfigurasi", 500);
  }
  const tokenParam = request.nextUrl.searchParams.get("token");
  const authHeader = request.headers.get("Authorization");
  const isAuthorized =
    (tokenParam && tokenParam === cronSecret) ||
    (authHeader && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return apiError("Unauthorized", 401);
  }

  const guruIds = await db
    .selectDistinct({ guruId: kursus.guruId })
    .from(kursus);

  const results: Array<{ guruId: string; status: string }> = [];

  for (const { guruId } of guruIds) {
    try {
      await refreshGuruAnalytics(guruId);
      results.push({ guruId, status: "ok" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[cron:analytics] failed for ${guruId}:`, msg);
      results.push({ guruId, status: "error" });
    }
  }

  return NextResponse.json({
    success: true,
    total: guruIds.length,
    processed: results.length,
    results,
  });
}