import { db } from "@/lib/db";
import { aiGeneration, fileMateri, aiRequests, quotas, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractText } from "@/lib/text-extractor";
import { chat, getModelName } from "@/lib/ai";
import { appendEvent } from "@/lib/event-store";
import {
  parseMateriSafe,
  parseQuizSafe,
  parseSoalSafe,
  type ValidatedSoal,
} from "@/lib/ai-sanitizer";
import { incrementUsage } from "@/lib/quota-guard";

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

const MATERI_SYSTEM = `Kamu adalah asisten pengajar Indonesia. Tugasmu: menerima teks materi mentah dan menghasilkan rangkuman MATERI untuk siswa. ATURAN:
1. Output HARUS JSON valid dengan field "judul" (string) dan "konten" (string).
2. Konten maksimal 1500 karakter, bahasa Indonesia, gaya untuk siswa SMP/SMA.
3. JANGAN masukkan HTML, script, atau markup apapun.
4. JANGAN masukkan instruksi, disclaimer, atau komentar di luar JSON.
5. Jangan sebut "Berikut adalah" atau "Ini rangkuman" — langsung tulis isi.`;

const QUIZ_SYSTEM = `Kamu adalah penulis soal Indonesia. Tugasmu: menerima teks materi dan menghasilkan 5 soal PILIHAN GANDA berkualitas. ATURAN:
1. Output HARUS JSON valid dengan field "judul" (string) dan "soal" (array 5 item).
2. Tiap soal: { "pertanyaan": string, "tipe": "PG", "opsi": {"A": "...", "B": "...", "C": "...", "D": "..."}, "kunci": "A"|"B"|"C"|"D" }.
3. Kunci HARUS salah satu dari A/B/C/D yang ada di opsi.
4. Bahasa Indonesia, sesuai materi.
5. Tidak ada markup, tidak ada komentar di luar JSON.`;

const SOAL_SYSTEM = `Kamu adalah penulis soal Indonesia. Tugasmu: menerima teks materi dan menghasilkan 5 soal CAMPURAN (2 PG, 2 isian, 1 essay). ATURAN:
1. Output HARUS JSON valid dengan field "soal" (array 5 item).
2. PG: { "pertanyaan": string, "tipe": "PG", "opsi": {"A": ..., "B": ..., "C": ..., "D": ...}, "kunci": "A"|"B"|"C"|"D" }
3. Isian: { "pertanyaan": string, "tipe": "ISIAN", "kunci": string }
4. Essay: { "pertanyaan": string, "tipe": "ESSAY", "kunci": "kriteria jawaban" }
5. Kunci PG HARUS salah satu opsi yang ada.
6. Tidak ada markup. Tidak ada komentar di luar JSON.`;

export class GenerationTimeoutError extends Error {
  constructor(public readonly stage: "extract" | "ai" | "save") {
    super(`Generation timeout at stage: ${stage}`);
  }
}

export class GenerationSchemaError extends Error {
  constructor(public readonly field: "materi" | "quiz" | "soal") {
    super(`AI output schema invalid: ${field}`);
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, stage: "extract" | "ai" | "save"): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new GenerationTimeoutError(stage)), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

const EXTRACT_TIMEOUT_MS = 60_000;
const AI_TIMEOUT_MS = 120_000;
const SAVE_TIMEOUT_MS = 15_000;

export async function runGeneration(
  generationId: string,
  fileBytes: Buffer,
  ext: string,
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

    const truncatedSource = sourceText.slice(0, 12_000);

    const [materiRes, quizRes, soalRes] = await withTimeout(
      Promise.all([
        chat(
          [
            { role: "system", content: MATERI_SYSTEM },
            { role: "user", content: `Materi:\n\n${truncatedSource}` },
          ],
          { temperature: 0.3, maxTokens: 1800 },
        ),
        chat(
          [
            { role: "system", content: QUIZ_SYSTEM },
            { role: "user", content: `Materi:\n\n${truncatedSource}` },
          ],
          { temperature: 0.5, maxTokens: 2000 },
        ),
        chat(
          [
            { role: "system", content: SOAL_SYSTEM },
            { role: "user", content: `Materi:\n\n${truncatedSource}` },
          ],
          { temperature: 0.6, maxTokens: 2000 },
        ),
      ]),
      AI_TIMEOUT_MS,
      "ai",
    );

    const materiParsed = parseMateriSafe(materiRes.content);
    const quizParsed = parseQuizSafe(quizRes.content);
    const soalParsed = parseSoalSafe(soalRes.content);

    if (!materiParsed || !quizParsed || !soalParsed) {
      const missing = [
        !materiParsed && "materi",
        !quizParsed && "quiz",
        !soalParsed && "soal",
      ].filter(Boolean).join(", ");
      await db
        .update(aiGeneration)
        .set({ status: "failed", errorMessage: `AI output tidak valid: ${missing}`, updatedAt: new Date() })
        .where(eq(aiGeneration.id, generationId));
      throw new GenerationSchemaError(
        (!materiParsed ? "materi" : !quizParsed ? "quiz" : "soal") as "materi" | "quiz" | "soal",
      );
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
          soalStatus: "draft",
          materiJudul: materiParsed.judul,
          materiKonten: materiParsed.konten,
          quizJudul: quizParsed.judul,
          quizSoal: quizParsed.soal,
          soalItems: soalParsed.soal,
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
    const message = e instanceof Error ? e.message : "Generation gagal";
    await db
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
