import "server-only";
import JSZip from "jszip";

/**
 * Ekstraktor teks dari PDF dan DOCX.
 *
 * PENTING:
 * - Semua input adalah untrusted content (DESIGN.md 19.1).
 * - Hasil ekstraksi disimpan ke kolom `extraction_text` untuk dipakai AI,
 *   bukan file binary.
 * - Ekstraktor ini TIDAK mengeksekusi konten — hanya parsing struktural.
 */

const MAX_TEXT_LENGTH = 200_000;
const MAX_DOCX_UNCOMPRESSED = 100 * 1024 * 1024;
const ZIP_BOMB_RATIO = 100;
const MAX_DOCX_FILES = 500;
const MAX_EXTRACT_TIME_MS = 60_000;
const MAX_PDF_PAGES = 50;

function truncate(text: string): string {
  if (text.length <= MAX_TEXT_LENGTH) return text;
  return text.slice(0, MAX_TEXT_LENGTH) + "\n\n[...truncated, dokumen terlalu panjang]";
}

export function sanitizeText(text: string): string {
  // Strip NUL bytes + control chars except \n \t \r (PostgreSQL rejects \u0000, control chars break rendering)
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout ${label} setelah ${ms / 1000} detik`)), ms),
    ),
  ]);
}

export async function extractPdfText(bytes: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await withTimeout(
    getDocumentProxy(new Uint8Array(bytes)),
    MAX_EXTRACT_TIME_MS,
    "membuka PDF",
  );
  const { totalPages, text } = await withTimeout(
    extractText(pdf, { mergePages: true }),
    MAX_EXTRACT_TIME_MS,
    "ekstraksi PDF",
  );
  if (totalPages > MAX_PDF_PAGES) {
    throw new Error(`PDF memiliki ${totalPages} halaman (maks ${MAX_PDF_PAGES}), kemungkinan dokumen tidak wajar`);
  }
  return truncate(sanitizeText(text || ""));
}

export async function extractDocxText(bytes: Buffer): Promise<string> {
  if (bytes.length > 50 * 1024 * 1024) {
    throw new Error("File DOCX terlalu besar (maks 50MB)");
  }

  const zip = await withTimeout(
    JSZip.loadAsync(bytes, { checkCRC32: true }),
    MAX_EXTRACT_TIME_MS,
    "membuka DOCX",
  );

  const entries = Object.keys(zip.files);
  if (entries.length > MAX_DOCX_FILES) {
    throw new Error(`DOCX memiliki terlalu banyak file (${entries.length}), kemungkinan zip bomb`);
  }

  let totalUncompressed = 0;
  for (const path of entries) {
    const entry = zip.files[path];
    if (entry.dir) continue;
    const node = entry as unknown as { _data?: { uncompressedSize?: number }; comment?: string };
    const size = node._data?.uncompressedSize ?? 0;
    totalUncompressed += size;
    if (totalUncompressed > MAX_DOCX_UNCOMPRESSED) {
      throw new Error("DOCX terlalu besar saat diekstrak (kemungkinan zip bomb)");
    }
  }
  if (bytes.length > 0 && totalUncompressed / bytes.length > ZIP_BOMB_RATIO) {
    throw new Error("Rasio kompresi DOCX tidak wajar (kemungkinan zip bomb)");
  }

  const documentXml = await withTimeout(
    zip.file("word/document.xml")?.async("string") ?? Promise.reject(new Error("DOCX tidak memiliki word/document.xml")),
    MAX_EXTRACT_TIME_MS,
    "membaca word/document.xml",
  );

  const textMatches = documentXml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  let buffer = "";

  for (const m of textMatches) {
    const t = m[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    buffer += t;
  }

  const cleaned = buffer
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return truncate(sanitizeText(cleaned));
}

export async function extractText(
  bytes: Buffer,
  ext: string,
): Promise<string> {
  if (ext === "pdf") return extractPdfText(bytes);
  if (ext === "docx" || ext === "doc") return extractDocxText(bytes);
  throw new Error(`Ekstensi .${ext} tidak didukung untuk ekstraksi`);
}
