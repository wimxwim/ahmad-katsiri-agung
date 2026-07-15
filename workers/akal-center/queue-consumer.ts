interface QueueMessage {
  generationId: string;
  fileId: string;
  fileName: string;
  ext: string;
  guruId: string;
  kursusId: string;
  imagekitFileId: string;
  imagekitLink: string;
}

interface Env {
  AI_GENERATION: Queue<QueueMessage>;
  AI_BASE_URL: string;
  AI_API_KEY: string;
  AI_MODEL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  IMAGEKIT_PRIVATE_KEY: string;
  IMAGEKIT_URL_ENDPOINT: string;
}

export default {
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      const { generationId, fileId, imagekitLink, ext } = msg.body;
      console.log(`[ai-queue] processing generation ${generationId}`);

      try {
        await updateStatus(env, generationId, "extracting");

        const fileUrl = imagekitLink.startsWith("/")
          ? `https://akalcenter.my.id${imagekitLink}`
          : imagekitLink;
        const res = await fetch(fileUrl);
        const bytes = Buffer.from(await res.arrayBuffer());
        const sourceText = await extractText(bytes, ext);

        if (!sourceText || sourceText.length < 50) {
          await updateStatus(env, generationId, "failed", "Teks terlalu pendek");
          msg.ack();
          continue;
        }

        const truncated = sourceText.slice(0, 12000);

        await updateStatus(env, generationId, "generating");

        const apiKey = env.AI_API_KEY || "";
        const baseUrl = env.AI_BASE_URL || "https://router.bynara.id/v1";

        const aiModel = env.AI_MODEL || "deepseek-v4-flash-bynara";
        const [materiRes, quizRes, soalRes] = await Promise.all([
          aiChat(baseUrl, apiKey, aiModel, MATERI_SYSTEM_PROMPT, truncated, 1500),
          aiChat(baseUrl, apiKey, aiModel, QUIZ_SYSTEM_PROMPT, truncated, 1500),
          aiChat(baseUrl, apiKey, aiModel, SOAL_SYSTEM_PROMPT, truncated, 1500),
        ]);

        const totalTokensIn = materiRes.tokensIn + quizRes.tokensIn + soalRes.tokensIn;
        const totalTokensOut = materiRes.tokensOut + quizRes.tokensOut + soalRes.tokensOut;

        await updateGeneration(env, generationId, {
          status: "ready",
          materiStatus: "draft",
          quizStatus: "draft",
          soalStatus: "draft",
          materiJudul: extractJsonField(materiRes.content, "judul") || "Materi",
          materiKonten: sanitizeAiOutput(materiRes.content, "materi"),
          quizKonten: sanitizeAiOutput(quizRes.content, "quiz"),
          soalKonten: sanitizeAiOutput(soalRes.content, "soal"),
          modelName: aiModel,
          tokenInput: totalTokensIn,
          tokenOutput: totalTokensOut,
          errorMessage: null,
        });

        console.log(`[ai-queue] generation ${generationId} complete`);
        msg.ack();
      } catch (err) {
        const msg2 = err instanceof Error ? err.message : String(err);
        console.error(`[ai-queue] generation ${generationId} failed:`, msg2);
        await updateStatus(env, generationId, "failed", msg2);
        msg.retry();
      }
    }
  },
};

async function updateStatus(env: Env, id: string, status: string, error?: string) {
  await supabaseQuery(env, "ai_generation", "UPDATE", {
    id,
    status,
    ...(error ? { error_message: error } : {}),
    updated_at: new Date().toISOString(),
  });
}

async function updateGeneration(env: Env, id: string, data: Record<string, unknown>) {
  await supabaseQuery(env, "ai_generation", "UPDATE", {
    id,
    ...data,
    updated_at: new Date().toISOString(),
  });
}

async function supabaseQuery(env: Env, table: string, method: string, data: Record<string, unknown>) {
  const url = `${env.SUPABASE_URL}/rest/v1/${table}?id=eq.${data.id}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  };

  if (method === "UPDATE") {
    await fetch(url, { method: "PATCH", headers, body: JSON.stringify(data) });
  }
}

async function extractText(bytes: Buffer, ext: string): Promise<string> {
  try {
    const { extractText: unpdfExtract } = await import("unpdf");
    const result = await unpdfExtract(bytes, {});
    const pages = result?.pages || result?.text ? [result] : [];
    const text = Array.isArray(pages)
      ? pages.map((p: any) => (typeof p === "string" ? p : p?.text || p?.content || "")).join("\n")
      : String(result?.text || result?.content || "");
    return text.slice(0, 24000);
  } catch {
    return "";
  }
}

async function aiChat(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userContent: string,
  maxTokens: number,
): Promise<{ content: string; tokensIn: number; tokensOut: number }> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json() as any;
  const content = json.choices?.[0]?.message?.content || "";
  return {
    content,
    tokensIn: json.usage?.prompt_tokens || 0,
    tokensOut: json.usage?.completion_tokens || 0,
  };
}

function extractJsonField(content: string, field: string): string {
  try {
    const obj = JSON.parse(content);
    return obj[field] || "";
  } catch {
    return "";
  }
}

function sanitizeAiOutput(content: string, type: "materi" | "quiz" | "soal"): string {
  let cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\bon\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\bon\w+\s*=\s*'[^']*'/gi, "")
    .trim();

  if (type === "materi") {
    cleaned = cleaned.replace(/<h[1-6][^>]*>/gi, "<p>").replace(/<\/h[1-6]>/gi, "</p>");
  }

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        JSON.parse(match[0]);
        return match[0];
      } catch {
        // fall through
      }
    }
    return cleaned;
  }
}

const MATERI_SYSTEM_PROMPT = `Kamu adalah guru PAI profesional. Buat materi pembelajaran dari teks berikut.
Output JSON: {"judul": "Judul Materi", "konten": "Isi materi lengkap..."}
Gunakan bahasa Indonesia yang baik dan benar.`;

const QUIZ_SYSTEM_PROMPT = `Kamu adalah pembuat soal PAI. Buat 5 soal pilihan ganda dari teks berikut.
Output JSON: {"judul": "Quiz", "soal": [{"pertanyaan": "...", "tipe": "PG", "opsi": {"A":"...","B":"...","C":"...","D":"..."}, "kunci": "A"}]}
Pastikan opsi A-D lengkap. Kunci jawaban harus A, B, C, atau D.`;

const SOAL_SYSTEM_PROMPT = `Kamu adalah pembuat soal PAI. Buat soal dari teks berikut: 3 PG + 2 Essay.
Output JSON: {"soal": [{"pertanyaan": "...", "tipe": "PG", "opsi": {"A":"...","B":"...","C":"...","D":"..."}, "kunci": "A"}, ...]}`;