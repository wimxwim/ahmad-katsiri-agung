import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
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
} from "@/lib/db/schema";
import { and, eq, sql, gte, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { calculateTRI, getTRILabel } from "@/lib/analytics/calculateTRI";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;
  if (!session || session.role !== "owner") {
    return NextResponse.json({ data: null, error: "Hanya owner" }, { status: 403 });
  }

  const allGurus = await db
    .select({ id: users.id, nama: users.nama, email: users.email })
    .from(users)
    .where(eq(users.role, "GURU"));

  if (allGurus.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const guruIds = allGurus.map((g) => g.id);
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);

  const [materiCounts, quizCounts, courseCounts, enrollCounts, attemptCounts, eventWeeks, fileCounts] =
    await Promise.all([
      db
        .select({
          guruId: materiPublished.guruId,
          cnt: sql<number>`cast(count(*) as integer)`,
        })
        .from(materiPublished)
        .where(inArray(materiPublished.guruId, guruIds))
        .groupBy(materiPublished.guruId),
      db
        .select({
          guruId: quizPublished.guruId,
          cnt: sql<number>`cast(count(*) as integer)`,
        })
        .from(quizPublished)
        .where(inArray(quizPublished.guruId, guruIds))
        .groupBy(quizPublished.guruId),
      db
        .select({
          guruId: kursus.guruId,
          cnt: sql<number>`cast(count(*) as integer)`,
        })
        .from(kursus)
        .where(inArray(kursus.guruId, guruIds))
        .groupBy(kursus.guruId),
      db
        .select({
          guruId: kursus.guruId,
          enrollCnt: sql<number>`cast(count(${siswaKursus.id}) as integer)`,
        })
        .from(kursus)
        .leftJoin(siswaKursus, eq(kursus.id, siswaKursus.kursusId))
        .where(inArray(kursus.guruId, guruIds))
        .groupBy(kursus.guruId),
      db
        .select({
          guruId: kursus.guruId,
          attemptCnt: sql<number>`cast(count(${quizAttempt.id}) as integer)`,
        })
        .from(kursus)
        .leftJoin(quizPublished, eq(kursus.id, quizPublished.kursusId))
        .leftJoin(quizAttempt, and(eq(quizPublished.id, quizAttempt.quizPublishedId), eq(quizAttempt.status, "SELESAI")))
        .where(inArray(kursus.guruId, guruIds))
        .groupBy(kursus.guruId),
      db
        .select({
          guruId: sql<string>`split_part(${eventStore.streamId}, ':', 2)`,
          weekCount: sql<number>`cast(count(distinct date_trunc('week', ${eventStore.createdAt})) as integer)`,
        })
        .from(eventStore)
        .where(
          and(
            sql`${eventStore.streamId} like 'upload:%'`,
            gte(eventStore.createdAt, ninetyDaysAgo),
          ),
        )
        .groupBy(sql`split_part(${eventStore.streamId}, ':', 2)`),
      db
        .select({
          guruId: fileMateri.guruId,
          cnt: sql<number>`cast(count(*) as integer)`,
        })
        .from(fileMateri)
        .where(inArray(fileMateri.guruId, guruIds))
        .groupBy(fileMateri.guruId),
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

  return NextResponse.json({ data: results });
}
