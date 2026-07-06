import { NextRequest, NextResponse } from "next/server";
import { mockKursus } from "@/data/mock";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip = ipFromRequest(req);
    const rl = checkRateLimit(`kursus-detail:${ip}`, 30, 15000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const { id } = await params;
    const kursus = mockKursus.find((k) => k.id === id);
    if (!kursus) {
      return NextResponse.json({ error: "Kursus tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ data: kursus });
  } catch (e) {
    console.error("Kursus detail error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
