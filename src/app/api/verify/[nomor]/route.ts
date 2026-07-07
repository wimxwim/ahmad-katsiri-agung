import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { sertifikat, users, kursus } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nomor: string }> }
) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`verify-cert:${ip}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { nomor } = await params;

    const [record] = await db
      .select({
        nomorSertifikat: sertifikat.nomorSertifikat,
        issuedAt: sertifikat.issuedAt,
        namaSiswa: users.nama,
        judulKursus: kursus.judul,
      })
      .from(sertifikat)
      .leftJoin(users, eq(sertifikat.siswaId, users.id))
      .leftJoin(kursus, eq(sertifikat.kursusId, kursus.id))
      .where(eq(sertifikat.nomorSertifikat, nomor));

    if (!record) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      data: {
        nama: record.namaSiswa,
        kursus: record.judulKursus,
        issuedAt: record.issuedAt,
      },
    });
  } catch (e) {
    console.error("Verify sertifikat error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
