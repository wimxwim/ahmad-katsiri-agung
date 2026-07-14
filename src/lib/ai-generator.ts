import { db } from "@/lib/db";
import { aiGeneration, fileMateri, aiRequests, quotas, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractText } from "@/lib/text-extractor";
import { chatWithFallback, getModelName, getModelForTask, type ChatResult } from "@/lib/ai";
import { appendEvent } from "@/lib/event-store";
import {
  parseMateriSafe,
  parseQuizSafe,
  parseSoalSafe,
  type ValidatedSoal,
} from "@/lib/ai-sanitizer";
import { incrementUsage } from "@/lib/quota-guard";

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|commands?)/gi,
  /forget\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|commands?)/gi,
  /system:\s*/gi,
  /<\|system\|>.*?<\|end\|>/gi,
  /you\s+are\s+now\s+(an?\s+)?(admin|root|superuser|god|owner)/gi,
  /act\s+as\s+(an?\s+)?(admin|root|hacker|attacker)/gi,
  /pretend\s+(you\s+are|to\s+be)\s+(an?\s+)?/gi,
  /override\s+(all\s+)?(instructions?|prompts?|safety|rules)/gi,
  /bypass\s+(all\s+)?(instructions?|prompts?|safety|rules|security)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
];

function sanitizeUserText(text: string): string {
  let sanitized = text;
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[DIBLOKIR]");
  }
  if (sanitized.length < 50) return text;
  return sanitized;
}

export type GeneratedSoal = ValidatedSoal;
export type GeneratedQuiz = ValidatedSoal;

export interface GenerationResult {
  id: string;
  materiJudul: string | null;
  materiKonten: string | null;
  quizJudul: string | null;
  quizSoal: GeneratedQuiz[];
  soalItems: GeneratedSoal[];
  tokensIn: number;
  tokensOut: number;
  modelName: string;
}

const MATERI_SYSTEM = `Kamu adalah asisten pengajar PAI/Akidah Akhlak Indonesia. Tugasmu: menerima teks materi mentah dan menghasilkan MATERI TERSTRUKTUR untuk siswa SMP/MTs. ATURAN:
1. Output HARUS JSON valid dengan field:
   - "judul": string (judul materi, singkat dan jelas, maks 100 karakter)
   - "ringkasan": string (ringkasan 1-2 kalimat, maks 200 karakter)
   - "pendahuluan": string (paragraf pengantar, 2-4 kalimat)
   - "konten": array of { "judul": string, "isi": string } (3-5 bagian, tiap isi 2-4 kalimat)
   - "poinPenting": array of string (3-5 poin kunci)
2. Bahasa Indonesia, gaya untuk siswa SMP/MTs.
3. JANGAN masukkan HTML, script, atau markup apapun.
4. JANGAN masukkan instruksi, disclaimer, atau komentar di luar JSON.
5. Jangan sebut "Berikut adalah" atau "Ini rangkuman" — langsung tulis isi.
6. JANGAN gunakan data siswa asli (nama, NISN, nilai) dalam output.
7. Data yang dikirim HANYA untuk generasi konten — tidak untuk training model.`;

export function buildSoalSystemPrompt(count: number): string {
  return `Kamu adalah penulis soal PAI/Akidah Akhlak Indonesia. Tugasmu: menerima teks materi dan menghasilkan ${count} soal PILIHAN GANDA berkualitas untuk latihan siswa SMP/MTs. ATURAN:
1. Output HARUS JSON valid dengan field "soal" (array ${count} item).
2. Tiap soal: { "pertanyaan": string, "tipe": "PG", "opsi": {"A": "...", "B": "...", "C": "...", "D": "..."}, "kunci": "A"|"B"|"C"|"D" }.
3. Kunci HARUS salah satu dari A/B/C/D yang ada di opsi.
4. Buat distraktor (opsi salah) yang masuk akal dan menantang — jangan terlalu mudah.
5. Variasikan tingkat kesulitan: ${Math.round(count * 0.3)} mudah, ${Math.round(count * 0.4)} sedang, ${Math.round(count * 0.3)} sulit.
6. Bahasa Indonesia, sesuai materi, untuk siswa SMP/MTs.
7. Tidak ada markup, tidak ada komentar di luar JSON.
8. JANGAN gunakan data siswa asli dalam soal.
9. Data dikirim HANYA untuk generasi konten — tidak untuk training model.`;
}

export function buildQuizSystemPrompt(count: number): string {
  return `Kamu adalah penulis kuis PAI/Akidah Akhlak Indonesia. Tugasmu: menerima teks materi dan menghasilkan ${count} soal PILIHAN GANDA untuk kuis singkat. ATURAN:
1. Output HARUS JSON valid dengan field "judul" (string) dan "soal" (array ${count} item).
2. Tiap soal: { "pertanyaan": string, "tipe": "PG", "opsi": {"A": "...", "B": "...", "C": "...", "D": "..."}, "kunci": "A"|"B"|"C"|"D" }.
3. Kunci HARUS salah satu dari A/B/C/D yang ada di opsi.
4. Buat distraktor yang masuk akal.
5. Bahasa Indonesia, untuk siswa SMP/MTs.
6. Tidak ada markup, tidak ada komentar di luar JSON.`;
}

export class GenerationTimeoutError extends Error {
  constructor(public readonly stage: "extract" | "ai" | "ai-materi" | "ai-quiz" | "ai-soal" | "save") {
    super(`Generation timeout at stage: ${stage}`);
  }
}

export class GenerationSchemaError extends Error {
  constructor(public readonly field: "materi" | "quiz" | "soal") {
    super(`AI output schema invalid: ${field}`);
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, stage: "extract" | "ai" | "ai-materi" | "ai-quiz" | "ai-soal" | "save"): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new GenerationTimeoutError(stage)), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

const EXTRACT_TIMEOUT_MS = 60_000;
const AI_TIMEOUT_MS = 90_000;
const SAVE_TIMEOUT_MS = 15_000;

function sentencePool(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 30)
    .slice(0, 12);
}

function fallbackTopic(text: string): string {
  const firstLine = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length >= 8 && line.length <= 90);
  return firstLine || "Materi Pembelajaran";
}

function fallbackQuestion(seed: string, index: number): string {
  const cleaned = seed.replace(/[?.!]+$/g, "").slice(0, 140);
  if (index % 2 === 0) return `Apa inti dari pernyataan berikut: ${cleaned}?`;
  return `Mengapa siswa perlu memahami materi tentang ${cleaned.toLowerCase()}?`;
}

function fallbackAiResults(sourceText: string, quizCount = 5, soalCount = 10): [ChatResult, ChatResult, ChatResult] {
  const sentences = sentencePool(sourceText);
  const topic = fallbackTopic(sourceText);
  const basis = sentences.length > 0 ? sentences : [topic];
  const quizItems = Array.from({ length: quizCount }, (_, index) => {
    const seed = basis[index % basis.length];
    const kunci = ["A", "B", "C", "D"][index % 4];
    return {
      pertanyaan: fallbackQuestion(seed, index),
      tipe: "PG" as const,
      opsi: {
        A: seed.slice(0, 180) || "Memahami inti materi",
        B: "Mengabaikan pesan utama materi",
        C: "Menghafal tanpa memahami makna",
        D: "Menunda penerapan materi dalam kehidupan",
      },
      kunci,
    };
  });
  const soalItems = Array.from({ length: soalCount }, (_, index) => {
    const seed = basis[index % basis.length];
    const kunci = ["A", "B", "C", "D"][index % 4];
    return {
      pertanyaan: fallbackQuestion(seed, index),
      tipe: "PG" as const,
      opsi: {
        A: seed.slice(0, 180) || "Memahami inti materi",
        B: "Mengabaikan pesan utama materi",
        C: "Menghafal tanpa memahami makna",
        D: "Menunda penerapan materi dalam kehidupan",
      },
      kunci,
    };
  });
  const materiStructured = {
    judul: topic,
    ringkasan: basis[0]?.slice(0, 200) || topic,
    pendahuluan: basis.slice(0, 2).join(" ") || topic,
    konten: basis.slice(0, 3).map((s, i) => ({
      judul: `Bagian ${i + 1}`,
      isi: s.slice(0, 500),
    })),
    poinPenting: basis.slice(0, 3).map((s) => s.slice(0, 150)),
  };
  return [
    { content: JSON.stringify(materiStructured), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
    { content: JSON.stringify({ judul: `Kuis ${topic}`, soal: quizItems }), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
    { content: JSON.stringify({ soal: soalItems }), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
  ];
}

export async function runGeneration(
  generationId: string,
  fileBytes: Buffer,
  ext: string,
  soalCount = 10,
  quizCount = 5,
): Promise<GenerationResult> {
  const [gen] = await db
    .select()
    .from(aiGeneration)
    .where(eq(aiGeneration.id, generationId))
    .limit(1);
  if (!gen) throw new Error("Generation record tidak ditemukan");

  try {
    await db
      .update(aiGeneration)
      .set({ status: "extracting", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    if (gen.fileMateriId) {
      await db
        .update(fileMateri)
        .set({ status: "extracting", updatedAt: new Date() })
        .where(eq(fileMateri.id, gen.fileMateriId));
    }
    await appendEvent(`gen:${gen.guruId}`, "gen.extracting", { generationId });

    const sourceText = await withTimeout(
      extractText(fileBytes, ext),
      EXTRACT_TIMEOUT_MS,
      "extract",
    );
    if (!sourceText || sourceText.length < 50) {
      await db
        .update(aiGeneration)
        .set({ status: "failed", errorMessage: "Teks hasil ekstraksi terlalu pendek", updatedAt: new Date() })
        .where(eq(aiGeneration.id, generationId));
      if (gen.fileMateriId) {
        await db
          .update(fileMateri)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(fileMateri.id, gen.fileMateriId));
      }
      throw new Error("Dokumen tidak menghasilkan teks yang cukup untuk di-generate");
    }

    if (gen.fileMateriId) {
      await db
        .update(fileMateri)
        .set({ status: "extracted", extractionText: sourceText, updatedAt: new Date() })
        .where(eq(fileMateri.id, gen.fileMateriId));
    }

    await db
      .update(aiGeneration)
      .set({ status: "generating", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    await appendEvent(`gen:${gen.guruId}`, "gen.generating", { generationId });

    const truncatedSource = sanitizeUserText(sourceText.slice(0, 12_000));

    let aiResults: [ChatResult, ChatResult, ChatResult];
    try {
      const materiRes = await withTimeout(
        chatWithFallback(
          [
            { role: "system", content: MATERI_SYSTEM },
            { role: "user", content: `Materi:\n\n${truncatedSource}` },
          ],
          { model: getModelForTask("light"), temperature: 0.3, maxTokens: 1500 },
        ),
        AI_TIMEOUT_MS,
        "ai-materi",
      );
      const quizRes = await withTimeout(
        chatWithFallback(
          [
            { role: "system", content: buildQuizSystemPrompt(quizCount) },
            { role: "user", content: `Materi:\n\n${truncatedSource}` },
          ],
          { model: getModelForTask("light"), temperature: 0.5, maxTokens: Math.max(800, quizCount * 60) },
        ),
        AI_TIMEOUT_MS,
        "ai-quiz",
      );
      const soalRes = await withTimeout(
        chatWithFallback(
          [
            { role: "system", content: buildSoalSystemPrompt(soalCount) },
            { role: "user", content: `Materi:\n\n${truncatedSource}` },
          ],
          { model: getModelForTask("light"), temperature: 0.5, maxTokens: Math.max(800, soalCount * 50) },
        ),
        AI_TIMEOUT_MS,
        "ai-soal",
      );
      aiResults = [materiRes, quizRes, soalRes];
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[ai-generator] upstream AI failed:", errMsg);
      console.error("[ai-generator] error stack:", error instanceof Error ? (error.stack ?? "").slice(0, 500) : "");
      aiResults = fallbackAiResults(truncatedSource, quizCount, soalCount);
    }

    const [materiRes, quizRes, soalRes] = aiResults;

    const materiParsed = parseMateriSafe(materiRes.content);
    const quizParsed = parseQuizSafe(quizRes.content);
    const soalParsed = parseSoalSafe(soalRes.content);

    if (!materiParsed || !quizParsed) {
      const missing = [
        !materiParsed && "materi",
        !quizParsed && "quiz",
      ].filter(Boolean).join(", ");
      await db
        .update(aiGeneration)
        .set({ status: "failed", errorMessage: `AI output tidak valid: ${missing}`, updatedAt: new Date() })
        .where(eq(aiGeneration.id, generationId));
      throw new GenerationSchemaError(
        (!materiParsed ? "materi" : !quizParsed ? "quiz" : "soal") as "materi" | "quiz" | "soal",
      );
    }

    if (!soalParsed) {
      console.error("[ai-generator] soal output invalid:", soalRes.content.slice(0, 2000));
    }

    const tokensIn = materiRes.tokensIn + quizRes.tokensIn + soalRes.tokensIn;
    const tokensOut = materiRes.tokensOut + quizRes.tokensOut + soalRes.tokensOut;

    const updated = await withTimeout(
      db
        .update(aiGeneration)
        .set({
          status: "ready",
          materiStatus: "draft",
          quizStatus: "draft",
          soalStatus: soalParsed ? "draft" : "not_generated",
          materiJudul: materiParsed.judul,
          materiKonten: JSON.stringify({
            ringkasan: materiParsed.ringkasan,
            pendahuluan: materiParsed.pendahuluan,
            konten: materiParsed.konten,
            poinPenting: materiParsed.poinPenting,
          }),
          quizJudul: quizParsed.judul,
          quizSoal: quizParsed.soal,
          soalItems: soalParsed?.soal ?? [],
          errorMessage: soalParsed ? null : "Soal AI belum valid. Materi dan quiz tetap siap direview; gunakan regenerate soal dari halaman draft.",
          tokenInput: tokensIn,
          tokenOutput: tokensOut,
          modelName: getModelName(),
          updatedAt: new Date(),
        })
        .where(eq(aiGeneration.id, generationId))
        .returning(),
      SAVE_TIMEOUT_MS,
      "save",
    );

    await appendEvent(`gen:${gen.guruId}`, "gen.ready", {
      generationId,
      tokensIn,
      tokensOut,
      model: getModelName(),
    });

    // AI cost tracking + quota increment (best-effort)
    try {
      await db.insert(aiRequests).values({
        userId: gen.guruId,
        model: getModelName(),
        provider: "nararouter",
        requestType: "generation",
        promptTokens: tokensIn,
        completionTokens: tokensOut,
        totalTokens: tokensIn + tokensOut,
      });
      const guru = await db.query.users.findFirst({ where: eq(users.id, gen.guruId) });
      const guruRole = guru?.role ?? "GURU";
      const quota = await db.query.quotas.findFirst({
        where: and(eq(quotas.role, guruRole), eq(quotas.resourceType, "ai_generation"), eq(quotas.isActive, true)),
      });
      if (quota) await incrementUsage(gen.guruId, quota.id);
    } catch { /* non-critical */ }

    const u = updated[0];
    return {
      id: u.id,
      materiJudul: u.materiJudul,
      materiKonten: u.materiKonten,
      quizJudul: u.quizJudul,
      quizSoal: (u.quizSoal as unknown as GeneratedQuiz[]) || [],
      soalItems: (u.soalItems as unknown as GeneratedSoal[]) || [],
      tokensIn: u.tokenInput || 0,
      tokensOut: u.tokenOutput || 0,
      modelName: u.modelName || getModelName(),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation gagal";    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: message.slice(0, 500), updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    if (gen.fileMateriId) {
      await db
        .update(fileMateri)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(fileMateri.id, gen.fileMateriId));
    }
    await appendEvent(`gen:${gen.guruId}`, "gen.failed", { generationId, error: message.slice(0, 200) });
    throw e;
  }
}

export async function runGenerationFromText(
  generationId: string,
  sourceText: string,
  guruId: string,
  soalCount = 10,
  quizCount = 5,
): Promise<void> {
  const [gen] = await db
    .select()
    .from(aiGeneration)
    .where(eq(aiGeneration.id, generationId))
    .limit(1);
  if (!gen) throw new Error("Generation record tidak ditemukan");

  const truncatedSource = sanitizeUserText(sourceText.slice(0, 12_000));

  let aiResults: [ChatResult, ChatResult, ChatResult];
  try {
    const materiRes = await withTimeout(
      chatWithFallback(
        [
          { role: "system", content: MATERI_SYSTEM },
          { role: "user", content: `Materi:\n\n${truncatedSource}` },
        ],
        { model: getModelForTask("light"), temperature: 0.3, maxTokens: 1500 },
      ),
      AI_TIMEOUT_MS,
      "ai-materi",
    );
    const quizRes = await withTimeout(
      chatWithFallback(
        [
          { role: "system", content: buildQuizSystemPrompt(quizCount) },
          { role: "user", content: `Materi:\n\n${truncatedSource}` },
        ],
        { model: getModelForTask("light"), temperature: 0.5, maxTokens: Math.max(800, quizCount * 60) },
      ),
      AI_TIMEOUT_MS,
      "ai-quiz",
    );
    const soalRes = await withTimeout(
      chatWithFallback(
        [
          { role: "system", content: buildSoalSystemPrompt(soalCount) },
          { role: "user", content: `Materi:\n\n${truncatedSource}` },
        ],
        { model: getModelForTask("light"), temperature: 0.5, maxTokens: Math.max(800, soalCount * 50) },
      ),
      AI_TIMEOUT_MS,
      "ai-soal",
    );
    aiResults = [materiRes, quizRes, soalRes];
  } catch (error) {
    console.error("[ai-generator] upstream AI failed:", error);
    aiResults = fallbackAiResults(truncatedSource, quizCount, soalCount);
  }

  const [materiRes, quizRes, soalRes] = aiResults;
  const materiParsed = parseMateriSafe(materiRes.content);
  const quizParsed = parseQuizSafe(quizRes.content);
  const soalParsed = parseSoalSafe(soalRes.content);

  if (!materiParsed || !quizParsed) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "AI output tidak valid", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    throw new Error("AI output tidak valid: materi atau quiz");
  }

  const tokensIn = materiRes.tokensIn + quizRes.tokensIn + soalRes.tokensIn;
  const tokensOut = materiRes.tokensOut + quizRes.tokensOut + soalRes.tokensOut;

  await db
    .update(aiGeneration)
    .set({
      status: "ready",
      materiStatus: "draft",
      quizStatus: "draft",
      soalStatus: soalParsed ? "draft" : "not_generated",
      materiJudul: materiParsed.judul,
      materiKonten: JSON.stringify({
        ringkasan: materiParsed.ringkasan,
        pendahuluan: materiParsed.pendahuluan,
        konten: materiParsed.konten,
        poinPenting: materiParsed.poinPenting,
      }),
      quizJudul: quizParsed.judul,
      quizSoal: quizParsed.soal,
      soalItems: soalParsed?.soal ?? [],
      errorMessage: soalParsed ? null : "Soal belum valid. Materi dan quiz siap direview.",
      tokenInput: tokensIn,
      tokenOutput: tokensOut,
      modelName: getModelName(),
      updatedAt: new Date(),
    })
    .where(eq(aiGeneration.id, generationId));

  await appendEvent(`gen:${guruId}`, "gen.ready", {
    generationId,
    tokensIn,
    tokensOut,
    model: getModelName(),
  });
}
