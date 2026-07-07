import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiRateLimit } from "@/lib/api-response";

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

export async function GET(req: NextRequest) {
  const ip = ipFromRequest(req);
  const rl = await checkRateLimit(`readyz:${ip}`, 30, 60_000);
  if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const dbOk = await getPostgresStatus();

  if (!dbOk) {
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    database: "connected",
    timestamp: new Date().toISOString(),
  });
}
