import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventStore } from "@/lib/db/schema";
import { lte, and, like } from "drizzle-orm";
import { apiError } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
  const ip = ipFromRequest(request);
  const rl = await checkRateLimit(`cron:${ip}`, 10, 60000);
  if (!rl.allowed) return apiError("Rate limit", 429);
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return apiError("CRON_SECRET tidak dikonfigurasi", 500);
  }
  const auth = request.headers.get("Authorization");
  const expected = `Bearer ${cronSecret}`;
  if (auth !== expected) {
    return apiError("Unauthorized", 401);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const deletedAuth = await db
    .delete(eventStore)
    .where(
      and(
        lte(eventStore.createdAt, thirtyDaysAgo),
        like(eventStore.eventType, "auth.%"),
      ),
    );

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const deletedOld = await db
    .delete(eventStore)
    .where(
      and(
        lte(eventStore.createdAt, ninetyDaysAgo),
        like(eventStore.eventType, "gen.%"),
      ),
    );

  return NextResponse.json({
    ok: true,
    pruned: {
      authEvents: deletedAuth.rowCount ?? 0,
      genEvents: deletedOld.rowCount ?? 0,
      timestamp: new Date().toISOString(),
    },
  });
  } catch (e) {
    console.error("Prune events cron error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}