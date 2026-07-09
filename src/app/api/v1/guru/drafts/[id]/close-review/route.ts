import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import {
  aiGeneration,
  materiPublished,
  quizPublished,
  soalPublished,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = request.cookies.get(SESSION_COOKIE_NAME);
    if (!cookieStore?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(cookieStore.value);
    if (!_ar.success || (_ar.data.role !== "guru" && _ar.data.role !== "owner")) {
      return apiError("Hanya guru yang dapat menutup siklus review", 403);
    }
    const session = _ar.data;

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
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

    let materiId: string | null = null;
    let quizId: string | null = null;
    let soalCount = 0;

    if (row.materiStatus === "approved" && materiKontenFinal.length > 0 && row.kursusId) {
      const ringkasan = (row.materiEditedKonten ?? row.materiKonten ?? "").length > 200
        ? (row.materiEditedKonten ?? row.materiKonten ?? "").slice(0, 200) + "..."
        : (row.materiEditedKonten ?? row.materiKonten ?? "");
      const [m] = await db
        .insert(materiPublished)
        .values({
          aiGenerationId: row.id,
          guruId: session.userId!,
          kursusId: row.kursusId,
        judul: materiJudulFinal || "Materi tanpa judul",
        konten: materiKontenFinal,
        ringkasan: sanitizeText(ringkasan, 250),
        })
        .returning({ id: materiPublished.id });
      materiId = m.id;
    }

    if (row.quizStatus === "approved" && row.quizSoal && row.quizSoal.length > 0 && row.kursusId) {
      const [q] = await db
        .insert(quizPublished)
        .values({
          aiGenerationId: row.id,
          guruId: session.userId!,
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
        await db.insert(soalPublished).values(
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
        await db.insert(soalPublished).values(
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
        soalCount = items.length;
      }
    }

    const [updated] = await db
      .update(aiGeneration)
      .set({
        status: allApproved ? "approved" : "rejected",
        publishedAt: allApproved ? new Date() : null,
        publishedMateriId: materiId,
        publishedQuizId: quizId,
        updatedAt: new Date(),
      })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
      .returning();

    await appendEvent(`gen:${session.userId}`, "gen.review_closed", {
      generationId: id,
      fullyApproved: allApproved,
      materiId,
      quizId,
      soalCount,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      redirectTo: `/guru/drafts/${id}/published`,
    });
  } catch (e) {
    console.error("Close review error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
