import { NextRequest } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getBalance, getSubscriptionStatus } from "@/lib/token-service";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`token-balance:${ip}`, 30, 60000);
    if (!rl.allowed) return apiError("Rate limit", 429);
    const session = await requireGuru(request);
    const [balance, subscription] = await Promise.all([
      getBalance(session.userId),
      getSubscriptionStatus(session.userId),
    ]);
    return apiSuccess({ ...balance, subscription });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Token balance error:", e);
    return apiError("INTERNAL_ERROR", "Gagal membaca saldo", undefined, 500);
  }
}