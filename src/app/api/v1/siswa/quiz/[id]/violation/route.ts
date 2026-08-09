import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { quizPublished, siswaKursus, quizViolation } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { validateCsrf } from "@/lib/csrf-server";

export const runtime = "nodejs";

const ViolationSchema = z.object({
  jenis: z.string().min(1).max(50),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);
    const { id } = await params;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const rl = await checkRateLimit(`quiz-violation:${session.userId}`, 60, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [quiz] = await db
      .select({ kursusId: quizPublished.kursusId, modeEvaluasi: quizPublished.modeEvaluasi })
      .from(quizPublished)
      .where(eq(quizPublished.id, id))
      .limit(1);
    if (!quiz) return apiError("Kuis tidak ditemukan", 404);

    if (quiz.modeEvaluasi === "BELAJAR") {
      return apiError("Pelanggaran hanya dicatat untuk mode ULANGAN/CBT", 400);
    }

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

    const body = await request.json().catch(() => ({}));
    const parsed = ViolationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);
    }

    await db.insert(quizViolation).values({
      siswaId: session.userId!,
      quizPublishedId: id,
      jenis: parsed.data.jenis,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    return apiError("Terjadi kesalahan server", 500);
  }
}