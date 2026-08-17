import { NextRequest, NextResponse, after } from "next/server";
import { checkRateLimit, checkConcurrentLimit, releaseConcurrent } from "@/lib/rate-limit";
import { checkQuota, QuotaExceededError } from "@/lib/quota-guard";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { getBalance, checkBalance, refundBalance, InsufficientBalanceError, requireUnlocked, SubscriptionLockedError, deductGenerateCostDynamic, settleGenerationCost, estimateGenerationCost } from "@/lib/token-service";

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
    if (!row.fileMateriId) {
      return apiError("Draft ini tidak punya file sumber untuk re-generate", 400);
    }

    const rl = await checkRateLimit(`draft-regen-materi:${session.userId}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const conc = await checkConcurrentLimit(`gen:${session.userId}`, 1, CONCURRENT_TTL);
    if (!conc.allowed) {
      return apiError("Terlalu banyak job aktif. Tunggu job sebelumnya selesai.", 429);
    }

    try {
      await checkQuota(session.userId, session.role, "ai_generation");
    } catch (e) {
      if (e instanceof QuotaExceededError) {
        releaseConcurrent(`gen:${session.userId}`);
        return NextResponse.json({
          error: e.message,
          resourceType: e.resourceType,
          limit: e.limitValue,
          usage: e.currentUsage,
        }, { status: 429 });
      }
      throw e;
    }

    const [fileForCost] = await db.select().from(fileMateri).where(eq(fileMateri.id, row.fileMateriId!)).limit(1);
    const sourceLenForCost = fileForCost?.extractionText?.length || 5000;
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

    const { regenerateMateriOnly } = await import("@/lib/ai-regenerate");

    await db
      .update(aiGeneration)
      .set({ materiStatus: "not_generated", updatedAt: new Date() })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)));

    const finalId = id;
    const finalUserId = session.userId;

    after(async () => {
      try {
        await regenerateMateriOnly(finalId);

        const [gen] = await db
          .select({ tokenInput: aiGeneration.tokenInput, tokenOutput: aiGeneration.tokenOutput })
          .from(aiGeneration)
          .where(eq(aiGeneration.id, finalId))
          .limit(1);

        if (gen && gen.tokenInput != null && gen.tokenOutput != null) {
          await settleGenerationCost(
            finalUserId,
            gen.tokenInput,
            gen.tokenOutput,
            chargedAmount,
            finalId,
          ).catch((settleErr) => {
            console.error("Settle regenerate materi cost failed:", settleErr);
          });
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("Regen materi async error:", errMsg);

        await refundBalance(finalUserId, chargedAmount, {
          notes: "Regenerate materi gagal. Token dikembalikan.",
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

        await appendEvent(`gen:${finalUserId}`, "gen.failed", {
          generationId: finalId,
          error: errMsg.slice(0, 200),
          refunded: true,
        }).catch(() => {});
      } finally {
        releaseConcurrent(`gen:${finalUserId}`);
      }
    });

    await appendEvent(`gen:${session.userId}`, "gen.materi_regenerate_queued", { generationId: id });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof InsufficientBalanceError) {
      releaseConcurrent(`gen:${sessionUserId}`);
      return NextResponse.json({
        success: false,
        error: "Saldo token tidak cukup. Top-up sekarang?",
        balance: e.currentBalance,
        required: e.required,
      }, { status: 402 });
    }
    console.error("Regen materi error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
