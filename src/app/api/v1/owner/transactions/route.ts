import { NextRequest } from "next/server";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getAllTransactions } from "@/lib/token-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireOwner(request);
    const sp = request.nextUrl.searchParams;
    const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "50", 10) || 50));
    const offset = Math.max(0, parseInt(sp.get("offset") ?? "0", 10) || 0);
    const type = sp.get("type") || undefined;

    const result = await getAllTransactions(limit, offset, type);
    return apiSuccess(result);
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Owner transactions error:", e);
    return apiError("INTERNAL_ERROR", "Gagal memuat transaksi", undefined, 500);
  }
}