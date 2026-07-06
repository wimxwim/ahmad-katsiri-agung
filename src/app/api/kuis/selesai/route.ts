import { NextRequest, NextResponse } from "next/server";
import { appendRow } from "@/lib/google-sheets";
import { sendTelegram, escapeMarkdown } from "@/lib/telegram";
import { KuisSelesaiSchema } from "@/lib/validation";
import { verifyQuizToken, verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

export async function POST(req: NextRequest) {
  try {
    // Session binding: verify Origin matches our domain
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const allowedOrigins = ["https://akalcenter.my.id", "https://ahmad-katsiri-agung.vercel.app", "http://localhost:3000"];
    const originOk = allowedOrigins.some((o) => origin.startsWith(o));
    if (!originOk) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`kuis-selesai:${ip}`, 10, 30_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi ${limit.retryAfter} detik.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const text = await req.text();
    if (text.length > 50_000) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }
    const raw = JSON.parse(text);
    const parsed = KuisSelesaiSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { namaSiswa, kelas, noAbsen, status, judulBab, skor, totalSoal, jawabanSalah } = parsed.data;
    const cleanNamaSiswa = sanitizeText(namaSiswa, 100);
    const cleanKelas = sanitizeText(kelas, 20);
    const cleanNoAbsen = noAbsen ? sanitizeText(noAbsen, 10) : "";
    const cleanJudulBab = sanitizeText(judulBab, 200);
    const cleanJawabanSalah = jawabanSalah.map((j) => ({
      nomor: j.nomor,
      pertanyaan: sanitizeText(j.pertanyaan, 500),
      jawabanSiswa: sanitizeText(j.jawabanSiswa, 200),
      kunciJawaban: sanitizeText(j.kunciJawaban, 200),
    }));
    const token = extractBearerToken(req);

    if (status === "resmi") {
      if (token) {
        const payload = await verifyQuizToken(token);
        if (!payload) {
          return NextResponse.json({ error: "Token tidak valid atau kedaluwarsa" }, { status: 401 });
        }
        if (payload.nama !== cleanNamaSiswa || payload.kelas !== cleanKelas) {
          return NextResponse.json({ error: "Data tidak cocok dengan token" }, { status: 403 });
        }
      } else {
        // Fallback: verify via session cookie (login from /masuk)
        const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
        if (!sessionCookie?.value) {
          return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 401 });
        }
        const session = await verifySession(sessionCookie.value);
        if (!session) {
          return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
        }
        if (session.nama !== cleanNamaSiswa || (session.kelas && session.kelas !== cleanKelas)) {
          return NextResponse.json({ error: "Data tidak cocok dengan sesi" }, { status: 403 });
        }
      }
    }

    const persentase = Math.round((skor / totalSoal) * 100);
    const now = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const isoNow = new Date().toISOString();

    const detailSalah = cleanJawabanSalah
      .map(
        (j) =>
          `Soal ${j.nomor}: ${escapeMarkdown(j.pertanyaan)}\n    Jawaban: ${escapeMarkdown(j.jawabanSiswa)}\n    Kunci:   ${escapeMarkdown(j.kunciJawaban)}`
      )
      .join("\n\n");

    const labelStatus = status === "resmi" ? "SISWA RESMI" : "LATIHAN UMUM";
    const icon = status === "resmi" ? "🟢" : "⚪";
    const lulus = persentase >= 70 ? "🌟" : "📚";

    const safeNama = escapeMarkdown(cleanNamaSiswa);
    const safeKelas = escapeMarkdown(cleanKelas);
    const safeJudul = escapeMarkdown(cleanJudulBab);
    const safeNoAbsen = cleanNoAbsen ? escapeMarkdown(cleanNoAbsen) : "";

    const message = [
      `${icon} *LAPORAN KUIS BARU — ${labelStatus}*`,
      ``,
      `👤 *Nama:* ${safeNama}`,
      `🏫 *Kelas:* ${safeKelas}${safeNoAbsen ? `\n🔢 *No. Absen:* ${safeNoAbsen}` : ""}`,
      `📖 *Materi:* ${safeJudul}`,
      ``,
      `📊 *HASIL EVALUASI:*`,
      `• Skor Akhir: ${skor} / ${totalSoal}`,
      `• Persentase: ${persentase}% ${lulus}`,
      ...(cleanJawabanSalah.length > 0
        ? [`\n❌ *Detail Jawaban Salah:*\n\n${detailSalah}`]
        : ["\n✅ *Semua jawaban benar!*"]),
      ``,
      `📅 *Dikirim:* ${now}`,
    ].join("\n");

    // ── Google Sheets: simpan hasil kuis otomatis ────────────────
    const labelLulus = persentase >= 70 ? "✅ Lulus" : "❌ Tidak";

    try {
      await appendRow("RekapNilai!A:J", [
        [
          isoNow,
          cleanNamaSiswa,
          cleanKelas,
          cleanNoAbsen || "-",
          status === "resmi" ? "Siswa Resmi" : "Latihan",
          cleanJudulBab,
          String(skor),
          String(totalSoal),
          String(persentase),
          labelLulus,
        ],
      ]);
    } catch (e) {
      console.error("Gagal menyimpan ke RekapNilai:", e);
      return NextResponse.json(
        { error: "Gagal menyimpan hasil kuis. Silakan coba lagi." },
        { status: 500 },
      );
    }

    await sendTelegram(message);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan hasil kuis" }, { status: 500 });
  }
}
