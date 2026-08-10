// GET /api/v1/guru/invite-codes - Lihat kode undangan sendiri
import { NextRequest } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { apiError, apiSuccess, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { guruInviteCodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`invite-codes:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const codes = await db
      .select()
      .from(guruInviteCodes)
      .where(eq(guruInviteCodes.issuingGuruId, session.userId));

    return apiSuccess({ inviteCodes: codes });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Invite codes guru error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}