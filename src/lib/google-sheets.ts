/**
 * ⚠️ LEGACY ONLY — GOOGLE SHEETS BRIDGE ⚠️
 *
 * Per TODO V2 Multi-Guru (Gelombang 9), file ini adalah bridge sementara
 * dari era website single-guru PAI ke platform multi-guru baru.
 *
 * STATUS:
 *   - READ/WRITE masih aktif untuk endpoint legacy yang belum dimigrasi
 *   - JANGAN dipakai untuk fitur baru apapun
 *   - Semua data baru wajib masuk Supabase via Drizzle ORM
 *
 * ENDPOINT YANG MASIH PAKAI FILE INI:
 *   - /api/siswa/cek     (verifikasi siswa lama dari sheet DaftarSiswa)
 *   - /api/kuis/selesai  (simpan nilai ke sheet RekapNilai)
 *   - /api/kuis/rekap    (baca rekap nilai dari sheet RekapNilai)
 *   - /api/refleksi      (sheet RefleksiDiri)
 *   - /api/diskusi       (sheet Diskusi + DiskusiBalasan)
 *   - /api/doa           (sheet DoaUcapan)
 *
 * RENCANA CUTOWER:
 *   1. Flow baru (auth DB, quiz DB, analytics DB) harus stabil dulu
 *   2. Parallel write diaktifkan per fitur saat flow baru siap
 *   3. Setelah verifikasi data konsisten, matikan write ke Sheets
 *   4. Terakhir, matikan read dari Sheets
 *
 * @see /prd/TODO-V2-MULTI-GURU.md Gelombang 9
 * @see /prd/LEGACY-MIGRATION-MAP.md untuk peta field Sheets → Supabase
 */

import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getClient() {
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!key) throw new Error("GOOGLE_SHEETS_PRIVATE_KEY not set");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function appendRow(range: string, values: string[][]) {
  if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID not set");
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function readRows(range: string): Promise<string[][]> {
  if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID not set");
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return res.data.values || [];
}

export async function findRow(
  range: string,
  columnIndex: number,
  value: string
): Promise<number | null> {
  const rows = await readRows(range);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][columnIndex]?.toLowerCase() === value.toLowerCase()) {
      return i;
    }
  }
  return null;
}

export async function overwriteRows(range: string, values: string[][]) {
  if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID not set");
  const sheets = getClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range,
  });
  if (values.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }
}
