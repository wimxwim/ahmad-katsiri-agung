import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { validateCsrf } from "@/lib/csrf-server";

export const dynamic = "force-dynamic";

function generateKode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`kelas-invite:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [k] = await db
      .select()
      .from(kelas)
      .where(and(eq(kelas.id, id), eq(kelas.guruId, session.userId)))
      .limit(1);

    if (!k) return apiError("Kelas tidak ditemukan", 404);

    const kode = k.kodeInvite || generateKode();

    if (!k.kodeInvite) {
      await db
        .update(kelas)
        .set({ kodeInvite: kode })
        .where(eq(kelas.id, id));
    }

    return NextResponse.json({ success: true, data: { kode } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Invite error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}