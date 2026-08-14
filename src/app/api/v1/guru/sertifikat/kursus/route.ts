import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kursus, sertifikat, siswaKursus, quizAttempt, quizPublished } from "@/lib/db/schema";
import { and, eq, sql, countDistinct, inArray } from "drizzle-orm";
import { KKM } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`sertifikat-kursus:${ip}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    // F1-5: Split fan-out 4 leftJoin into 2 separate aggregations to avoid multiplicative row explosion
    // Query 1: kursus base + sertifikat count
    const kursusBase = await db
      .select({
        id: kursus.id,
        judul: kursus.judul,
        slug: kursus.slug,
        deskripsi: kursus.deskripsi,
      })
      .from(kursus)
      .where(eq(kursus.guruId, session.userId));

    if (kursusBase.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Aggregation 1: totalSertifikat per kursus (isolated, no fan-out)
    const sertifikatAgg = await db
      .select({
        kursusId: kursus.id,
        totalSertifikat: countDistinct(sertifikat.id).as("totalSertifikat"),
      })
      .from(kursus)
      .leftJoin(sertifikat, eq(sertifikat.kursusId, kursus.id))
      .where(eq(kursus.guruId, session.userId))
      .groupBy(kursus.id);

    // Aggregation 2: totalSiswaSelesai per kursus (isolated, no sertifikat join)
    // CTE approach: count distinct siswa with SELESAI attempt per kursus
    const selesaiAgg = await db
      .select({
        kursusId: kursus.id,
        totalSiswaSelesai: countDistinct(sql`case when ${quizAttempt.id} is not null and ${quizAttempt.nilai} >= ${KKM} then ${siswaKursus.siswaId} end`).as("totalSiswaSelesai"),
      })
      .from(kursus)
      .leftJoin(siswaKursus, eq(siswaKursus.kursusId, kursus.id))
      .leftJoin(
        quizPublished,
        eq(quizPublished.kursusId, kursus.id),
      )
      .leftJoin(
        quizAttempt,
        and(
          eq(quizAttempt.siswaId, siswaKursus.siswaId),
          eq(quizAttempt.quizPublishedId, quizPublished.id),
          inArray(quizAttempt.status, ["SELESAI", "BELAJAR"]),
        ),
      )
      .where(eq(kursus.guruId, session.userId))
      .groupBy(kursus.id);

    const sertifikatMap = new Map(sertifikatAgg.map((r) => [r.kursusId, Number((r as unknown as { totalSertifikat: number }).totalSertifikat ?? 0)]));
    const selesaiMap = new Map(selesaiAgg.map((r) => [r.kursusId, Number((r as unknown as { totalSiswaSelesai: number }).totalSiswaSelesai ?? 0)]));

    const rows = kursusBase.map((k) => ({
      id: k.id,
      judul: k.judul,
      slug: k.slug,
      deskripsi: k.deskripsi,
      totalSertifikat: sertifikatMap.get(k.id) ?? 0,
      totalSiswaSelesai: selesaiMap.get(k.id) ?? 0,
    }));

    // Sort by totalSertifikat desc (already ordered, but re-sort after merge to be safe)
    rows.sort((a, b) => b.totalSertifikat - a.totalSertifikat);

    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Sertifikat kursus error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
