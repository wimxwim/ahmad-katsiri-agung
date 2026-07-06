import { NextRequest, NextResponse } from "next/server";
import { readRows } from "@/lib/google-sheets";
import { SiswaCekSchema } from "@/lib/validation";
import { signQuizToken } from "@/lib/auth";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

const SHEET_RANGE = "DaftarSiswa!A:D";

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`siswa-cek:${ip}`, 10, 30_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi ${limit.retryAfter} detik.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const text = await req.text();
    if (text.length > 5_000) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }
    const raw = JSON.parse(text);
    const parsed = SiswaCekSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: "Gagal memeriksa data siswa" }, { status: 500 });
  }
}
