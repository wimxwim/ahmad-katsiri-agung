import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`masuk:${ip}`, 5, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const formData = await request.formData();
    const mode = formData.get("_mode") as string;

    if (mode === "logout") {
      const response = NextResponse.json({ success: true, redirect: "/masuk" });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    return apiError("Mode tidak valid", 400);
  } catch (e) {
    console.error("Logout error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
