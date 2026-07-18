import { db } from "@/lib/db";
import { quizPublished, soalPublished, quizAttempt } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export async function fetchQuizList(enrolledIds: string[], userId: string) {
  if (enrolledIds.length === 0) return { data: [], totalAttempt: 0 };

  const quizList = await db
    .select()
    .from(quizPublished)
    .where(inArray(quizPublished.kursusId, enrolledIds))
    .orderBy(asc(quizPublished.publishedAt))
    .limit(100);

  const quizIds = quizList.map((q) => q.id);
  const soalCount = new Map<string, number>();
  if (quizIds.length > 0) {
    const soals = await db
      .select({ id: soalPublished.id, quizPublishedId: soalPublished.quizPublishedId })
      .from(soalPublished)
      .where(inArray(soalPublished.quizPublishedId, quizIds));
    for (const s of soals) {
      if (!s.quizPublishedId) continue;
      soalCount.set(s.quizPublishedId, (soalCount.get(s.quizPublishedId) || 0) + 1);
    }
  }

  const attempts = await db
    .select()
    .from(quizAttempt)
    .where(
      and(
        eq(quizAttempt.siswaId, userId),
        inArray(quizAttempt.quizPublishedId, quizIds),
      ),
    );

  const bestByQuiz = new Map<string, { nilai: number | null; selesai: boolean }>();
  for (const a of attempts) {
    const prev = bestByQuiz.get(a.quizPublishedId);
    const aNilai = a.nilai ?? 0;
    const prevNilai = prev?.nilai ?? -1;
    if (aNilai > prevNilai || ((a.status === "SELESAI" || a.status === "BELAJAR") && !prev?.selesai)) {
      bestByQuiz.set(a.quizPublishedId, { nilai: a.nilai, selesai: a.status === "SELESAI" || a.status === "BELAJAR" });
    }
  }

  const data = quizList.map((q) => {
    const totalSoal = soalCount.get(q.id) || 0;
    const best = bestByQuiz.get(q.id);
    return {
      ...q,
      totalSoal,
      sudahDikerjakan: !!best?.selesai,
      nilaiTerbaik: q.modeEvaluasi === "CBT" ? null : best?.nilai ?? null,
      tampilkanNilai: q.modeEvaluasi !== "CBT",
    };
  });

  return { data, totalAttempt: attempts.length };
}