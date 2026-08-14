import { NextRequest, NextResponse } from "next/server";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { aiGeneration, materiPublished, materiSharing, quizPublished, soalPublished } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { requireNotSuspended, SubscriptionLockedError } from "@/lib/token-service";
import { validateCsrf } from "@/lib/csrf-server";
import { isFallbackMateri, isFallbackQuiz, isFallbackSoal } from "@/lib/ai-generator";
import { sanitizeText } from "@/lib/sanitize";
import { invalidateGuruCache } from "@/lib/dashboard-cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);
    await requireNotSuspended(session.userId);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`draft-action:${ip}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .limit(1);
    if (!row) return apiError("Draft tidak ditemukan", 404);
    // Already approved → idempotent 200 (no duplicate publish, no 409)
    if ((row.status as string) === "approved") {
      return NextResponse.json({ success: true, status: "approved" });
    }
    if (row.status !== "ready" && row.status !== "rejected") {
      return apiError(`Draft belum siap untuk di-approve (status: ${row.status})`, 400);
    }
    if (row.materiKonten) {
      try {
        const parsed = JSON.parse(row.materiKonten as string);
        if (parsed && isFallbackMateri(parsed)) return apiError("Draft mengandung fallback garbage, regenerate dulu", 400);
      } catch {}
    }
    if (Array.isArray(row.soalItems) && isFallbackSoal(row.soalItems as unknown[])) {
      return apiError("Draft mengandung fallback garbage, regenerate dulu", 400);
    }
    if (Array.isArray(row.quizSoal) && isFallbackQuiz(row.quizSoal as unknown[])) {
      return apiError("Draft mengandung fallback garbage, regenerate dulu", 400);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(aiGeneration)
        .set({ status: "approved", updatedAt: new Date() })
        .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)));

      // --- materiPublished (idempotent via onConflictDoNothing on ai_generation_id unique) ---
      if (row.kursusId && row.materiKonten) {
        const kontenFinal = sanitizeText((row as { materiEditedKonten?: string | null }).materiEditedKonten ?? (row.materiKonten as string) ?? "", 50_000);
        const judulFinal = sanitizeText((row as { materiJudul?: string | null }).materiJudul ?? "Materi", 200) || "Materi";
        if (kontenFinal.length > 0) {
          const [pub] = await tx
            .insert(materiPublished)
            .values({
              aiGenerationId: id,
              guruId: session.userId,
              kursusId: row.kursusId,
              judul: judulFinal,
              konten: kontenFinal,
              ringkasan: sanitizeText(kontenFinal.slice(0, 200), 250) || null,
            })
            .onConflictDoNothing()
            .returning({ id: materiPublished.id });
          const materiId = pub?.id ?? (await tx.select({ id: materiPublished.id }).from(materiPublished).where(eq(materiPublished.aiGenerationId, id)).limit(1).then((r) => r[0]?.id ?? null));
          if (materiId) {
            await tx.insert(materiSharing).values({ materiPublishedId: materiId, visibility: "PRIVAT", approvalStatus: "APPROVED" }).onConflictDoNothing();
            if (!row.publishedMateriId) {
              await tx.update(aiGeneration).set({ publishedMateriId: materiId, updatedAt: new Date() }).where(eq(aiGeneration.id, id));
            }
          }
        }
      }

      // --- quizPublished + its soalPublished rows ---
      if (row.kursusId && Array.isArray(row.quizSoal) && (row.quizSoal as unknown[]).length > 0) {
        const rawQuizItems = ((row as { quizEditedSoal?: unknown }).quizEditedSoal ?? row.quizSoal) as Array<{ pertanyaan: string; tipe: string; opsi?: Record<string, string>; kunci: string }>;
        if (rawQuizItems.length > 0) {
          const [qPub] = await tx
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
          const quizId = qPub?.id ?? (await tx.select({ id: quizPublished.id }).from(quizPublished).where(eq(quizPublished.aiGenerationId, id)).limit(1).then((r) => r[0]?.id ?? null));
          if (quizId) {
            const [hasSoal] = await tx.select({ id: soalPublished.id }).from(soalPublished).where(and(eq(soalPublished.aiGenerationId, id), eq(soalPublished.quizPublishedId, quizId))).limit(1);
            if (!hasSoal) {
              const validTypes = ["PG", "ISIAN", "ESSAY"] as const;
              await tx.insert(soalPublished).values(
                rawQuizItems.map((s, i) => ({
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
              await tx.update(aiGeneration).set({ publishedQuizId: quizId, updatedAt: new Date() }).where(eq(aiGeneration.id, id));
            }
          }
        }
      }

      // --- standalone soalPublished rows (quizPublishedId = null) ---
      if (Array.isArray(row.soalItems) && (row.soalItems as unknown[]).length > 0) {
        const rawSoalItems = ((row as { soalEditedItems?: unknown }).soalEditedItems ?? row.soalItems) as Array<{ pertanyaan: string; tipe: string; opsi?: Record<string, string>; kunci: string }>;
        if (rawSoalItems.length > 0) {
          const [existing] = await tx.select({ id: soalPublished.id }).from(soalPublished).where(and(eq(soalPublished.aiGenerationId, id), isNull(soalPublished.quizPublishedId))).limit(1);
          if (!existing) {
            const validTypes = ["PG", "ISIAN", "ESSAY"] as const;
            const inserted = await tx
              .insert(soalPublished)
              .values(
                rawSoalItems.map((s, i) => ({
                  aiGenerationId: id,
                  quizPublishedId: null,
                  urutan: i,
                  pertanyaan: sanitizeText(s.pertanyaan ?? "Soal", 2000) || "Soal",
                  tipe: (validTypes.includes(s.tipe as typeof validTypes[number]) ? s.tipe : "PG") as "PG" | "ISIAN" | "ESSAY",
                  pilihanGanda: s.opsi ?? null,
                  kunci: sanitizeText(s.kunci ?? "A", 500) || "A",
                  poin: 1,
                })),
              )
              .returning({ id: soalPublished.id });
            if (inserted.length > 0 && !row.publishedSoalId) {
              await tx.update(aiGeneration).set({ publishedSoalId: inserted[0].id, updatedAt: new Date() }).where(eq(aiGeneration.id, id));
            }
          }
        }
      }
    });
    await appendEvent(`gen:${session.userId}`, "gen.approved", { generationId: id });
    invalidateGuruCache(session.userId).catch(() => {});

    return NextResponse.json({ success: true, status: "approved" });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof SubscriptionLockedError) return apiError(e.message, 403);
    console.error("Approve error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
