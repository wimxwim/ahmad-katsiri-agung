import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockKursus } from "@/data/mock";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

const EnrollStatusSchema = z.object({
  siswaId: z.string().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = checkRateLimit(`enroll-status:${ip}`, 20, 15000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const { searchParams } = new URL(request.url);
    const rawSiswaId = searchParams.get("siswaId");
    const parsed = EnrollStatusSchema.safeParse({ siswaId: rawSiswaId });
    if (rawSiswaId && !parsed.success) {
      return NextResponse.json({ error: "Parameter tidak valid" }, { status: 400 });
    }

    const enrolled = mockKursus.slice(0, 2).map((k, i) => ({
      kursusId: k.id,
      kursusNama: k.nama,
      progress: [65, 32][i] ?? 0,
      enrolledAt: "2026-03-01",
    }));

    return NextResponse.json({ data: enrolled });
  } catch (e) {
    console.error("Enroll status error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
