import { NextRequest, NextResponse } from "next/server";
import { appendRow, readRows } from "@/lib/google-sheets";
import { sendTelegram, escapeMarkdown } from "@/lib/telegram";
import { DiskusiSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiSuccess } from "@/lib/api-response";

const SHEET_RANGE = "Diskusi!A:G";

export async function GET(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = await checkRateLimit(`diskusi-get:${ip}`, 30, 60_000);
    if (!limit.allowed) return apiRateLimit(limit.retryAfter);

    const rows = await readRows(SHEET_RANGE);
    const list = rows
      .slice(1)
      .reverse()
      .map(([id, nama, kategori, judul, isi, waktu, slug]) => ({
        id,
        nama: nama || "Anonim",
        kategori,
        judul,
        isi,
        waktu,
        slug,
      }));

    return NextResponse.json({ diskusi: list });
  } catch (e) {
    console.error("GET /api/diskusi gagal:", e);
    return apiError("Gagal mengambil data", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = await checkRateLimit(`diskusi:${ip}`, 5, 15_000);
    if (!limit.allowed) return apiRateLimit(limit.retryAfter);

    const text = await req.text();
    if (text.length > 10_000) {
      return apiError("Payload terlalu besar", 413);
    }
    const raw = JSON.parse(text);
    const parsed = DiskusiSchema.safeParse(raw);
    if (!parsed.success) {
      return apiError("Data tidak valid", 400);
    }

    const { nama, kategori, judul, isi } = parsed.data;
    const cleanNama = sanitizeText(nama, 60);
    const cleanJudul = sanitizeText(judul, 150);
    const cleanIsi = sanitizeText(isi, 1000);

    const now = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const id = `dsk_${Date.now()}`;
    const slug = id;

    await appendRow(SHEET_RANGE, [
      [id, cleanNama, kategori, cleanJudul, cleanIsi, now, slug],
    ]);

    await sendTelegram(
      `💬 *DISKUSI BARU!*\n\n👤 ${escapeMarkdown(cleanNama)}\n🏷 ${escapeMarkdown(kategori)}\n📌 ${escapeMarkdown(cleanJudul)}\n\n${escapeMarkdown(cleanIsi.slice(0, 200))}${cleanIsi.length > 200 ? "…" : ""}`
    );

    return apiSuccess({ slug });
  } catch (e) { console.error("POST /api/diskusi error:", e);
    return apiError("Gagal mengirim diskusi", 500);
  }
}
