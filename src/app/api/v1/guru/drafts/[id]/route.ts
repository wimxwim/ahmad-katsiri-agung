import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri, materiPublished, quizPublished, soalPublished } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`drafts-detail:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;
    const [row] = await db
      .select({
        id: aiGeneration.id,
        guruId: aiGeneration.guruId,
        fileMateriId: aiGeneration.fileMateriId,
        status: aiGeneration.status,
        materiStatus: aiGeneration.materiStatus,
        quizStatus: aiGeneration.quizStatus,
        soalStatus: aiGeneration.soalStatus,
        materiJudul: aiGeneration.materiJudul,
        materiKonten: aiGeneration.materiKonten,
        materiEditedKonten: aiGeneration.materiEditedKonten,
        materiApprovedAt: aiGeneration.materiApprovedAt,
        quizJudul: aiGeneration.quizJudul,
        quizSoal: aiGeneration.quizSoal,
        quizEditedSoal: aiGeneration.quizEditedSoal,
        quizApprovedAt: aiGeneration.quizApprovedAt,
        soalItems: aiGeneration.soalItems,
        soalEditedItems: aiGeneration.soalEditedItems,
        soalApprovedAt: aiGeneration.soalApprovedAt,
        publishedAt: aiGeneration.publishedAt,
        sourceFileName: aiGeneration.sourceFileName,
        tokenInput: aiGeneration.tokenInput,
        tokenOutput: aiGeneration.tokenOutput,
        modelName: aiGeneration.modelName,
        createdAt: aiGeneration.createdAt,
        updatedAt: aiGeneration.updatedAt,
        errorMessage: aiGeneration.errorMessage,
      })
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .limit(1);

    if (!row) return apiError("Draft tidak ditemukan", 404);
    return NextResponse.json({ data: row });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Draft detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);
    const { id } = await params;

    const rl = await checkRateLimitPerUser(`draft-delete:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiError("Terlalu banyak permintaan, coba lagi dalam 60 detik", 429);

    const [draft] = await db
      .select({ id: aiGeneration.id, fileMateriId: aiGeneration.fileMateriId })
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
      .limit(1);

    if (!draft) {
      return apiError("Draft tidak ditemukan", 404);
    }

    // Delete dependent published rows first (FK constraints)
    await db
      .delete(soalPublished)
      .where(eq(soalPublished.aiGenerationId, id));
    await db
      .delete(quizPublished)
      .where(eq(quizPublished.aiGenerationId, id));
    await db
      .delete(materiPublished)
      .where(eq(materiPublished.aiGenerationId, id));

    await db
      .delete(aiGeneration)
      .where(eq(aiGeneration.id, id));

    if (draft.fileMateriId) {
      await db
        .delete(fileMateri)
        .where(eq(fileMateri.id, draft.fileMateriId));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Delete draft error:", e);
    return apiError("Gagal menghapus draft", 500);
  }
}
