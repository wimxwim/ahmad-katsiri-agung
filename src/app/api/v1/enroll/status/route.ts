import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { siswaKursus, kursus, users } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return apiError("Silakan login terlebih dahulu", 401);
    }
    const session = await verifySession(sessionCookie.value);
    if (!session) {
      return apiError("Sesi tidak valid", 401);
    }

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
