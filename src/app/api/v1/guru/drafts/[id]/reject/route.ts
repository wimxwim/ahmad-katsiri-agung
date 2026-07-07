import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const session = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    if (!session || (session.role !== "guru" && session.role !== "owner")) {
      return apiError("Hanya guru yang dapat reject draft", 403);
    }

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`draft-action:${ip}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
      .limit(1);
    if (!row) return apiError("Draft tidak ditemukan", 404);

    await db
      .update(aiGeneration)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(aiGeneration.id, id));
    await appendEvent(`gen:${session.userId}`, "gen.rejected", { generationId: id });

    return NextResponse.json({ success: true, status: "rejected" });
  } catch (e) {
    console.error("Reject error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
