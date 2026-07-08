import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { quizPublished, soalPublished, siswaKursus, quizAttempt } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success) return apiError("Sesi tidak valid", 401);
    const session = _ar.data;
    if (session.role !== "murid" && session.role !== "orang_tua") {
      return apiError("Hanya siswa yang dapat melihat kuis", 403);
    }

    const rl = await checkRateLimit(`siswa-quiz:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")));
    const enrolledIds = enrollments.map((e) => e.kursusId);
    if (enrolledIds.length === 0) {
      return NextResponse.json({ data: [], attempts: [] });
    }

    const quizList = await db
      .select()
      .from(quizPublished)
      .where(inArray(quizPublished.kursusId, enrolledIds))
      .orderBy(asc(quizPublished.publishedAt));

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
          eq(quizAttempt.siswaId, session.userId!),
          inArray(quizAttempt.quizPublishedId, quizIds),
        ),
      );

    const bestByQuiz = new Map<string, { nilai: number | null; selesai: boolean }>();
    for (const a of attempts) {
      const prev = bestByQuiz.get(a.quizPublishedId);
      const aNilai = a.nilai ?? 0;
      const prevNilai = prev?.nilai ?? -1;
      if (aNilai > prevNilai || (a.status === "SELESAI" && !prev?.selesai)) {
        bestByQuiz.set(a.quizPublishedId, { nilai: a.nilai, selesai: a.status === "SELESAI" });
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

    return NextResponse.json({ data, totalAttempt: attempts.length });
  } catch (e) {
    console.error("Siswa quiz list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
