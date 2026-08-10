import { NextRequest } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiSuccess } from "@/lib/api-response";
import { db } from "@/lib/db";
import { quizPublished, soalPublished, siswaKursus } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { chatWithFallback, getModelForTask } from "@/lib/ai";
import { sanitizeUserText } from "@/lib/ai-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const RefleksiSchema = z.object({
  refleksi: z
    .string()
    .min(10, "Refleksi terlalu pendek")
    .max(2000, "Refleksi terlalu panjang"),
  jawaban: z.record(z.string(), z.string()).optional().default({}),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
    const session = await requireSiswa(request);

    const { id } = await params;
    const rl = await checkRateLimit(`siswa-quiz-refleksi:${session.userId}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [quiz] = await db
      .select()
      .from(quizPublished)
      .where(eq(quizPublished.id, id))
      .limit(1);
    if (!quiz) return apiError("Kuis tidak ditemukan", 404);

    if (quiz.modeEvaluasi !== "BELAJAR") {
      return apiError("Refleksi hanya tersedia untuk mode Belajar", 403);
    }

    const [enroll] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, quiz.kursusId),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enroll) return apiError("Anda belum terdaftar di kursus ini", 403);

    const body = await request.json();
    const parsed = RefleksiSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);
    }

    const { refleksi, jawaban } = parsed.data;
    const sanitizedRefleksi = sanitizeUserText(refleksi);

    // Fetch soal records so the AI can respond to the actual answers
    const soals = await db
      .select()
      .from(soalPublished)
      .where(eq(soalPublished.quizPublishedId, id))
      .orderBy(asc(soalPublished.urutan));

    const jawabanSummary = soals
      .map((s) => {
        const nomor = s.urutan || soals.indexOf(s) + 1;
        const userAnswer = jawaban[s.id];
        const correct =
          s.tipe === "PG"
            ? typeof userAnswer === "string" &&
              userAnswer.toUpperCase() === s.kunci.toUpperCase()
            : typeof userAnswer === "string" &&
              userAnswer.trim().toLowerCase() === s.kunci.trim().toLowerCase();
        return `Soal ${nomor} (${s.tipe}): ${s.pertanyaan} | Jawaban siswa: ${userAnswer || "(tidak dijawab)"} | Kunci: ${s.kunci} | ${correct ? "Benar" : "Salah"}`;
      })
      .join("\n");

    const result = await chatWithFallback(
      [
        {
          role: "system",
          content:
            "Kamu adalah tutor yang ramah dan memotivasi untuk siswa Indonesia (PAI/Akidah Akhlak SMP). Jawab dalam bahasa Indonesia yang jelas, hangat, dan mudah dipahami. Bantu siswa memahami materi dan memperbaiki kesalahan, bukan sekadar memberi pujian atau jawaban mentah. Tulis 3-5 paragraf singkat.",
        },
        {
          role: "user",
          content: `Seorang siswa baru saja menyelesaikan kuis "${quiz.judul}".\n\nJawaban mereka:\n${jawabanSummary}\n\nRefleksi siswa:\n${sanitizedRefleksi}\n\nBerikan penjelasan yang membantu dan memotivasi dalam bahasa Indonesia, menanggapi refleksi siswa dan mengklarifikasi konsep yang masih salah.`,
        },
      ],
      { model: getModelForTask("light"), temperature: 0.4, maxTokens: 1000 },
    );

    return apiSuccess({ penjelasan: result.content });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Quiz refleksi error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
