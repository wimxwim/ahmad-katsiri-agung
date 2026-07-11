export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
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
  return process.env.AI_WORKER_URL || process.env.AI_BASE_URL || "https://router.bynara.id/v1";
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

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
  retries = 2,
): Promise<ChatResult> {
  const url = `${getBaseUrl()}/chat/completions`;
  const model = options.model || getModelName();
  console.error("[ai] chat() called:", { url, model, msgLen: messages.reduce((s,m) => s + m.content.length, 0) });
  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 1500,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      });

      console.error("[ai] response:", { status: res.status, ok: res.ok, attempt });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const isRetryable = [502, 503, 504].includes(res.status);
        if (isRetryable && attempt < retries) {
          lastError = new Error(`NaraRouter ${res.status} (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(`NaraRouter error ${res.status}: ${text.slice(0, 300)}`);
      }

      const json = (await res.json()) as NaraRouterResponse;
      const content = json.choices?.[0]?.message?.content || "";
      return {
        content,
        tokensIn: json.usage?.prompt_tokens || 0,
        tokensOut: json.usage?.completion_tokens || 0,
        model: json.model,
      };
    } catch (e: any) {
      if (e instanceof Error && e.message.startsWith("NaraRouter error")) throw e;
      if (attempt < retries) {
        lastError = e;
        await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt)));
        continue;
      }
      throw e;
    }
  }

  throw lastError || new Error("NaraRouter failed after all retries");
}

export async function chatWithFallback(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  try {
    return await chat(messages, options);
  } catch (e) {
    const heavyModel = getModelForTask("heavy");
    const flashModel = getFlashModel();
    const currentModel = options.model || getModelName();
    if (currentModel === heavyModel && flashModel !== heavyModel) {
      console.warn("Heavy model failed, falling back to flash:", (e as Error).message);
      try {
        return await chat(messages, { ...options, model: flashModel });
      } catch (e2) {
        console.warn("Flash model also failed, falling back to mimo:", (e2 as Error).message);
        return await chat(messages, { ...options, model: "mimo-v2.5" });
      }
    }
    console.warn("Model failed, falling back to mimo:", (e as Error).message);
    return await chat(messages, { ...options, model: "mimo-v2.5" });
  }
}
