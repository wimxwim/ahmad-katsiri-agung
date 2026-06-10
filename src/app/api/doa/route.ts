import { NextRequest, NextResponse } from "next/server";
import { appendRow, readRows } from "@/lib/google-sheets";
import { sendTelegram } from "@/lib/telegram";

const SHEET_RANGE = "DoaUcapan!A:D";

export async function GET() {
  try {
    const rows = await readRows(SHEET_RANGE);
    const doaList = rows
      .slice(1)
      .reverse()
      .map(([id, nama, isi, waktu]) => ({
        id,
        nama: nama || "Anonim",
        isi,
        waktu,
      }));
    return NextResponse.json({ doa: doaList });
  } catch {
    return NextResponse.json({ doa: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nama, isi } = await req.json();
    if (!isi || isi.trim().length === 0) {
      return NextResponse.json({ error: "Isi doa tidak boleh kosong" }, { status: 400 });
    }
    if (isi.length > 400) {
      return NextResponse.json({ error: "Maksimal 400 karakter" }, { status: 400 });
    }

    const cleanNama = nama?.trim() || "Anonim";
    const now = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const id = `doa_${Date.now()}`;

    await appendRow(SHEET_RANGE, [[id, cleanNama, isi.trim(), now]]);

    await sendTelegram(
      `🤲 *DOA & UCAPAN BARU MASUK!*\n\n👤 *Pengirim:* ${cleanNama}\n💬 _${isi.trim()}_`
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim doa" }, { status: 500 });
  }
}
