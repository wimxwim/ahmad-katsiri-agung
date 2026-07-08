/**
 * ⚠️ LEGACY ONLY — SUBMIT HASIL KUIS LAMA ⚠️
 *
 * Endpoint ini masih menulis ke Google Sheets (RekapNilai) dan Telegram.
 * Akan dimatikan setelah quiz engine DB-driven stabil.
 *
 * FRONTEND YANG MASIH PAKAI:
 *   - src/components/evaluasi/QuizEngine.tsx (submit kuis legacy)
 *
 * RENCANA:
 *   - Migrasi ke /api/v1/siswa/quiz/[id]/submit yang tulis ke quiz_attempt
 *   - Setelah quiz engine baru hidup, endpoint ini bisa dihapus
 *
 * @see /prd/TODO-V2-MULTI-GURU.md Gelombang 9
 */

/**
 * ⚠️ LEGACY ONLY — SUBMIT HASIL KUIS LAMA ⚠️
 *
 * Endpoint ini masih menulis ke Google Sheets (RekapNilai) dan Telegram.
 * Akan dimatikan setelah quiz engine baru (DB-driven) stabil.
 *
 * FRONTEND YANG MASIH PAKAI:
 *   - src/components/evaluasi/QuizEngine.tsx (submit hasil kuis legacy)
 *
 * PENGGANTI BARU:
 *   - /api/v1/siswa/quiz/[id]/submit (DB-driven, Supabase)
 *
 * @see /prd/TODO-V2-MULTI-GURU.md Gelombang 9
 */

import { NextRequest } from "next/server";
import { appendRow } from "@/lib/google-sheets";
import { sendTelegram, escapeMarkdown } from "@/lib/telegram";
import { KuisSelesaiSchema } from "@/lib/validation";
import { verifyQuizToken, verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { apiError, apiRateLimit, apiSuccess } from "@/lib/api-response";

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    const allowed = ["akalcenter.my.id", "ahmad-katsiri-agung.vercel.app", "localhost"];
    return allowed.some((h) => hostname === h);
  } catch (e) { console.error("kuis selesai error:", e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Session binding: verify Origin matches our domain
    const origin = req.headers.get("origin") || "";
    if (origin && !isOriginAllowed(origin)) {
      return apiError("Akses ditolak", 403);
    }

    const ip = ipFromRequest(req);
    const limit = await checkRateLimit(`kuis-selesai:${ip}`, 10, 30_000);
    if (!limit.allowed) return apiRateLimit(limit.retryAfter);

    const text = await req.text();
    if (text.length > 50_000) {
      return apiError("Payload terlalu besar", 413);
    }
    const raw = JSON.parse(text);
    const parsed = KuisSelesaiSchema.safeParse(raw);
    if (!parsed.success) {
      return apiError("Data tidak valid", 400);
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
        const _qt = await verifyQuizToken(token);
        if (!_qt.success) {
          return apiError("Token tidak valid atau kedaluwarsa", 401);
        }
        const payload = _qt.data;
        if (payload.nama !== cleanNamaSiswa || payload.kelas !== cleanKelas) {
          return apiError("Data tidak cocok dengan token", 403);
        }
      } else {
        // Fallback: verify via session cookie (login from /masuk)
        const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
        if (!sessionCookie?.value) {
          return apiError("Sesi tidak ditemukan", 401);
        }
        const _ar2 = await verifySession(sessionCookie.value);
        if (!_ar2.success) {
          return apiError("Sesi tidak valid", 401);
        }
        const session = _ar2.data;
        if (session.nama !== cleanNamaSiswa || (session.kelas && session.kelas !== cleanKelas)) {
          return apiError("Data tidak cocok dengan sesi", 403);
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
      return apiError("Gagal menyimpan hasil kuis. Silakan coba lagi.", 500);
    }

    await sendTelegram(message);
    return apiSuccess();
  } catch (e) { console.error("kuis selesai error:", e);
    return apiError("Gagal menyimpan hasil kuis", 500);
  }
}
