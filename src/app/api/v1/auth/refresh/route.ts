import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/session";

const REFRESH_COOKIE_NAME = "akal_refresh";

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`refresh:${ip}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const rawToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (!rawToken) return apiError("AUTH_REQUIRED", "Sesi habis, silakan masuk ulang.", undefined, 401);

    const { rotateRefreshToken } = await import("@/lib/refresh-token");
    const result = await rotateRefreshToken(rawToken);
    if (!result) return apiError("AUTH_REQUIRED", "Token tidak valid, silakan masuk ulang.", undefined, 401);

    const response = NextResponse.json({
      success: true,
      user: null,
    });

    response.cookies.set(SESSION_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (e) {
    console.error("Session refresh error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
