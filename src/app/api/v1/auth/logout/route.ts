import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { logAuthEvent } from "@/lib/auth-audit";
import { SESSION_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/session";
import { verifySession } from "@/lib/auth";

/**
 * POST /api/v1/auth/logout
 *
 * Logout final yang konsisten:
 *   1. Hapus session cookie (HttpOnly)
 *   2. Hapus cookie sementara Google (jika ada)
 *   3. Audit log auth.logout
 *
 * Body tidak wajib — endpoint idempotent.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`logout:${ip}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    const session = _ar?.success ? _ar.data : null;

    let userId: string | undefined;
    if (session) {
      userId = session.userId;
      await logAuthEvent("auth.logout", {
        userId,
        email: session.email,
        ip,
      });
    }

    // Revoke refresh tokens
    if (userId) {
      const { revokeUserRefreshTokens } = await import("@/lib/refresh-token");
      revokeUserRefreshTokens(userId).catch(() => {});
    }

    const response = NextResponse.json({ success: true, redirect: "/" });
    response.cookies.delete(SESSION_COOKIE_NAME);
    response.cookies.delete(REFRESH_COOKIE_NAME);
    response.cookies.delete("akal_google_state");
    response.cookies.delete("akal_google_portal");
    response.cookies.delete("akal_google_return");
    return response;
  } catch (e) {
    console.error("Logout error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
