import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  kursus,
  siswaKursus,
  aiGeneration,
  quizPublished,
  quizAttempt,
  materiPublished,
  jawabanLog,
  soal,
  quotas,
  quotaUsages,
} from "@/lib/db/schema";
import { and, eq, sql, desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);
    const guruId = session.userId;

    const [kursusRows, draftRows, enrolledRows, quizPubRows, quizAttemptRows, materiPubRows, quotaRow] =
      await Promise.all([
        db
          .select({ id: kursus.id, judul: kursus.judul, slug: kursus.slug, deskripsi: kursus.deskripsi, statusPublikasi: kursus.statusPublikasi })
          .from(kursus)
          .where(eq(kursus.guruId, guruId)),

        db
          .select({ id: aiGeneration.id })
          .from(aiGeneration)
          .where(and(eq(aiGeneration.guruId, guruId), eq(aiGeneration.status, "ready"))),

        db
          .selectDistinct({ siswaId: siswaKursus.siswaId })
          .from(siswaKursus)
          .innerJoin(kursus, eq(siswaKursus.kursusId, kursus.id))
          .where(eq(kursus.guruId, guruId)),

        db
          .select({ id: quizPublished.id, kursusId: quizPublished.kursusId })
          .from(quizPublished)
          .innerJoin(kursus, eq(quizPublished.kursusId, kursus.id))
          .where(eq(kursus.guruId, guruId)),

        db
          .selectDistinct({ siswaId: quizAttempt.siswaId })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .innerJoin(kursus, eq(quizPublished.kursusId, kursus.id))
          .where(eq(kursus.guruId, guruId)),

        db
          .select({ id: materiPublished.id })
          .from(materiPublished)
          .innerJoin(kursus, eq(materiPublished.kursusId, kursus.id))
          .where(eq(kursus.guruId, guruId)),

        db
          .select({ limitValue: quotas.limitValue, currentUsage: quotaUsages.currentUsage })
          .from(quotas)
          .leftJoin(quotaUsages, and(eq(quotaUsages.quotaId, quotas.id), eq(quotaUsages.userId, guruId)))
          .where(and(eq(quotas.role, "GURU"), eq(quotas.resourceType, "ai_generation"), eq(quotas.isActive, true)))
          .limit(1),
      ]);

    const totalSiswa = enrolledRows.length;
    const siswaYangPunyaAttempt = quizAttemptRows.length;

    let weakTopics: { pertanyaan: string; errorRate: number; totalJawab: number }[] = [];
    try {
      const jawabanStats = await db
        .select({
          soalId: jawabanLog.soalId,
          totalJawab: sql<number>`cast(count(*) as integer)`,
          totalSalah: sql<number>`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as integer)`,
        })
        .from(jawabanLog)
        .groupBy(jawabanLog.soalId)
        .having(sql`count(*) >= 3`)
        .orderBy(desc(sql`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as real) / cast(count(*) as real)`))
        .limit(3);

      if (jawabanStats.length > 0) {
        const soalIds = jawabanStats.map((s) => s.soalId);
        const soalMap = await db
          .select({ id: soal.id, teks: soal.teks })
          .from(soal)
          .where(inArray(soal.id, soalIds));
        const soalLookup = new Map(soalMap.map((s) => [s.id, s]));
        for (const stat of jawabanStats) {
          const s = soalLookup.get(stat.soalId);
          weakTopics.push({
            pertanyaan: s?.teks ?? "Soal tidak ditemukan",
            errorRate: Math.round((stat.totalSalah / stat.totalJawab) * 100),
            totalJawab: stat.totalJawab,
          });
        }
      }
    } catch {
      // best-effort
    }

    const aiQuotaUsed = quotaRow?.[0]?.currentUsage ?? 0;
    const aiQuotaLimit = quotaRow?.[0]?.limitValue ?? 0;

    return NextResponse.json({
      data: {
        totalKursus: kursusRows.length,
        totalSiswa,
        draftMenunggu: draftRows.length,
        totalKuisDikerjakan: 0,
        siswaBelumMengerjakan: totalSiswa - siswaYangPunyaAttempt,
        totalMateriPublished: materiPubRows.length,
        totalQuizPublished: quizPubRows.length,
        kursusList: kursusRows,
        weakTopics,
        aiQuotaUsed,
        aiQuotaLimit,
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Dashboard guru error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
