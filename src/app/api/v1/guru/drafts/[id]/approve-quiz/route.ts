import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, quizPublished, soalPublished } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { isFallbackQuiz } from "@/lib/ai-generator";
import { sanitizeText } from "@/lib/sanitize";

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
    if (row.quizStatus === "not_generated" || !row.quizSoal) {
      return apiError("Draft quiz belum tersedia untuk di-approve", 400);
    }
    if (Array.isArray(row.quizSoal) && isFallbackQuiz(row.quizSoal as unknown[])) {
      return apiError("Draft mengandung fallback garbage, regenerate dulu", 400);
    }

    const rl = await checkRateLimit(`draft-approve-quiz:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [updated] = await db
      .update(aiGeneration)
      .set({
        quizStatus: "approved",
        quizApprovedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .returning();

    // Idempotent publish: insert quizPublished + soalPublished (quiz) on first approve
    if (row.kursusId && updated) {
      try {
        const rawItems = ((row as { quizEditedSoal?: unknown }).quizEditedSoal ?? row.quizSoal) as Array<{ pertanyaan: string; tipe: string; opsi?: Record<string, string>; kunci: string }> | null;
        const items = Array.isArray(rawItems) ? rawItems : [];
        if (items.length > 0) {
          const [pub] = await db
            .insert(quizPublished)
            .values({
              aiGenerationId: id,
              guruId: session.userId,
              kursusId: row.kursusId,
              judul: sanitizeText((row as { quizJudul?: string | null }).quizJudul ?? "Kuis", 200) || "Kuis",
              modeEvaluasi: "BELAJAR",
              durasiMenit: 20,
            })
            .onConflictDoNothing()
            .returning({ id: quizPublished.id });
          const quizId = pub?.id ?? (await db.select({ id: quizPublished.id }).from(quizPublished).where(eq(quizPublished.aiGenerationId, id)).limit(1).then((r) => r[0]?.id ?? null));
          if (quizId) {
            // quizPublished soal rows: only insert once (check existing)
            const [existingSoal] = await db.select({ id: soalPublished.id }).from(soalPublished).where(and(eq(soalPublished.aiGenerationId, id), eq(soalPublished.quizPublishedId, quizId))).limit(1);
            if (!existingSoal) {
              const validTypes = ["PG", "ISIAN", "ESSAY"] as const;
              await db.insert(soalPublished).values(
                items.map((s, i) => ({
                  aiGenerationId: id,
                  quizPublishedId: quizId,
                  urutan: i,
                  pertanyaan: sanitizeText(s.pertanyaan ?? "Soal", 2000) || "Soal",
                  tipe: (validTypes.includes(s.tipe as typeof validTypes[number]) ? s.tipe : "PG") as "PG" | "ISIAN" | "ESSAY",
                  pilihanGanda: s.opsi ?? null,
                  kunci: sanitizeText(s.kunci ?? "A", 500) || "A",
                  poin: 1,
                })),
              );
            }
            if (!row.publishedQuizId) {
              await db.update(aiGeneration).set({ publishedQuizId: quizId, updatedAt: new Date() }).where(eq(aiGeneration.id, id));
            }
          }
        }
      } catch (err) {
        console.error("approve-quiz publish error:", err);
      }
    }

    await appendEvent(`gen:${session.userId}`, "gen.quiz_approved", { generationId: id });

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Approve quiz error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
