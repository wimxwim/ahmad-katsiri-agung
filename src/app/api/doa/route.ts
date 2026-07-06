import { NextRequest, NextResponse } from "next/server";
import { appendRow, readRows } from "@/lib/google-sheets";
import { sendTelegram, escapeMarkdown } from "@/lib/telegram";
import { DoaSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

const SHEET_RANGE = "DoaUcapan!A:D";

export async function GET(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`doa-get:${ip}`, 30, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

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
  } catch (e) {
    console.error("GET /api/doa gagal:", e);
    return NextResponse.json({ error: "Gagal mengambil data doa" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`doa:${ip}`, 5, 10_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi ${limit.retryAfter} detik.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const text = await req.text();
    if (text.length > 10_000) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }
    const raw = JSON.parse(text);
    const parsed = DoaSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { nama, isi } = parsed.data;
    const cleanNama = sanitizeText(nama, 60);
    const cleanIsi = sanitizeText(isi, 400);

    const now = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const id = `doa_${Date.now()}`;

    await appendRow(SHEET_RANGE, [[id, cleanNama, cleanIsi, now]]);

    await sendTelegram(
      `🤲 *DOA & UCAPAN BARU MASUK!*\n\n👤 *Pengirim:* ${escapeMarkdown(cleanNama)}\n💬 ${escapeMarkdown(cleanIsi)}`
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim doa" }, { status: 500 });
  }
}
