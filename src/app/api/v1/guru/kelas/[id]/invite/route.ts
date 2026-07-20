import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { requireNotSuspended, SubscriptionLockedError } from "@/lib/token-service";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { validateCsrf } from "@/lib/csrf-server";

export const dynamic = "force-dynamic";

function generateKode(): string {
  return crypto.randomBytes(6).toString("base64url").slice(0, 8);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
    const session = await requireGuru(request);
    await requireNotSuspended(session.userId);

    const rl = await checkRateLimitPerUser(`kelas-invite:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [k] = await db
      .select()
      .from(kelas)
      .where(and(eq(kelas.id, id), eq(kelas.guruId, session.userId)))
      .limit(1);

    if (!k) return apiError("Kelas tidak ditemukan", 404);

    const now = new Date();
    const kodeExpired = k.kodeInvite && k.inviteExpiresAt && new Date(k.inviteExpiresAt) < now;
    const kode = !kodeExpired ? k.kodeInvite || generateKode() : generateKode();

    if (!k.kodeInvite || kodeExpired) {
      await db
        .update(kelas)
        .set({ kodeInvite: kode, inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        .where(eq(kelas.id, id));
    }

    return NextResponse.json({ success: true, data: { kode } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof SubscriptionLockedError) return apiError(e.message, 403);
    console.error("Invite error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}