export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface ChatResult {
  content: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

interface NaraRouterResponse {
  id: string;
  model: string;
  choices: { index: number; message: { role: string; content: string }; finish_reason: string }[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

function getBaseUrl(): string {
  return process.env.AI_BASE_URL || "https://router.bynara.id/v1";
}

function getApiKey(): string {
  const key = process.env.AI_API_KEY || process.env.NARAROUTER_API_KEY;
  if (!key) throw new Error("AI_API_KEY belum diset");
  return key;
}

export function getModelName(): string {
  return process.env.AI_MODEL || "deepseek-v4-flash";
}

export function getFlashModel(): string {
  return process.env.AI_FLASH_MODEL || "deepseek-v4-flash";
}

export type AiTaskComplexity = "heavy" | "light";

export function getModelForTask(complexity: AiTaskComplexity): string {
  if (complexity === "light") return getFlashModel();
  return getModelName();
}

function isDeepSeekModel(model: string): boolean {
  return model.includes("deepseek-v4");
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
  retries = 3,
): Promise<ChatResult> {
  const url = `${getBaseUrl()}/chat/completions`;
  const model = options.model || getModelName();
  console.error("[ai] chat() called:", { url, model, msgLen: messages.reduce((s,m) => s + m.content.length, 0) });
  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: options.maxTokens ?? 1500,
    temperature: options.temperature ?? 0.4,
  };
  if (isDeepSeekModel(model)) {
    body.thinking = { type: "disabled" };
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(options.timeoutMs ?? 180_000),
      });

      console.error("[ai] response:", { status: res.status, ok: res.ok, attempt });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const isEngineCanceled = text.toLowerCase().includes("engine invoke canceled") || text.toLowerCase().includes("service unavailable");
        const isRetryable = [429, 500, 502, 503, 504].includes(res.status) || isEngineCanceled;
        if (isRetryable && attempt < retries) {
          lastError = new Error(`NaraRouter ${res.status} engine-canceled=${isEngineCanceled} (attempt ${attempt + 1}/${retries + 1}): ${text.slice(0, 120)}`);
          const backoff = 1500 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
          console.warn(`[ai] retryable ${res.status} attempt ${attempt + 1}/${retries + 1} backoff ${backoff}ms: ${text.slice(0, 120)}`);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        throw new Error(`NaraRouter error ${res.status}: ${text.slice(0, 400)}`);
      }

      const json = (await res.json()) as NaraRouterResponse;
      const content = json.choices?.[0]?.message?.content || "";
      return {
        content,
        tokensIn: json.usage?.prompt_tokens || 0,
        tokensOut: json.usage?.completion_tokens || 0,
        model: json.model,
      };
    } catch (e: unknown) {
      if (e instanceof Error && e.message.startsWith("NaraRouter error")) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (attempt < retries) {
        lastError = e;
        const backoff = 1500 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
        console.warn(`[ai] network/abort retry ${attempt + 1}/${retries + 1} backoff ${backoff}ms: ${msg.slice(0, 120)}`);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw e;
    }
  }

  if (lastError) throw lastError;
  throw new Error("NaraRouter failed after all retries");
}

export async function chatWithFallback(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  const userText = messages.find((m) => m.role === "user")?.content ?? "";
  const _complexity: AiTaskComplexity = options.model ? (options.model === getFlashModel() ? "light" : "heavy") : "heavy";
  if (userText.trim().length < 10 || (_complexity === "heavy" && userText.trim().length < 100)) {
    console.error(`[ai] chatWithFallback blocked: user prompt too short (${userText.length} chars) — likely empty extractionText complexity=${_complexity}`);
    throw new Error(`Prompt terlalu pendek (${userText.length} chars). Dokumen mungkin scan gambar tanpa teks — upload PDF text-based atau DOCX.`);
  }
  try {
    return await chat(messages, options);
  } catch (e) {
    const heavyModel = getModelForTask("heavy");
    const flashModel = getFlashModel();
    const currentModel = options.model || getModelName();
    const errMsg = e instanceof Error ? e.message : String(e);
    const isEngineCanceled = errMsg.toLowerCase().includes("engine invoke canceled") || errMsg.includes("503");
    console.warn(`[ai] primary ${currentModel} failed (engineCanceled=${isEngineCanceled}): ${errMsg.slice(0, 200)} — trying fallback chain`);

    const fallbackChain: string[] = [];
    if (currentModel === heavyModel && flashModel !== heavyModel) {
      fallbackChain.push(flashModel);
    }
    fallbackChain.push("deepseek-v4-flash-alibaba");
    fallbackChain.push("mimo-v2.5");

    let lastError: unknown = e;
    for (const model of fallbackChain) {
      if (model === currentModel) continue;
      try {
        console.warn(`Model ${currentModel} failed, falling back to ${model}:`, (lastError as Error).message.slice(0, 150));
        await new Promise((r) => setTimeout(r, 800 + Math.floor(Math.random() * 400)));
        return await chat(messages, { ...options, model });
      } catch (err) {
        lastError = err;
        console.warn(`[ai] fallback ${model} also failed: ${(err as Error).message.slice(0, 150)}`);
      }
    }
    throw lastError;
  }
}
