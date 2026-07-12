import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

const BUILD_TIMESTAMP = new Date(process.env.BUILD_TIMESTAMP || Date.now()).getTime();
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AKAL Center";

async function checkPostgres(): Promise<{ status: string; latencyMs: number }> {
  const t0 = performance.now();
  try {
    const { db } = await import("@/lib/db");
    await db.execute(sql`SELECT 1`);
    return { status: "connected", latencyMs: Math.round(performance.now() - t0) };
  } catch {
    return { status: "disconnected", latencyMs: Math.round(performance.now() - t0) };
  }
}

async function checkRedis(): Promise<{ status: string; latencyMs: number }> {
  const t0 = performance.now();
  try {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    if (!redis) return { status: "not_configured", latencyMs: 0 };
    await redis.ping();
    return { status: "connected", latencyMs: Math.round(performance.now() - t0) };
  } catch {
    return { status: "disconnected", latencyMs: Math.round(performance.now() - t0) };
  }
}

async function checkSupabase(): Promise<{ status: string; latencyMs: number }> {
  // Aplikasi ini tidak menggunakan Supabase Auth/REST; database lewat Drizzle+Postgres.
  // Health Supabase dianggap not_applicable untuk mencegah false-alarm degraded.
  return { status: "not_applicable", latencyMs: 0 };
}

async function checkImageKit(): Promise<{ status: string; latencyMs: number }> {
  const t0 = performance.now();
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) return { status: "not_configured", latencyMs: 0 };
    const basicAuth = Buffer.from(`${privateKey}:`).toString("base64");
    const res = await fetch("https://api.imagekit.io/v1/files?limit=1", {
      headers: { Authorization: `Basic ${basicAuth}` },
      signal: AbortSignal.timeout(5000),
    });
    return { status: res.ok ? "connected" : `error_${res.status}`, latencyMs: Math.round(performance.now() - t0) };
  } catch {
    return { status: "unreachable", latencyMs: Math.round(performance.now() - t0) };
  }
}

async function checkAI(): Promise<{ status: string; latencyMs: number }> {
  const t0 = performance.now();
  try {
    const baseUrl = process.env.AI_BASE_URL || "https://router.bynara.id/v1";
    const apiKey = process.env.AI_API_KEY || process.env.NARAROUTER_API_KEY;
    if (!apiKey) return { status: "not_configured", latencyMs: 0 };
    const res = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    return { status: res.ok ? "connected" : `error_${res.status}`, latencyMs: Math.round(performance.now() - t0) };
  } catch {
    return { status: "unreachable", latencyMs: Math.round(performance.now() - t0) };
  }
}

export async function GET() {
  const t0 = performance.now();
  const [pg, redis, supabase, imagekit, ai] = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkSupabase(),
    checkImageKit(),
    checkAI(),
  ]);

  const services = { postgres: pg, redis, supabase, imagekit, ai };
  const allOk = Object.values(services).every(
    (s) => s.status === "connected" || s.status === "not_configured" || s.status === "not_applicable",
  );
  const degraded = Object.values(services).some(
    (s) => s.status !== "connected" && s.status !== "not_configured" && s.status !== "not_applicable",
  );

  return NextResponse.json(
    {
      status: allOk ? "ok" : degraded ? "degraded" : "error",
      app: APP_NAME,
      version: "2.0.0",
      uptime: Math.floor((Date.now() - BUILD_TIMESTAMP) / 1000),
      responseTimeMs: Math.round(performance.now() - t0),
      timestamp: new Date().toISOString(),
      services,
    },
    { status: allOk ? 200 : degraded ? 200 : 503 },
  );
}
