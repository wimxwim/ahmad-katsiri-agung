import { NextRequest, NextResponse } from "next/server";
import { readRows, overwriteRows } from "@/lib/google-sheets";

const SHEET_RANGE = "DoaUcapan!A:D";

function isTestEntry(nama: string, isi: string): boolean {
  const cleaned = isi.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");

  if (isi.includes("alert(")) return true;
  if (cleaned.length <= 1 && cleaned.length > 0) return true;
  if (cleaned === "test" || cleaned === "cek" || cleaned === "terst") return true;
  if (cleaned === "masuk" || cleaned === "harus nya masuk") return true;
  if (cleaned === "normal test" || cleaned.startsWith("test notif") || cleaned.startsWith("test doa")) return true;
  if (cleaned.startsWith("test empty") || cleaned.startsWith("test ting")) return true;
  if (cleaned.startsWith("ini ulasan dari halaman")) return true;

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
