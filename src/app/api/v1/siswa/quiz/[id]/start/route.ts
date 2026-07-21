import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { cacheSet } from "@/lib/cache-layer";
import { quizPublished, siswaKursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf-server";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);
    const { id } = await params;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const rl = await checkRateLimit(`quiz-start:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [quiz] = await db
      .select({ kursusId: quizPublished.kursusId })
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

    const startKey = `quiz:start:${session.userId}:${id}`;
    await cacheSet(startKey, Date.now(), 3600);

    return NextResponse.json({ success: true, startedAt: Date.now() });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    return apiError("Terjadi kesalahan server", 500);
  }
}