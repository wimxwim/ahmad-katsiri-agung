import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { requireNotSuspended } from "@/lib/token-service";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
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

    const rl = await checkRateLimitPerUser(`kursus-invite:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [k] = await db
      .select()
      .from(kursus)
      .where(and(eq(kursus.id, id), eq(kursus.guruId, session.userId)))
      .limit(1);

    if (!k) return apiError("Kursus tidak ditemukan", 404);

    const now = new Date();
    const kodeExpired = k.kodeInvite && k.inviteExpiresAt && new Date(k.inviteExpiresAt) < now;
    const kode = !kodeExpired ? k.kodeInvite || generateKode() : generateKode();

    if (!k.kodeInvite || kodeExpired) {
      await db
        .update(kursus)
        .set({ kodeInvite: kode, inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
        .where(eq(kursus.id, id));
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://akalcenter.my.id";
    const inviteLink = `${baseUrl}/undang/${kode}`;

    return NextResponse.json({ success: true, data: { kode, inviteLink } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kursus invite error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}