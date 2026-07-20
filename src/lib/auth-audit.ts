import { appendEvent } from "@/lib/event-store";

/**
 * Auth audit log — ditulis ke event_store (append-only, hash-chained).
 * Dipakai untuk trail login/register/logout/intent-mismatch tanpa PII mentah.
 *
 * Stream ID convention: `auth:{userId | "anon"}`
 * Event types: auth.login.success | auth.login.failed | auth.register.success |
 *              auth.logout | auth.intent_mismatch | auth.google.linked |
 *              auth.password.set
 */

export type AuthEventType =
  | "auth.login.success"
  | "auth.login.failed"
  | "auth.register.success"
  | "auth.register.duplicate"
  | "auth.logout"
  | "auth.intent_mismatch"
  | "auth.google.linked"
  | "auth.password.set"
  | "auth.forgot_password.attempt"
  | "auth.forgot_password.requested"
  | "auth.password.reset";

interface AuthLogOptions {
  userId?: string;
  email?: string;
  portal?: "guru" | "siswa" | "unknown";
  ip?: string;
  reason?: string;
  method?: "password" | "google" | "csv_import";
  emailSent?: boolean;
}

export async function logAuthEvent(
  eventType: AuthEventType,
  options: AuthLogOptions = {},
): Promise<void> {
  const streamId = `auth:${options.userId || "anon"}`;
  const payload = {
    event: eventType,
    at: new Date().toISOString(),
    ...(options.userId ? { userId: options.userId } : {}),
    ...(options.email ? { emailHash: await quickHash(options.email) } : {}),
    ...(options.portal ? { portal: options.portal } : {}),
    ...(options.method ? { method: options.method } : {}),
    ...(options.ip ? { ipMasked: maskIp(options.ip) } : {}),
    ...(options.reason ? { reason: options.reason } : {}),
    ...(options.emailSent !== undefined ? { emailSent: options.emailSent } : {}),
  };
  try {
    await appendEvent(streamId, eventType, payload);
  } catch (e) {
    console.error("[auth-audit] gagal menulis event:", e);
  }
}

function maskIp(ip: string): string {
  if (ip === "unknown" || !ip) return "unknown";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.x.x`;
    }
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + ":xxxx";
  }
  return "masked";
}

async function quickHash(input: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(input.toLowerCase()).digest("hex").slice(0, 16);
}
