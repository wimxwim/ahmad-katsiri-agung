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
  type ValidatedSoalItem,
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

const GRADE_GUIDELINES: Record<string, {
  label: string;
  sentenceLength: string;
  vocabulary: string;
  cognitiveStyle: string;
  difficultyDistribution: string;
  bloomDistribution: string;
}> = {
  "A": {
    label: "Fase A (SD Kelas 1-2)",
    sentenceLength: "Maksimal 5 kata per kalimat.",
    vocabulary: "Kata sangat sederhana (maks 2 suku kata). Hindari istilah teknis.",
    cognitiveStyle: "Contoh konkret dari kehidupan sehari-hari anak. Cerita pendek.",
    difficultyDistribution: "50% mudah, 30% sedang, 20% sulit.",
    bloomDistribution: "L1 (Recall) 70%, L2 (Understand) 30%.",
  },
  "B": {
    label: "Fase B (SD Kelas 3-4)",
    sentenceLength: "Maksimal 8 kata per kalimat.",
    vocabulary: "Kata sederhana. Istilah baru harus dijelaskan.",
    cognitiveStyle: "Contoh konkret. Hubungan sederhana. Analogi visual.",
    difficultyDistribution: "40% mudah, 40% sedang, 20% sulit.",
    bloomDistribution: "L1 50%, L2 40%, L3 10%.",
  },
  "C": {
    label: "Fase C (SD Kelas 5-6)",
    sentenceLength: "Maksimal 12 kata per kalimat.",
    vocabulary: "Istilah sederhana dengan definisi dalam kalimat.",
    cognitiveStyle: "Kausalitas sederhana. Cerita dengan konflik moral.",
    difficultyDistribution: "30% mudah, 45% sedang, 25% sulit.",
    bloomDistribution: "L1 30%, L2 45%, L3 25%.",
  },
  "D": {
    label: "Fase D (SMP/MTs Kelas 7-9)",
    sentenceLength: "8-15 kata per kalimat.",
    vocabulary: "Istilah PAI/Akidah Akhlak boleh digunakan dengan definisi singkat. Istilah Arab diperbolehkan.",
    cognitiveStyle: "Abstraksi terbatas. Hubungan sebab-akibat. Penerapan dalam konteks remaja. Dalil Al-Quran dan Hadits.",
    difficultyDistribution: "30% mudah, 40% sedang, 30% sulit.",
    bloomDistribution: "L1 20%, L2 35%, L3 30%, L4 15%.",
  },
  "E": {
    label: "Fase E (SMA Kelas 10)",
    sentenceLength: "10-18 kata per kalimat.",
    vocabulary: "Istilah akademik dan Arab diperbolehkan. Dalil lengkap dengan terjemahan.",
    cognitiveStyle: "Analisis, perbandingan, evaluasi. Multi-perspektif. Isu kontemporer.",
    difficultyDistribution: "20% mudah, 40% sedang, 40% sulit.",
    bloomDistribution: "L1 10%, L2 25%, L3 30%, L4 25%, L5 10%.",
  },
  "F": {
    label: "Fase F (SMA Kelas 11-12)",
    sentenceLength: "12-20+ kata per kalimat.",
    vocabulary: "Istilah akademik penuh. Dalil dengan tafsir. Referensi literatur.",
    cognitiveStyle: "Sintesis, kritik, evaluasi kritis. Argumentasi multi-dimensi. Etika digital.",
    difficultyDistribution: "15% mudah, 35% sedang, 50% sulit.",
    bloomDistribution: "L1 5%, L2 15%, L3 25%, L4 30%, L5 20%, L6 5%.",
  },
};

function tingkatToFase(tingkat: number): string {
  if (tingkat <= 2) return "A";
  if (tingkat <= 4) return "B";
  if (tingkat <= 6) return "C";
  if (tingkat <= 9) return "D";
  if (tingkat <= 10) return "E";
  return "F";
}

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

export function buildMateriSystemPrompt(tingkat?: number): string {
  const fase = tingkatToFase(tingkat ?? 7);
  const cfg = GRADE_GUIDELINES[fase];
  return `Kamu adalah pengembang kurikulum PAI/Akidah Akhlak Indonesia untuk ${cfg.label}.

TUGAS: Menerima teks materi mentah dan menghasilkan MATERI PEMBELAJARAN KOMPREHENSIF yang akan menjadi SATU-SATUNYA sumber belajar siswa. Siswa hanya akan membaca materi ini — tidak ada sumber lain.

ATURAN COVERAGE (WAJIB):
1. Identifikasi SEMUA topik, sub-topik, istilah, dalil, dan konsep dalam teks sumber.
2. PASTIKAN setiap topik dijelaskan dengan cukup detail sehingga siswa bisa menjawab soal tentang topik tersebut.
3. Untuk setiap topik, sertakan: definisi, dalil/ayat dengan terjemahan, contoh konkret, dan hikmah.
4. Jangan lewatkan istilah kunci, nama tokoh, peristiwa, atau nilai-nilai penting.

ATURAN FORMAT (WAJIB):
1. Output HARUS JSON valid.
2. Struktur:
{
  "judul": "string (maks 100 karakter)",
  "ringkasan": "string (maks 250 karakter)",
  "tujuanPembelajaran": ["string x 3-5"],
  "pendahuluan": "string (3-5 kalimat pengantar)",
  "konten": [
    {
      "judul": "string (nama sub-bab)",
      "isi": "string (4-8 kalimat, WAJIB detail dan informatif)",
      "dalil": "string | null (ayat/hadits + terjemahan jika ada)",
      "contoh": "string (2-3 kalimat contoh penerapan dalam kehidupan)",
      "hikmah": "string (nilai atau pelajaran yang bisa dipetik)",
      "poinSoal": ["string x 3-5 potensi soal dari bagian ini"]
    }
  ],
  "istilahKunci": [{"istilah": "string", "definisi": "string"}],
  "poinPenting": ["string x 5-8"],
  "refleksi": "string (pertanyaan refleksi untuk siswa, 2-3 kalimat)"
}
3. konten: 5-8 bagian, setiap bagian isi minimal 4 kalimat.
4. istilahKunci: 5-10 item, setiap definisi 1-2 kalimat.
5. poinPenting: 5-8 item, setiap poin 1 kalimat.

ATURAN BAHASA (KHUSUS ${cfg.label}):
- ${cfg.sentenceLength}
- ${cfg.vocabulary}
- ${cfg.cognitiveStyle}

ATURAN KEAMANAN:
- JANGAN masukkan HTML, script, atau markup.
- JANGAN masukkan instruksi, disclaimer, atau komentar di luar JSON.
- JANGAN gunakan data siswa asli.
- Data dikirim HANYA untuk generasi konten.`;
}

export function buildSoalSystemPrompt(count: number, _tingkat?: number): string {
  return `Kamu adalah penulis soal PAI/Akidah Akhlak Indonesia. Tugasmu: menerima teks materi dan menghasilkan ${count} soal PILIHAN GANDA berkualitas untuk latihan siswa SMP/MTs. ATURAN:
1. Output HARUS JSON valid dengan field "soal" (array ${count} item).
2. Tiap soal: { "pertanyaan": string, "tipe": "PG", "opsi": {"A": "...", "B": "...", "C": "...", "D": "..."}, "kunci": "A"|"B"|"C"|"D" }.
3. Kunci HARUS salah satu dari A/B/C/D yang ada di opsi.
4. Buat distraktor (opsi salah) yang masuk akal dan menantang — jangan terlalu mudah.
5. Variasikan tingkat kesulitan: ${Math.round(count * 0.3)} mudah, ${Math.round(count * 0.4)} sedang, ${Math.round(count * 0.3)} sulit.
6. Bahasa Indonesia, sesuai materi, untuk siswa SMP/MTs.
7. Tidak ada markup, tidak ada komentar di luar JSON.
8. JANGAN gunakan data siswa asli dalam soal.
9. Data dikirim HANYA untuk generasi konten.`;
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
const SOAL_TIMEOUT_MS = 180_000;
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

function fallbackAiResults(sourceText: string, quizCount = 5, soalCount = 35): [ChatResult, ChatResult, ChatResult] {
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
    tujuanPembelajaran: ["Memahami materi pembelajaran", "Menerapkan konsep dalam kehidupan"],
    pendahuluan: basis.slice(0, 2).join(" ") || topic,
    konten: basis.slice(0, 5).map((s, i) => ({
      judul: `Bagian ${i + 1}`,
      isi: s.slice(0, 500),
      dalil: null,
      contoh: "Terapkan dalam kehidupan sehari-hari.",
      hikmah: "Memahami materi ini membantu kita menjadi lebih baik.",
      poinSoal: [s.slice(0, 100)],
    })),
    istilahKunci: [{ istilah: "Materi", definisi: "Pokok pembahasan yang dipelajari" }],
    poinPenting: basis.slice(0, 5).map((s) => s.slice(0, 150)),
    refleksi: "Apa yang sudah kamu pahami dari materi ini?",
  };
  return [
    { content: JSON.stringify(materiStructured), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
    { content: JSON.stringify({ judul: `Kuis ${topic}`, soal: quizItems }), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
    { content: JSON.stringify({ soal: soalItems }), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
  ];
}

export function validateCoverage(
  materiKonten: string,
  soalItems: ValidatedSoalItem[],
): { covered: number; total: number; percentage: number; uncoveredSoal: string[] } {
  const materiText = materiKonten.toLowerCase();
  const total = soalItems.length;
  const uncoveredSoal: string[] = [];

  let covered = 0;
  for (const soal of soalItems) {
    const kunci = soal.kunci?.toLowerCase() || "";
    const pertanyaan = soal.pertanyaan?.toLowerCase() || "";

    const opsiValue = soal.opsi?.[soal.kunci]?.toLowerCase() || "";
    const penjelasan = (soal as Record<string, unknown>).penjelasan as string | undefined;
    const penjelasanLower = penjelasan?.toLowerCase() || "";

    const kunciCovered =
      kunci.length > 2 && materiText.includes(kunci);
    const opsiCovered =
      opsiValue.length > 5 && materiText.includes(opsiValue.slice(0, 20));
    const penjelasanCovered =
      penjelasanLower.length > 10 && materiText.includes(penjelasanLower.slice(0, 30));

    const pertanyaanKeywords = pertanyaan
      .replace(/[?.,!]/g, "")
      .split(" ")
      .filter((w: string) => w.length > 4)
      .slice(0, 5);

    const keywordMatches = pertanyaanKeywords.filter((kw: string) => materiText.includes(kw));
    const keywordCoverage = pertanyaanKeywords.length > 0
      ? keywordMatches.length / pertanyaanKeywords.length
      : 0;

    if (kunciCovered || opsiCovered || penjelasanCovered || keywordCoverage >= 0.6) {
      covered++;
    } else {
      uncoveredSoal.push(soal.pertanyaan.slice(0, 100));
    }
  }

  return {
    covered,
    total,
    percentage: total > 0 ? Math.round((covered / total) * 100) : 0,
    uncoveredSoal,
  };
}

export async function runGeneration(
  generationId: string,
  fileBytes: Buffer,
  ext: string,
  soalCount = 35,
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

    const MAX_SOURCE_LENGTH = 20_000;
    let truncatedSource: string;
    if (sourceText.length > MAX_SOURCE_LENGTH) {
      await appendEvent(`gen:${gen.guruId}`, "gen.truncation_warning", {
        generationId,
        originalLength: sourceText.length,
        maxLength: MAX_SOURCE_LENGTH,
        truncated: sourceText.length - MAX_SOURCE_LENGTH,
      });
      console.warn(`[AI Generator] Source text truncated from ${sourceText.length} to ${MAX_SOURCE_LENGTH} chars for generation ${generationId}`);
      truncatedSource = sanitizeUserText(sourceText.slice(0, MAX_SOURCE_LENGTH));
    } else {
      truncatedSource = sanitizeUserText(sourceText);
    }

    let materiRes: ChatResult;
    try {
      materiRes = await withTimeout(
        chatWithFallback(
          [
            { role: "system", content: buildMateriSystemPrompt() },
            { role: "user", content: `Materi:\n\n${truncatedSource}` },
          ],
          { model: getModelForTask("light"), temperature: 0.3, maxTokens: 2500 },
        ),
        AI_TIMEOUT_MS,
        "ai-materi",
      );
      console.log("[ai-generator] materi done, starting quiz...");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[ai-generator] materi AI failed, using fallback:", errMsg);
      console.error("[ai-generator] error stack:", error instanceof Error ? (error.stack ?? "").slice(0, 500) : "");
      const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
      materiRes = fb[0];
    }

    let quizRes: ChatResult;
    try {
      quizRes = await withTimeout(
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
      console.log("[ai-generator] quiz done, starting soal...");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[ai-generator] quiz AI failed, using fallback:", errMsg);
      console.error("[ai-generator] error stack:", error instanceof Error ? (error.stack ?? "").slice(0, 500) : "");
      const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
      quizRes = fb[1];
    }

    let soalRes: ChatResult;
    try {
      soalRes = await withTimeout(
        chatWithFallback(
          [
            { role: "system", content: buildSoalSystemPrompt(soalCount) },
            { role: "user", content: `Materi:\n\n${truncatedSource}` },
          ],
          { model: getModelForTask("light"), temperature: 0.5, maxTokens: Math.max(2500, soalCount * 200) },
        ),
        SOAL_TIMEOUT_MS,
        "ai-soal",
      );
      console.log("[ai-generator] soal done.");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[ai-generator] soal AI failed, using fallback:", errMsg);
      console.error("[ai-generator] error stack:", error instanceof Error ? (error.stack ?? "").slice(0, 500) : "");
      const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
      soalRes = fb[2];
    }

    let materiParsed = parseMateriSafe(materiRes.content);
    let quizParsed = parseQuizSafe(quizRes.content);
    let soalParsed = parseSoalSafe(soalRes.content);

    if (!materiParsed) {
      console.warn("[ai-generator] materi parse failed, using fallback");
      const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
      materiParsed = parseMateriSafe(fb[0].content);
    }

    if (!quizParsed) {
      console.warn("[ai-generator] quiz parse failed, using fallback");
      const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
      quizParsed = parseQuizSafe(fb[1].content);
    }

    if (!soalParsed) {
      console.warn("[ai-generator] soal AI output invalid, menggunakan fallback lokal. Raw preview:", soalRes.content.slice(0, 500));
      const fallback = fallbackAiResults(truncatedSource, quizCount, soalCount);
      const fallbackSoal = parseSoalSafe(fallback[2].content);
      if (fallbackSoal) {
        soalParsed = fallbackSoal;
        console.log("[ai-generator] soal fallback berhasil —", fallbackSoal.soal.length, "item");
      }
    }

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
        (!materiParsed ? "materi" : "quiz") as "materi" | "quiz" | "soal",
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
          modelName: typeof getModelName() === 'string' ? getModelName() : String(getModelName() ?? 'unknown'),
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
      modelName: typeof (u.modelName || getModelName()) === 'string' ? (u.modelName || getModelName()) : String(u.modelName || getModelName() || 'unknown'),
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
  soalCount = 35,
  quizCount = 5,
  tingkat?: number,
): Promise<void> {
  const [gen] = await db
    .select()
    .from(aiGeneration)
    .where(eq(aiGeneration.id, generationId))
    .limit(1);
  if (!gen) throw new Error("Generation record tidak ditemukan");

  await db
    .update(aiGeneration)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(aiGeneration.id, generationId));

  const truncatedSource = sanitizeUserText(sourceText.slice(0, 20_000));

  let materiRes: ChatResult;
  try {
    materiRes = await withTimeout(
      chatWithFallback(
        [
          { role: "system", content: buildMateriSystemPrompt(tingkat) },
          { role: "user", content: `Materi:\n\n${truncatedSource}` },
        ],
        { model: getModelForTask("light"), temperature: 0.3, maxTokens: 2500 },
      ),
      AI_TIMEOUT_MS,
      "ai-materi",
    );
    console.log("[ai-generator] materi done, starting quiz...");
  } catch (error) {
    console.error("[ai-generator] materi AI failed, using fallback:", error);
    const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
    materiRes = fb[0];
  }

  let quizRes: ChatResult;
  try {
    quizRes = await withTimeout(
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
    console.log("[ai-generator] quiz done, starting soal...");
  } catch (error) {
    console.error("[ai-generator] quiz AI failed, using fallback:", error);
    const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
    quizRes = fb[1];
  }

  let soalRes: ChatResult;
  try {
    soalRes = await withTimeout(
      chatWithFallback(
        [
          { role: "system", content: buildSoalSystemPrompt(soalCount, tingkat) },
{ role: "user", content: `Materi:\n\n${truncatedSource}` },
        ],
        { model: getModelForTask("light"), temperature: 0.5, maxTokens: Math.max(2500, soalCount * 200) },
      ),
      SOAL_TIMEOUT_MS,
      "ai-soal",
    );
    console.log("[ai-generator] soal done.");
  } catch (error) {
    console.error("[ai-generator] soal AI failed, using fallback:", error);
    const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
    soalRes = fb[2];
  }

  let materiParsed = parseMateriSafe(materiRes.content);
  let quizParsed = parseQuizSafe(quizRes.content);
  let soalParsed = parseSoalSafe(soalRes.content);

  if (!materiParsed) {
    console.warn("[ai-generator] materi parse failed, using fallback");
    const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
    materiParsed = parseMateriSafe(fb[0].content);
  }

  if (!quizParsed) {
    console.warn("[ai-generator] quiz parse failed, using fallback");
    const fb = fallbackAiResults(truncatedSource, quizCount, soalCount);
    quizParsed = parseQuizSafe(fb[1].content);
  }

  if (!soalParsed) {
    console.warn("[ai-generator] soal AI output invalid, menggunakan fallback lokal. Raw preview:", soalRes.content.slice(0, 500));
    const fallback = fallbackAiResults(truncatedSource, quizCount, soalCount);
    const fallbackSoal = parseSoalSafe(fallback[2].content);
    if (fallbackSoal) {
      soalParsed = fallbackSoal;
      console.log("[ai-generator] soal fallback berhasil —", fallbackSoal.soal.length, "item");
    }
  }

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
      modelName: typeof getModelName() === 'string' ? getModelName() : String(getModelName() ?? 'unknown'),
      tingkat: tingkat ?? null,
      fase: tingkat ? tingkatToFase(tingkat) : null,
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
