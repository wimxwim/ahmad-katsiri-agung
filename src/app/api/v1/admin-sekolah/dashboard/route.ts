import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, kursus, siswaKursus } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const [u] = await db
      .select({ sekolahId: users.sekolahId })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const sekolahId = u?.sekolahId;
    if (!sekolahId) {
      return NextResponse.json({
        data: {
          totalGuru: 0,
          totalKursus: 0,
          totalSiswa: 0,
          aiQuotaUsed: 0,
          aiQuotaLimit: 100,
          guruList: [],
        },
      });
    }

    const guruList = await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        totalKursus: sql<number>`count(distinct ${kursus.id})`.mapWith(Number),
        totalSiswa: sql<number>`count(distinct ${siswaKursus.siswaId})`.mapWith(Number),
      })
      .from(users)
      .leftJoin(kursus, eq(kursus.guruId, users.id))
      .leftJoin(siswaKursus, eq(siswaKursus.kursusId, kursus.id))
      .where(eq(users.sekolahId, sekolahId))
      .groupBy(users.id, users.nama, users.email)
      .orderBy(sql`count(distinct ${kursus.id}) DESC`);

    const totalGuru = guruList.length;
    const totalKursus = guruList.reduce((sum, g) => sum + g.totalKursus, 0);
    const totalSiswa = guruList.reduce((sum, g) => sum + g.totalSiswa, 0);

    return NextResponse.json({
      data: {
        totalGuru,
        totalKursus,
        totalSiswa,
        aiQuotaUsed: 0,
        aiQuotaLimit: 100,
        guruList,
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Admin sekolah dashboard error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}