import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

const MODELS = [
  "deepseek-v4-pro",
  "deepseek-v4-flash",
  "mimo-v2.5",
  "mistral-large",
  "mimo-v2.5-pro",
  "mistral-medium-3-5",
  "kimi-k2.7-code-free",
  "claude-sonnet-5-bynara",
  "gpt-5.6-luna",
];

interface BenchResult {
  model: string;
  status: number;
  timeMs: number;
  validJson: boolean;
  tokensIn: number;
  tokensOut: number;
  content: string;
  error: string | null;
}

export async function GET(request: NextRequest) {
  try {
    await requireOwner(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`benchmark:${ip}`, 1, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { chat } = await import("@/lib/ai");
    const results: BenchResult[] = [];

  for (const model of MODELS) {
    const t0 = performance.now();
    try {
      const result = await chat(
        [{ role: "user", content: "Say hi in 5 words" }],
        { model, maxTokens: 20 },
        0,
      );
      const timeMs = Math.round(performance.now() - t0);
      results.push({
        model,
        status: 200,
        timeMs,
        validJson: true,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        content: result.content.trim(),
        error: null,
      });
    } catch (e: any) {
      const timeMs = Math.round(performance.now() - t0);
      const msg = e.message || String(e);
      results.push({
        model,
        status: msg.includes("401") ? 401 : msg.includes("429") ? 429 : 500,
        timeMs,
        validJson: false,
        tokensIn: 0,
        tokensOut: 0,
        content: "",
        error: msg.slice(0, 200),
      });
    }
  }

  const sorted = [...results].sort((a, b) => a.timeMs - b.timeMs);
  return NextResponse.json({ results, sorted, total: results.length });
  } catch (e) {
    console.error("Benchmark error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}