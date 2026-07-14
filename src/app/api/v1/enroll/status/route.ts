import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { requireSiswa } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { siswaKursus, kursus, users } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`enroll-status:${ip}`, 20, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const enrollments = await db
      .select({
        kursusId: siswaKursus.kursusId,
        status: siswaKursus.status,
        tanggalDaftar: siswaKursus.tanggalDaftar,
        judul: kursus.judul,
        nama: users.nama,
      })
      .from(siswaKursus)
      .leftJoin(kursus, eq(siswaKursus.kursusId, kursus.id))
      .leftJoin(users, and(eq(siswaKursus.siswaId, users.id), isNull(users.deletedAt)))
      .where(eq(siswaKursus.siswaId, session.userId!));

    return NextResponse.json({ data: enrollments });
  } catch (e) {
    console.error("Enroll status error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
