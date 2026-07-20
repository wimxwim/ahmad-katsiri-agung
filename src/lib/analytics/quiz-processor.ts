import { db } from "@/lib/db";
import { jawabanLog, studentAbility, soal, skillMastery } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { uuidv7 } from "@/lib/uuid";
import { estimateTheta } from "@/lib/analytics/calculateIRT";
import { updateElo } from "@/lib/analytics/calculateElo";
import { updateBKT, slipForward } from "@/lib/analytics/calculateBKT";
import { calculateNextReview } from "@/lib/analytics/calculateSpacedRep";
import { appendEvent } from "@/lib/event-store";

interface AnswerItem {
  soalId: string;        // original soal.id
  skillId?: string | null;  // NEW
  isCorrect: boolean;
  jawabanSiswa: string;
  waktuJawabDetik: number;
  irtA: number;
  irtB: number;
  irtC: number;
  eloRating: number;
}

export async function processQuizResults(params: {
  siswaId: string;
  kursusId: string;
  quizSessionId: string;
  answers: AnswerItem[];
}): Promise<void> {
  try {
    // 1. Insert jawabanLog
    if (params.answers.length > 0) {
      await db.insert(jawabanLog).values(
        params.answers.map(a => ({
          id: uuidv7(),
          siswaId: params.siswaId,
          soalId: a.soalId,
          jawabanSiswa: a.jawabanSiswa,
          isBenar: a.isCorrect,
          waktuJawabDetik: a.waktuJawabDetik,
          quizSessionId: params.quizSessionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }

    // 2. IRT: update studentAbility.theta
    const responsePattern = params.answers.map(a => ({
      a: a.irtA,
      b: a.irtB,
      c: a.irtC,
      correct: a.isCorrect,
    }));
    const theta = estimateTheta(responsePattern);

    const [existing] = await db.select({ id: studentAbility.id })
      .from(studentAbility)
      .where(and(
        eq(studentAbility.siswaId, params.siswaId),
        eq(studentAbility.kursusId, params.kursusId),
      )).limit(1);

    if (existing) {
      await db.update(studentAbility)
        .set({ theta, updatedAt: new Date() })
        .where(eq(studentAbility.id, existing.id));
    } else {
      await db.insert(studentAbility).values({
        id: uuidv7(),
        siswaId: params.siswaId,
        kursusId: params.kursusId,
        theta,
        updatedAt: new Date(),
      });
    }

    // 3. Elo: update soal.eloRating per answer
    for (const a of params.answers) {
      const currentRating = a.eloRating || 1000;
      const { newRatingSoal } = updateElo(1000, currentRating, a.isCorrect);
      await db.update(soal)
        .set({ eloRating: newRatingSoal, updatedAt: new Date() })
        .where(eq(soal.id, a.soalId));
    }

    // 4. BKT: update skill mastery per skill
    const skillMap = new Map<string, { correct: number; total: number }>();
    for (const a of params.answers) {
      if (!a.skillId) continue;
      if (!skillMap.has(a.skillId)) skillMap.set(a.skillId, { correct: 0, total: 0 });
      const entry = skillMap.get(a.skillId)!;
      entry.total += 1;
      if (a.isCorrect) entry.correct += 1;
    }

    for (const [skillId, stats] of skillMap) {
      const [existingSkill] = await db.select({
        id: skillMastery.id,
        pL: skillMastery.pL,
        repetitionNum: skillMastery.repetitionNum,
        memoryStrength: skillMastery.memoryStrength,
      }).from(skillMastery).where(and(
        eq(skillMastery.siswaId, params.siswaId),
        eq(skillMastery.skillId, skillId),
      )).limit(1);

      const prevPL = existingSkill?.pL ?? 0.1;
      const prevRep = existingSkill?.repetitionNum ?? 0;
      const prevEF = existingSkill?.memoryStrength ?? 2.5;
      const prevInterval = 1; // schema has no interval column, default 1 day

      // Update BKT for each answer in this skill
      let pL = prevPL;
      for (const a of params.answers) {
        if (a.skillId !== skillId) continue;
        pL = updateBKT(pL, a.isCorrect);
      }
      pL = slipForward(pL);

      // Calculate spaced repetition
      const qualityScore = stats.correct === stats.total ? 5
        : stats.correct >= stats.total * 0.75 ? 4
        : stats.correct >= stats.total * 0.5 ? 3
        : 2;
      const newRep = prevRep + 1;
      const { newEF, nextDate } = calculateNextReview(qualityScore, prevInterval, prevEF, newRep);

      if (existingSkill) {
        await db.update(skillMastery).set({
          pL,
          memoryStrength: newEF,
          repetitionNum: newRep,
          lastPracticedAt: new Date(),
          nextReviewAt: nextDate,
          updatedAt: new Date(),
        }).where(eq(skillMastery.id, existingSkill.id));
      } else {
        await db.insert(skillMastery).values({
          id: uuidv7(),
          siswaId: params.siswaId,
          skillId,
          pL,
          memoryStrength: newEF,
          repetitionNum: newRep,
          lastPracticedAt: new Date(),
          nextReviewAt: nextDate,
          updatedAt: new Date(),
        });
      }
    }

    await appendEvent(`siswa:${params.siswaId}`, "quiz.processed", {
      kursusId: params.kursusId,
      answersCount: params.answers.length,
      theta,
    });
  } catch (err) {
    console.error("processQuizResults failed:", err);
    // Don't throw — fire-and-forget should not break quiz submission
  }
}