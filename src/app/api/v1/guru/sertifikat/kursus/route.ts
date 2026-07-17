import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kursus, sertifikat, siswaKursus, quizAttempt, quizPublished } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`sertifikat-kursus:${ip}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const rows = await db
      .select({
        id: kursus.id,
        judul: kursus.judul,
        slug: kursus.slug,
        deskripsi: kursus.deskripsi,
        totalSertifikat: sql<number>`count(distinct ${sertifikat.id})`.mapWith(Number),
        totalSiswaSelesai: sql<number>`count(distinct case when ${quizAttempt.id} is not null then ${siswaKursus.siswaId} end)`.mapWith(Number),
      })
      .from(kursus)
      .leftJoin(sertifikat, eq(sertifikat.kursusId, kursus.id))
      .leftJoin(siswaKursus, eq(siswaKursus.kursusId, kursus.id))
      .leftJoin(
        quizPublished,
        and(
          eq(quizPublished.kursusId, kursus.id),
        ),
      )
      .leftJoin(
        quizAttempt,
        and(
          eq(quizAttempt.siswaId, siswaKursus.siswaId),
          eq(quizAttempt.quizPublishedId, quizPublished.id),
          eq(quizAttempt.status, "SELESAI"),
        ),
      )
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