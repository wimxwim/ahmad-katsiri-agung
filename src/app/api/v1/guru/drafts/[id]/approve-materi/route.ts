import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration, materiPublished, materiSharing } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { isFallbackMateri } from "@/lib/ai-generator";
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
    if (row.materiStatus === "not_generated" || !row.materiKonten) {
      return apiError("Draft materi belum tersedia untuk di-approve", 400);
    }
    try {
      const parsed = row.materiKonten ? JSON.parse(row.materiKonten as string) : null;
      if (parsed && isFallbackMateri(parsed)) {
        return apiError("Draft mengandung fallback garbage, regenerate dulu", 400);
      }
    } catch {}

    const rl = await checkRateLimit(`draft-approve-materi:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [updated] = await db
      .update(aiGeneration)
      .set({
        materiStatus: "approved",
        materiApprovedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .returning();

    // Idempotent publish: insert materiPublished on first approve (re-approve = 200, no duplicate)
    if (row.kursusId && updated) {
      const kontenFinal = sanitizeText((row as { materiEditedKonten?: string | null }).materiEditedKonten ?? (row.materiKonten as string | null) ?? "", 50_000);
      const judulFinal = sanitizeText((row as { materiJudul?: string | null }).materiJudul ?? "Materi tanpa judul", 200) || "Materi tanpa judul";
      const ringkasanFinal = sanitizeText((kontenFinal.length > 200 ? kontenFinal.slice(0, 200) + "..." : kontenFinal), 250);
      if (kontenFinal.length > 0) {
        try {
          const [pub] = await db
            .insert(materiPublished)
            .values({
              aiGenerationId: id,
              guruId: session.userId,
              kursusId: row.kursusId,
              judul: judulFinal,
              konten: kontenFinal,
              ringkasan: ringkasanFinal || null,
            })
            .onConflictDoNothing()
            .returning({ id: materiPublished.id });
          const publishedMateriId = pub?.id ?? (await db.select({ id: materiPublished.id }).from(materiPublished).where(eq(materiPublished.aiGenerationId, id)).limit(1).then((r) => r[0]?.id ?? null));
          if (publishedMateriId) {
            await db.insert(materiSharing).values({ materiPublishedId: publishedMateriId, visibility: "PRIVAT", approvalStatus: "APPROVED" }).onConflictDoNothing();
            if (!row.publishedMateriId) {
              await db.update(aiGeneration).set({ publishedMateriId, updatedAt: new Date() }).where(eq(aiGeneration.id, id));
            }
          }
        } catch (err) {
          // Non-blocking: materiStatus already approved; publish failure is logged
          console.error("approve-materi publish error:", err);
        }
      }
    }

    await appendEvent(`gen:${session.userId}`, "gen.materi_approved", { generationId: id });

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Approve materi error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
