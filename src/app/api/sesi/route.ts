import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return NextResponse.json({ session: null });
    }

    const payload = await verifySession(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({
      session: {
        role: payload.role,
        nama: payload.nama,
        kelas: payload.kelas,
        noAbsen: payload.noAbsen,
        nis: payload.nis,
        sekolah: payload.sekolah,
      },
    });
  } catch {
    return NextResponse.json({ session: null });
  }
}
