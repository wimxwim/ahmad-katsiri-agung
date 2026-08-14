import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { getBalance } from "@/lib/token-service";
import { checkRateLimitPerUser } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`token-balance:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const balance = await getBalance(session.userId!);
    return NextResponse.json(balance);
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Token balance error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
