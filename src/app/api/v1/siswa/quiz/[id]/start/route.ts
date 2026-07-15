import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { cacheSet } from "@/lib/cache-layer";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);
    const { id } = await params;

    const rl = await checkRateLimit(`quiz-start:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const startKey = `quiz:start:${session.userId}:${id}`;
    await cacheSet(startKey, Date.now(), 3600);

    return NextResponse.json({ success: true, startedAt: Date.now() });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    return apiError("Terjadi kesalahan server", 500);
  }
}