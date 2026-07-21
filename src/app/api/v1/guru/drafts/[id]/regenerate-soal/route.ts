import { NextRequest, NextResponse, after } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkQuota, QuotaExceededError } from "@/lib/quota-guard";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";

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

    const rl = await checkRateLimit(`draft-regen-soal:${session.userId}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    // Temporarily disabled for debugging
    // const conc = await checkConcurrentLimit(`gen:${session.userId}`, 2, 3 * 60 * 1000);
    // if (!conc.allowed) {
    //   return apiError("Terlalu banyak job aktif. Tunggu job sebelumnya selesai.", 429);
    // }

    try {
      await checkQuota(session.userId, session.role, "ai_generation");
    } catch (e) {
      if (e instanceof QuotaExceededError) {
        return NextResponse.json({
          error: e.message,
          resourceType: e.resourceType,
          limit: e.limitValue,
          usage: e.currentUsage,
        }, { status: 429 });
      }
      throw e;
    }

    const { regenerateSoalOnly } = await import("@/lib/ai-regenerate");

    await db
      .update(aiGeneration)
      .set({ soalStatus: "not_generated", updatedAt: new Date() })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)));

    const guruId = session.userId!;
    const finalId = id;

    after(async () => {
      try {
        await regenerateSoalOnly(finalId);
      } catch (e) {
        console.error("Regen soal async error:", e);
      }
    });

    await appendEvent(`gen:${session.userId}`, "gen.soal_regenerate_queued", { generationId: id });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Regen soal error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}