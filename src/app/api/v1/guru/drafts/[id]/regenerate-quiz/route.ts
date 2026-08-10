import { NextRequest, NextResponse, after } from "next/server";
import { checkRateLimit, checkConcurrentLimit, releaseConcurrent } from "@/lib/rate-limit";
import { checkQuota, QuotaExceededError } from "@/lib/quota-guard";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { getBalance } from "@/lib/token-service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const balance = await getBalance(session.userId);
    const isPremium = balance.isUnlocked === true;
    const CONCURRENT_TTL = isPremium ? 3 * 60 * 1000 : 30 * 60 * 1000;

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

    const rl = await checkRateLimit(`draft-regen-quiz:${session.userId}`, 5, 60_000);
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

    const { regenerateQuizOnly } = await import("@/lib/ai-regenerate");

    await db
      .update(aiGeneration)
      .set({ quizStatus: "not_generated", updatedAt: new Date() })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)));

    const finalId = id;
    const finalUserId = session.userId;

    after(async () => {
      try {
        await regenerateQuizOnly(finalId);
      } catch (e) {
        console.error("Regen quiz async error:", e);
      } finally {
        releaseConcurrent(`gen:${finalUserId}`);
      }
    });

    await appendEvent(`gen:${session.userId}`, "gen.quiz_regenerate_queued", { generationId: id });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Regen quiz error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}