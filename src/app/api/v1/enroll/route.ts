import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

const EnrollSchema = z.object({
  kursusId: z.string().min(1),
  siswaId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = checkRateLimit(`enroll:${ip}`, 5, 30000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = EnrollSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data tidak valid" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      enrolled: true,
      kursusId: sanitizeText(parsed.data.kursusId, 50),
      siswaId: sanitizeText(parsed.data.siswaId, 50),
      enrolledAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Enroll error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
