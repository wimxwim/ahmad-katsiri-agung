import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { getCachedDashboard } from "@/lib/dashboard-cache";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);
    const guruId = session.userId;

    const rl = await checkRateLimitPerUser(`dashboard:${guruId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const data = await getCachedDashboard(guruId);
    const response = NextResponse.json({ data });
    response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
    return response;
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Dashboard guru error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}