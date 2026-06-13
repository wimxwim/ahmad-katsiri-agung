import { NextRequest, NextResponse } from "next/server";
import { readRows } from "@/lib/google-sheets";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`rekap:${ip}`, 20, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const apiKey = req.headers.get("x-api-key");
    if (!ADMIN_KEY || apiKey !== ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (e) {
    console.error("rekap error:", e);
    return NextResponse.json(
      { error: "Gagal memuat data dari server" },
      { status: 500 }
    );
  }
}
