import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { materiPublished, materiRead, siswaKursus, quizPublished, soalPublished } from "@/lib/db/schema";
import { and, eq, gt, asc } from "drizzle-orm";
import { isNull, sql } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);

    const { id } = await params;
    const rl = await checkRateLimit(`siswa-materi:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [row] = await db
      .select()
      .from(materiPublished)
      .where(eq(materiPublished.id, id))
      .limit(1);
    if (!row) return apiError("Materi tidak ditemukan", 404);

    const [enrolled] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, row.kursusId),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enrolled) return apiError("Anda belum terdaftar di kursus ini", 403);

    const [existing] = await db
      .select()
      .from(materiRead)
      .where(
        and(
          eq(materiRead.siswaId, session.userId!),
          eq(materiRead.materiPublishedId, id),
        ),
      )
      .limit(1);

    const [nextRow] = await db
      .select({ id: materiPublished.id })
      .from(materiPublished)
      .where(
        and(
          eq(materiPublished.kursusId, row.kursusId),
          gt(materiPublished.urutan, row.urutan),
        ),
      )
      .orderBy(asc(materiPublished.urutan))
      .limit(1);

    const [relatedQuiz] = await db
      .select({ id: quizPublished.id, judul: quizPublished.judul })
      .from(quizPublished)
      .where(eq(quizPublished.aiGenerationId, row.aiGenerationId))
      .limit(1);

    const soalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(soalPublished)
      .where(
        and(
          eq(soalPublished.aiGenerationId, row.aiGenerationId),
          isNull(soalPublished.quizPublishedId),
        ),
      )
      .then((r) => Number(r[0]?.count ?? 0));

    if (existing) {
      await db
        .update(materiRead)
        .set({ readAt: new Date() })
        .where(eq(materiRead.id, existing.id));
    } else {
      await db.insert(materiRead).values({
        siswaId: session.userId!,
        materiPublishedId: id,
      });
    }

    return NextResponse.json({
      data: {
        ...row,
        nextId: nextRow?.id ?? null,
        quizId: relatedQuiz?.id ?? null,
        quizJudul: relatedQuiz?.judul ?? null,
        soalBatchId: soalCount > 0 ? row.aiGenerationId : null,
        soalBatchTotal: soalCount,
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Materi detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    const [row] = await db
      .select()
      .from(materiPublished)
      .where(eq(materiPublished.id, id))
      .limit(1);
    if (!row) return apiError("Materi tidak ditemukan", 404);

    const [enrolled] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, row.kursusId),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enrolled) return apiError("Anda belum terdaftar di kursus ini", 403);

    const body = await request.json().catch(() => ({}));
    const progressPersen = Math.max(0, Math.min(100, Number(body?.progress ?? 100)));
    const selesai = Boolean(body?.selesai ?? progressPersen >= 100);

    const rl = await checkRateLimit(`siswa-materi-progress:${session.userId}`, 60, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [existing] = await db
      .select()
      .from(materiRead)
      .where(
        and(
          eq(materiRead.siswaId, session.userId!),
          eq(materiRead.materiPublishedId, id),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(materiRead)
        .set({ progressPersen, selesai, readAt: new Date() })
        .where(eq(materiRead.id, existing.id));
    } else {
      await db.insert(materiRead).values({
        siswaId: session.userId!,
        materiPublishedId: id,
        progressPersen,
        selesai,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Materi progress error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
