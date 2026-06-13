import { NextRequest, NextResponse } from "next/server";
import { readRows, overwriteRows } from "@/lib/google-sheets";

const SHEET_RANGE = "DoaUcapan!A:D";

function isTestEntry(nama: string, isi: string): boolean {
  if (nama.includes("alert(") || isi.includes("alert(")) return true;

  const cleanNama = nama.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
  const cleanIsi = isi.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");

  if (cleanIsi.length <= 1 && cleanIsi.length > 0) return true;
  if (cleanIsi === "test" || cleanIsi === "cek" || cleanIsi === "terst") return true;
  if (cleanIsi === "masuk" || cleanIsi === "harus nya masuk") return true;
  if (cleanIsi === "normal test" || cleanIsi.startsWith("test notif") || cleanIsi.startsWith("test doa")) return true;
  if (cleanIsi.startsWith("test empty") || cleanIsi.startsWith("test ting")) return true;
  if (cleanIsi.startsWith("ini ulasan dari halaman")) return true;

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    if (key !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await readRows(SHEET_RANGE);
    const header = rows[0] || ["ID", "Nama", "Isi", "Waktu"];
    const data = rows.slice(1);

    const removed: { nama: string; isi: string }[] = [];
    const keep = data.filter((row) => {
      const nama = (row[1] || "").trim();
      const isi = (row[2] || "").trim();
      const isTest = isTestEntry(nama, isi);
      if (isTest) removed.push({ nama, isi });
      return !isTest;
    });

    await overwriteRows(SHEET_RANGE, [header, ...keep]);

    return NextResponse.json({
      success: true,
      kept: keep.length,
      removed: removed.length,
      items: removed,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
