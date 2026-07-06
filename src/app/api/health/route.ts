import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

const startTime = Date.now();

const getPostgresStatus = async (): Promise<boolean> => {
  try {
    const { db } = await import("@/lib/db");
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
};

export async function GET() {
  const dbOk = await getPostgresStatus();

  return NextResponse.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    database: dbOk ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
}
