import { NextRequest, NextResponse } from "next/server";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
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
    if (row.status !== "ready" && row.status !== "rejected") {
      return apiError(`Draft belum siap untuk di-approve (status: ${row.status})`, 400);
    }

    await db
      .update(aiGeneration)
      .set({ status: "approved", updatedAt: new Date() })
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)));
    await appendEvent(`gen:${session.userId}`, "gen.approved", { generationId: id });

    return NextResponse.json({ success: true, status: "approved" });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Approve error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
