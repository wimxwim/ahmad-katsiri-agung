import { NextRequest, NextResponse } from "next/server";
import { mockNilai, mockSiswa } from "@/data/mock";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip = ipFromRequest(req);
    const rl = checkRateLimit(`kursus-nilai:${ip}`, 20, 15000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const { id } = await params;
    const nilaiKursus = mockNilai.filter((n) => n.kursusId === id);
    const enriched = nilaiKursus.map((n) => {
      const siswa = mockSiswa.find((s) => s.id === n.siswaId);
      return { ...n, siswa };
    });
    const quizLabels = [...new Set(enriched.map((n) => n.judulQuiz))];
    return NextResponse.json({ data: enriched, quizzes: quizLabels, total: enriched.length });
  } catch (e) {
    console.error("Nilai error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
