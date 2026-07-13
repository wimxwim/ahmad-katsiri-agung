import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY ai_daily_costs`);
    return NextResponse.json({ success: true, refreshed: new Date().toISOString() });
  } catch (e) {
    console.error("ai_daily_costs refresh error:", e);
    return NextResponse.json({ success: false, error: "Refresh failed" }, { status: 500 });
  }
}
