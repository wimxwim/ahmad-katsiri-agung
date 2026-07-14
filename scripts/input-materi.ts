/**
 * input-materi.ts — Input materi langsung ke akun guru
 *
 * Workflow:
 *   1. Baca PDF/DOCX dari disk
 *   2. Ekstrak teks
 *   3. Generate materi + quiz + soal via AI (NaraRouter)
 *   4. Insert langsung ke tabel published (materiPublished, quizPublished, soalPublished)
 *   5. Buat kursus (jika belum ada)
 *   6. Set status kursus ke PUBLIK
 *   7. Kirim notifikasi ke dashboard guru
 *
 * Self-contained — tidak perlu Next.js runtime.
 *
 * Usage:
 *   npx tsx scripts/input-materi.ts path/to/file.pdf [options]
 *
 * Options:
 *   --guru-email     Email guru (default: guru@akalcenter.my.id)
 *   --kursus-title   Judul kursus (default: dari AI)
 *   --kursus-slug    Slug kursus (default: dari judul)
 *   --env            Path ke .env (default: .env.local)
 *   --publish        Langsung PUBLIK (default: true)
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import crypto from "node:crypto";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc } from "drizzle-orm";
import JSZip from "jszip";

import {
  users,
  kursus,
  aiGeneration,
  materiPublished,
  quizPublished,
  soalPublished,
  pengumuman,
  eventStore,
} from "@/lib/db/schema";
import { parseMateriSafe, parseQuizSafe, parseSoalSafe } from "@/lib/ai-sanitizer";

// ── Types ──────────────────────────────────────────────────────────

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResult {
  content: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

interface CliArgs {
  filePath: string;
  guruEmail: string;
  guruId: string | null;
  kursusTitle: string | null;
  kursusSlug: string | null;
  envPath: string;
  publish: boolean;
  kelas: string | null;
}

interface Summary {
  file: string;
  extractedChars: number;
  aiGenerations: string[];
  kursusId: string;
  kursusTitle: string;
  kursusSlug: string;
  materiId: string | null;
  quizId: string | null;
  soalCount: number;
  tokensIn: number;
  tokensOut: number;
  modelName: string;
}

// ── Helpers ────────────────────────────────────────────────────────

function uuidv7(): string {
  const HEX = "0123456789abcdef";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const ms = BigInt(Date.now());
  const ts0 = Number((ms >> 40n) & 0xffffffffn);
  const ts1 = Number((ms >> 28n) & 0xfffn);
  const ts2 = Number(ms & 0xfffffffn);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, ts0, false);
  view.setUint16(4, (ts1 << 4) | 0x7, false);
  view.setUint16(6, (ts2 << 4) | (bytes[8] & 0x0f), false);
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map((b) => HEX[(b >> 4) & 0xf] + HEX[b & 0xf]).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) || "materi-tanpa-judul";
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "\n\n[...dokumen terlalu panjang, terpotong]";
}

// ── CLI Parser ─────────────────────────────────────────────────────

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  if (args[0] === "--list-guru") process.exit(0); // handled in main()
  if (args.length === 0 || args[0].startsWith("--")) {
    console.error("Usage: npx tsx scripts/input-materi.ts <file.pdf|file.docx> [options]");
    console.error("Options:");
    console.error("  --guru-email     Email guru (default: guru@akalcenter.my.id)");
    console.error("  --guru-id        UUID guru (lebih cepat, skip lookup)");
    console.error("  --kursus-title   Judul kursus (default: dari AI)");
    console.error("  --kursus-slug    Slug kursus (default: dari judul)");
    console.error("  --kelas 7|8|9    Kelas SMP");
    console.error("  --no-publish     Jangan publish (biarkan draft)");
    console.error("  --list-guru      Tampilkan daftar guru");
    process.exit(1);
  }

  const result: CliArgs = {
    filePath: args[0],
    guruEmail: "guru@akalcenter.my.id",
    guruId: null,
    kursusTitle: null,
    kursusSlug: null,
    envPath: ".env.local",
    publish: true,
    kelas: null,
  };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case "--guru-email":
        result.guruEmail = args[++i];
        break;
      case "--guru-id":
        result.guruId = args[++i];
        break;
      case "--kursus-title":
        result.kursusTitle = args[++i];
        break;
      case "--kursus-slug":
        result.kursusSlug = args[++i];
        break;
      case "--env":
        result.envPath = args[++i];
        break;
      case "--kelas":
        result.kelas = args[++i];
        break;
      case "--no-publish":
        result.publish = false;
        break;
    }
  }

  return result;
}

// ── DB Setup ───────────────────────────────────────────────────────

function createDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
    statement_timeout: 60000,
  });
  pool.on("error", (err) => console.error("DB pool error:", err));
  return drizzle(pool);
}

// ── Text Extraction ────────────────────────────────────────────────

async function extractPdfText(bytes: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const { text } = await extractText(pdf, { mergePages: true });
  return truncate(text || "", 200_000);
}

async function extractDocxText(bytes: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: true });
  const doc = await zip.file("word/document.xml")?.async("string");
  if (!doc) throw new Error("DOCX tidak memiliki word/document.xml");
  const texts = doc.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  let buffer = "";
  for (const m of texts) {
    buffer += m[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }
  return truncate(
    buffer.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(),
    200_000,
  );
}

// ── AI Client ──────────────────────────────────────────────────────

function getAiConfig() {
  return {
    baseUrl: process.env.AI_BASE_URL || "https://router.bynara.id/v1",
    apiKey: process.env.AI_API_KEY || process.env.NARAROUTER_API_KEY || "",
    model: process.env.AI_MODEL || "deepseek-v4-flash-bynara",
    flashModel: process.env.AI_FLASH_MODEL || "deepseek-v4-flash-bynara",
  };
}

async function chatCompletion(
  messages: ChatMessage[],
  options: { model?: string; temperature?: number; maxTokens?: number } = {},
): Promise<ChatResult> {
  const cfg = getAiConfig();
  const model = options.model || cfg.model;
  const url = `${cfg.baseUrl}/chat/completions`;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 1500,
  };
  if (model.includes("deepseek-v4")) {
    body.thinking = { type: "disabled" };
  }

  let lastError: Error | null = null;
  const retries = 2;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const isRetryable = [502, 503, 504].includes(res.status);
        if (isRetryable && attempt < retries) {
          lastError = new Error(`AI ${res.status} (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(`AI error ${res.status}: ${text.slice(0, 300)}`);
      }

      const json = (await res.json()) as {
        choices: { message: { content: string } }[];
        usage?: { prompt_tokens: number; completion_tokens: number };
        model: string;
      };
      return {
        content: json.choices?.[0]?.message?.content || "",
        tokensIn: json.usage?.prompt_tokens || 0,
        tokensOut: json.usage?.completion_tokens || 0,
        model: json.model,
      };
    } catch (e: any) {
      if (e instanceof Error && e.message.startsWith("AI error")) throw e;
      if (attempt < retries) {
        lastError = e;
        await new Promise((r) => setTimeout(r, 1500 * Math.pow(2, attempt)));
        continue;
      }
      throw e;
    }
  }
  throw lastError || new Error("AI failed after retries");
}

async function chatWithFallback(
  messages: ChatMessage[],
  options: { model?: string; temperature?: number; maxTokens?: number } = {},
): Promise<ChatResult> {
  try {
    return await chatCompletion(messages, options);
  } catch (e) {
    const cfg = getAiConfig();
    const currentModel = options.model || cfg.model;
    const flash = cfg.flashModel;
    console.warn(`Model ${currentModel} failed, falling back to ${flash}:`, (e as Error).message);
    try {
      return await chatCompletion(messages, { ...options, model: flash });
    } catch (e2) {
      console.warn("Flash also failed, falling back to mimo-v2.5:", (e2 as Error).message);
      return await chatCompletion(messages, { ...options, model: "mimo-v2.5" });
    }
  }
}

// ── AI Prompts ─────────────────────────────────────────────────────

const MATERI_SYSTEM = `Kamu adalah asisten pengajar Indonesia. Tugasmu: menerima teks materi mentah dan menghasilkan rangkuman MATERI untuk siswa SMP/MTs. ATURAN:
1. Output HARUS JSON valid dengan format:
{
  "judul": "Judul Materi",
  "ringkasan": "Ringkasan singkat 2-3 kalimat",
  "pendahuluan": "Paragraf pembuka/pendahuluan",
  "konten": [
    {"judul": "Sub-bab 1", "isi": "Penjelasan sub-bab 1..."},
    {"judul": "Sub-bab 2", "isi": "Penjelasan sub-bab 2..."}
  ],
  "poinPenting": ["Poin penting 1", "Poin penting 2", "Poin penting 3"]
}
2. konten HARUS array of objects (min 1, max 10 sub-bab), masing-masing punya judul & isi.
3. poinPenting HARUS array of strings (min 1, max 10).
4. ringkasan min 10 karakter, pendahuluan min 20 karakter.
5. Bahasa Indonesia, gaya untuk siswa SMP/SMA.
6. JANGAN masukkan HTML, script, atau markup apapun.
7. JANGAN masukkan instruksi, disclaimer, atau komentar di luar JSON.
8. Jangan sebut "Berikut adalah" atau "Ini rangkuman" — langsung tulis isi.
9. JANGAN gunakan data siswa asli (nama, NISN, nilai) dalam output.
10. Data yang dikirim HANYA untuk generasi konten — tidak untuk training model.`;

const QUIZ_SYSTEM = `Kamu adalah penulis soal Indonesia. Tugasmu: menerima teks materi dan menghasilkan 5 soal PILIHAN GANDA berkualitas. ATURAN:
1. Output HARUS JSON valid dengan field "judul" (string) dan "soal" (array 5 item).
2. Tiap soal: { "pertanyaan": string, "tipe": "PG", "opsi": {"A": "...", "B": "...", "C": "...", "D": "..."}, "kunci": "A"|"B"|"C"|"D" }.
3. Kunci HARUS salah satu dari A/B/C/D yang ada di opsi.
4. Bahasa Indonesia, sesuai materi.
5. Tidak ada markup, tidak ada komentar di luar JSON.
6. JANGAN gunakan data siswa asli dalam soal.
7. Data dikirim HANYA untuk generasi konten — tidak untuk training model.`;

const SOAL_SYSTEM = `Kamu adalah penulis soal Indonesia. Tugasmu: menerima teks materi dan menghasilkan 35 soal CAMPURAN (15 PG, 10 isian, 10 essay). ATURAN:
1. Output HARUS JSON valid dengan field "soal" (array 35 item).
2. PG: { "pertanyaan": string, "tipe": "PG", "opsi": {"A": ..., "B": ..., "C": ..., "D": ...}, "kunci": "A"|"B"|"C"|"D" }
3. Isian: { "pertanyaan": string, "tipe": "ISIAN", "kunci": string }
4. Essay: { "pertanyaan": string, "tipe": "ESSAY", "kunci": "kriteria jawaban" }
5. Kunci PG HARUS salah satu opsi yang ada.
6. Tidak ada markup. Tidak ada komentar di luar JSON.
7. JANGAN gunakan data siswa asli dalam soal.
8. Data dikirim HANYA untuk generasi konten — tidak untuk training model.`;

// ── Fallback (when AI fails) ───────────────────────────────────────

function fallbackTopic(text: string): string {
  const firstLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length >= 8 && l.length <= 90);
  return firstLine || "Materi Pembelajaran";
}

function fallbackAiResults(sourceText: string): [ChatResult, ChatResult, ChatResult] {
  const sentences = sourceText
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30)
    .slice(0, 12);
  const topic = fallbackTopic(sourceText);
  const basis = sentences.length > 0 ? sentences : [topic];
  const konten = basis.slice(0, 5).join(" ").slice(0, 1500);
  const quizItems = Array.from({ length: 5 }, (_, i) => {
    const seed = basis[i % basis.length];
    return {
      pertanyaan: `Apa inti dari: ${seed.slice(0, 140).replace(/[?.!]+$/g, "")}?`,
      tipe: "PG",
      opsi: { A: seed.slice(0, 180) || "Memahami inti", B: "Mengabaikan pesan utama", C: "Menghafal tanpa makna", D: "Menunda penerapan" },
      kunci: ["A", "B", "C", "D", "A"][i],
    };
  });
  const soalItems = [
    quizItems[0], quizItems[1],
    { pertanyaan: `Tuliskan satu nilai utama dari materi ${topic}.`, tipe: "ISIAN", kunci: "Nilai utama sesuai materi" },
    { pertanyaan: `Sebutkan contoh penerapan ${topic} dalam kehidupan sehari-hari.`, tipe: "ISIAN", kunci: "Contoh penerapan relevan" },
    { pertanyaan: `Jelaskan hikmah mempelajari ${topic}.`, tipe: "ESSAY", kunci: "Pemahaman, hikmah, dan contoh sikap" },
  ];
  return [
    { content: JSON.stringify({ judul: topic, konten: konten || topic }), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
    { content: JSON.stringify({ judul: `Quiz ${topic}`, soal: quizItems }), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
    { content: JSON.stringify({ soal: soalItems }), tokensIn: 0, tokensOut: 0, model: "local-fallback" },
  ];
}

// ── Event Store ────────────────────────────────────────────────────

async function appendEvent(streamId: string, eventType: string, payload: Record<string, unknown>) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const d = drizzle(pool);
  try {
    const last = await d
      .select({ version: eventStore.version, previousHash: eventStore.previousHash })
      .from(eventStore)
      .where(eq(eventStore.streamId, streamId))
      .orderBy(desc(eventStore.version))
      .limit(1);
    const version = (last[0]?.version ?? 0) + 1;
    const prevHash = last[0]?.previousHash ?? "0".repeat(64);
    const hashInput = prevHash + JSON.stringify(payload) + version;
    const newHash = crypto.createHash("sha256").update(hashInput).digest("hex");
    await d.insert(eventStore).values({ streamId, version, eventType, payload, previousHash: newHash });
  } finally {
    await pool.end();
  }
}

// ── Main ───────────────────────────────────────────────────────────

async function main(): Promise<Summary> {
  const rawArgs = process.argv.slice(2);

  // ── Mode: list guru ──────────────────────────────────────
  if (rawArgs[0] === "--list-guru") {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    const db = drizzle(pool);
    const list = await db
      .select({ id: users.id, nama: users.nama, email: users.email })
      .from(users)
      .where(eq(users.role, "GURU"))
      .limit(100);
    await pool.end();
    console.log(JSON.stringify(list));
    process.exit(0);
  }

  const args = parseArgs();
  const filePath = resolve(args.filePath);

  // Validate file
  if (!existsSync(filePath)) {
    throw new Error(`File tidak ditemukan: ${filePath}`);
  }
  const ext = filePath.toLowerCase().endsWith(".pdf") ? "pdf"
    : filePath.toLowerCase().endsWith(".docx") || filePath.toLowerCase().endsWith(".doc") ? "docx"
    : null;
  if (!ext) throw new Error("Format file harus PDF atau DOCX");
  const fileName = filePath.split("/").pop() || filePath;

  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║     AKAL Center — Input Materi Guru       ║");
  console.log("╚════════════════════════════════════════════╝\n");
  console.log(`📄 File  : ${fileName}`);
  console.log(`📁 Path  : ${filePath}`);
  if (args.kelas) console.log(`🎒 Kelas  : ${args.kelas}`);
  console.log(`👤 Guru  : ${args.guruEmail}`);
  console.log(`📋 Publish: ${args.publish ? "YA" : "TIDAK (draft)"}\n`);

  // Init DB
  const db = createDb();

  // Find guru
  let guru: { id: string; nama: string; email: string };
  if (args.guruId) {
    const [g] = await db
      .select({ id: users.id, nama: users.nama, email: users.email })
      .from(users)
      .where(eq(users.id, args.guruId))
      .limit(1);
    if (!g) throw new Error(`Guru tidak ditemukan (ID: ${args.guruId})`);
    guru = g;
  } else {
    const [g] = await db
      .select({ id: users.id, nama: users.nama, email: users.email })
      .from(users)
      .where(eq(users.email, args.guruEmail))
      .limit(1);
    if (!g) throw new Error(`Guru tidak ditemukan: ${args.guruEmail}`);
    guru = g;
  }

  console.log(`✅ Guru ditemukan: ${guru.nama} (${guru.email})`);
  console.log(`   ID: ${guru.id}\n`);

  // Read file
  const fileBytes = readFileSync(filePath);
  console.log(`📦 Ukuran file: ${(fileBytes.length / 1024 / 1024).toFixed(2)} MB`);

  // Extract text
  console.log(`\n🔍 Ekstraksi teks dari ${ext}...`);
  let sourceText: string;
  if (ext === "pdf") {
    sourceText = await extractPdfText(fileBytes);
  } else {
    sourceText = await extractDocxText(fileBytes);
  }
  if (!sourceText || sourceText.length < 50) {
    throw new Error("Teks hasil ekstraksi terlalu pendek (< 50 karakter)");
  }
  console.log(`   ✅ Berhasil: ${sourceText.length.toLocaleString()} karakter`);

  const truncatedSource = sourceText.slice(0, 12_000);

  // Create aiGeneration record
  const genId = uuidv7();
  const now = new Date();

  await db.insert(aiGeneration).values({
    id: genId,
    guruId: guru.id,
    sourceFileName: fileName,
    status: "generating",
    materiStatus: "not_generated",
    quizStatus: "not_generated",
    soalStatus: "not_generated",
    createdAt: now,
    updatedAt: now,
  });

  // AI Generation
  console.log(`\n🤖 Generate AI (3 tahap: materi, quiz, soal)...`);
  console.log(`   Model: ${getAiConfig().model}`);

  let aiResults: [ChatResult, ChatResult, ChatResult];
  try {
    console.log(`   → Materi...`);
    const materiRes = await chatWithFallback(
      [{ role: "system", content: MATERI_SYSTEM }, { role: "user", content: `Materi:\n\n${truncatedSource}` }],
      { model: getAiConfig().flashModel, temperature: 0.3, maxTokens: 1500 },
    );
    console.log(`   → Quiz...`);
    const quizRes = await chatWithFallback(
      [{ role: "system", content: QUIZ_SYSTEM }, { role: "user", content: `Materi:\n\n${truncatedSource}` }],
      { model: getAiConfig().flashModel, temperature: 0.5, maxTokens: 1500 },
    );
    console.log(`   → Soal (35 soal)...`);
    const soalRes = await chatWithFallback(
      [{ role: "system", content: SOAL_SYSTEM }, { role: "user", content: `Materi:\n\n${truncatedSource}` }],
      { model: getAiConfig().flashModel, temperature: 0.5, maxTokens: 5000 },
    );
    aiResults = [materiRes, quizRes, soalRes];
  } catch (error) {
    console.warn(`   ⚠️ AI upstream error: ${error instanceof Error ? error.message : String(error)}`);
    console.warn(`   → Menggunakan fallback lokal`);
    aiResults = fallbackAiResults(truncatedSource);
  }

  const [materiRes, quizRes, soalRes] = aiResults;
  console.log(`   ✅ AI selesai (model: ${materiRes.model})`);
  console.log(`   Token input: ${(materiRes.tokensIn + quizRes.tokensIn + soalRes.tokensIn).toLocaleString()}`);
  console.log(`   Token output: ${(materiRes.tokensOut + quizRes.tokensOut + soalRes.tokensOut).toLocaleString()}`);

  // Parse & validate
  const materiParsed = parseMateriSafe(materiRes.content);
  const quizParsed = parseQuizSafe(quizRes.content);
  const soalParsed = parseSoalSafe(soalRes.content);

  if (!materiParsed || !quizParsed) {
    throw new Error(`AI output tidak valid: ${!materiParsed ? "materi" : "quiz"}`);
  }

  const judulFinal = args.kursusTitle || (args.kelas ? `${args.kelas}. ${materiParsed.judul}` : materiParsed.judul);
  const slugFinal = args.kursusSlug || slugify(judulFinal);
  const kontenFinal = Array.isArray(materiParsed.konten)
    ? materiParsed.konten.map((k: { judul: string; isi: string }) => `## ${k.judul}\n\n${k.isi}`).join("\n\n")
    : (typeof materiParsed.konten === "string" ? materiParsed.konten : JSON.stringify(materiParsed.konten));
  const kontenFlat = Array.isArray(materiParsed.konten)
    ? materiParsed.konten.map((k: { judul: string; isi: string }) => `${k.judul}: ${k.isi}`).join(" ")
    : (typeof materiParsed.konten === "string" ? materiParsed.konten : "");
  const ringkasanFinal = (args.kelas ? `[Kelas ${args.kelas}] ` : "") + (materiParsed.ringkasan || kontenFlat.slice(0, 200) + "...");
  const quizJudulFinal = quizParsed.judul;
  const quizSoalItems = quizParsed.soal;
  const soalItems = soalParsed?.soal ?? [];

  console.log(`\n📋 Judul Materi: ${judulFinal}`);
  console.log(`   Slug: ${slugFinal}`);
  if (args.kelas) console.log(`   Kelas: ${args.kelas}`);
  console.log(`   Quiz: ${quizJudulFinal} (${quizSoalItems.length} soal)`);
  console.log(`   Soal tambahan: ${soalItems.length} ${!soalParsed ? "(invalid, skip)" : ""}`);

  // Create or get kursus
  const [existingKursus] = await db
    .select({ id: kursus.id, judul: kursus.judul, statusPublikasi: kursus.statusPublikasi })
    .from(kursus)
    .where(and(eq(kursus.guruId, guru.id), eq(kursus.slug, slugFinal)))
    .limit(1);

  let kursusId: string;
  if (existingKursus) {
    kursusId = existingKursus.id;
    console.log(`\n📚 Kursus sudah ada: "${existingKursus.judul}" (${existingKursus.id.slice(0, 8)}...)`);
  } else {
    kursusId = uuidv7();
    const status = args.publish ? "PUBLIK" : "DRAFT";
    await db.insert(kursus).values({
      id: kursusId,
      guruId: guru.id,
      judul: judulFinal,
      slug: slugFinal,
      deskripsi: ringkasanFinal,
      statusPublikasi: status as "PUBLIK" | "DRAFT" | "ARSIP",
      isPublic: args.publish,
      publishedAt: args.publish ? now : null,
      harga: 0,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`\n📚 Kursus baru dibuat: "${judulFinal}" (${kursusId.slice(0, 8)}...)`);
    console.log(`   Status: ${args.publish ? "PUBLIK" : "DRAFT"}`);
  }

  // Update aiGeneration with kursusId
  await db
    .update(aiGeneration)
    .set({ kursusId, updatedAt: new Date() })
    .where(eq(aiGeneration.id, genId));

  // Insert materiPublished
  let materiPublishedId: string | null = null;
  if (materiParsed) {
    materiPublishedId = uuidv7();
    await db.insert(materiPublished).values({
      id: materiPublishedId,
      aiGenerationId: genId,
      guruId: guru.id,
      kursusId,
      judul: materiParsed.judul || "Materi tanpa judul",
      konten: kontenFinal,
      ringkasan: ringkasanFinal,
      publishedAt: now,
    });
    console.log(`   📖 Materi published: "${(materiParsed.judul || "").slice(0, 60)}"`);
  }

  // Insert quizPublished + soalPublished
  let quizPublishedId: string | null = null;
  let soalCount = 0;
  if (quizParsed && quizSoalItems.length > 0) {
    quizPublishedId = uuidv7();
    await db.insert(quizPublished).values({
      id: quizPublishedId,
      aiGenerationId: genId,
      guruId: guru.id,
      kursusId,
      judul: quizJudulFinal || "Kuis tanpa judul",
      modeEvaluasi: "BELAJAR",
      durasiMenit: 20,
      publishedAt: now,
    });

    await db.insert(soalPublished).values(
      quizSoalItems.map((s, i) => ({
        aiGenerationId: genId,
        quizPublishedId: quizPublishedId!,
        urutan: i,
        pertanyaan: s.pertanyaan,
        tipe: s.tipe,
        pilihanGanda: s.opsi ?? null,
        kunci: s.kunci,
        poin: 1,
      })),
    );
    soalCount += quizSoalItems.length;
    console.log(`   📝 Quiz published: "${(quizJudulFinal || "").slice(0, 60)}" (${quizSoalItems.length} soal)`);
  }

  // Insert standalone soalPublished (if any)
  if (soalParsed && soalItems.length > 0) {
    await db.insert(soalPublished).values(
      soalItems.map((s, i) => ({
        aiGenerationId: genId,
        quizPublishedId: null,
        urutan: i,
        pertanyaan: s.pertanyaan,
        tipe: s.tipe,
        pilihanGanda: s.opsi ?? null,
        kunci: s.kunci,
        poin: 1,
      })),
    );
    soalCount += soalItems.length;
    console.log(`   📝 Soal tambahan: ${soalItems.length} soal`);
  }

  // Update aiGeneration status
  await db
    .update(aiGeneration)
    .set({
      status: "ready",
      materiStatus: "approved",
      quizStatus: "approved",
      soalStatus: soalParsed ? "approved" : "not_generated",
      materiJudul: materiParsed.judul,
      materiKonten: kontenFinal,
      quizJudul: quizJudulFinal,
      quizSoal: quizSoalItems,
      soalItems: soalItems,
      publishedAt: now,
      publishedMateriId: materiPublishedId,
      publishedQuizId: quizPublishedId,
      tokenInput: materiRes.tokensIn + quizRes.tokensIn + soalRes.tokensIn,
      tokenOutput: materiRes.tokensOut + quizRes.tokensOut + soalRes.tokensOut,
      modelName: materiRes.model,
      updatedAt: new Date(),
    })
    .where(eq(aiGeneration.id, genId));

  // Create notification (pengumuman)
  await db.insert(pengumuman).values({
    judul: `📚 Materi Baru: ${judulFinal}`,
    konten: `Materi "${judulFinal}" (${fileName}) berhasil ditambahkan dengan ${soalCount} soal.`,
    target: "SEMUA",
    guruId: guru.id,
    kursusId,
    publishedAt: now,
    isPinned: false,
  });
  console.log(`   🔔 Notifikasi terkirim ke dashboard guru`);

  // Log event
  const tokensIn = materiRes.tokensIn + quizRes.tokensIn + soalRes.tokensIn;
  const tokensOut = materiRes.tokensOut + quizRes.tokensOut + soalRes.tokensOut;
  await appendEvent(`gen:${guru.id}`, "gen.input_materi_direct", {
    generationId: genId,
    fileName,
    kursusId,
    materiPublishedId,
    quizPublishedId,
    soalCount,
    tokensIn,
    tokensOut,
    model: materiRes.model,
  });

  // Summary
  const summary: Summary = {
    file: fileName,
    extractedChars: sourceText.length,
    aiGenerations: [materiRes.model, quizRes.model, soalRes.model],
    kursusId,
    kursusTitle: judulFinal,
    kursusSlug: slugFinal,
    materiId: materiPublishedId,
    quizId: quizPublishedId,
    soalCount,
    tokensIn,
    tokensOut,
    modelName: materiRes.model,
  };

  return summary;
}

// ── Run ────────────────────────────────────────────────────────────

main()
  .then((s) => {
    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║        ✅ SELESAI — Input Materi          ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log(`\n📊 Ringkasan:`);
    console.log(`   File     : ${s.file}`);
    console.log(`   Teks     : ${s.extractedChars.toLocaleString()} karakter`);
    console.log(`   Model AI : ${s.modelName}`);
    console.log(`   Token    : ${s.tokensIn.toLocaleString()} in / ${s.tokensOut.toLocaleString()} out`);
    console.log(`   Kursus   : "${s.kursusTitle}" (${s.kursusSlug})`);
    console.log(`   ID       : ${s.kursusId}`);
    console.log(`   Materi   : ${s.materiId ? "✅" : "❌"} ${s.materiId || ""}`);
    console.log(`   Quiz     : ${s.quizId ? "✅" : "❌"} ${s.quizId || ""}`);
    console.log(`   Soal     : ${s.soalCount} butir`);
    console.log(`\n👤 Guru dapat melihat materi di dashboard:`);
    console.log(`   https://akalcenter.my.id/guru/kursus`);
    process.exit(0);
  })
  .catch((e) => {
    console.error("\n❌ GAGAL:", e instanceof Error ? e.message : String(e));
    if (e instanceof Error && e.stack) {
      console.error(e.stack.split("\n").slice(0, 5).join("\n"));
    }
    process.exit(1);
  });
