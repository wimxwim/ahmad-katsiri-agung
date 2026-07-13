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

    const rl = await checkRateLimit(`draft-close:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const allApproved =
      row.materiStatus === "approved" &&
      row.quizStatus === "approved" &&
      row.soalStatus === "approved";

    const materiKontenFinal = sanitizeText(row.materiEditedKonten ?? row.materiKonten ?? "", 50_000);
    const materiJudulFinal = sanitizeText(row.materiJudul || "Materi tanpa judul", 200);

    const updated = await db.transaction(async (tx) => {
      let materiId: string | null = null;
      let quizId: string | null = null;

      if (row.materiStatus === "approved" && materiKontenFinal.length > 0 && row.kursusId) {
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
        materiId = m.id;

        await tx.insert(materiSharing).values({
          materiPublishedId: m.id,
          visibility: "PRIVAT",
          approvalStatus: "APPROVED",
        }).onConflictDoNothing();
      }

      if (row.quizStatus === "approved" && row.quizSoal && row.quizSoal.length > 0 && row.kursusId) {
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
        quizId = q.id;

        const items = (row.quizEditedSoal ?? row.quizSoal) as Array<{
          pertanyaan: string;
          tipe: "PG" | "ISIAN" | "ESSAY";
          opsi?: Record<string, string>;
          kunci: string;
        }>;
        if (items.length > 0) {
          await tx.insert(soalPublished).values(
            items.map((s, i) => ({
              aiGenerationId: row.id,
              quizPublishedId: quizId!,
              urutan: i,
              pertanyaan: s.pertanyaan,
              tipe: s.tipe,
              pilihanGanda: s.opsi ?? null,
              kunci: s.kunci,
              poin: 1,
            })),
          );
        }
      }

      if (row.soalStatus === "approved" && row.soalItems && row.soalItems.length > 0 && row.kursusId) {
        const items = (row.soalEditedItems ?? row.soalItems) as Array<{
          pertanyaan: string;
          tipe: "PG" | "ISIAN" | "ESSAY";
          opsi?: Record<string, string>;
          kunci: string;
        }>;
        if (items.length > 0) {
          await tx.insert(soalPublished).values(
            items.map((s, i) => ({
              aiGenerationId: row.id,
              quizPublishedId: null,
              urutan: i,
              pertanyaan: s.pertanyaan,
              tipe: s.tipe,
              pilihanGanda: s.opsi ?? null,
              kunci: s.kunci,
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

    await appendEvent(`gen:${session.userId}`, "gen.review_closed", {
      generationId: id,
      fullyApproved: allApproved,
    });

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