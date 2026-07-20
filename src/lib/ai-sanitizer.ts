import { z } from "zod";

/**
 * Sanitizer & validator untuk output AI.
 *
 * PENTING (DESIGN.md 18.4 + AGENTS.md):
 * - AI output = untrusted content. Jangan return raw.
 * - Jangan oper string AI langsung ke dangerouslySetInnerHTML atau rich text editor
 *   tanpa lewat sanitizer ini dulu.
 * - Schema validation ketat: field yang tidak sesuai akan ditolak, bukan dipaksa masuk.
 */

const SAFE_TEXT_LIMITS = {
  judul: 300,
  konten: 8000,
  pertanyaan: 1000,
  kunci: 500,
  opsi: 200,
};

type JsonObject = Record<string, unknown>;

const OPTION_KEYS = ["A", "B", "C", "D", "E"] as const;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(input: unknown, max: number): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/vbscript\s*:/gi, "blocked:")
    .replace(/data\s*:/gi, "blocked:")
    .replace(/file\s*:/gi, "blocked:")
    .replace(/\bon\w+\s*=/gi, "blocked=")
    .replace(/&#x?[\da-fA-F]+;?/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Sanitasi untuk rich text (HTML aman) — untuk future use ketika konten
 * materi perlu mendukung format kaya (bold, italic, list).
 *
 * ATURAN:
 * - Hanya tag HTML aman yang diizinkan: b, i, em, strong, u, ol, ul, li, p, br
 * - Semua attribute dihapus (termasuk class, style, id, onclick, dll)
 * - Protocol berbahaya diblokir (javascript:, data:, file:)
 * - Script, iframe, object, embed, form, input, style dihapus total
 */
const ALLOWED_RICH_TAGS = new Set([
  "b", "i", "em", "strong", "u", "ol", "ul", "li", "p", "br", "sub", "sup",
]);

export function sanitizeRichText(input: unknown): string {
  if (typeof input !== "string") return "";
  const cleaned = input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?<\/embed>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<input[\s\S]*?\/?>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*\s(on\w+)\s*=[^>]*>/gi, "")
    .replace(/<[^>]*\s(href|src)\s*=\s*["']?\s*(javascript|vbscript|data|file)\s*:/gi, "")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .replace(/&#x?[\da-fA-F]+;?/g, "");

  return cleaned.replace(/<\/?([a-zA-Z]+)[^>]*>/g, (match, tag) => {
    const lower = tag.toLowerCase();
    if (ALLOWED_RICH_TAGS.has(lower)) {
      if (match.startsWith("</")) return `</${lower}>`;
      return `<${lower}>`;
    }
    return "";
  });
}

const GeneratedSoalSchema = z.object({
  pertanyaan: z.string().transform((v) => cleanText(v, SAFE_TEXT_LIMITS.pertanyaan)).refine((v) => v.length > 5, {
    message: "pertanyaan terlalu pendek",
  }),
  tipe: z.enum(["PG", "ISIAN", "ESSAY"]),
  opsi: z
    .record(z.string(), z.string().transform((v) => cleanText(v, SAFE_TEXT_LIMITS.opsi)))
    .optional(),
  kunci: z.string().transform((v) => cleanText(v, SAFE_TEXT_LIMITS.kunci)),
});

const GeneratedQuizSchema = GeneratedSoalSchema;

export const MateriResultSchema = z.object({
  judul: z.string().transform((v) => cleanText(v, SAFE_TEXT_LIMITS.judul)).pipe(z.string().min(3)),
  ringkasan: z.string().transform((v) => cleanText(v, 300)).pipe(z.string().min(10)),
  pendahuluan: z.string().transform((v) => cleanText(v, 2000)).pipe(z.string().min(20)),
  konten: z
    .array(
      z.object({
        judul: z.string().transform((v) => cleanText(v, 200)),
        isi: z.string().transform((v) => cleanText(v, 2000)).pipe(z.string().min(20)),
      }),
    )
    .min(1)
    .max(10),
  poinPenting: z
    .array(z.string().transform((v) => cleanText(v, 300)))
    .min(1)
    .max(10),
});

export const QuizResultSchema = z.object({
  judul: z.string().transform((v) => cleanText(v, SAFE_TEXT_LIMITS.judul)).pipe(z.string().min(3)),
  soal: z
    .array(GeneratedQuizSchema)
    .min(1)
    .max(15)
    .transform((arr) =>
      arr.map((s) => {
        if (s.tipe === "PG" && s.opsi) {
          const allowed = Object.keys(s.opsi).filter((k) => /^[A-E]$/.test(k));
          const filtered: Record<string, string> = {};
          for (const k of allowed) filtered[k] = s.opsi[k];
          return { ...s, opsi: filtered };
        }
        if (s.tipe === "PG" && (!s.opsi || Object.keys(s.opsi).length === 0)) {
          return { ...s, opsi: { A: "-", B: "-", C: "-", D: "-" } };
        }
        return s;
      }),
    ),
});

export const SoalResultSchema = z.object({
  soal: z
    .array(GeneratedSoalSchema)
    .min(1)
    .max(50)
    .transform((arr) =>
      arr.map((s) => {
        if (s.tipe === "PG" && s.opsi) {
          const allowed = Object.keys(s.opsi).filter((k) => /^[A-E]$/.test(k));
          const filtered: Record<string, string> = {};
          for (const k of allowed) filtered[k] = s.opsi[k];
          return { ...s, opsi: filtered };
        }
        return s;
      }),
    ),
});

export type ValidatedMateri = z.infer<typeof MateriResultSchema>;
export type ValidatedQuiz = z.infer<typeof QuizResultSchema>;
export type ValidatedSoal = z.infer<typeof SoalResultSchema>;
export type ValidatedSoalItem = z.infer<typeof GeneratedSoalSchema>;

export function parseMateriSafe(content: string): ValidatedMateri | null {
  try {
    const raw = JSON.parse(extractJson(content));
    return MateriResultSchema.parse(raw);
  } catch (error) {
    console.error("[ai-sanitizer] parseMateriSafe failed:", error);
    return null;
  }
}

export function parseQuizSafe(content: string): ValidatedQuiz | null {
  try {
    const raw = normalizeQuizPayload(JSON.parse(extractJson(content)));
    return QuizResultSchema.parse(raw);
  } catch (error) {
    console.error("[ai-sanitizer] parseQuizSafe failed:", error);
    return null;
  }
}

export function parseSoalSafe(content: string): ValidatedSoal | null {
  try {
    const raw = normalizeSoalPayload(JSON.parse(extractJson(content)));
    return SoalResultSchema.parse(raw);
  } catch (error) {
    console.error("[ai-sanitizer] parseSoalSafe failed:", error);
    return null;
  }
}

function extractJson(content: string): string {
  const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fence ? fence[1] : content).trim();
  if (raw.startsWith("{") && raw.endsWith("}")) return raw;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) return raw.slice(start, end + 1).trim();
  return raw;
}

function normalizeQuizPayload(raw: unknown): unknown {
  if (!isObject(raw)) return raw;
  const soal = Array.isArray(raw.soal) ? raw.soal.map(normalizeSoalItem) : raw.soal;
  return { ...raw, soal };
}

function normalizeSoalPayload(raw: unknown): unknown {
  if (Array.isArray(raw)) return { soal: raw.map(normalizeSoalItem) };
  if (!isObject(raw)) return raw;
  const source = Array.isArray(raw.soal)
    ? raw.soal
    : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.questions)
        ? raw.questions
        : Array.isArray(raw.data)
          ? raw.data
          : raw.soal;

  // Unwrap nested: {result: {soal: [...]}}, {data: {questions: [...]}}, etc.
  const keys = Object.keys(raw);
  if (keys.length === 1) {
    const inner = (raw as Record<string, unknown>)[keys[0]];
    if (isObject(inner)) {
      const innerKeys = Object.keys(inner);
      if (innerKeys.includes("soal") || innerKeys.includes("items") || innerKeys.includes("questions") || innerKeys.includes("data")) {
        return normalizeSoalPayload(inner);
      }
    }
  }

  const soal = Array.isArray(source) ? source.map(normalizeSoalItem) : source;
  return { ...raw, soal };
}

function normalizeSoalItem(item: unknown): unknown {
  if (!isObject(item)) return item;
  const pertanyaan = item.pertanyaan ?? item.question ?? item.teks ?? item.soal;
  const tipe = normalizeTipe(item.tipe ?? item.type ?? item.jenis);
  const opsi = normalizeOpsi(item.opsi ?? item.pilihan ?? item.options ?? item.choices);
  const kunci = normalizeKunci(item.kunci ?? item.jawaban ?? item.answer ?? item.correctAnswer, tipe, opsi);
  return {
    ...item,
    pertanyaan,
    tipe,
    ...(opsi ? { opsi } : {}),
    kunci,
  };
}

function normalizeTipe(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();
  if (["pg", "pilihan ganda", "multiple choice", "multiple-choice", "mcq"].includes(normalized)) return "PG";
  if (["isian", "isi singkat", "jawaban singkat", "short answer", "fill", "fill in"].includes(normalized)) return "ISIAN";
  if (["essay", "esai", "uraian", "essay question", "long answer"].includes(normalized)) return "ESSAY";
  return value;
}

function normalizeOpsi(value: unknown): Record<string, string> | undefined {
  if (Array.isArray(value)) {
    const output: Record<string, string> = {};
    value.slice(0, OPTION_KEYS.length).forEach((entry, index) => {
      const cleaned = cleanOptionEntry(entry);
      if (cleaned) output[OPTION_KEYS[index]] = cleaned;
    });
    return Object.keys(output).length > 0 ? output : undefined;
  }

  // Parse string opsi: "A. xxx\nB. yyy" -> {A: "xxx", B: "yyy"}
  if (typeof value === "string") {
    const lines = value.split(/\n|\\n/).filter(Boolean);
    const parsed: Record<string, string> = {};
    for (const line of lines) {
      const match = line.match(/^([A-E])[.)]\s*(.+)/);
      if (match) {
        parsed[match[1]] = match[2].trim();
      }
    }
    if (Object.keys(parsed).length >= 2) return parsed;
  }

  if (!isObject(value)) return undefined;

  const output: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    const optionKey = normalizeOptionKey(key);
    const cleaned = cleanOptionEntry(entry);
    if (optionKey && cleaned) output[optionKey] = cleaned;
  }

  return Object.keys(output).length > 0 ? output : undefined;
}

function normalizeOptionKey(key: string): string | null {
  const trimmed = key.trim().toUpperCase();
  if (OPTION_KEYS.includes(trimmed as (typeof OPTION_KEYS)[number])) return trimmed;
  const separated = trimmed.match(/(?:^|[^A-Z])([A-E])(?:[^A-Z]|$)/);
  if (separated) return separated[1];
  const suffix = trimmed.match(/[A-E]$/);
  if (suffix && /^(OPTION|OPSI|PILIHAN|JAWABAN|ANSWER|CHOICE)/.test(trimmed)) return suffix[0];
  return null;
}

function cleanOptionEntry(value: unknown): string {
  if (typeof value === "string") return cleanText(value, SAFE_TEXT_LIMITS.opsi);
  if (isObject(value)) {
    const candidate = value.text ?? value.label ?? value.value ?? value.jawaban;
    if (typeof candidate === "string") return cleanText(candidate, SAFE_TEXT_LIMITS.opsi);
  }
  return "";
}

function normalizeKunci(value: unknown, tipe: unknown, opsi: Record<string, string> | undefined): unknown {
  // Convert numeric keys: 0->A, 1->B, 2->C, 3->D, 4->E
  if (typeof value === "number" || /^\d+$/.test(String(value))) {
    const num = typeof value === "number" ? value : parseInt(String(value), 10);
    if (num >= 0 && num <= 4) {
      return String.fromCharCode(65 + num); // 0->A, 1->B, ...
    }
  }
  if (typeof value !== "string") return value;
  if (tipe !== "PG" || !opsi) return value;
  const cleaned = cleanText(value, SAFE_TEXT_LIMITS.kunci);
  const direct = normalizeOptionKey(cleaned);
  if (direct && opsi[direct]) return direct;
  const match = Object.entries(opsi).find(([, option]) => option.toLowerCase() === cleaned.toLowerCase());
  return match?.[0] ?? cleaned;
}
