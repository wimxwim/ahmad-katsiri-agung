import { NextRequest, NextResponse } from "next/server";
import { appendRow, readRows } from "@/lib/google-sheets";
import { sendTelegram, escapeMarkdown } from "@/lib/telegram";
import { BalasanSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

const DISKUSI_RANGE = "Diskusi!A:G";
const BALASAN_RANGE = "DiskusiBalasan!A:F";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const ip = ipFromRequest(req);
    const rl = checkRateLimit(`diskusi-detail:${ip}`, 20, 15000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const { slug } = await context.params;

    const rows = await readRows(DISKUSI_RANGE);
    if (!rows[0]) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    const rowIndex = rows.findIndex(
      (r, i) => i > 0 && r[6]?.toLowerCase() === slug.toLowerCase()
    );
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Diskusi tidak ditemukan" }, { status: 404 });
    }

    const d = rows[rowIndex];
    const diskusi = {
      id: d[0],
      nama: d[1] || "Anonim",
      kategori: d[2],
      judul: d[3],
      isi: d[4],
      waktu: d[5],
      slug: d[6],
    };

    const balasanRaw = await readRows(BALASAN_RANGE);
    const balasan = balasanRaw
      .slice(1)
      .filter((r) => r[1] === slug)
      .map((r) => ({
        id: r[0],
        nama: r[2] || "Anonim",
        isi: r[3],
        waktu: r[5],
      }));

    return NextResponse.json({ diskusi, balasan });
  } catch (e) {
    console.error("GET /api/diskusi/[slug] gagal:", e);
    return NextResponse.json({ error: "Gagal memuat diskusi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const parentRows = await readRows(DISKUSI_RANGE);
    const parentExists = parentRows.slice(1).some(
      (r) => r[6]?.toLowerCase() === slug.toLowerCase()
    );
    if (!parentExists) {
      return NextResponse.json({ error: "Diskusi tidak ditemukan" }, { status: 404 });
    }

    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`balas:${ip}`, 8, 10_000);
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
    const parsed = BalasanSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { nama, isi } = parsed.data;
    const cleanNama = sanitizeText(nama, 60);
    const cleanIsi = sanitizeText(isi, 1000);

    const now = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const id = `bal_${Date.now()}`;

    await appendRow(BALASAN_RANGE, [
      [id, slug, cleanNama, cleanIsi, "balasan", now],
    ]);

    await sendTelegram(
      `💬 *BALASAN DISKUSI!*\n\n👤 ${escapeMarkdown(cleanNama)}\n🔄 Balasan ke: ${escapeMarkdown(slug)}\n\n${escapeMarkdown(cleanIsi.slice(0, 200))}${cleanIsi.length > 200 ? "…" : ""}`
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengirim balasan" },
      { status: 500 }
    );
  }
}
