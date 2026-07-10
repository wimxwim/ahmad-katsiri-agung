import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireGuru(request);

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .limit(1);
    if (!row) return apiError("Draft tidak ditemukan", 404);

    const rl = await checkRateLimit(`draft-reject-soal:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [updated] = await db
      .update(aiGeneration)
      .set({
        soalStatus: "rejected",
        updatedAt: new Date(),
      })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .returning();

    await appendEvent(`gen:${session.userId}`, "gen.soal_rejected", { generationId: id });

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Reject soal error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
