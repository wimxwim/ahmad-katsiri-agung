import { NextRequest, NextResponse } from "next/server";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import {
  users,
  kursus,
  materiPublished,
  quizPublished,
  quizAttempt,
  siswaKursus,
  eventStore,
  fileMateri,
  teacherReadinessSnapshot,
  aiRequests,
} from "@/lib/db/schema";
import { and, eq, sql, gte, inArray, or } from "drizzle-orm";
import { calculateTRI, getTRILabel } from "@/lib/analytics/calculateTRI";

export async function GET(request: NextRequest) {
  try {
  const session = await requireOwner(request);

  const rl = await checkRateLimitPerUser(`owner-tri:${session.userId}`, 5, 60_000);
  if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);

  const allGurus = await db
    .select({ id: users.id, nama: users.nama, email: users.email })
    .from(users)
    .where(eq(users.role, "GURU"));

  const guruIds = allGurus.map((g) => g.id);

  const [
    materiCounts, quizCounts, courseCounts, enrollCounts, attemptCounts, eventWeeks, fileCounts,
    totalSiswa, totalKursus, aiCostToday, aiCostMonth, aiRequestsToday, activeGurus7d,
  ] = await Promise.all([
    db.select({ guruId: materiPublished.guruId, cnt: sql<number>`cast(count(*) as integer)` })
      .from(materiPublished).where(inArray(materiPublished.guruId, guruIds)).groupBy(materiPublished.guruId),
    db.select({ guruId: quizPublished.guruId, cnt: sql<number>`cast(count(*) as integer)` })
      .from(quizPublished).where(inArray(quizPublished.guruId, guruIds)).groupBy(quizPublished.guruId),
    db.select({ guruId: kursus.guruId, cnt: sql<number>`cast(count(*) as integer)` })
      .from(kursus).where(inArray(kursus.guruId, guruIds)).groupBy(kursus.guruId),
    db.select({ guruId: kursus.guruId, enrollCnt: sql<number>`cast(count(${siswaKursus.id}) as integer)` })
      .from(kursus).leftJoin(siswaKursus, eq(kursus.id, siswaKursus.kursusId))
      .where(inArray(kursus.guruId, guruIds)).groupBy(kursus.guruId),
    db.select({ guruId: kursus.guruId, attemptCnt: sql<number>`cast(count(${quizAttempt.id}) as integer)` })
      .from(kursus).leftJoin(quizPublished, eq(kursus.id, quizPublished.kursusId))
      .leftJoin(quizAttempt, and(eq(quizPublished.id, quizAttempt.quizPublishedId), or(eq(quizAttempt.status, "SELESAI"), eq(quizAttempt.status, "BELAJAR"))))
      .where(inArray(kursus.guruId, guruIds)).groupBy(kursus.guruId),
    db.select({ guruId: sql<string>`split_part(${eventStore.streamId}, ':', 2)`,
      weekCount: sql<number>`cast(count(distinct date_trunc('week', ${eventStore.createdAt})) as integer)` })
      .from(eventStore).where(and(sql`${eventStore.streamId} like 'upload:%'`, gte(eventStore.createdAt, ninetyDaysAgo)))
      .groupBy(sql`split_part(${eventStore.streamId}, ':', 2)`),
    db.select({ guruId: fileMateri.guruId, cnt: sql<number>`cast(count(*) as integer)` })
      .from(fileMateri).where(inArray(fileMateri.guruId, guruIds)).groupBy(fileMateri.guruId),

    db.select({ cnt: sql<number>`cast(count(*) as integer)` }).from(users).where(eq(users.role, "SISWA")),
    db.select({ cnt: sql<number>`cast(count(*) as integer)` }).from(kursus),
    db.select({ cost: sql<number>`cast(coalesce(sum(${aiRequests.totalTokens}), 0) as integer)` })
      .from(aiRequests).where(gte(aiRequests.createdAt, todayStart)),
    db.select({ cost: sql<number>`cast(coalesce(sum(${aiRequests.totalTokens}), 0) as integer)` })
      .from(aiRequests).where(gte(aiRequests.createdAt, monthStart)),
    db.select({ cnt: sql<number>`cast(count(*) as integer)` })
      .from(aiRequests).where(gte(aiRequests.createdAt, todayStart)),
    db.select({ guruId: eventStore.streamId })
      .from(eventStore).where(and(sql`${eventStore.streamId} like 'upload:%'`, gte(eventStore.createdAt, sevenDaysAgo)))
      .groupBy(eventStore.streamId),
  ]);

  const toMap = (arr: { guruId: string | null }[], key: string): Map<string, number> => {
    const m = new Map<string, number>();
    for (const row of arr) {
      if (row.guruId) m.set(row.guruId, (row as unknown as Record<string, number>)[key] ?? 0);
    }
    return m;
  };

  const materiMap = toMap(materiCounts, "cnt");
  const quizMap = toMap(quizCounts, "cnt");
  const courseMap = toMap(courseCounts, "cnt");
  const enrollMap = toMap(enrollCounts, "enrollCnt");
  const attemptMap = toMap(attemptCounts, "attemptCnt");
  const fileMap = toMap(fileCounts, "cnt");
  const eventMap = toMap(eventWeeks, "weekCount");

  const maxMateri = Math.max(...Array.from(materiMap.values()), 1);
  const maxAttempt = Math.max(...Array.from(attemptMap.values()), 1);

  const results: {
    guruId: string;
    nama: string;
    email: string;
    triScore: number;
    label: string;
    komponen: {
      materi: number;
      responsivitas: number;
      gradingSpeed: number;
      variasi: number;
      efektivitas: number;
      konsistensi: number;
    };
  }[] = [];

  for (const guru of allGurus) {
    const gId = guru.id;
    const mCount = materiMap.get(gId) ?? 0;
    const qCount = quizMap.get(gId) ?? 0;
    const cCount = courseMap.get(gId) ?? 0;
    const eCount = enrollMap.get(gId) ?? 0;
    const aCount = attemptMap.get(gId) ?? 0;
    const fCount = fileMap.get(gId) ?? 0;
    const wCount = eventMap.get(gId) ?? 0;

    const materi = maxMateri > 0 ? Math.min(mCount / maxMateri, 1) : 0;
    const responsivitas = eCount > 0 ? Math.min(aCount / eCount, 1) : 0;
    const gradingSpeed = maxAttempt > 0 ? Math.min(aCount / maxAttempt, 1) : 0;
    const distinctTypes = [mCount > 0, qCount > 0, fCount > 0, cCount > 1].filter(Boolean).length;
    const variasi = Math.min(distinctTypes / 4, 1);
    const efektivitas = eCount > 0 ? Math.min(aCount / (eCount * 2), 1) : 0;
    const konsistensi = Math.min(wCount / 12, 1);

    const komponen = { materi, responsivitas, gradingSpeed, variasi, efektivitas, konsistensi };
    const triScore = calculateTRI(komponen);
    const label = getTRILabel(triScore);

    results.push({
      guruId: gId,
      nama: guru.nama,
      email: guru.email,
      triScore: Math.round(triScore * 100) / 100,
      label,
      komponen,
    });
  }

  results.sort((a, b) => b.triScore - a.triScore);

  for (const r of results) {
    try {
      await db.insert(teacherReadinessSnapshot).values({
        guruId: r.guruId,
        triScore: r.triScore,
        komponen: r.komponen,
        snapshotDate: now,
      });
    } catch {
      // best-effort insert — snapshot history is non-critical
    }
  }

  return NextResponse.json({
    metrics: {
      totalGuru: allGurus.length,
      totalSiswa: totalSiswa[0]?.cnt ?? 0,
      totalKursus: totalKursus[0]?.cnt ?? 0,
      aiTokensToday: aiCostToday[0]?.cost ?? 0,
      aiTokensMonth: aiCostMonth[0]?.cost ?? 0,
      aiRequestsToday: aiRequestsToday[0]?.cnt ?? 0,
      activeGurus7d: activeGurus7d.length,
    },
    data: results,
  });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Owner TRI error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
