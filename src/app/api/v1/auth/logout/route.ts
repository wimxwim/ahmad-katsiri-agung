import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { logAuthEvent } from "@/lib/auth-audit";
import { SESSION_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/session";
import { verifySession } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf-server";

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
    const csrfErr = validateCsrf(request);
    if (csrfErr) return csrfErr;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`logout:${ip}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    const session = _ar?.success ? _ar.data : null;

    let userId: string | undefined;
    if (session) {
      userId = session.userId;
      logAuthEvent("auth.logout", {
        userId,
        email: session.email,
        ip,
      }).catch(err => console.error("logAuthEvent failed:", err));
    }

    if (userId) {
      const { revokeUserRefreshTokens } = await import("@/lib/refresh-token");
      await revokeUserRefreshTokens(userId);
    }

    const response = NextResponse.json({ success: true, redirect: "/masuk" });
    response.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
    response.cookies.set(REFRESH_COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/api/v1/auth/refresh", maxAge: 0 });
    response.cookies.set("akal_google_state", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
    response.cookies.set("akal_google_portal", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
    response.cookies.set("akal_google_return", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch (e) {
    console.error("Logout error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
