import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, checkConcurrentLimit, releaseConcurrent } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = request.cookies.get(SESSION_COOKIE_NAME);
    if (!cookieStore?.value) return apiError("Sesi tidak valid", 401);
    const session = await verifySession(cookieStore.value);
    if (!session || (session.role !== "guru" && session.role !== "owner")) {
      return apiError("Hanya guru yang dapat meregenerasi", 403);
    }

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
      .limit(1);
    if (!row) return apiError("Draft tidak ditemukan", 404);
    if (!row.fileMateriId) {
      return apiError("Draft ini tidak punya file sumber untuk re-generate", 400);
    }

    const rl = await checkRateLimit(`draft-regen-materi:${session.userId}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const conc = await checkConcurrentLimit(`gen:${session.userId}`, 2);
    if (!conc.allowed) {
      return apiError("Terlalu banyak job aktif. Tunggu job sebelumnya selesai.", 429);
    }

    const { regenerateMateriOnly } = await import("@/lib/ai-regenerate");

    await db
      .update(aiGeneration)
      .set({ materiStatus: "not_generated", updatedAt: new Date() })
      .where(eq(aiGeneration.id, id));

    regenerateMateriOnly(id)
      .catch((e) => {
        console.error("Regen materi async error:", e);
      })
      .finally(() => {
        releaseConcurrent(`gen:${session.userId}`);
      });

    await appendEvent(`gen:${session.userId}`, "gen.materi_regenerate_queued", { generationId: id });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Regen materi error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
