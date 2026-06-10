import { NextResponse } from "next/server";
import { readRows } from "@/lib/google-sheets";

export async function GET() {
  try {
    const [daftarSiswa, rekapNilai] = await Promise.all([
      readRows("DaftarSiswa!A:D"),
      readRows("RekapNilai!A:H"),
    ]);

    const siswaRows = daftarSiswa.slice(1).map(([_, nama, kelas]) => ({ nama, kelas }));
    const nilaiRows = rekapNilai.slice(1);

    const siswaSudah = new Set(nilaiRows.map((r) => r[1]?.toLowerCase()));

    const rekap = siswaRows.map((siswa) => {
      const sudah = siswaSudah.has(siswa.nama?.toLowerCase());
      const entry = nilaiRows.find(
        (r) => r[1]?.toLowerCase() === siswa.nama?.toLowerCase()
      );
      return {
        nama: siswa.nama,
        kelas: siswa.kelas,
        status: sudah ? "sudah" : "belum",
        skor: entry ? `${entry[5]}/${entry[6]}` : "-",
        tanggal: entry ? entry[7] : "-",
      };
    });

    return NextResponse.json({ rekap });
  } catch {
    return NextResponse.json({ rekap: [] });
  }
}
