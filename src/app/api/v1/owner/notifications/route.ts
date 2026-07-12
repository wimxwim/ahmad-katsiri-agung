import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { eventStore } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireOwner(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`owner-notif:${ip}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const eventType = url.searchParams.get("type") || "upload.masuk";

    const events = await db
      .select({
        id: eventStore.id,
        eventType: eventStore.eventType,
        payload: eventStore.payload,
        createdAt: eventStore.createdAt,
      })
      .from(eventStore)
      .where(and(eq(eventStore.streamId, "owner:notif"), eq(eventStore.eventType, eventType)))
      .orderBy(desc(eventStore.createdAt))
      .limit(limit);

    const items = events.map((e) => ({
      id: e.id,
      type: e.eventType,
      payload: e.payload as Record<string, unknown>,
      createdAt: e.createdAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ data: items, total: items.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan server";
    return apiError(msg, 500);
  }
}