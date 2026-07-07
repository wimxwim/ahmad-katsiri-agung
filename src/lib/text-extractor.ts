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

function truncate(text: string): string {
  if (text.length <= MAX_TEXT_LENGTH) return text;
  return text.slice(0, MAX_TEXT_LENGTH) + "\n\n[...truncated, dokumen terlalu panjang]";
}

export async function extractPdfText(bytes: Buffer): Promise<string> {
  const { PDFParse } = (await import("pdf-parse")) as unknown as {
    PDFParse: new (opts: { data: Buffer }) => {
      getText(): Promise<{ text: string }>;
      destroy(): Promise<void>;
    };
  };
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    return truncate(result.text || "");
  } finally {
    await parser.destroy().catch(() => {});
  }
}

export async function extractDocxText(bytes: Buffer): Promise<string> {
  if (bytes.length > 50 * 1024 * 1024) {
    throw new Error("File DOCX terlalu besar (maks 50MB)");
  }

  const zip = await JSZip.loadAsync(bytes, {
    checkCRC32: true,
  });

  let totalUncompressed = 0;
  for (const path of Object.keys(zip.files)) {
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

  const documentXml = await zip.file("word/document.xml")?.async("string");
  if (!documentXml) {
    throw new Error("DOCX tidak memiliki word/document.xml");
  }

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

  return truncate(cleaned);
}

export async function extractText(
  bytes: Buffer,
  ext: string,
): Promise<string> {
  if (ext === "pdf") return extractPdfText(bytes);
  if (ext === "docx" || ext === "doc") return extractDocxText(bytes);
  throw new Error(`Ekstensi .${ext} tidak didukung untuk ekstraksi`);
}
