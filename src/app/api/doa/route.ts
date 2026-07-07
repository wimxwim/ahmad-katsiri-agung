import { NextRequest, NextResponse } from "next/server";
import { appendRow, readRows } from "@/lib/google-sheets";
import { sendTelegram, escapeMarkdown } from "@/lib/telegram";
import { DoaSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiSuccess } from "@/lib/api-response";

const SHEET_RANGE = "DoaUcapan!A:D";

export async function GET(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = await checkRateLimit(`doa-get:${ip}`, 30, 60_000);
    if (!limit.allowed) return apiRateLimit(limit.retryAfter);

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
    return apiError("Gagal mengambil data doa", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = await checkRateLimit(`doa:${ip}`, 5, 10_000);
    if (!limit.allowed) return apiRateLimit(limit.retryAfter);

    const text = await req.text();
    if (text.length > 10_000) {
      return apiError("Payload terlalu besar", 413);
    }
    const raw = JSON.parse(text);
    const parsed = DoaSchema.safeParse(raw);
    if (!parsed.success) {
      return apiError("Data tidak valid", 400);
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

    return apiSuccess();
  } catch (e) { console.error("POST /api/doa error:", e);
    return apiError("Gagal mengirim doa", 500);
  }
}
