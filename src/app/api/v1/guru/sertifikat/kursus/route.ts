import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { kursus, sertifikat, siswaKursus } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rows = await db
      .select({
        id: kursus.id,
        judul: kursus.judul,
        slug: kursus.slug,
        deskripsi: kursus.deskripsi,
        totalSertifikat: sql<number>`count(distinct ${sertifikat.id})`.mapWith(Number),
        totalSiswaSelesai: sql<number>`count(distinct ${siswaKursus.siswaId})`.mapWith(Number),
      })
      .from(kursus)
      .leftJoin(sertifikat, eq(sertifikat.kursusId, kursus.id))
      .leftJoin(siswaKursus, eq(siswaKursus.kursusId, kursus.id))
      .where(eq(kursus.guruId, session.userId))
      .groupBy(kursus.id)
      .orderBy(sql`count(distinct ${sertifikat.id}) DESC`);

    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Sertifikat kursus error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}