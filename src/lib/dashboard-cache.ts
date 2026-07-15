import "server-only";
import { db } from "@/lib/db";
import { cacheGet, cacheSet, cacheDel, cacheKey } from "@/lib/cache-layer";
import {
  kursus,
  siswaKursus,
  aiGeneration,
  quizPublished,
  quizAttempt,
  materiPublished,
  jawabanLog,
  soal,
  skill,
  quotas,
  quotaUsages,
} from "@/lib/db/schema";
import { and, eq, sql, desc, inArray } from "drizzle-orm";
import { calculateRiskScore, getRiskLabel } from "@/lib/analytics/calculateRiskScore";

export interface DashboardSummary {
  totalKursus: number;
  totalSiswa: number;
  draftMenunggu: number;
  totalKuisDikerjakan: number;
  siswaBelumMengerjakan: number;
  totalMateriPublished: number;
  totalQuizPublished: number;
  kursusList: { id: string; judul: string; slug: string; deskripsi: string | null; statusPublikasi: string }[];
  aiQuotaUsed: number;
  aiQuotaLimit: number;
}

export interface DashboardAnalytics {
  weakTopics: { pertanyaan: string; errorRate: number; totalJawab: number }[];
  siswaBerisiko: number;
  siswaKritis: number;
  computedAt: string;
}

export interface DashboardData extends DashboardSummary {
  weakTopics: { pertanyaan: string; errorRate: number; totalJawab: number }[];
  siswaBerisiko: number;
  siswaKritis: number;
}

export async function getCachedDashboard(guruId: string): Promise<DashboardData> {
  const k = cacheKey("dashboard", "guru", guruId);
  const cached = await cacheGet<DashboardData>(k);
  if (cached) return cached;

  const summary = await computeSummary(guruId);

  const analyticsK = cacheKey("analytics", "guru", guruId);
  let analytics = await cacheGet<DashboardAnalytics>(analyticsK);
  if (!analytics) {
    analytics = await computeAnalytics(guruId);
    await cacheSet(analyticsK, analytics, 900);
  }

  const data: DashboardData = { ...summary, ...analytics };
  await cacheSet(k, data, 90);
  return data;
}

export async function computeSummary(guruId: string): Promise<DashboardSummary> {
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

  return {
    totalKursus: kursusRows.length,
    totalSiswa,
    draftMenunggu: draftRows.length,
    totalKuisDikerjakan: quizAttemptRows.length,
    siswaBelumMengerjakan: totalSiswa - siswaYangPunyaAttempt,
    totalMateriPublished: materiPubRows.length,
    totalQuizPublished: quizPubRows.length,
    kursusList: kursusRows,
    aiQuotaUsed: quotaRow?.[0]?.currentUsage ?? 0,
    aiQuotaLimit: quotaRow?.[0]?.limitValue ?? 0,
  };
}

export async function computeAnalytics(guruId: string): Promise<DashboardAnalytics> {
  const kursusRows = await db
    .select({ id: kursus.id })
    .from(kursus)
    .where(eq(kursus.guruId, guruId));

  const kursusIds = kursusRows.map((k) => k.id);

  let weakTopics: { pertanyaan: string; errorRate: number; totalJawab: number }[] = [];
  if (kursusIds.length > 0) {
    try {
      const jawabanStats = await db
        .select({
          soalId: jawabanLog.soalId,
          totalJawab: sql<number>`cast(count(*) as integer)`,
          totalSalah: sql<number>`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as integer)`,
        })
        .from(jawabanLog)
        .innerJoin(soal, eq(jawabanLog.soalId, soal.id))
        .innerJoin(skill, eq(soal.skillId, skill.id))
        .innerJoin(kursus, eq(skill.kursusId, kursus.id))
        .where(inArray(kursus.id, kursusIds))
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
        weakTopics = jawabanStats.map((stat) => {
          const s = soalLookup.get(stat.soalId);
          return {
            pertanyaan: s?.teks ?? "Soal tidak ditemukan",
            errorRate: Math.round((stat.totalSalah / stat.totalJawab) * 100),
            totalJawab: stat.totalJawab,
          };
        });
      }
    } catch { /* best-effort */ }
  }

  let siswaBerisiko = 0;
  let siswaKritis = 0;
  try {
    const enrolledRows = await db
      .selectDistinct({ siswaId: siswaKursus.siswaId })
      .from(siswaKursus)
      .innerJoin(kursus, eq(siswaKursus.kursusId, kursus.id))
      .where(eq(kursus.guruId, guruId));

    const enrolledSiswaIds = enrolledRows.map((r) => r.siswaId);
    if (enrolledSiswaIds.length > 0) {
      const [quizStats, userRows] = await Promise.all([
        db
          .select({
            siswaId: quizAttempt.siswaId,
            total: sql<number>`cast(count(*) as integer)`,
            benar: sql<number>`cast(sum(case when ${quizAttempt.nilai} >= 70 then 1 else 0 end) as integer)`,
          })
          .from(quizAttempt)
          .where(inArray(quizAttempt.siswaId, enrolledSiswaIds))
          .groupBy(quizAttempt.siswaId),
        db.execute<{ id: string; last_active_at: string | null }>(sql`
          SELECT id, last_active_at FROM users WHERE id = ANY(${enrolledSiswaIds}::uuid[])
        `),
      ]);

      const quizMap = new Map(quizStats.map((s) => [s.siswaId, s]));
      const loginMap = new Map((userRows.rows ?? []).map((u) => [u.id, u.last_active_at]));
      const now = Date.now();
      const DAY_MS = 86_400_000;

      for (const siswaId of enrolledSiswaIds) {
        const qs = quizMap.get(siswaId);
        const quizPerf = qs && qs.total > 0 ? qs.benar / qs.total : 0;
        const lastLogin = loginMap.get(siswaId);
        const loginGap = lastLogin ? Math.max(0, (now - new Date(lastLogin).getTime()) / DAY_MS) : 30;
        const risk = calculateRiskScore({
          completionRate: quizPerf,
          quizPerformance: quizPerf,
          attendanceRate: 0.5,
          loginGap,
          timelinessRate: 0.5,
          participationRate: qs && qs.total > 0 ? 1 : 0,
        });
        const label = getRiskLabel(risk);
        if (label === "berisiko") siswaBerisiko++;
        if (label === "kritis") siswaKritis++;
      }
    }
  } catch { /* best-effort */ }

  return {
    weakTopics,
    siswaBerisiko,
    siswaKritis,
    computedAt: new Date().toISOString(),
  };
}

export async function invalidateGuruCache(guruId: string): Promise<void> {
  await cacheDel(cacheKey("dashboard", "guru", guruId));
  await cacheDel(cacheKey("analytics", "guru", guruId));
}

export async function refreshGuruAnalytics(guruId: string): Promise<void> {
  const analytics = await computeAnalytics(guruId);
  await cacheSet(cacheKey("analytics", "guru", guruId), analytics, 900);
  await cacheDel(cacheKey("dashboard", "guru", guruId));
}