import { NextRequest, NextResponse, after } from "next/server";
import { checkRateLimit, checkRateLimitPerUser, checkConcurrentLimit, releaseConcurrent, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { runGeneration } from "@/lib/ai-generator";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { readFile } from "fs/promises";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { checkQuota, QuotaExceededError } from "@/lib/quota-guard";
import { validateCsrf } from "@/lib/csrf-server";
import { checkBalance, getBalance, refundBalance, InsufficientBalanceError, requireUnlocked, SubscriptionLockedError, deductGenerateCostDynamic, settleGenerationCost, estimateGenerationCost } from "@/lib/token-service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let sessionUserId: string | null = null;
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);
    sessionUserId = session.userId;

    const balance = await getBalance(session.userId);
    const isPremium = balance.isUnlocked === true;
    const CONCURRENT_TTL = isPremium ? 10 * 60 * 1000 : 5 * 60 * 1000;

    try {
      await requireUnlocked(session.userId);
    } catch (e) {
      if (e instanceof SubscriptionLockedError) {
        return NextResponse.json({ success: false, error: e.message, locked: true }, { status: 402 });
      }
      throw e;
    }

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .limit(1);
    if (!row) return apiError("Draft tidak ditemukan", 404);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`ai-regen:${ip}`, 2, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const userRl = await checkRateLimitPerUser(`regen:${session.userId}`, 5, 60_000);
    if (!userRl.allowed) {
      return apiError(`Terlalu banyak regenerate. Coba lagi dalam ${userRl.retryAfter} detik.`, 429);
    }

    if (!row.fileMateriId) {
      return apiError("Draft ini tidak punya file sumber", 400);
    }

    const [file] = await db
      .select()
      .from(fileMateri)
      .where(eq(fileMateri.id, row.fileMateriId))
      .limit(1);
    if (!file) return apiError("File sumber tidak ditemukan", 404);

    let bytes: Buffer;
    if (file.imagekitFileId && file.lokasi === "IMAGEKIT") {
      const adapter = await getStorageAdapter(session.userId);
      const res = await fetch(adapter.getLink(file.imagekitFileId));
      if (!res.ok) return apiError("Gagal download file dari ImageKit", 502);
      bytes = Buffer.from(await res.arrayBuffer());
    } else if (file.linkAkses.startsWith("/tmp/")) {
      bytes = await readFile(file.linkAkses);
    } else {
      return apiError("Lokasi file tidak didukung untuk regenerate", 400);
    }

    const ext = (file.tipeMime.includes("pdf") ? "pdf" : file.tipeMime.includes("word") ? "docx" : "doc");

    const concRl = await checkConcurrentLimit(`gen:${session.userId}`, 1, CONCURRENT_TTL);
    if (!concRl.allowed) {
      return apiError("Masih ada job AI yang sedang berjalan. Tunggu selesai sebelum regenerate.", 429);
    }

    try {
      await checkQuota(session.userId, session.role, "ai_generation");
    } catch (e) {
      releaseConcurrent(`gen:${session.userId}`);
      if (e instanceof QuotaExceededError) {
        return NextResponse.json(
          { success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } },
          { status: 429 },
        );
      }
      throw e;
    }

    const sourceLenForCost = bytes.length || 5000;
    const estimatedCost = estimateGenerationCost(sourceLenForCost);
    if (process.env.FREE_GENERATE_MODE !== "true") {
      const hasBalance = await checkBalance(session.userId!, estimatedCost);
      if (!hasBalance) {
        releaseConcurrent(`gen:${session.userId}`);
        const bal = await getBalance(session.userId!);
        return NextResponse.json({
          success: false,
          error: `Saldo token tidak cukup. Estimasi biaya Rp${estimatedCost}/generate.`,
          balance: bal.balance,
          required: estimatedCost,
        }, { status: 402 });
      }
    }

    const { chargedAmount } = await deductGenerateCostDynamic(session.userId!, sourceLenForCost, id);

    await db
      .update(aiGeneration)
      .set({ status: "queued", errorMessage: null, updatedAt: new Date() })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)));
    await appendEvent(`gen:${session.userId}`, "gen.queued", { generationId: id });

    const guruId = session.userId!;
    const finalId = id;
    const finalBytes = bytes;
    const finalExt = ext;

    after(async () => {
      try {
        await runGeneration(finalId, finalBytes, finalExt);

        const [gen] = await db
          .select({ tokenInput: aiGeneration.tokenInput, tokenOutput: aiGeneration.tokenOutput })
          .from(aiGeneration)
          .where(eq(aiGeneration.id, finalId))
          .limit(1);

        if (gen && gen.tokenInput != null && gen.tokenOutput != null) {
          await settleGenerationCost(
            guruId,
            gen.tokenInput,
            gen.tokenOutput,
            chargedAmount,
            finalId,
          ).catch((settleErr) => {
            console.error("Settle regenerate cost failed:", settleErr);
          });
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("Regenerate async error:", errMsg);

        await refundBalance(guruId, chargedAmount, {
          notes: "Regenerate gagal. Token dikembalikan.",
          referenceId: `refund:${finalId}`,
        }).catch(() => {});

        await db
          .update(aiGeneration)
          .set({
            status: "failed",
            errorMessage: errMsg.slice(0, 500),
            updatedAt: new Date(),
          })
          .where(eq(aiGeneration.id, finalId))
          .catch(() => {});

        await appendEvent(`gen:${guruId}`, "gen.failed", {
          generationId: finalId,
          error: errMsg.slice(0, 200),
          refunded: true,
        }).catch(() => {});
      } finally {
        releaseConcurrent(`gen:${guruId}`);
      }
    });

    return NextResponse.json({ success: true, status: "queued" });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof QuotaExceededError) {
      return NextResponse.json(
        { success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } },
        { status: 429 },
      );
    }
    if (e instanceof InsufficientBalanceError) {
      releaseConcurrent(`gen:${sessionUserId}`);
      return NextResponse.json({
        success: false,
        error: "Saldo token tidak cukup. Top-up sekarang?",
        balance: e.currentBalance,
        required: e.required,
      }, { status: 402 });
    }
    console.error("Regenerate error:", e);
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan server";
    return apiError(msg, 500);
  }
}
