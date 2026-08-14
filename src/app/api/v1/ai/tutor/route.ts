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
import { tutorChat, siswaKursus, kursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { apiError, apiSuccess } from "@/lib/api-response";
import { chatWithFallback } from "@/lib/ai";
import { sanitizeUserText } from "@/lib/ai-generator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const TutorSchema = z.object({
  message: z.string().min(2, "Pertanyaan terlalu pendek").max(2000, "Pertanyaan terlalu panjang"),
  kursusId: z.string().uuid({ message: "kursusId tidak valid" }).optional(),
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

    const { message, kursusId } = parsed.data;

    const sanitizedMessage = sanitizeUserText(message);
    if (sanitizedMessage.trim().length < 10) {
      return apiError("PROMPT_TOO_SHORT", "Pesan terlalu pendek, tulis minimal 10 karakter", undefined, 400);
    }

    // find enrolled courses (scoped to kursusId when provided)
    const whereKursus = [eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")];
    if (kursusId) whereKursus.push(eq(siswaKursus.kursusId, kursusId));

    const enrollments = await db
      .select({
        judul: kursus.judul,
        status: siswaKursus.status,
      })
      .from(siswaKursus)
      .innerJoin(kursus, eq(kursus.id, siswaKursus.kursusId))
      .where(and(...whereKursus))
      .limit(5);

    const ctxKursus =
      enrollments.length > 0
        ? "Kursus yang sedang diambil siswa: " + enrollments.map((e) => e.judul).join(", ")
        : "";

    const [chat] = await db
      .insert(tutorChat)
      .values({
        userId: session.userId,
        role: session.role,
        prompt: sanitizedMessage,
        status: "processing",
      })
      .returning();

    // Run AI in background via after() - matches generate route pattern
    after(async () => {
      try {
        const systemPrompt = `Kamu adalah tutor belajar untuk siswa Indonesia (PAI/Akidah Akhlak SMP). ${ctxKursus || "Siswa belum mengambil kursus tertentu."} Jawab dalam bahasa Indonesia yang jelas, ramah, dan edukatif.

ATURAN PENTING:
1. Jawab SINGKAT DAN PADAT - maksimal 3-4 kalimat (atau 40-60 kata) untuk pertanyaan normal.
2. Jawaban harus UTUH/SELF-CONTAINED - meskipun pertanyaannya pendek, jawabannya tetap menjelaskan inti dengan lengkap agar siswa paham tanpa konteks tambahan.
3. Jika siswa menanyakan di luar materi PAI/Akidah Akhlak, arahkan kembali ke materi pelajaran dengan ramah.
4. Bantu siswa memahami konsep, bukan sekadar memberi jawaban instan.`;

        const result = await chatWithFallback(
          [
            {
              role: "system",
              content: systemPrompt,
            },
            { role: "user", content: sanitizedMessage },
          ],
          { maxTokens: 300, model: process.env.AI_TUTOR_MODEL || "agnes-2.0-flash", complexity: "light" }, // benchmark 2.88s 5/5 fastest+cheapest free model
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
        const _msg = err instanceof Error ? err.message : "";
        const _isPromptTooShort = _msg.includes("Prompt terlalu pendek");
        // errorCode: PROMPT_TOO_SHORT when _isPromptTooShort
        await db
          .update(tutorChat)
          .set({
            status: "failed",
            errorMessage: _isPromptTooShort ? "Tulis minimal 10 karakter — coba jelaskan pertanyaanmu lebih lengkap" : err instanceof Error ? err.message.slice(0, 500) : "AI unavailable",
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
