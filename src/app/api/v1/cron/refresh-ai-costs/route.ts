import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { apiError } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = ipFromRequest(request);
  const rl = await checkRateLimit(`cron:${ip}`, 10, 60000);
  if (!rl.allowed) return apiError("Rate limit", 429);
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return apiError("CRON_SECRET not configured", 500);
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return apiError("Unauthorized", 401);
  }
  try {
    await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY ai_daily_costs`);
    return NextResponse.json({ success: true, refreshed: new Date().toISOString() });
  } catch (e) {
    console.error("ai_daily_costs refresh error:", e);
    return NextResponse.json({ success: false, error: "Refresh failed" }, { status: 500 });
  }
}
