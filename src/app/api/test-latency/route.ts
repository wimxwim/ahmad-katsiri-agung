import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.CRON_SECRET || "akal-cron-secret";

interface TestResult {
  name: string;
  status: number;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  snippet: string;
  error: string | null;
}

async function callNaraRouter(
  model: string,
  messages: Array<{ role: string; content: string }>,
  extra: Record<string, unknown> = {},
  maxTokens = 300,
): Promise<{ status: number; data: Record<string, unknown>; latencyMs: number }> {
  const baseUrl = process.env.AI_BASE_URL || "https://router.bynara.id/v1";
  const apiKey = process.env.AI_API_KEY || process.env.NARAROUTER_API_KEY;
  const t0 = performance.now();
  const body: Record<string, unknown> = { model, messages, max_tokens: maxTokens, ...extra };
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const latencyMs = Math.round(performance.now() - t0);
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, data, latencyMs };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const MODEL = "deepseek-v4-flash-bynara";
  const results: TestResult[] = [];
  const region = process.env.VERCEL_REGION || "unknown";
  const startTotal = performance.now();

  const promptPendek = "Jelaskan apa itu Rukun Iman dalam Islam dalam 3 kalimat.";
  const promptSoal = `Kamu adalah guru PAI Akidah Akhlak untuk SMP/MTs. Buatkan 5 soal pilihan ganda tentang Rukun Iman dalam format JSON. Format: [{"soal":"...", "pilihan":["A. ...","B. ...","C. ...","D. ..."], "jawaban":"A", "pembahasan":"..."}]`;

  const tests = [
    {
      name: "Baseline (no param)",
      messages: [{ role: "user" as const, content: promptPendek }],
      extra: {},
      maxTokens: 200,
    },
    {
      name: "Temp 0.3 + thinking:disabled",
      messages: [{ role: "user" as const, content: promptPendek }],
      extra: { temperature: 0.3, thinking: { type: "disabled" } },
      maxTokens: 200,
    },
    {
      name: "Generate 5 soal PAI (real task)",
      messages: [
        { role: "system" as const, content: promptSoal },
        { role: "user" as const, content: "Buatkan 5 soal." },
      ],
      extra: { temperature: 0.4, thinking: { type: "disabled" }, response_format: { type: "json_object" } },
      maxTokens: 1500,
    },
    {
      name: "Temp 1.2 + thinking:disabled (stress)",
      messages: [{ role: "user" as const, content: "Sebutkan 3 malaikat dan tugasnya." }],
      extra: { temperature: 1.2, thinking: { type: "disabled" } },
      maxTokens: 250,
    },
  ];

  for (const t of tests) {
    try {
      const { status, data, latencyMs } = await callNaraRouter(MODEL, t.messages, t.extra, t.maxTokens);
      const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
      const usage = data.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
      const content = choices?.[0]?.message?.content || "";
      results.push({
        name: t.name,
        status,
        latencyMs,
        tokensIn: usage?.prompt_tokens || 0,
        tokensOut: usage?.completion_tokens || 0,
        snippet: content.slice(0, 120),
        error: null,
      });
    } catch (e: unknown) {
      results.push({
        name: t.name,
        status: 0,
        latencyMs: 0,
        tokensIn: 0,
        tokensOut: 0,
        snippet: "",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const totalMs = Math.round(performance.now() - startTotal);
  const avgLatency = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length)
    : 0;
  const pipelineEstimate = avgLatency * 3 + 60_000;

  return NextResponse.json({
    model: MODEL,
    region,
    totalMs,
    avgLatencyMs: avgLatency,
    pipelineEstimateMs: pipelineEstimate,
    pipelineEstimateSec: Math.round(pipelineEstimate / 1000),
    vercelLimitSec: 300,
    vercelSafe: pipelineEstimate < 300_000,
    results,
  });
}