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
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[bytes[i] % chars.length];
  return out;
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
    // TODO: one-time invite — schema belum punya usedAt. Untuk one-time, tambah kolom usedAt + atomic WHERE usedAt IS NULL saat klaim.
    // Saat ini reuse kode selama belum expired (7 hari). Jika sudah dipakai 1x seharusnya generate baru.
    // Logika ideal: if (!isExpired && k.kodeInvite && k.usedAt == null) reuse; else generate baru dengan usedAt check.
    const kodeExpired = k.kodeInvite && k.inviteExpiresAt && new Date(k.inviteExpiresAt) < now;
    // Reuse existing kode jika belum expired; TODO: ganti dengan check usedAt untuk one-time (maxUses 1)
    const kode = !kodeExpired ? k.kodeInvite || generateKode() : generateKode();

    if (!k.kodeInvite || kodeExpired) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db
        .update(kelas)
        .set({ kodeInvite: kode, inviteExpiresAt: expiresAt })
        .where(eq(kelas.id, id));
      const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
      const inviteLink = base ? `${base}/undang?kode=${kode}` : `/undang?kode=${kode}`;
      return NextResponse.json({ success: true, data: { kode, expiresAt: expiresAt.toISOString(), inviteLink } });
    }

    const base2 = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
    const inviteLink2 = base2 ? `${base2}/undang?kode=${kode}` : `/undang?kode=${kode}`;
    return NextResponse.json({ success: true, data: { kode, expiresAt: k.inviteExpiresAt ? new Date(k.inviteExpiresAt).toISOString() : null, inviteLink: inviteLink2 } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof SubscriptionLockedError) return apiError(e.message, 403);
    console.error("Invite error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
