import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readRows } from "@/lib/google-sheets";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { apiError, apiRateLimit } from "@/lib/api-response";

export const runtime = "nodejs";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    const allowed = ["akalcenter.my.id", "ahmad-katsiri-agung.vercel.app", "localhost"];
    return allowed.some((h) => hostname === h);
  } catch (e) {
    console.error("isOriginAllowed error:", e);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || "";
    if (origin && !isOriginAllowed(origin)) {
      return apiError("Akses ditolak", 403);
    }

    const ip = ipFromRequest(req);
    const limit = await checkRateLimit(`rekap:${ip}`, 20, 60_000);
    if (!limit.allowed) return apiRateLimit(limit.retryAfter);

    // Auth: x-api-key (legacy) atau session guru
    const apiKey = req.headers.get("x-api-key");
    const isKeyValid = ADMIN_KEY && apiKey === ADMIN_KEY;

    let isGuruSession = false;
    if (!isKeyValid) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      if (sessionCookie?.value) {
        const _ar = await verifySession(sessionCookie.value);
        const session = _ar.success ? _ar.data : null;
        isGuruSession = session?.role === "guru";
      }
    }

    if (!isKeyValid && !isGuruSession) {
      return apiError("Unauthorized", 401);
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
    return apiError("Gagal memuat data dari server", 500);
  }
}
