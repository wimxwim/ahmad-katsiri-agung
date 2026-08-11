import { NextRequest, NextResponse, after } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri, eventStore } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { runGenerationFromText } from "@/lib/ai-generator";
import { extractText, sanitizeText } from "@/lib/text-extractor";
import { invalidateGuruCache } from "@/lib/dashboard-cache";
import {
  checkBalance,
  getBalance,
  refundBalance,
  InsufficientBalanceError,
  requireUnlocked,
  SubscriptionLockedError,
  requireNotSuspended,
  deductGenerateCostDynamic,
  settleGenerationCost,
  estimateGenerationCost,
} from "@/lib/token-service";
import { DAILY_GENERATE_LIMIT, PREMIUM_DAILY_GENERATE_LIMIT } from "@/lib/token-constants";
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
    await requireNotSuspended(session.userId);
    const balance = await getBalance(session.userId);
    const isPremium = balance.isUnlocked === true;
    const CONCURRENT_TTL = isPremium ? 3 * 60 * 1000 : 30 * 60 * 1000;
    const dailyLimit = isPremium ? PREMIUM_DAILY_GENERATE_LIMIT : DAILY_GENERATE_LIMIT;
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
    const concRl = await checkConcurrentLimit(concKey, MAX_CONCURRENT_PER_GURU, CONCURRENT_TTL);
    if (!concRl.allowed) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak job aktif. Tunggu sebentar." },
        { status: 429 },
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [dailyCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiGeneration)
      .where(and(
        eq(aiGeneration.guruId, session.userId),
        sql`${aiGeneration.createdAt} >= ${todayStart}`,
        sql`${aiGeneration.status} IN ('generating', 'ready', 'approved')`,
      ));
    if ((dailyCount?.count ?? 0) >= dailyLimit) {
      releaseConcurrent(concKey);
      return NextResponse.json({
        success: false,
        error: `Batas generate harian tercapai (${dailyLimit}x/hari). Coba lagi besok atau upgrade paket.`,
        errorCode: "DAILY_LIMIT_REACHED",
        dailyLimit,
        currentCount: dailyCount?.count ?? 0,
      }, { status: 429 });
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

    let soalCount = 25;
    let quizCount = 10;
    try {
      const body = await request.clone().json().catch(() => null);
      if (body && typeof body === "object") {
        const pg = typeof body.pgCount === "number" ? body.pgCount : 0;
        const isian = typeof body.isianCount === "number" ? body.isianCount : 0;
        const essay = typeof body.essayCount === "number" ? body.essayCount : 0;
        const totalFromBody = pg + isian + essay;
        if (totalFromBody > 0) soalCount = Math.min(50, Math.max(5, totalFromBody));
        if (typeof body.quizCount === "number" && body.quizCount > 0) quizCount = Math.min(15, Math.max(5, body.quizCount));
      }
    } catch {
      // fallback to defaults
    }

    let sourceText = file.extractionText;

    if (!sourceText || sourceText.length < 50) {
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
        const fileRes = await fetch(fileUrl, { signal: AbortSignal.timeout(60_000) });
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
        const errMsg = extractErr instanceof Error ? extractErr.message : String(extractErr);
        console.error("On-demand extraction failed:", errMsg);
        const safeErrMsg = sanitizeText(`Ekstraksi gagal: ${errMsg}`).slice(0, 500);
        await db
          .update(aiGeneration)
          .set({ status: "failed", errorMessage: safeErrMsg, updatedAt: new Date() })
          .where(eq(aiGeneration.id, id))
          .catch((dbErr) => console.error("Gagal menyimpan error_message ekstraksi:", dbErr));
        return NextResponse.json({
          success: false,
          error: "Gagal mengekstrak dokumen. Coba upload ulang.",
          errorCode: "EXTRACTION_ERROR",
        }, { status: 500 });
      }
    }

    const estimatedCost = estimateGenerationCost(sourceText.length);
    const hasBalance = await checkBalance(session.userId!, estimatedCost);
    if (!hasBalance) {
      releaseConcurrent(concKey);
      const bal = await getBalance(session.userId!);
      return NextResponse.json({
        success: false,
        error: `Saldo token tidak cukup. Estimasi biaya Rp${estimatedCost}/generate.`,
        errorCode: "INSUFFICIENT_BALANCE",
        balance: bal.balance,
        required: estimatedCost,
      }, { status: 402 });
    }

    await appendEvent(`gen:${session.userId}`, "gen.queued", {
      generationId: id,
      soalCount,
      quizCount,
    });

    const [claimed] = await db
      .update(aiGeneration)
      .set({ status: "generating", updatedAt: new Date() })
      .where(
        and(
          eq(aiGeneration.id, id),
          eq(aiGeneration.guruId, session.userId!),
          sql`${aiGeneration.status} IN ('queued', 'extracted', 'failed', 'extracting')`,
        ),
      )
      .returning({ id: aiGeneration.id });

    if (!claimed) {
      releaseConcurrent(concKey);
      return NextResponse.json({
        success: false,
        error: "Generate sudah dimulai di request lain.",
        errorCode: "ALREADY_GENERATING",
      }, { status: 409 });
    }

    let chargedAmount = estimatedCost;
    try {
      const result = await deductGenerateCostDynamic(session.userId!, sourceText.length, id);
      chargedAmount = result.chargedAmount;
    } catch (e) {
      releaseConcurrent(concKey);
      await db
        .update(aiGeneration)
        .set({ status: "extracted", updatedAt: new Date() })
        .where(eq(aiGeneration.id, id))
        .catch(() => {});
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

    const guruId = session.userId!;
    const finalText = sourceText;
    const tingkat = gen.tingkat ?? undefined;

    after(async () => {
      try {
        await runGenerationFromText(id, finalText, guruId, soalCount, quizCount, tingkat);
        invalidateGuruCache(guruId).catch(() => {});

        const [gen] = await db
          .select({ tokenInput: aiGeneration.tokenInput, tokenOutput: aiGeneration.tokenOutput })
          .from(aiGeneration)
          .where(eq(aiGeneration.id, id))
          .limit(1);

        if (gen && gen.tokenInput != null && gen.tokenOutput != null) {
          await settleGenerationCost(
            guruId,
            gen.tokenInput,
            gen.tokenOutput,
            chargedAmount,
            id,
          ).catch((settleErr) => {
            console.error("Settle generation cost failed:", settleErr);
          });
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("Background generation failed:", errMsg);

        const isTimeout = errMsg.includes("timeout") || errMsg.includes("Timeout");
        const refundNote = isTimeout
          ? "Generate timeout. Token dikembalikan otomatis."
          : "Generate gagal. Token dikembalikan otomatis.";

        try {
          await refundBalance(guruId, chargedAmount, { notes: refundNote, referenceId: `refund:${id}` });
        } catch {
          console.error("Refund failed for generation:", id);
        }

        await db
          .update(aiGeneration)
          .set({
            status: "failed",
            errorMessage: errMsg.slice(0, 500),
            updatedAt: new Date(),
          })
          .where(eq(aiGeneration.id, id));

        await appendEvent(`gen:${guruId}`, "gen.failed", {
          generationId: id,
          error: errMsg.slice(0, 200),
          refunded: true,
        }).catch(() => {});
      } finally {
        if (concKey) releaseConcurrent(concKey);
      }
    });

    return NextResponse.json({
      success: true,
      generationId: id,
      status: "generating",
      estimatedCost: chargedAmount,
      soalCount,
      quizCount,
      message: "Generate dimulai. Biaya akan disesuaikan dengan token aktual. Anda dapat meninggalkan halaman.",
    }, { status: 202 });
  } catch (e) {
    if (concKey) releaseConcurrent(concKey);
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Generate trigger error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}