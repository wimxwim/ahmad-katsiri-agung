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

export async function POST(_req: NextRequest) {
  const { chat, getModelForTask } = await import("@/lib/ai");
  try {
    const result = await chat(
      [{ role: "user", content: "say hi in 3 words" }],
      { model: getModelForTask("light"), maxTokens: 20 },
    );
    return NextResponse.json({ ok: true, result });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
