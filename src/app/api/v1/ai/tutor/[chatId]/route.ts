import { NextRequest } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { tutorChat } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { apiError, apiSuccess } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { calculateActualPrice } from "@/lib/token-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await requireSiswa(request);
    const { chatId } = await params;

    const rl = await checkRateLimitPerUser(`ai-tutor-poll:${session.userId}`, 30, 60_000);
    if (!rl.allowed) {
      return apiError("RATE_LIMITED", "Terlalu banyak permintaan", undefined, 429);
    }

    const [chat] = await db
      .select()
      .from(tutorChat)
      .where(and(eq(tutorChat.id, chatId), eq(tutorChat.userId, session.userId)))
      .limit(1);

    if (!chat) return apiError("NOT_FOUND", "Chat tidak ditemukan", undefined, 404);

    return apiSuccess({
      chatId: chat.id,
      status: chat.status,
      response: chat.response,
      errorMessage: chat.errorMessage,
      modelName: chat.modelName,
      tokenInput: chat.tokenInput,
      tokenOutput: chat.tokenOutput,
      totalTokens: (chat.tokenInput || 0) + (chat.tokenOutput || 0),
      costEstimated: calculateActualPrice(chat.tokenInput || 0, chat.tokenOutput || 0),
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("AI tutor poll error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}