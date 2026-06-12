import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/google-sheets";
import { sendTelegram } from "@/lib/telegram";
import { KuisSelesaiSchema } from "@/lib/validation";
import { verifyQuizToken } from "@/lib/auth";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`kuis-selesai:${ip}`, 10, 30_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi ${limit.retryAfter} detik.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const raw = await req.json();
    const parsed = KuisSelesaiSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { namaSiswa, kelas, status, judulBab, skor, totalSoal, jawabanSalah, token } = parsed.data;

    if (status === "resmi") {
      if (!token) {
        return NextResponse.json({ error: "Token verifikasi diperlukan" }, { status: 401 });
      }
      const payload = await verifyQuizToken(token);
      if (!payload) {
        return NextResponse.json({ error: "Token tidak valid atau kedaluwarsa" }, { status: 401 });
      }
      if (payload.nama !== namaSiswa || payload.kelas !== kelas) {
        return NextResponse.json({ error: "Data tidak cocok dengan token" }, { status: 403 });
      }
    }

    const persentase = Math.round((skor / totalSoal) * 100);
    const now = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const detailSalah = jawabanSalah
      .map((j) => `Soal ${j.nomor}: ${j.pertanyaan}\n    Jawaban: ${j.jawabanSiswa}\n    Kunci:   ${j.kunciJawaban}`)
      .join("\n\n");

    const labelStatus = status === "resmi" ? "SISWA RESMI" : "LATIHAN UMUM";
    const icon = status === "resmi" ? "🟢" : "⚪";
    const lulus = persentase >= 70 ? "🌟" : "📚";

    const message = [
      `${icon} *LAPORAN KUIS BARU — ${labelStatus}*`,
      ``,
      `👤 *Nama:* ${namaSiswa}`,
      `🏫 *Kelas:* ${kelas}`,
      `📖 *Materi:* ${judulBab}`,
      ``,
      `📊 *HASIL EVALUASI:*`,
      `• Skor Akhir: ${skor} / ${totalSoal}`,
      `• Persentase: ${persentase}% ${lulus}`,
      ...(jawabanSalah.length > 0
        ? [`\n❌ *Detail Jawaban Salah:*\n\n${detailSalah}`]
        : ["\n✅ *Semua jawaban benar!*"]),
      ``,
      `📅 *Dikirim:* ${now}`,
    ].join("\n");

    if (status === "resmi") {
      const id = `nilai_${Date.now()}`;
      await appendRow("RekapNilai!A:H", [
        [id, namaSiswa, kelas, "✅ Selesai", judulBab, String(skor), String(totalSoal), now],
      ]);
    }

    await sendTelegram(message);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan hasil kuis" }, { status: 500 });
  }
}
