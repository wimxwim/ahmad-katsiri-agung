import { NextRequest, after } from "next/server";
import { z } from "zod";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import {
  checkRateLimitPerUser,
  checkConcurrentLimit,
  releaseConcurrent,
} from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { tutorChat } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiSuccess } from "@/lib/api-response";
import { chatWithFallback } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const TutorSchema = z.object({
  message: z.string().min(2, "Pertanyaan terlalu pendek").max(2000, "Pertanyaan terlalu panjang"),
});

export async function POST(request: NextRequest) {
  // KILL SWITCH: AI_TUTOR_ENABLED must be "true" in env
  if (process.env.AI_TUTOR_ENABLED !== "true") {
    return apiError("AI_TUTOR_DISABLED", "Fitur AI Tutor belum aktif", undefined, 503);
  }

  let concKey: string | null = null;

  try {
    const session = await requireSiswa(request);
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const rl = await checkRateLimitPerUser(`ai-tutor:${session.userId}`, 10, 60_000);
    if (!rl.allowed) {
      return apiError("RATE_LIMITED", "Terlalu banyak pertanyaan, tunggu sebentar", undefined, 429);
    }

    concKey = `ai-tutor:${session.userId}`;
    const concurrent = await checkConcurrentLimit(concKey, 1, 180_000);
    if (!concurrent.allowed) {
      return apiError("CONCURRENT_LIMIT", "Tunggu jawaban AI sebelumnya selesai", undefined, 429);
    }

    const body = await request.json();
    const parsed = TutorSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const { message } = parsed.data;

    const [chat] = await db
      .insert(tutorChat)
      .values({
        userId: session.userId,
        role: session.role,
        prompt: message,
        status: "processing",
      })
      .returning();

    // Run AI in background via after() - matches generate route pattern
    after(async () => {
      try {
        const result = await chatWithFallback(
          [
            {
              role: "system",
              content:
                "Kamu adalah tutor belajar untuk siswa Indonesia (PAI/Akidah Akhlak SMP). Jawab dengan bahasa Indonesia yang jelas, ramah, dan edukatif. Bantu siswa memahami materi, bukan memberikan jawaban instan tanpa penjelasan.",
            },
            { role: "user", content: message },
          ],
          { maxTokens: 1000, model: "mistral-medium-3-5" },
        );

        await db
          .update(tutorChat)
          .set({
            response: result.content,
            status: "done",
            modelName: result.model,
            tokenInput: result.tokensIn,
            tokenOutput: result.tokensOut,
            updatedAt: new Date(),
          })
          .where(eq(tutorChat.id, chat.id));
      } catch (err) {
        await db
          .update(tutorChat)
          .set({
            status: "failed",
            errorMessage: err instanceof Error ? err.message.slice(0, 500) : "AI unavailable",
            updatedAt: new Date(),
          })
          .where(eq(tutorChat.id, chat.id));
      } finally {
        if (concKey) await releaseConcurrent(concKey);
      }
    });

    return apiSuccess({ chatId: chat.id, status: "processing" }, 202);
  } catch (e) {
    if (concKey) await releaseConcurrent(concKey);
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("AI tutor error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
