import { KKM } from "@/lib/constants";
import {
  kursus,
  siswaKursus,
  quizSession,
  quizPublished,
  quizAttempt,
  users,
  jawabanLog,
  soal,
  soalPublished,
  aiGeneration,
  studentAbility,
  skill,
  skillMastery,
} from "@/lib/db/schema";
import { and, asc, desc, eq, gte, isNull, sql, inArray, count, avg, countDistinct } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { cacheGet, cacheSet, cacheKey } from "@/lib/cache-layer";
import { db } from "@/lib/db";

const CACHE_TTL = 30;

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);
    const guruId = session.userId;

    const rl = await checkRateLimitPerUser(`analytics:${guruId}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    await db.execute(sql`SET LOCAL statement_timeout = '30000'`);

    const rawPeriode = request.nextUrl.searchParams.get("periode") || "28d";
    const periode: "7d" | "28d" | "90d" =
      rawPeriode === "7d" || rawPeriode === "28d" || rawPeriode === "90d" ? rawPeriode : "28d";
    const days = periode === "7d" ? 7 : periode === "90d" ? 90 : 28;
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - days);

    const cacheK = cacheKey("analytics", "guru", guruId, `periode:${periode}`, "v1");
    const cached = await cacheGet(cacheK);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": `private, max-age=${CACHE_TTL}, stale-while-revalidate=300` },
      });
    }

    const [kursusList, siswaList, draftsList, kuisList] = await Promise.all([
      db.select({ id: kursus.id, judul: kursus.judul }).from(kursus).where(eq(kursus.guruId, guruId)),
      db
        .selectDistinct({ siswaId: siswaKursus.siswaId })
        .from(siswaKursus)
        .innerJoin(kursus, eq(siswaKursus.kursusId, kursus.id))
        .where(and(eq(kursus.guruId, guruId), eq(siswaKursus.status, "AKTIF"))),
      db
        .select({ id: aiGeneration.id })
        .from(aiGeneration)
        .where(eq(aiGeneration.guruId, guruId)),
      db
        .select({ id: quizSession.id })
        .from(quizSession)
        .innerJoin(kursus, eq(quizSession.kursusId, kursus.id))
        .where(and(eq(kursus.guruId, guruId), eq(quizSession.isActive, true))),
    ]);

    const kursusIds = kursusList.map((k) => k.id);

    // ---------- kursusBreakdown: 2 agregasi (enrollAgg + attemptAgg) ----------
    type EnrollAggRow = { kursusId: string; totalSiswa: number };
    type AttemptAggRow = {
      kursusId: string;
      totalAttempt: number;
      rataNilai: number;
      tuntas: number;
      belumTuntas: number;
    };

    let enrollAgg: EnrollAggRow[] = [];
    let attemptAgg: AttemptAggRow[] = [];

    if (kursusIds.length > 0) {
      const [ea, aa] = await Promise.all([
        db
          .select({
            kursusId: siswaKursus.kursusId,
            totalSiswa: countDistinct(siswaKursus.siswaId).as("totalSiswa"),
          })
          .from(siswaKursus)
          .where(and(inArray(siswaKursus.kursusId, kursusIds), eq(siswaKursus.status, "AKTIF")))
          .groupBy(siswaKursus.kursusId) as Promise<EnrollAggRow[]>,
        db
          .select({
            kursusId: quizPublished.kursusId,
            totalAttempt: count(sql`1`).as("totalAttempt"),
            rataNilai: sql<number>`coalesce(avg(${quizAttempt.nilai}), 0)`.as("rataNilai"),
            tuntas: countDistinct(sql`case when ${quizAttempt.nilai} >= ${KKM} then ${quizAttempt.siswaId} end`).as("tuntas"),
            belumTuntas: countDistinct(sql`case when ${quizAttempt.nilai} < ${KKM} then ${quizAttempt.siswaId} end`).as("belumTuntas"),
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(
            and(
              inArray(quizPublished.kursusId, kursusIds),
              sql`${quizAttempt.status} in ('SELESAI','BELAJAR')`,
              gte(quizAttempt.waktuSelesai, since),
            ),
          )
          .groupBy(quizPublished.kursusId) as Promise<AttemptAggRow[]>,
      ]);
      enrollAgg = ea;
      attemptAgg = aa;
    }

    const enrollMap = new Map(enrollAgg.map((r) => [r.kursusId, r.totalSiswa]));
    const attemptMap = new Map(attemptAgg.map((r) => [r.kursusId, r]));

    const kursusBreakdown = kursusList.map((k) => {
      const a = attemptMap.get(k.id);
      return {
        kursusId: k.id,
        judul: k.judul,
        totalSiswa: enrollMap.get(k.id) ?? 0,
        totalAttempt: a ? Number(a.totalAttempt) : 0,
        rataNilai: a ? Math.round(Number(a.rataNilai)) : 0,
        siswaTuntas: a ? Number(a.tuntas) : 0,
        siswaBelumTuntas: a ? Number(a.belumTuntas) : 0,
      };
    });

    const totalAttemptAll = kursusBreakdown.reduce((s, k) => s + k.totalAttempt, 0);

    // ---------- global distinct tuntas / belumTuntas + rataNilaiKeseluruhan (AVG DB) ----------
    let totalSiswaTuntas = 0;
    let totalSiswaBelumTuntas = 0;
    let rataNilaiKeseluruhan = 0;

    if (kursusIds.length > 0) {
      const [distinctRow, avgRow] = await Promise.all([
        db
          .select({
            tuntas: countDistinct(sql`case when ${quizAttempt.nilai} >= ${KKM} then ${quizAttempt.siswaId} end`).as("tuntas"),
            belumTuntas: countDistinct(sql`case when ${quizAttempt.nilai} < ${KKM} then ${quizAttempt.siswaId} end`).as("belumTuntas"),
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(
            and(
              inArray(quizPublished.kursusId, kursusIds),
              sql`${quizAttempt.status} in ('SELESAI','BELAJAR')`,
              gte(quizAttempt.waktuSelesai, since),
            ),
          ),
        db
          .select({ avgNilai: avg(quizAttempt.nilai).as("avgNilai") })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(
            and(
              inArray(quizPublished.kursusId, kursusIds),
              sql`${quizAttempt.status} in ('SELESAI','BELAJAR')`,
              gte(quizAttempt.waktuSelesai, since),
            ),
          ),
      ]);
      totalSiswaTuntas = Number((distinctRow[0] as unknown as { tuntas: number }).tuntas ?? 0);
      totalSiswaBelumTuntas = Number((distinctRow[0] as unknown as { belumTuntas: number }).belumTuntas ?? 0);
      const avgVal = (avgRow[0] as unknown as { avgNilai: string | number | null }).avgNilai;
      rataNilaiKeseluruhan = avgVal != null ? Math.round(Number(avgVal)) : 0;
    }

    // ---------- scoreTrend: AVG nilai per week dari quizAttempt ----------
    type ScoreTrendRow = { week: string; rata: number; total: number };
    let scoreTrend: ScoreTrendRow[] = [];
    if (kursusIds.length > 0) {
      try {
        const rows = await db
          .select({
            week: sql<string>`to_char(date_trunc('week', ${quizAttempt.waktuSelesai}), 'YYYY-MM-DD')`.as("week"),
            rata: sql<number>`coalesce(avg(${quizAttempt.nilai}), 0)`.as("rata"),
            total: count(sql`1`).as("total"),
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(
            and(
              inArray(quizPublished.kursusId, kursusIds),
              gte(quizAttempt.waktuSelesai, since),
              sql`${quizAttempt.status} in ('SELESAI','BELAJAR')`,
            ),
          )
          .groupBy(sql`date_trunc('week', ${quizAttempt.waktuSelesai})`)
          .orderBy(sql`date_trunc('week', ${quizAttempt.waktuSelesai})`);
        scoreTrend = (rows as unknown as ScoreTrendRow[]).map((r) => ({
          week: r.week,
          rata: Math.round(Number(r.rata)),
          total: Number(r.total),
        }));
      } catch {
        scoreTrend = [];
      }
    }

    // legacy trend alias for backward compat (same as scoreTrend mapped)
    const trend = scoreTrend.map((r) => ({ minggu: r.week, total: r.total }));

    // ---------- 5 agregasi baru ----------
    type ScoreDistribution = { bucket0_59: number; bucket60_69: number; bucket70_79: number; bucket80_89: number; bucket90_100: number };
    type AttemptTrendRow = { week: string; total: number };
    type HeatmapRow = { dow: number; hour: number; total: number };
    type PerMateriRow = { skillId: string; nama: string; avgBenar: number; total: number };

    let scoreDistribution: ScoreDistribution = { bucket0_59: 0, bucket60_69: 0, bucket70_79: 0, bucket80_89: 0, bucket90_100: 0 };
    let attemptTrend: AttemptTrendRow[] = [];
    let activityHeatmap: HeatmapRow[] = [];
    let performaPerMateri: PerMateriRow[] = [];

    if (kursusIds.length > 0) {
      try {
        const sdRows = await db
          .select({
            bucket0_59: sql<number>`cast(sum(case when ${quizAttempt.nilai} < 60 then 1 else 0 end) as integer)`.as("bucket0_59"),
            bucket60_69: sql<number>`cast(sum(case when ${quizAttempt.nilai} >= 60 and ${quizAttempt.nilai} < 70 then 1 else 0 end) as integer)`.as("bucket60_69"),
            bucket70_79: sql<number>`cast(sum(case when ${quizAttempt.nilai} >= 70 and ${quizAttempt.nilai} < 80 then 1 else 0 end) as integer)`.as("bucket70_79"),
            bucket80_89: sql<number>`cast(sum(case when ${quizAttempt.nilai} >= 80 and ${quizAttempt.nilai} < 90 then 1 else 0 end) as integer)`.as("bucket80_89"),
            bucket90_100: sql<number>`cast(sum(case when ${quizAttempt.nilai} >= 90 then 1 else 0 end) as integer)`.as("bucket90_100"),
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(
            and(
              inArray(quizPublished.kursusId, kursusIds),
              gte(quizAttempt.waktuSelesai, since),
              sql`${quizAttempt.status} in ('SELESAI','BELAJAR')`,
            ),
          );
        const r = sdRows[0] as unknown as ScoreDistribution;
        scoreDistribution = {
          bucket0_59: Number(r.bucket0_59 ?? 0),
          bucket60_69: Number(r.bucket60_69 ?? 0),
          bucket70_79: Number(r.bucket70_79 ?? 0),
          bucket80_89: Number(r.bucket80_89 ?? 0),
          bucket90_100: Number(r.bucket90_100 ?? 0),
        };
      } catch {
        // keep zeros
      }

      try {
        const atRows = await db
          .select({
            week: sql<string>`to_char(date_trunc('week', ${quizAttempt.waktuSelesai}), 'YYYY-MM-DD')`.as("week"),
            total: count(sql`1`).as("total"),
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(
            and(
              inArray(quizPublished.kursusId, kursusIds),
              gte(quizAttempt.waktuSelesai, since),
              sql`${quizAttempt.status} in ('SELESAI','BELAJAR')`,
            ),
          )
          .groupBy(sql`date_trunc('week', ${quizAttempt.waktuSelesai})`)
          .orderBy(sql`date_trunc('week', ${quizAttempt.waktuSelesai})`);
        attemptTrend = (atRows as unknown as AttemptTrendRow[]).map((x) => ({ week: x.week, total: Number(x.total) }));
      } catch {
        attemptTrend = [];
      }

      try {
        const hmRows = await db
          .select({
            dow: sql<number>`cast(extract(dow from ${quizAttempt.waktuMulai}) as integer)`.as("dow"),
            hour: sql<number>`cast(extract(hour from ${quizAttempt.waktuMulai}) as integer)`.as("hour"),
            total: count(sql`1`).as("total"),
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(
            and(
              inArray(quizPublished.kursusId, kursusIds),
              gte(quizAttempt.waktuMulai, since),
            ),
          )
          .groupBy(sql`extract(dow from ${quizAttempt.waktuMulai})`, sql`extract(hour from ${quizAttempt.waktuMulai})`)
          .orderBy(sql`extract(dow from ${quizAttempt.waktuMulai})`, sql`extract(hour from ${quizAttempt.waktuMulai})`);
        activityHeatmap = (hmRows as unknown as HeatmapRow[]).map((x) => ({ dow: Number(x.dow), hour: Number(x.hour), total: Number(x.total) }));
      } catch {
        activityHeatmap = [];
      }

      try {
        const pmRows = await db
          .select({
            skillId: skill.id,
            nama: skill.nama,
            avgBenar: sql<number>`coalesce(avg(case when ${jawabanLog.isBenar} then 1 else 0 end), 0)`.as("avgBenar"),
            total: count(sql`1`).as("total"),
          })
          .from(jawabanLog)
          .innerJoin(soalPublished, eq(jawabanLog.soalId, soalPublished.id))
          .innerJoin(soal, eq(soalPublished.skillId, soal.skillId))
          .innerJoin(skill, eq(soal.skillId, skill.id))
          .where(and(inArray(skill.kursusId, kursusIds), gte(jawabanLog.createdAt, since)))
          .groupBy(skill.id, skill.nama)
          .orderBy(desc(sql`coalesce(avg(case when ${jawabanLog.isBenar} then 1 else 0 end), 0)`));
        performaPerMateri = (pmRows as unknown as PerMateriRow[]).map((x) => ({
          skillId: x.skillId,
          nama: x.nama,
          avgBenar: Number(x.avgBenar),
          total: Number(x.total),
        }));
        if (performaPerMateri.length === 0) {
          // F1-5: fallback leftJoin skill.nama, jangan coalesce quizId sebagai nama
          const fallback = await db
            .select({
              skillId: soalPublished.skillId,
              nama: skill.nama,
              avgBenar: sql<number>`coalesce(avg(case when ${jawabanLog.isBenar} then 1 else 0 end), 0)`.as("avgBenar"),
              total: count(sql`1`).as("total"),
            })
            .from(jawabanLog)
            .innerJoin(soalPublished, eq(jawabanLog.soalId, soalPublished.id))
            .leftJoin(skill, eq(soalPublished.skillId, skill.id))
            .innerJoin(quizPublished, eq(soalPublished.quizPublishedId, quizPublished.id))
            .where(inArray(quizPublished.kursusId, kursusIds))
            .groupBy(soalPublished.skillId, skill.nama);
          performaPerMateri = (fallback as unknown as PerMateriRow[]).map((x) => ({
            skillId: (x.skillId as unknown as string) ?? "",
            nama: (x.nama as unknown as string) ?? "",
            avgBenar: Number(x.avgBenar),
            total: Number(x.total),
          }));
        }
      } catch {
        performaPerMateri = [];
      }
    }

    // ---------- remedial: avg nilai per siswa via DB ----------
    type RemedialEntry = { siswaId: string; nama: string; rataNilai: number; totalAttempt: number; kursus: string[] };

    // Build remedialSiswaIds from DB avg < KKM within periode
    let remedialSiswaIds = new Set<string>();
    let remedialScores = new Map<string, { total: number; count: number }>();
    if (kursusIds.length > 0) {
      try {
        const avgPerSiswa = await db
          .select({
            siswaId: quizAttempt.siswaId,
            avgNilai: sql<number>`avg(${quizAttempt.nilai})`.as("avgNilai"),
            totalAttempt: count(sql`1`).as("totalAttempt"),
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(
            and(
              inArray(quizPublished.kursusId, kursusIds),
              gte(quizAttempt.waktuSelesai, since),
              sql`${quizAttempt.status} in ('SELESAI','BELAJAR')`,
            ),
          )
          .groupBy(quizAttempt.siswaId)
          .having(sql`avg(${quizAttempt.nilai}) < ${KKM}`);
        for (const row of avgPerSiswa as unknown as { siswaId: string; avgNilai: number; totalAttempt: number }[]) {
          remedialSiswaIds.add(row.siswaId);
          remedialScores.set(row.siswaId, { total: Number(row.avgNilai) * Number(row.totalAttempt), count: Number(row.totalAttempt) });
        }
      } catch {
        // fallback empty
      }
    }

    type WeakTopic = {
      soalId: string;
      pertanyaan: string;
      tipe: string;
      totalJawab: number;
      totalBenar: number;
      totalSalah: number;
      errorRate: number;
    };

    const [remedialList, weakTopics] = await Promise.all([
      (async (): Promise<RemedialEntry[]> => {
        if (remedialSiswaIds.size === 0) return [];
        const remedialUsers = await db
          .select({ id: users.id, nama: users.nama })
          .from(users)
          .where(inArray(users.id, Array.from(remedialSiswaIds)));
        const userMap = new Map(remedialUsers.map((u) => [u.id, u.nama]));
        // need kursus per siswa
        const kursusPerSiswa = kursusIds.length
          ? await db
              .select({ siswaId: quizAttempt.siswaId, kursusId: quizPublished.kursusId })
              .from(quizAttempt)
              .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
              .where(
                and(
                  inArray(quizPublished.kursusId, kursusIds),
                  inArray(quizAttempt.siswaId, Array.from(remedialSiswaIds)),
                  gte(quizAttempt.waktuSelesai, since),
                ),
              )
          : [];
        const kursusBySiswa = new Map<string, Set<string>>();
        for (const r of kursusPerSiswa as unknown as { siswaId: string; kursusId: string }[]) {
          if (!kursusBySiswa.has(r.siswaId)) kursusBySiswa.set(r.siswaId, new Set());
          kursusBySiswa.get(r.siswaId)!.add(r.kursusId);
        }
        const list: RemedialEntry[] = [];
        for (const siswaId of remedialSiswaIds) {
          const score = remedialScores.get(siswaId);
          const avg = score && score.count > 0 ? Math.round(score.total / score.count) : 0;
          const cIds = kursusBySiswa.get(siswaId) ?? new Set<string>();
          const studentCourses = kursusList.filter((k) => cIds.has(k.id)).map((k) => k.judul);
          list.push({
            siswaId,
            nama: userMap.get(siswaId) ?? "Siswa",
            rataNilai: avg,
            totalAttempt: score?.count ?? 0,
            kursus: studentCourses,
          });
        }
        list.sort((a, b) => a.rataNilai - b.rataNilai);
        return list.slice(0, 50);
      })(),
      (async (): Promise<WeakTopic[]> => {
        try {
          if (kursusIds.length === 0) return [];
          const jawabanStats = await db
            .select({
              soalId: jawabanLog.soalId,
              totalJawab: sql<number>`cast(count(*) as integer)`.as("totalJawab"),
              totalBenar: sql<number>`cast(sum(case when ${jawabanLog.isBenar} then 1 else 0 end) as integer)`.as("totalBenar"),
              totalSalah: sql<number>`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as integer)`.as("totalSalah"),
            })
            .from(jawabanLog)
            .innerJoin(soalPublished, eq(jawabanLog.soalId, soalPublished.id))
            .innerJoin(skill, eq(soalPublished.skillId, skill.id))
            .where(inArray(skill.kursusId, kursusIds))
            .groupBy(jawabanLog.soalId)
            .having(sql`count(*) >= 3`)
            .orderBy(desc(sql`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as real) / cast(count(*) as real)`))
            .limit(10);
          if (jawabanStats.length === 0) return [];
          const soalIds = (jawabanStats as unknown as { soalId: string }[]).map((s) => s.soalId);
          const soalMap = await db
            .select({ id: soalPublished.id, teks: soalPublished.pertanyaan, tipe: soalPublished.tipe })
            .from(soalPublished)
            .where(inArray(soalPublished.id, soalIds));
          const soalLookup = new Map(soalMap.map((s) => [s.id, s]));
          const topics: WeakTopic[] = [];
          for (const stat of jawabanStats as unknown as { soalId: string; totalJawab: number; totalBenar: number; totalSalah: number }[]) {
            const s = soalLookup.get(stat.soalId);
            topics.push({
              soalId: stat.soalId,
              pertanyaan: s?.teks ?? "Soal tidak ditemukan",
              tipe: s?.tipe ?? "PG",
              totalJawab: Number(stat.totalJawab),
              totalBenar: Number(stat.totalBenar),
              totalSalah: Number(stat.totalSalah),
              errorRate: stat.totalJawab > 0 ? Math.round((Number(stat.totalSalah) / Number(stat.totalJawab)) * 100) : 0,
            });
          }
          return topics;
        } catch {
          return [];
        }
      })(),
    ]);

    type RemedialDetailEntry = {
      siswaId: string;
      nama: string;
      jumlahSoalSalah: number;
      topMateri: string | null;
      persenBenar: number;
    };
    const remedialDetail = await (async (): Promise<RemedialDetailEntry[]> => {
      try {
        if (remedialSiswaIds.size === 0) return [];
        // F2-1: GROUP BY di DB, bukan LIMIT 2000 raw + JS Map
        // Gunakan MODE() WITHIN GROUP untuk topMateri, fallback ke max() jika tidak support
        let rows: { siswaId: string; nama: string | null; jumlahSoalSalah: number; topMateri: string | null; persenBenar: number }[] = [];
        try {
          const grouped = await db
            .select({
              siswaId: jawabanLog.siswaId,
              nama: users.nama,
              jumlahSoalSalah: sql<number>`count(distinct case when ${jawabanLog.isBenar} = false then ${jawabanLog.soalId} end)`.as("jumlahSoalSalah"),
              topMateri: sql<string | null>`mode() within group (order by ${aiGeneration.materiJudul})`.as("topMateri"),
              persenBenar: sql<number>`coalesce(avg(case when ${jawabanLog.isBenar} then 1 else 0 end), 0)`.as("persenBenar"),
            })
            .from(jawabanLog)
            .innerJoin(soalPublished, eq(jawabanLog.soalId, soalPublished.id))
            .innerJoin(aiGeneration, eq(soalPublished.aiGenerationId, aiGeneration.id))
            .leftJoin(users, eq(jawabanLog.siswaId, users.id))
            .where(
              and(
                inArray(jawabanLog.siswaId, Array.from(remedialSiswaIds)),
                eq(aiGeneration.guruId, guruId),
              ),
            )
            .groupBy(jawabanLog.siswaId, users.nama)
            .limit(50);
          rows = grouped as unknown as typeof rows;
        } catch {
          // Fallback jika MODE() tidak support: gunakan max() atau string_agg first value
          try {
            const fallbackRows = await db
              .select({
                siswaId: jawabanLog.siswaId,
                nama: users.nama,
                jumlahSoalSalah: sql<number>`count(distinct case when ${jawabanLog.isBenar} = false then ${jawabanLog.soalId} end)`.as("jumlahSoalSalah"),
                topMateri: sql<string | null>`max(${aiGeneration.materiJudul})`.as("topMateri"),
                persenBenar: sql<number>`coalesce(avg(case when ${jawabanLog.isBenar} then 1 else 0 end), 0)`.as("persenBenar"),
              })
              .from(jawabanLog)
              .innerJoin(soalPublished, eq(jawabanLog.soalId, soalPublished.id))
              .innerJoin(aiGeneration, eq(soalPublished.aiGenerationId, aiGeneration.id))
              .leftJoin(users, eq(jawabanLog.siswaId, users.id))
              .where(
                and(
                  inArray(jawabanLog.siswaId, Array.from(remedialSiswaIds)),
                  eq(aiGeneration.guruId, guruId),
                ),
              )
              .groupBy(jawabanLog.siswaId, users.nama)
              .limit(50);
            rows = fallbackRows as unknown as typeof rows;
          } catch {
            return [];
          }
        }

        const detailList: RemedialDetailEntry[] = rows.map((r) => ({
          siswaId: r.siswaId,
          nama: r.nama ?? "Siswa",
          jumlahSoalSalah: Number(r.jumlahSoalSalah ?? 0),
          topMateri: r.topMateri ?? null,
          persenBenar: Math.round(Number(r.persenBenar ?? 0) * 100),
        }));
        detailList.sort((a, b) => a.persenBenar - b.persenBenar);
        return detailList.slice(0, 50);
      } catch {
        return [];
      }
    })();

    const studentAbilities = kursusIds.length > 0
      ? await db
          .select({
            siswaId: studentAbility.siswaId,
            nama: users.nama,
            kursusId: studentAbility.kursusId,
            theta: studentAbility.theta,
          })
          .from(studentAbility)
          .leftJoin(users, and(eq(studentAbility.siswaId, users.id), isNull(users.deletedAt)))
          .where(inArray(studentAbility.kursusId, kursusIds))
          .orderBy(desc(studentAbility.theta))
          .limit(20)
      : [];

    const soalDifficulty = kursusIds.length > 0
      ? await db
          .select({
            id: soal.id,
            teks: soal.teks,
            tipe: soal.tipe,
            eloRating: soal.eloRating,
            irtA: soal.irtA,
            irtB: soal.irtB,
            irtC: soal.irtC,
          })
          .from(soal)
          .innerJoin(skill, eq(soal.skillId, skill.id))
          .where(inArray(skill.kursusId, kursusIds))
          .orderBy(asc(soal.eloRating))
          .limit(10)
      : [];

    const allSiswaIds = siswaList.map((s) => s.siswaId);
    // F2-1: skillMasteryRaw tambah WHERE pL < 0.8 di DB + LIMIT 50 sebelum select, jangan filter JS
    const skillMasteryRaw = allSiswaIds.length > 0
      ? await db
          .select({
            siswaId: skillMastery.siswaId,
            nama: users.nama,
            skillId: skillMastery.skillId,
            skillNama: skill.nama,
            pL: skillMastery.pL,
            memoryStrength: skillMastery.memoryStrength,
            repetitionNum: skillMastery.repetitionNum,
            lastPracticedAt: skillMastery.lastPracticedAt,
            nextReviewAt: skillMastery.nextReviewAt,
          })
          .from(skillMastery)
          .leftJoin(users, eq(skillMastery.siswaId, users.id))
          .leftJoin(skill, eq(skillMastery.skillId, skill.id))
          .where(and(inArray(skillMastery.siswaId, allSiswaIds), sql`${skillMastery.pL} < 0.8`))
          .limit(50)
      : [];

    const skillMasteryData = skillMasteryRaw.slice(0, 50);

    // ringkasan Hybrid C
    let ringkasanHybrid: { levelCounts: Record<string, number>; soalSulitCount: number; skillMahirCount: number } = {
      levelCounts: {},
      soalSulitCount: 0,
      skillMahirCount: 0,
    };
    try {
      const levelCounts: Record<string, number> = {};
      for (const s of studentAbilities as unknown as { theta: number }[]) {
        const lvl = s.theta >= 1.5 ? "Mahir" : s.theta >= 0.5 ? "Menengah" : s.theta >= -0.5 ? "Dasar" : "Pemula";
        levelCounts[lvl] = (levelCounts[lvl] ?? 0) + 1;
      }
      const sulitCount = (soalDifficulty as unknown as { eloRating: number }[]).filter((x) => Number(x.eloRating) < 900).length;
      const mahirCount = (skillMasteryRaw as unknown as { pL: number }[]).filter((x) => Number(x.pL) >= 0.8).length;
      ringkasanHybrid = { levelCounts, soalSulitCount: sulitCount, skillMahirCount: mahirCount };
    } catch {
      // keep defaults
    }

    const responseData = {
      data: {
        totalKursus: kursusList.length,
        totalSiswa: siswaList.length,
        totalDraft: draftsList.length,
        totalKuisAktif: kuisList.length,
        totalAttempt: totalAttemptAll,
        totalSiswaTuntas,
        totalSiswaBelumTuntas,
        rataNilaiKeseluruhan,
        trend,
        kursusBreakdown,
        remedialList,
        remedialDetail,
        weakTopics,
        studentAbilities: (studentAbilities as unknown as { siswaId: string; nama: string | null; kursusId: string; theta: number }[]).map((s) => ({
          siswaId: s.siswaId,
          nama: s.nama ?? "Siswa",
          kursusId: s.kursusId,
          theta: s.theta,
          level: s.theta >= 1.5 ? "Mahir" : s.theta >= 0.5 ? "Menengah" : s.theta >= -0.5 ? "Dasar" : "Pemula",
        })),
        soalDifficulty: (soalDifficulty as unknown as { id: string; teks: string; tipe: string; eloRating: number; irtA: number; irtB: number; irtC: number }[]).map((s) => ({
          id: s.id,
          pertanyaan: s.teks,
          tipe: s.tipe,
          eloRating: s.eloRating,
          irtA: s.irtA,
          irtB: s.irtB,
          irtC: s.irtC,
          difficulty: s.eloRating < 900 ? "Sulit" : s.eloRating < 1000 ? "Sedang" : "Mudah",
        })),
        skillMastery: skillMasteryData,
        scoreTrend,
        scoreDistribution,
        attemptTrend,
        activityHeatmap,
        performaPerMateri,
        ringkasanHybrid,
        periode,
      },
    };
    await cacheSet(cacheK, responseData, CACHE_TTL);
    return NextResponse.json(responseData, { headers: { "Cache-Control": `private, max-age=${CACHE_TTL}, stale-while-revalidate=300` } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Analytics guru error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
