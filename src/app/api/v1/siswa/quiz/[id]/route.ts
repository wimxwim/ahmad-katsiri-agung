import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { quizPublished, soalPublished, siswaKursus } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const session = await verifySession(sessionCookie.value);
    if (!session) return apiError("Sesi tidak valid", 401);
    if (session.role !== "murid" && session.role !== "orang_tua") {
      return apiError("Hanya siswa yang dapat menandai progress", 403);
    }
    const { id } = await params;
    const rl = await checkRateLimit(`siswa-quiz-detail:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [quiz] = await db
      .select()
      .from(quizPublished)
      .where(eq(quizPublished.id, id))
      .limit(1);
    if (!quiz) return apiError("Kuis tidak ditemukan", 404);

    const [enroll] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, quiz.kursusId),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enroll) return apiError("Anda belum terdaftar di kursus ini", 403);

    const soals = await db
      .select({
        id: soalPublished.id,
        pertanyaan: soalPublished.pertanyaan,
        tipe: soalPublished.tipe,
        pilihanGanda: soalPublished.pilihanGanda,
        poin: soalPublished.poin,
        urutan: soalPublished.urutan,
      })
      .from(soalPublished)
      .where(eq(soalPublished.quizPublishedId, id))
      .orderBy(asc(soalPublished.urutan));

    const safe = soals.map((s) => ({
      id: s.id,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      pilihanGanda: s.pilihanGanda,
      poin: s.poin,
    }));

    return NextResponse.json({ data: { ...quiz, soal: safe } });
  } catch (e) {
    console.error("Quiz detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
