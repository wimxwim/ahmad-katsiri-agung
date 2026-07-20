import { NextRequest } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess } from "@/lib/api-response";
import { TOPUP_PLANS, MIN_TOPUP, MAX_TOPUP } from "@/lib/token-constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireGuru(request);
    return apiSuccess({
      plans: TOPUP_PLANS,
      minCustom: MIN_TOPUP,
      maxCustom: MAX_TOPUP,
      qrisImageUrl: "/qris-gopay.png",
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Token plans error:", e);
    return apiError("INTERNAL_ERROR", "Gagal memuat paket top-up", undefined, 500);
  }
}