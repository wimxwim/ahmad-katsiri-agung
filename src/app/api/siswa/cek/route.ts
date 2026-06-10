import { NextRequest, NextResponse } from "next/server";
import { readRows } from "@/lib/google-sheets";

const SHEET_RANGE = "DaftarSiswa!A:D";

export async function POST(req: NextRequest) {
  try {
    const { nama, tanggalLahir } = await req.json();
    if (!nama || !tanggalLahir) {
      return NextResponse.json(
        { error: "Nama dan Tanggal Lahir harus diisi" },
        { status: 400 }
      );
    }

    const rows = await readRows(SHEET_RANGE);

    for (const row of rows.slice(1)) {
      const [_, rowNama, rowKelas, rowTtl] = row;
      if (
        rowNama?.toLowerCase().trim() === nama.toLowerCase().trim() &&
        rowTtl?.toLowerCase().trim() === tanggalLahir.toLowerCase().trim()
      ) {
        return NextResponse.json({
          found: true,
          nama: rowNama,
          kelas: rowKelas,
        });
      }
    }

    return NextResponse.json({
      found: false,
      error: "Nama atau Tanggal Lahir tidak cocok dengan daftar kelas",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal memeriksa data siswa" },
      { status: 500 }
    );
  }
}
