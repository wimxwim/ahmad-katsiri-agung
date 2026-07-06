import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockKursus } from "@/data/mock";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

const KursusSchema = z.object({
  nama: z.string().min(1).max(200),
  deskripsi: z.string().max(500).optional().default(""),
  kelas: z.enum(["7", "8", "9"]).optional().default("7"),
  coverColor: z.string().max(20).optional().default("#005231"),
});

export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = checkRateLimit(`kursus-list:${ip}`, 30, 15000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
    }
    return NextResponse.json({ data: mockKursus });
  } catch (e) {
    console.error("Kursus GET error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = checkRateLimit(`kursus-create:${ip}`, 5, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfter} detik.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const body = await request.json();
    const parsed = KursusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data tidak valid" },
        { status: 400 },
      );
    }

    const newKursus = {
      id: `k${Date.now()}`,
      nama: sanitizeText(parsed.data.nama, 200),
      deskripsi: sanitizeText(parsed.data.deskripsi, 500),
      kelas: parsed.data.kelas,
      jumlahSiswa: 0,
      jumlahMateri: 0,
      status: "AKTIF" as const,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      coverColor: parsed.data.coverColor,
    };
    mockKursus.push(newKursus);
    return NextResponse.json({ data: newKursus }, { status: 201 });
  } catch (e) {
    console.error("Kursus POST error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
