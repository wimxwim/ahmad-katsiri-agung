import { NextRequest, NextResponse } from "next/server";
import { appendRow, readRows } from "@/lib/google-sheets";
import { sendTelegram, escapeMarkdown } from "@/lib/telegram";
import { RefleksiSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

const SHEET_RANGE = "RefleksiDiri!A:F";

export async function GET(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`refleksi-get:${ip}`, 30, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const { searchParams } = req.nextUrl;
    const filterNama = searchParams.get("nama")?.toLowerCase().trim();

    const rows = await readRows(SHEET_RANGE);
    let list = rows
      .slice(1)
      .reverse()
      .map(([id, nama, pelajaran, akhlakBaik, perluDiperbaiki, waktu]) => ({
        id,
        nama: nama || "Anonim",
        pelajaran,
        akhlakBaik,
        perluDiperbaiki,
        waktu,
      }));

    if (filterNama) {
      list = list.filter((r) => r.nama.toLowerCase().includes(filterNama));
    }

    return NextResponse.json({ refleksi: list });
  } catch (e) {
    console.error("GET /api/refleksi gagal:", e);
    return NextResponse.json(
      { error: "Gagal mengambil data refleksi" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`refleksi:${ip}`, 5, 10_000);
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
    const parsed = RefleksiSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { nama, pelajaran, akhlakBaik, perluDiperbaiki } = parsed.data;
    const cleanNama = sanitizeText(nama, 60);
    const cleanPelajaran = sanitizeText(pelajaran, 500);
    const cleanAkhlakBaik = sanitizeText(akhlakBaik, 500);
    const cleanPerluDiperbaiki = sanitizeText(perluDiperbaiki, 500);

    const now = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const id = `ref_${Date.now()}`;

    await appendRow(SHEET_RANGE, [
      [id, cleanNama, cleanPelajaran, cleanAkhlakBaik, cleanPerluDiperbaiki, now],
    ]);

    await sendTelegram(
      `📝 *REFLEKSI DIRI BARU MASUK!*\n\n👤 *Nama:* ${escapeMarkdown(cleanNama)}\n📖 *Dipelajari:* ${escapeMarkdown(cleanPelajaran)}\n💚 *Akhlak Baik:* ${escapeMarkdown(cleanAkhlakBaik)}\n🔄 *Perlu Diperbaiki:* ${escapeMarkdown(cleanPerluDiperbaiki)}`
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengirim refleksi" },
      { status: 500 }
    );
  }
}
