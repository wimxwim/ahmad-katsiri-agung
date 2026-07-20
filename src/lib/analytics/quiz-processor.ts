import { db } from "@/lib/db";
import { jawabanLog, studentAbility, soal } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { uuidv7 } from "@/lib/uuid";
import { estimateTheta } from "@/lib/analytics/calculateIRT";
import { updateElo } from "@/lib/analytics/calculateElo";
import { appendEvent } from "@/lib/event-store";

interface AnswerItem {
  soalId: string;        // original soal.id
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