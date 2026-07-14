import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { aiGeneration, fileMateri, eventStore } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { runGenerationFromText } from "@/lib/ai-generator";
import { checkGenerateBalance, deductGenerateCost, getBalance, refundBalance, getGenerateCost, InsufficientBalanceError, requireUnlocked, SubscriptionLockedError } from "@/lib/token-service";
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
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);
    const { id } = await params;

    try {
      await requireUnlocked(session.userId);
    } catch (e) {
      if (e instanceof SubscriptionLockedError) {
        return NextResponse.json({ success: false, error: e.message, locked: true }, { status: 402 });
      }
      throw e;
    }

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`gen-trigger:${ip}`, 10, 60_000);
    if (!rl.allowed) return apiError("Terlalu banyak permintaan", 429, undefined, undefined, { "Retry-After": String(Math.ceil(rl.retryAfter / 1000)) });

    const [gen] = await db
      .select()
      .from(aiGeneration)
      .where(eq(aiGeneration.id, id))
      .limit(1);

    if (!gen) return apiError("Draft tidak ditemukan", 404);
    if (gen.guruId !== session.userId) return apiError("Akses ditolak", 403);
    if (gen.status === "ready") return NextResponse.json({ success: true, message: "Draft sudah siap", generationId: id });
    if (gen.status === "generating") return NextResponse.json({ success: true, message: "AI sedang generating", generationId: id });

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
      return NextResponse.json({ success: true, message: "Generate sudah dalam antrian", generationId: id });
    }

    const [file] = await db
      .select()
      .from(fileMateri)
      .where(eq(fileMateri.id, gen.fileMateriId!))
      .limit(1);

    if (!file) return apiError("File sumber tidak ditemukan", 404);

    const concRl = await checkConcurrentLimit(`gen:${session.userId}`, MAX_CONCURRENT_PER_GURU);
    if (!concRl.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak job aktif" }, { status: 429 });
    }

    try {
      await checkQuota(session.userId!, session.role, "ai_generation");
    } catch (e) {
      releaseConcurrent(`gen:${session.userId}`);
      if (e instanceof QuotaExceededError) {
        return NextResponse.json({ success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } }, { status: 429 });
      }
      throw e;
    }

    const text = file.extractionText;
    if (!text || text.length < 50) {
      releaseConcurrent(`gen:${session.userId}`);
      return NextResponse.json({ success: false, error: "Teks hasil ekstraksi terlalu pendek. Upload ulang file." }, { status: 400 });
    }

    const sp = request.nextUrl.searchParams;
    const rawSoal = sp.get("soalCount");
    const rawQuiz = sp.get("quizCount");
    const soalCount = rawSoal ? Math.min(35, Math.max(10, parseInt(rawSoal, 10) || 10)) : 10;
    const quizCount = rawQuiz ? Math.min(15, Math.max(5, parseInt(rawQuiz, 10) || 5)) : 5;

    const hasBalance = await checkGenerateBalance(session.userId!);
    if (!hasBalance) {
      releaseConcurrent(`gen:${session.userId}`);
      const bal = await getBalance(session.userId!);
      return NextResponse.json({
        success: false,
        error: `Saldo token tidak cukup. Minimal Rp${GENERATE_COST}/generate. Top-up sekarang?`,
        balance: bal.balance,
        required: GENERATE_COST,
      }, { status: 402 });
    }

    await appendEvent(`gen:${session.userId}`, "gen.queued", { generationId: id, soalCount, quizCount });

    let generateError: string | null = null;

    try {
      await deductGenerateCost(session.userId!);
      await runGenerationFromText(id, text, session.userId!, soalCount, quizCount);
    } catch (e) {
      if (e instanceof InsufficientBalanceError) {
        releaseConcurrent(`gen:${session.userId}`);
        return NextResponse.json({
          success: false,
          error: "Saldo token tidak cukup. Top-up sekarang?",
          balance: e.currentBalance,
          required: e.required,
        }, { status: 402 });
      }
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("Generate error:", errMsg);
      if (errMsg.includes("timeout") || errMsg.includes("Timeout")) {
        generateError = "Generate membutuhkan waktu lebih lama. Token sudah dikembalikan. Coba generate ulang atau kurangi jumlah soal.";
      } else {
        generateError = "Gagal generate konten AI. Token sudah dikembalikan.";
      }
      try { await refundBalance(session.userId!, getGenerateCost()); } catch { /* refund best-effort */ }
    } finally {
      releaseConcurrent(`gen:${session.userId}`);
    }

    const [updated] = await db
      .select()
      .from(aiGeneration)
      .where(eq(aiGeneration.id, id))
      .limit(1);

    return NextResponse.json({
      success: !generateError,
      message: generateError
        ? generateError
        : updated?.status === "ready"
          ? "Draft siap direview."
          : "Draft diproses.",
      generationId: id,
      status: updated?.status,
      materiStatus: updated?.materiStatus,
      quizStatus: updated?.quizStatus,
      soalStatus: updated?.soalStatus,
      soalCount,
      quizCount,
      errorMessage: generateError || updated?.errorMessage,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Generate trigger error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}