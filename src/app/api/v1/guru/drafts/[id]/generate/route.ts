import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri, eventStore } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { runGenerationFromText } from "@/lib/ai-generator";
import { extractText } from "@/lib/text-extractor";
import { invalidateGuruCache } from "@/lib/dashboard-cache";
import {
  checkGenerateBalance,
  deductGenerateCost,
  getBalance,
  refundBalance,
  getGenerateCost,
  InsufficientBalanceError,
  requireUnlocked,
  SubscriptionLockedError,
} from "@/lib/token-service";
import { GENERATE_COST } from "@/lib/token-constants";
import { checkQuota, QuotaExceededError } from "@/lib/quota-guard";
import {
  checkRateLimit,
  checkConcurrentLimit,
  releaseConcurrent,
  ipFromRequest,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_CONCURRENT_PER_GURU = 1;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let concKey: string | null = null;

  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);
    const { id } = await params;

    try {
      await requireUnlocked(session.userId);
    } catch (e) {
      if (e instanceof SubscriptionLockedError) {
        return NextResponse.json(
          { success: false, error: e.message, errorCode: "AI_LOCKED", requiredTopup: 5000 },
          { status: 402 },
        );
      }
      throw e;
    }

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`gen-trigger:${ip}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [gen] = await db
      .select()
      .from(aiGeneration)
      .where(eq(aiGeneration.id, id))
      .limit(1);

    if (!gen) return apiError("Draft tidak ditemukan", 404);
    if (gen.guruId !== session.userId) return apiError("Akses ditolak", 403);
    if (gen.status === "ready") {
      return NextResponse.json({
        success: true,
        message: "Draft sudah siap",
        generationId: id,
        status: "ready",
        materiStatus: gen.materiStatus,
        quizStatus: gen.quizStatus,
        soalStatus: gen.soalStatus,
      });
    }
    if (gen.status === "generating") {
      return NextResponse.json({
        success: true,
        message: "AI sedang generating",
        generationId: id,
        status: "generating",
      });
    }
    if (gen.status === "approved") {
      return apiError("Draft sudah dipublish. Tidak bisa di-generate ulang.", 409);
    }
    if (gen.status === "rejected") {
      return apiError("Draft sudah ditolak. Silakan upload ulang.", 409);
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [recentGen] = await db
      .select({ id: eventStore.id })
      .from(eventStore)
      .where(and(
        eq(eventStore.streamId, `gen:${session.userId}`),
        eq(eventStore.eventType, "gen.queued"),
        gte(eventStore.createdAt, fiveMinAgo),
        sql`${eventStore.payload}->>'generationId' = ${id}`,
      ))
      .limit(1);
    if (recentGen) {
      return NextResponse.json({
        success: true,
        message: "Generate sudah dalam antrian",
        generationId: id,
        status: gen.status,
      });
    }

    const [file] = await db
      .select()
      .from(fileMateri)
      .where(eq(fileMateri.id, gen.fileMateriId!))
      .limit(1);

    if (!file) return apiError("File sumber tidak ditemukan", 404);

    concKey = `gen:${session.userId}`;
    const concRl = await checkConcurrentLimit(concKey, MAX_CONCURRENT_PER_GURU);
    if (!concRl.allowed) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak job aktif. Tunggu sebentar." },
        { status: 429 },
      );
    }

    try {
      await checkQuota(session.userId!, session.role, "ai_generation");
    } catch (e) {
      releaseConcurrent(concKey);
      if (e instanceof QuotaExceededError) {
        return NextResponse.json(
          { success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } },
          { status: 429 },
        );
      }
      throw e;
    }

    const sp = request.nextUrl.searchParams;
    const rawSoal = sp.get("soalCount");
    const rawQuiz = sp.get("quizCount");
    const soalCount = rawSoal ? Math.min(50, Math.max(5, parseInt(rawSoal, 10) || 35)) : 35;
    const quizCount = rawQuiz ? Math.min(15, Math.max(5, parseInt(rawQuiz, 10) || 5)) : 5;

    let sourceText = file.extractionText;

    if (!sourceText || sourceText.length < 50) {
      if (file.status === "extracting") {
        releaseConcurrent(concKey);
        return NextResponse.json({
          success: false,
          error: "Dokumen masih diekstrak. Tunggu beberapa saat lalu coba lagi.",
          errorCode: "EXTRACTION_IN_PROGRESS",
          fileStatus: file.status,
        }, { status: 409 });
      }

      if (!file.imagekitFileId) {
        releaseConcurrent(concKey);
        return NextResponse.json({
          success: false,
          error: "File sumber tidak tersedia untuk ekstraksi ulang.",
          errorCode: "FILE_NOT_AVAILABLE",
        }, { status: 400 });
      }

      try {
        const fileUrl = file.linkAkses || `https://ik.imagekit.io/v6wbihytb/${file.imagekitFileId}`;
        const fileRes = await fetch(fileUrl, { signal: AbortSignal.timeout(30_000) });
        if (!fileRes.ok) {
          throw new Error(`Gagal mengunduh file: ${fileRes.status}`);
        }
        const fileBytes = Buffer.from(await fileRes.arrayBuffer());
        sourceText = await extractText(fileBytes, file.tipeMime?.includes("pdf") ? "pdf" : "docx");

        if (sourceText && sourceText.length >= 50) {
          await db
            .update(fileMateri)
            .set({ extractionText: sourceText, status: "extracted", updatedAt: new Date() })
            .where(eq(fileMateri.id, file.id));
        } else {
          releaseConcurrent(concKey);
          return NextResponse.json({
            success: false,
            error: "Teks hasil ekstraksi terlalu pendek. Upload ulang file.",
            errorCode: "EXTRACTION_FAILED",
          }, { status: 400 });
        }
      } catch (extractErr) {
        releaseConcurrent(concKey);
        console.error("On-demand extraction failed:", extractErr);
        return NextResponse.json({
          success: false,
          error: "Gagal mengekstrak dokumen. Coba upload ulang.",
          errorCode: "EXTRACTION_ERROR",
        }, { status: 500 });
      }
    }

    const hasBalance = await checkGenerateBalance(session.userId!);
    if (!hasBalance) {
      releaseConcurrent(concKey);
      const bal = await getBalance(session.userId!);
      return NextResponse.json({
        success: false,
        error: `Saldo token tidak cukup. Minimal Rp${GENERATE_COST}/generate.`,
        errorCode: "INSUFFICIENT_BALANCE",
        balance: bal.balance,
        required: GENERATE_COST,
      }, { status: 402 });
    }

    await appendEvent(`gen:${session.userId}`, "gen.queued", {
      generationId: id,
      soalCount,
      quizCount,
    });

    try {
      await deductGenerateCost(session.userId!, id);
    } catch (e) {
      releaseConcurrent(concKey);
      if (e instanceof InsufficientBalanceError) {
        return NextResponse.json({
          success: false,
          error: "Saldo token tidak cukup.",
          errorCode: "INSUFFICIENT_BALANCE",
          balance: e.currentBalance,
          required: e.required,
        }, { status: 402 });
      }
      throw e;
    }

    await db
      .update(aiGeneration)
      .set({ status: "generating", updatedAt: new Date() })
      .where(eq(aiGeneration.id, id));

    const guruId = session.userId!;
    const finalText = sourceText;

    fireAndForgetGeneration(id, finalText, guruId, soalCount, quizCount, concKey);

    return NextResponse.json({
      success: true,
      generationId: id,
      status: "generating",
      charged: GENERATE_COST,
      soalCount,
      quizCount,
      message: "Generate dimulai. Anda dapat meninggalkan halaman. Hasil akan muncul di Draft AI.",
    }, { status: 202 });
  } catch (e) {
    if (concKey) releaseConcurrent(concKey);
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Generate trigger error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

function fireAndForgetGeneration(
  generationId: string,
  sourceText: string,
  guruId: string,
  soalCount: number,
  quizCount: number,
  concKey: string,
): void {
  Promise.resolve().then(async () => {
    try {
      await runGenerationFromText(generationId, sourceText, guruId, soalCount, quizCount);
      invalidateGuruCache(guruId).catch(() => {});
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Background generation failed:", errMsg);

      const isTimeout = errMsg.includes("timeout") || errMsg.includes("Timeout");
      const refundNote = isTimeout
        ? "Generate timeout. Token dikembalikan otomatis."
        : "Generate gagal. Token dikembalikan otomatis.";

      try {
        await refundBalance(guruId, getGenerateCost(), { notes: refundNote });
      } catch {
        console.error("Refund failed for generation:", generationId);
      }

      await db
        .update(aiGeneration)
        .set({
          status: "failed",
          errorMessage: errMsg.slice(0, 500),
          updatedAt: new Date(),
        })
        .where(eq(aiGeneration.id, generationId));

      await appendEvent(`gen:${guruId}`, "gen.failed", {
        generationId,
        error: errMsg.slice(0, 200),
        refunded: true,
      });
    } finally {
      releaseConcurrent(concKey);
    }
  });
}