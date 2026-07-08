import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
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
    const _ar = await verifySession(cookieStore.value);
    if (!_ar.success || (_ar.data.role !== "guru" && _ar.data.role !== "owner")) {
      return apiError("Hanya guru yang dapat reject draft", 403);
    }
    const session = _ar.data;

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
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
      .where(eq(aiGeneration.id, id))
      .returning();

    await appendEvent(`gen:${session.userId}`, "gen.soal_rejected", { generationId: id });

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("Reject soal error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
