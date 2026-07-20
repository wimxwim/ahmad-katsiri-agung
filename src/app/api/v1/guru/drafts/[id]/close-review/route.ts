import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import {
  aiGeneration,
  materiPublished,
  materiSharing,
  quizPublished,
  soalPublished,
  kursus,
  fileMateri,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { sanitizeText } from "@/lib/sanitize";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";

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

    const approved = [
      row.materiStatus === "approved" || row.materiStatus === "not_generated",
      row.quizStatus === "approved" || row.quizStatus === "not_generated",
      row.soalStatus === "approved" || row.soalStatus === "not_generated",
    ];
    const blocked = approved.filter((a) => !a).length;
    if (blocked > 0) {
      return apiError(
        `${blocked} bagian belum di-approve. Approve atau reject semua bagian terlebih dahulu.`,
        400,
      );
    }

    // Idempotency check: prevent double-click from re-publishing
    if (row.status === "approved") {
      return NextResponse.json({
        success: true,
        data: { redirectTo: `/guru/drafts/${id}/published` },
      });
    }

    const rl = await checkRateLimit(`draft-close:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const allApproved =
      row.materiStatus === "approved" &&
      row.quizStatus === "approved" &&
      row.soalStatus === "approved";

    const materiKontenFinal = sanitizeText(row.materiEditedKonten ?? row.materiKonten ?? "", 50_000);
    const materiJudulFinal = sanitizeText(row.materiJudul || "Materi tanpa judul", 200);

    // Pre-check: if materiPublished already exists for this draft, skip materi insert
    const [existingMateri] = await db
      .select({ id: materiPublished.id })
      .from(materiPublished)
      .where(eq(materiPublished.aiGenerationId, id))
      .limit(1);
    const skipMateri = !!existingMateri;

    // Pre-check: if quizPublished already exists for this draft
    const [existingQuiz] = await db
      .select({ id: quizPublished.id })
      .from(quizPublished)
      .where(eq(quizPublished.aiGenerationId, id))
      .limit(1);
    const skipQuiz = !!existingQuiz;

    // Pre-check: if soalPublished already exists for this draft (standalone soals)
    const [existingSoal] = await db
      .select({ id: soalPublished.id })
      .from(soalPublished)
      .where(eq(soalPublished.aiGenerationId, id))
      .limit(1);
    const skipSoal = !!existingSoal;

    let updated;
    try {
      updated = await db.transaction(async (tx) => {
      let materiId: string | null = null;
      let quizId: string | null = null;

      if (!skipMateri && row.materiStatus === "approved" && materiKontenFinal.length > 0 && row.kursusId) {
        const ringkasan = (row.materiEditedKonten ?? row.materiKonten ?? "").length > 200
          ? (row.materiEditedKonten ?? row.materiKonten ?? "").slice(0, 200) + "..."
          : (row.materiEditedKonten ?? row.materiKonten ?? "");
        const [m] = await tx
          .insert(materiPublished)
          .values({
            aiGenerationId: row.id,
            guruId: session.userId,
            kursusId: row.kursusId,
            judul: materiJudulFinal || "Materi tanpa judul",
            konten: materiKontenFinal,
            ringkasan: sanitizeText(ringkasan, 250),
          })
          .returning({ id: materiPublished.id });
        if (!m?.id) throw new Error("Gagal insert materiPublished");
        materiId = m.id;

        await tx.insert(materiSharing).values({
          materiPublishedId: m.id,
          visibility: "PRIVAT",
          approvalStatus: "APPROVED",
        }).onConflictDoNothing();
      }

      if (!skipQuiz && row.quizStatus === "approved" && row.quizSoal && row.quizSoal.length > 0 && row.kursusId) {
        const [q] = await tx
          .insert(quizPublished)
          .values({
            aiGenerationId: row.id,
            guruId: session.userId,
            kursusId: row.kursusId,
            judul: row.quizJudul || "Kuis tanpa judul",
            modeEvaluasi: "BELAJAR",
            durasiMenit: 20,
          })
          .returning({ id: quizPublished.id });
        if (!q?.id) throw new Error("Gagal insert quizPublished");
        quizId = q.id;

        const items = (row.quizEditedSoal ?? row.quizSoal) as Array<{
          pertanyaan: string;
          tipe: "PG" | "ISIAN" | "ESSAY";
          opsi?: Record<string, string>;
          kunci: string;
        }>;
        if (items.length > 0) {
          const validTypes = ["PG", "ISIAN", "ESSAY"];
          await tx.insert(soalPublished).values(
            items.map((s, i) => ({
              aiGenerationId: row.id,
              quizPublishedId: quizId!,
              urutan: i,
              pertanyaan: s.pertanyaan || "Soal tidak tersedia",
              tipe: validTypes.includes(s.tipe) ? s.tipe : "PG",
              pilihanGanda: s.opsi ?? null,
              kunci: s.kunci || "A",
              poin: 1,
            })),
          );
        }
      }

      if (!skipSoal && row.soalStatus === "approved" && row.soalItems && row.soalItems.length > 0 && row.kursusId) {
        const items = (row.soalEditedItems ?? row.soalItems) as Array<{
          pertanyaan: string;
          tipe: "PG" | "ISIAN" | "ESSAY";
          opsi?: Record<string, string>;
          kunci: string;
        }>;
        if (items.length > 0) {
          const validTypes = ["PG", "ISIAN", "ESSAY"];
          await tx.insert(soalPublished).values(
            items.map((s, i) => ({
              aiGenerationId: row.id,
              quizPublishedId: null,
              urutan: i,
              pertanyaan: s.pertanyaan || "Soal tidak tersedia",
              tipe: validTypes.includes(s.tipe) ? s.tipe : "PG",
              pilihanGanda: s.opsi ?? null,
              kunci: s.kunci || "A",
              poin: 1,
            })),
          );
        }
      }

      const [updated] = await tx
        .update(aiGeneration)
        .set({
          status: allApproved ? "approved" : "rejected",
          publishedAt: allApproved ? new Date() : null,
          publishedMateriId: materiId,
          publishedQuizId: quizId,
          updatedAt: new Date(),
        })
        .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
        .returning();

      if (allApproved && row.kursusId && (materiId || quizId)) {
        await tx
          .update(kursus)
          .set({
            statusPublikasi: "PUBLIK",
            isPublic: true,
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(kursus.id, row.kursusId), eq(kursus.guruId, session.userId)));
      }

      return updated;
    });
    } catch (err: any) {
      // Extract Postgres error code from various possible paths
      const pgCode = err?.code || err?.cause?.code || err?.original?.code || err?.detail?.code || '';
      console.error("Close review error:", pgCode, err?.message, err?.detail, err?.schema, err?.table);

      if (pgCode === "23505") {
        return apiError("Draft sudah diterbitkan sebelumnya. Refresh halaman.", 409);
      }
      if (pgCode === "22P02" || pgCode === "23503" || pgCode === "23502") {
        return apiError("Data tidak valid. Coba generate ulang konten.", 400);
      }
      if (pgCode === "23514") {
        return apiError("Data melanggar batasan database. Hubungi admin.", 400);
      }
      // Catch-all: return the error message for debugging (safe for production since it's a DB error)
      return apiError("Gagal menerbitkan draft. Coba lagi.", 500);
    }

    try {
      await appendEvent(`gen:${session.userId}`, "gen.review_closed", {
        generationId: id,
        fullyApproved: allApproved,
      });
    } catch (err) {
      console.error("Failed to append close-review event:", err);
      // Non-blocking
    }

    if (allApproved && row.fileMateriId) {
      await db
        .update(fileMateri)
        .set({ extractionText: null, updatedAt: new Date() })
        .where(eq(fileMateri.id, row.fileMateriId));
    }

    return NextResponse.json({
      success: true,
      data: updated,
      redirectTo: `/guru/drafts/${id}/published`,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Close review error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}