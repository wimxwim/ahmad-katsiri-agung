import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { cookies } from "next/headers";
import { logAuthEvent } from "@/lib/auth-audit";

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

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    let userId: string | undefined;
    if (sessionCookie?.value) {
      const { verifySession } = await import("@/lib/auth");
      const _ar = await verifySession(sessionCookie.value);
      if (_ar.success) {
        userId = _ar.data.userId;
        await logAuthEvent("auth.logout", {
          userId,
          email: _ar.data.email,
          ip,
        });
      }
    }

    // Revoke refresh tokens
    if (userId) {
      const { revokeUserRefreshTokens } = await import("@/lib/refresh-token");
      revokeUserRefreshTokens(userId).catch(() => {});
    }

    const response = NextResponse.json({ success: true, redirect: "/" });
    response.cookies.delete(SESSION_COOKIE_NAME);
    response.cookies.delete("akal_refresh");
    response.cookies.delete("akal_google_state");
    response.cookies.delete("akal_google_portal");
    response.cookies.delete("akal_google_return");
    return response;
  } catch (e) {
    console.error("Logout error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
