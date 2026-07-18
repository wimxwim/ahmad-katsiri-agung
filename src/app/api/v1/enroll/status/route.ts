import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
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

    const { searchParams } = new URL(request.url);
    const kursusId = searchParams.get("kursusId");

    if (kursusId) {
      const [enrollment] = await db
        .select({
          kursusId: siswaKursus.kursusId,
          status: siswaKursus.status,
          tanggalDaftar: siswaKursus.tanggalDaftar,
        })
        .from(siswaKursus)
        .where(
          and(
            eq(siswaKursus.siswaId, session.userId!),
            eq(siswaKursus.kursusId, kursusId),
          ),
        )
        .limit(1);

      return NextResponse.json({
        data: {
          enrolled: Boolean(enrollment),
          kursusId,
          status: enrollment?.status ?? null,
        },
      });
    }

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
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Enroll status error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
