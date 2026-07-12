import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiRateLimit } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`sesi:${ip}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const result = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    const payload = result?.success ? result.data : null;
    if (!payload) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({
      session: {
        userId: payload.userId,
        role: payload.role,
        nama: payload.nama,
        email: payload.email,
        kelas: payload.kelas,
        noAbsen: payload.noAbsen,
        nis: payload.nis,
        sekolah: payload.sekolah,
      },
    });
  } catch (e) { console.error("GET /api/sesi error:", e);
    return NextResponse.json({ session: null });
  }
}
