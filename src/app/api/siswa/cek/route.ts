/**
 * ⚠️ LEGACY ONLY — VERIFIKASI SISWA LAMA ⚠️
 *
 * Endpoint ini masih memakai Google Sheets sebagai sumber data siswa lama.
 * Akan dimatikan setelah flow registrasi siswa baru via Supabase stabil.
 *
 * FRONTEND YANG MASIH PAKAI:
 *   - src/components/evaluasi/QuizLogin.tsx (form login kuis legacy)
 *
 * RENCANA:
 *   - Migrasi ke /api/v1/siswa/login yang baca tabel users + siswa_kursus
 *   - Setelah quiz engine baru hidup, endpoint ini bisa dihapus
 *
 * @see /prd/TODO-V2-MULTI-GURU.md Gelombang 9
 */

import { NextRequest, NextResponse } from "next/server";
import { readRows } from "@/lib/google-sheets";
import { SiswaCekSchema } from "@/lib/validation";
import { signQuizToken } from "@/lib/auth";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { apiError, apiRateLimit } from "@/lib/api-response";

const SHEET_RANGE = "DaftarSiswa!A:D";

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = await checkRateLimit(`siswa-cek:${ip}`, 10, 30_000);
    if (!limit.allowed) return apiRateLimit(limit.retryAfter);

    const text = await req.text();
    if (text.length > 5_000) {
      return apiError("Payload terlalu besar", 413);
    }
    const raw = JSON.parse(text);
    const parsed = SiswaCekSchema.safeParse(raw);
    if (!parsed.success) {
      return apiError("Data tidak valid", 400);
    }

    const { nama, tanggalLahir } = parsed.data;
    const cleanNama = sanitizeText(nama, 100);
    const cleanTanggalLahir = sanitizeText(tanggalLahir, 30);
    const rows = await readRows(SHEET_RANGE);

    let matchedNama = "";
    let matchedKelas = "";
    for (const row of rows.slice(1)) {
      const [_, rowNama, rowKelas, rowTtl] = row;
      if (
        rowNama?.toLowerCase().trim() === cleanNama.toLowerCase().trim() &&
        rowTtl?.toLowerCase().trim() === cleanTanggalLahir.toLowerCase().trim()
      ) {
        matchedNama = rowNama;
        matchedKelas = rowKelas;
        break;
      }
    }

    if (matchedNama) {
      const token = await signQuizToken(matchedNama, matchedKelas);
      return NextResponse.json({
        found: true,
        nama: matchedNama,
        kelas: matchedKelas,
        token,
      });
    }

    return NextResponse.json({ found: false });
  } catch (e) { console.error("POST /api/siswa/cek error:", e);
    return apiError("Gagal memeriksa data siswa", 500);
  }
}
