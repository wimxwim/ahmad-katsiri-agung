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
  konten: z.string().transform((v) => cleanText(v, SAFE_TEXT_LIMITS.konten)).pipe(z.string().min(20)),
});

export const QuizResultSchema = z.object({
  judul: z.string().transform((v) => cleanText(v, SAFE_TEXT_LIMITS.judul)).pipe(z.string().min(3)),
  soal: z
    .array(GeneratedQuizSchema)
    .min(1)
    .max(20)
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
    .max(20)
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
    const raw = JSON.parse(extractJson(content));
    return QuizResultSchema.parse(raw);
  } catch (error) {
    console.error("[ai-sanitizer] parseQuizSafe failed:", error);
    return null;
  }
}

export function parseSoalSafe(content: string): ValidatedSoal | null {
  try {
    const raw = JSON.parse(extractJson(content));
    return SoalResultSchema.parse(raw);
  } catch (error) {
    console.error("[ai-sanitizer] parseSoalSafe failed:", error);
    return null;
  }
}

function extractJson(content: string): string {
  const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fence ? fence[1] : content).trim();
}
