import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiRateLimit } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`sesi:${ip}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const payload = await getSession();
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
