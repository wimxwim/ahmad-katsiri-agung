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
  return process.env.AI_BASE_URL || "https://router.bynara.id/v1";
}

function getApiKey(): string {
  const key = process.env.AI_API_KEY || process.env.NARAROUTER_API_KEY;
  if (!key) throw new Error("AI_API_KEY belum diset");
  return key;
}

export function getModelName(): string {
  return process.env.AI_MODEL || "mimo-v2.5";
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  const url = `${getBaseUrl()}/chat/completions`;
  const body = {
    model: options.model || getModelName(),
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 1500,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
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
}
