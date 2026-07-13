import { NextRequest, NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/google-oauth";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";

/**
 * GET /api/v1/auth/google
 *
 * Memulai Google OAuth flow:
 *   1. Validasi portal intent (guru | siswa | undefined)
 *   2. Rate limit per IP
 *   3. Generate `state` random + simpan intent + returnTo di cookie (HttpOnly)
 *   4. Redirect ke Google consent screen
 */
export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`google-start:${ip}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const params = request.nextUrl.searchParams;
    const portal = params.get("portal") === "guru" ? "guru" : params.get("portal") === "siswa" ? "siswa" : "";
    const returnTo = params.get("returnTo") || "";

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return apiError("Login Google belum dikonfigurasi", 503);
    }

    const stateBytes = new Uint8Array(24);
    crypto.getRandomValues(stateBytes);
    const state = Array.from(stateBytes, (b) => b.toString(16).padStart(2, "0")).join("");

    const authUrl = buildAuthUrl(state);

    const response = NextResponse.redirect(authUrl);
    response.cookies.set("akal_google_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    if (portal) {
      response.cookies.set("akal_google_portal", portal, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      });
    }
    if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
      response.cookies.set("akal_google_return", returnTo, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      });
    }

    return response;
  } catch (e) {
    console.error("Google start error:", e);
    return apiError("Gagal memulai login Google", 500);
  }
}
