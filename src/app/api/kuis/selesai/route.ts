import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/google-sheets";
import { sendTelegram } from "@/lib/telegram";

interface JawabanSalah {
  nomor: number;
  pertanyaan: string;
  jawabanSiswa: string;
  kunciJawaban: string;
}

interface Body {
  namaSiswa: string;
  kelas: string;
  status: "resmi" | "latihan";
  judulBab: string;
  slugBab: string;
  skor: number;
  totalSoal: number;
  jawabanSalah: JawabanSalah[];
}

export async function POST(req: NextRequest) {
  try {
    const body: Body = await req.json();
    const { namaSiswa, kelas, status, judulBab, skor, totalSoal, jawabanSalah } = body;

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
