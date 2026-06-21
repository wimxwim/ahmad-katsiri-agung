import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readRows } from "@/lib/google-sheets";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export const runtime = "nodejs";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const allowedOrigins = ["https://akalcenter.my.id", "https://ahmad-katsiri-agung.vercel.app", "http://localhost:3000"];
    const originOk = allowedOrigins.some((o) => origin.startsWith(o));
    if (!originOk) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`rekap:${ip}`, 20, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    // Auth: x-api-key (legacy) atau session guru
    const apiKey = req.headers.get("x-api-key");
    const isKeyValid = ADMIN_KEY && apiKey === ADMIN_KEY;

    let isGuruSession = false;
    if (!isKeyValid) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      if (sessionCookie?.value) {
        const session = await verifySession(sessionCookie.value);
        isGuruSession = session?.role === "guru";
      }
    }

    if (!isKeyValid && !isGuruSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rekapNilai = await readRows("RekapNilai!A:J");
    const rows = rekapNilai.slice(1).reverse(); // skip header, newest first

    const rekap = rows.map((r) => ({
      tanggal: r[0] || "-",
      nama: r[1] || "-",
      kelas: r[2] || "-",
      noAbsen: r[3] || "-",
      tipe: r[4] || "-",
      bab: r[5] || "-",
      skor: r[6] || "0",
      total: r[7] || "0",
      persentase: r[8] || "0",
      lulus: r[9] || "-",
    }));

    return NextResponse.json({ rekap });
  } catch (e) {
    console.error("rekap error:", e);
    return NextResponse.json(
      { error: "Gagal memuat data dari server" },
      { status: 500 }
    );
  }
}
