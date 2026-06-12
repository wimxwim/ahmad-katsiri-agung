import { NextRequest, NextResponse } from "next/server";
import { readRows } from "@/lib/google-sheets";
import { SiswaCekSchema } from "@/lib/validation";
import { signQuizToken } from "@/lib/auth";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

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

    const raw = await req.json();
    const parsed = SiswaCekSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Data tidak valid";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { nama, tanggalLahir } = parsed.data;
    const rows = await readRows(SHEET_RANGE);

    for (const row of rows.slice(1)) {
      const [_, rowNama, rowKelas, rowTtl] = row;
      if (
        rowNama?.toLowerCase().trim() === nama.toLowerCase().trim() &&
        rowTtl?.toLowerCase().trim() === tanggalLahir.toLowerCase().trim()
      ) {
        const token = await signQuizToken(rowNama, rowKelas);
        return NextResponse.json({
          found: true,
          nama: rowNama,
          kelas: rowKelas,
          token,
        });
      }
    }

    return NextResponse.json({ found: false, error: "Nama atau Tanggal Lahir tidak cocok" });
  } catch {
    return NextResponse.json({ error: "Gagal memeriksa data siswa" }, { status: 500 });
  }
}
