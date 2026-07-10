import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY ai_daily_costs`);
    return NextResponse.json({ success: true, refreshed: new Date().toISOString() });
  } catch (e) {
    console.error("ai_daily_costs refresh error:", e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
