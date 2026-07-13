import { KKM } from "@/lib/constants";
import {
  kursus,
  siswaKursus,
  quizSession,
  eventStore,
  quizPublished,
  quizAttempt,
  users,
  jawabanLog,
  soal,
} from "@/lib/db/schema";
import { and, desc, eq, gte, sql, like, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const guruId = session.userId;

    const rl = await checkRateLimitPerUser(`analytics:${guruId}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const now = new Date();
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(now.getDate() - 28);

  const [kursusList, siswaList, draftsList, kuisList, weekData] = await Promise.all([
    db
      .select({ id: kursus.id, judul: kursus.judul })
      .from(kursus)
      .where(eq(kursus.guruId, guruId)),
    db
      .selectDistinct({ siswaId: siswaKursus.siswaId })
      .from(siswaKursus)
      .innerJoin(kursus, eq(siswaKursus.kursusId, kursus.id))
      .where(eq(kursus.guruId, guruId)),
    db
      .select({ id: eventStore.id })
      .from(eventStore)
      .where(
        and(
          eq(eventStore.streamId, `upload:${guruId}`),
          like(eventStore.eventType, "doc.%"),
        ),
      ),
    db
      .select({ id: quizSession.id })
      .from(quizSession)
      .innerJoin(kursus, eq(quizSession.kursusId, kursus.id))
      .where(and(eq(kursus.guruId, guruId), eq(quizSession.isActive, true))),
    db
      .select({
        week: sql<string>`to_char(date_trunc('week', ${eventStore.createdAt}), 'YYYY-MM-DD')`,
        total: sql<number>`cast(count(*) as integer)`,
      })
      .from(eventStore)
      .where(
        and(
          eq(eventStore.streamId, `upload:${guruId}`),
          gte(eventStore.createdAt, fourWeeksAgo),
        ),
      )
      .groupBy(sql`date_trunc('week', ${eventStore.createdAt})`)
      .orderBy(sql`date_trunc('week', ${eventStore.createdAt})`),
  ]);

  const trend: { minggu: string; total: number }[] = [];
  for (let i = 0; i < 4; i++) {
    trend.push({
      minggu: `Minggu ${i + 1}`,
      total: i < weekData.length ? weekData[i].total : 0,
    });
  }

  const kursusIds = kursusList.map((k) => k.id);

  const [enrollments, allAttempts, quizPubs] = await Promise.all([
    kursusIds.length
      ? db
          .select({ kursusId: siswaKursus.kursusId, siswaId: siswaKursus.siswaId })
          .from(siswaKursus)
          .where(and(inArray(siswaKursus.kursusId, kursusIds), eq(siswaKursus.status, "AKTIF")))
      : Promise.resolve([]),
    kursusIds.length
      ? db
          .select({
            id: quizAttempt.id,
            quizPublishedId: quizAttempt.quizPublishedId,
            siswaId: quizAttempt.siswaId,
            nilai: quizAttempt.nilai,
            status: quizAttempt.status,
          })
          .from(quizAttempt)
          .innerJoin(quizPublished, eq(quizAttempt.quizPublishedId, quizPublished.id))
          .where(inArray(quizPublished.kursusId, kursusIds))
      : Promise.resolve([]),
    kursusIds.length
      ? db
          .select()
          .from(quizPublished)
          .where(inArray(quizPublished.kursusId, kursusIds))
      : Promise.resolve([]),
  ]);

  const kursusBreakdown = kursusList.map((k) => {
    const enrolledSiswa = enrollments.filter((e) => e.kursusId === k.id);
    const enrolledIds = new Set(enrolledSiswa.map((e) => e.siswaId));
    const courseQuizIds = new Set(
      quizPubs.filter((q) => q.kursusId === k.id).map((q) => q.id),
    );
    const courseAttempts = allAttempts.filter((a) => courseQuizIds.has(a.quizPublishedId));
    const attemptedSiswa = new Set(courseAttempts.map((a) => a.siswaId));
    const completedAttempts = courseAttempts.filter((a) => a.status === "SELESAI");
    const nilaiList = completedAttempts.map((a) => a.nilai).filter((n): n is number => n !== null);
    const rataNilai = nilaiList.length > 0
      ? Math.round(nilaiList.reduce((s, n) => s + n, 0) / nilaiList.length)
      : 0;
    const siswaTuntas = new Set(
      completedAttempts.filter((a) => (a.nilai ?? 0) >= KKM).map((a) => a.siswaId),
    );
    const siswaBelumTuntas = new Set(
      Array.from(attemptedSiswa).filter((id) => !siswaTuntas.has(id)),
    );

    return {
      kursusId: k.id,
      judul: k.judul,
      totalSiswa: enrolledIds.size,
      totalAttempt: completedAttempts.length,
      rataNilai,
      siswaTuntas: siswaTuntas.size,
      siswaBelumTuntas: siswaBelumTuntas.size,
    };
  });

  const totalSiswaBelumTuntas = kursusBreakdown.reduce((s, k) => s + k.siswaBelumTuntas, 0);
  const totalSiswaTuntas = kursusBreakdown.reduce((s, k) => s + k.siswaTuntas, 0);
  const totalAttemptAll = kursusBreakdown.reduce((s, k) => s + k.totalAttempt, 0);

  const remedialSiswaIds = new Set<string>();
  const remedialScores = new Map<string, { total: number; count: number }>();
  for (const a of allAttempts) {
    if (a.nilai === null) continue;
    if (!remedialScores.has(a.siswaId)) {
      remedialScores.set(a.siswaId, { total: 0, count: 0 });
    }
    const entry = remedialScores.get(a.siswaId)!;
    entry.total += a.nilai;
    entry.count += 1;
  }
  for (const [siswaId, score] of remedialScores) {
    if (score.count > 0) {
      const avg = score.total / score.count;
      if (avg < KKM) {
        remedialSiswaIds.add(siswaId);
      }
    }
  }

  type RemedialEntry = {
    siswaId: string;
    nama: string;
    rataNilai: number;
    totalAttempt: number;
    kursus: string[];
  };

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
      const list: RemedialEntry[] = [];
      if (remedialSiswaIds.size === 0) return list;
      const remedialUsers = await db
        .select({ id: users.id, nama: users.nama })
        .from(users)
        .where(inArray(users.id, Array.from(remedialSiswaIds)));
      const userMap = new Map(remedialUsers.map((u) => [u.id, u.nama]));
      for (const siswaId of remedialSiswaIds) {
        const score = remedialScores.get(siswaId)!;
        const avg = Math.round(score.total / score.count);
        const studentCourseIds = new Set(
          allAttempts.filter((a) => a.siswaId === siswaId).map((a) => {
            const q = quizPubs.find((qp) => qp.id === a.quizPublishedId);
            return q?.kursusId;
          }).filter(Boolean),
        );
        const studentCourses = kursusList.filter((k) => studentCourseIds.has(k.id)).map((k) => k.judul);
        list.push({
          siswaId,
          nama: userMap.get(siswaId) ?? "Siswa",
          rataNilai: avg,
          totalAttempt: score.count,
          kursus: studentCourses,
        });
      }
      list.sort((a, b) => a.rataNilai - b.rataNilai);
      return list;
    })(),
    (async (): Promise<WeakTopic[]> => {
      try {
        const jawabanStats = await db
          .select({
            soalId: jawabanLog.soalId,
            totalJawab: sql<number>`cast(count(*) as integer)`,
            totalBenar: sql<number>`cast(sum(case when ${jawabanLog.isBenar} then 1 else 0 end) as integer)`,
            totalSalah: sql<number>`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as integer)`,
          })
          .from(jawabanLog)
          .groupBy(jawabanLog.soalId)
          .having(sql`count(*) >= 3`)
          .orderBy(desc(sql`cast(sum(case when ${jawabanLog.isBenar} then 0 else 1 end) as real) / cast(count(*) as real)`))
          .limit(10);

        if (jawabanStats.length === 0) return [];
        const soalIds = jawabanStats.map((s) => s.soalId);
        const soalMap = await db
          .select({ id: soal.id, teks: soal.teks, tipe: soal.tipe })
          .from(soal)
          .where(inArray(soal.id, soalIds));
        const soalLookup = new Map(soalMap.map((s) => [s.id, s]));
        const topics: WeakTopic[] = [];
        for (const stat of jawabanStats) {
          const s = soalLookup.get(stat.soalId);
          topics.push({
            soalId: stat.soalId,
            pertanyaan: s?.teks ?? "Soal tidak ditemukan",
            tipe: s?.tipe ?? "PG",
            totalJawab: stat.totalJawab,
            totalBenar: stat.totalBenar,
            totalSalah: stat.totalSalah,
            errorRate: Math.round((stat.totalSalah / stat.totalJawab) * 100),
          });
        }
        return topics;
      } catch {
        return [];
      }
    })(),
  ]);

  const totalSemuaNilai = kursusBreakdown.reduce((s, k) => s + k.rataNilai * k.totalAttempt, 0);
  const rataNilaiKeseluruhan = totalAttemptAll > 0
    ? Math.round(totalSemuaNilai / totalAttemptAll)
    : 0;

  return NextResponse.json({
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
      weakTopics,
    },
  }, { headers: { "Cache-Control": "private, max-age=120, stale-while-revalidate=300" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Analytics guru error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
