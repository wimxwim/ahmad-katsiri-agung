import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import {
  checkRateLimit,
  checkRateLimitPerUser,
  ipFromRequest,
} from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { fileMateri, kursus, users, aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { extractText } from "@/lib/text-extractor";
import { incrementUploadCount, getSubscriptionStatus } from "@/lib/token-service";
import { MIN_TOPUP } from "@/lib/token-constants";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ALLOWED_EXT = new Set(["pdf", "docx"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_SIZE = 10 * 1024 * 1024;

const MAGIC_BYTES: { ext: string; bytes: number[] }[] = [
  { ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  { ext: "docx", bytes: [0x50, 0x4b, 0x03, 0x04] },
];

function detectKategori(fileName: string, ext: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("-ppt") || lower.includes("_ppt") || lower.includes(" presentasi")) return "ppt";
  if (lower.includes("-soal") || lower.includes("_soal") || lower.includes(" latihan")) return "soal";
  if (lower.includes("modul ajar") || lower.includes("modul-ajar") || lower.includes("rpp")) return "modul_ajar";
  if (ext === "docx") return "docs";
  return "materi";
}

function detectExtension(buf: Buffer): string | null {
  for (const m of MAGIC_BYTES) {
    if (m.bytes.every((b, i) => buf[i] === b)) return m.ext;
  }
  return null;
}

function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function POST(request: NextRequest) {
  let imagekitFileId: string | null = null;
  let imagekitLink: string | null = null;

  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const ipRl = await checkRateLimit(`upload-doc-ip:${ip}`, 10, 60_000);
    if (!ipRl.allowed) return apiRateLimit(ipRl.retryAfter);

    const userRl = await checkRateLimitPerUser(`upload-doc:${session.userId}`, 20, 60_000);
    if (!userRl.allowed) {
      return apiError(
        `Anda terlalu banyak upload. Coba lagi dalam ${userRl.retryAfter} detik.`,
        429,
      );
    }

    const fd = await request.formData();
    const file = fd.get("file");
    const kursusId = fd.get("kursusId");

    if (!(file instanceof File)) return apiError("File tidak ditemukan", 400);
    if (typeof kursusId !== "string" || !kursusId) return apiError("kursusId wajib diisi", 400);

    if (file.size > MAX_SIZE) {
      return apiError(`File terlalu besar (maks 10MB)`, 413);
    }
    if (file.size === 0) {
      return apiError("File kosong", 400);
    }

    const originalName = file.name;
    const lowerName = originalName.toLowerCase();
    const extFromName = lowerName.split(".").pop() || "";
    if (!ALLOWED_EXT.has(extFromName)) {
      return apiError(`Ekstensi .${extFromName} tidak diizinkan. Gunakan PDF/DOCX.`, 415);
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return apiError(`MIME type ${file.type} tidak diizinkan`, 415);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const detected = detectExtension(bytes);
    if (!detected) {
      return apiError("File bukan PDF/DOCX yang valid (magic bytes tidak cocok)", 415);
    }
    if (detected !== extFromName) {
      return apiError(`Ekstensi .${extFromName} tidak cocok dengan isi file (.${detected})`, 415);
    }

    const fileHash = sha256(bytes);

    const [ownedKursus] = await db
      .select({ id: kursus.id })
      .from(kursus)
      .where(and(eq(kursus.id, kursusId), eq(kursus.guruId, session.userId!)))
      .limit(1);
    if (!ownedKursus) return apiError("Kursus tidak ditemukan untuk akun guru ini", 404);

    const subStatus = await getSubscriptionStatus(session.userId!);
    if (!subStatus.canUpload) {
      return apiError(
        "SUBSCRIPTION_LOCKED",
        `Batas upload gratis tercapai (${subStatus.uploadCount}/${subStatus.uploadLimit}). Top-up minimal Rp${MIN_TOPUP.toLocaleString("id-ID")} untuk upload unlimited.`,
        undefined,
        402,
      );
    }

    const adapter = await getStorageAdapter(session.userId!);
    const folder = `/akal/dokumen/guru-${session.userId}`;

    const uploadResult = await adapter.upload(bytes, {
      nama: originalName,
      tipeMime: file.type || `application/${detected}`,
      folder,
    });

    imagekitFileId = uploadResult.fileId;
    imagekitLink = uploadResult.link;

    const job = await db.transaction(async (tx) => {
      const [fm] = await tx
        .insert(fileMateri)
        .values({
          namaFile: originalName,
          tipeMime: file.type || `application/${detected}`,
          ukuranBytes: file.size,
          lokasi: "IMAGEKIT",
          imagekitFileId: uploadResult.fileId,
          linkAkses: uploadResult.link,
          kursusId,
          guruId: session.userId!,
          status: "uploaded",
          kategori: detectKategori(originalName, detected),
        })
        .returning({ id: fileMateri.id });

      const [gen] = await tx
        .insert(aiGeneration)
        .values({
          fileMateriId: fm.id,
          guruId: session.userId!,
          kursusId,
          sourceFileName: originalName,
          status: "queued",
        })
        .returning({ id: aiGeneration.id });

      return { fileId: fm.id, generationId: gen.id };
    });

    incrementUploadCount(session.userId!).catch(() => {});

    const guru = await db.query.users.findFirst({
      where: eq(users.id, session.userId!),
      columns: { nama: true },
    });
    const guruNama = guru?.nama ?? "Guru";

    appendEvent(`upload:${session.userId}`, "doc.uploaded", {
      jobId: job.fileId,
      generationId: job.generationId,
      guruId: session.userId,
      kursusId,
      fileName: originalName,
      sizeBytes: file.size,
      mime: file.type || null,
      ext: detected,
      fileHash,
      imagekitFileId: uploadResult.fileId,
      link: uploadResult.link,
      at: new Date().toISOString(),
    }).catch(() => {});

    appendEvent("owner:notif", "upload.masuk", {
      guruId: session.userId,
      guruNama,
      fileName: originalName,
      fileId: job.fileId,
      generationId: job.generationId,
      kursusId,
      sizeBytes: file.size,
      ext: detected,
      link: uploadResult.link,
      at: new Date().toISOString(),
    }).catch(() => {});

    queueExtraction(job.fileId, job.generationId, bytes, detected, session.userId!);

    return NextResponse.json({
      success: true,
      fileId: job.fileId,
      jobId: job.generationId,
      fileName: originalName,
      status: "queued",
      message: "Dokumen diterima. Teks akan diekstrak secara otomatis. Buka halaman Draft AI untuk generate materi.",
    }, { status: 202 });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);

    if (imagekitFileId && imagekitLink) {
      try {
        const adapter = await getStorageAdapter("cleanup");
        await adapter.delete(imagekitFileId);
      } catch (cleanupErr) {
        console.error("Gagal menghapus file orphan di ImageKit:", cleanupErr);
      }
    }

    console.error("Upload error:", e);
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan server";
    return apiError(msg, 500);
  }
}

function queueExtraction(
  fileId: string,
  generationId: string,
  bytes: Buffer,
  ext: string,
  guruId: string,
): void {
  Promise.resolve().then(async () => {
    try {
      await db
        .update(aiGeneration)
        .set({ status: "extracting", updatedAt: new Date() })
        .where(eq(aiGeneration.id, generationId));

      await db
        .update(fileMateri)
        .set({ status: "extracting", updatedAt: new Date() })
        .where(eq(fileMateri.id, fileId));

      const text = await extractText(bytes, ext);

      if (text && text.length >= 50) {
        await db
          .update(fileMateri)
          .set({ extractionText: text, status: "extracted", updatedAt: new Date() })
          .where(eq(fileMateri.id, fileId));

        await db
          .update(aiGeneration)
          .set({ status: "extracted", updatedAt: new Date() })
          .where(eq(aiGeneration.id, generationId));

        await appendEvent(`gen:${guruId}`, "gen.extracted", { generationId, textLength: text.length });
      } else {
        await db
          .update(fileMateri)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(fileMateri.id, fileId));

        await db
          .update(aiGeneration)
          .set({ status: "failed", errorMessage: "Teks hasil ekstraksi terlalu pendek", updatedAt: new Date() })
          .where(eq(aiGeneration.id, generationId));
      }
    } catch (err) {
      console.error("Background extraction failed:", err);
      await db
        .update(fileMateri)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(fileMateri.id, fileId));

      await db
        .update(aiGeneration)
        .set({ status: "failed", errorMessage: "Ekstraksi gagal: " + (err instanceof Error ? err.message.slice(0, 200) : "unknown"), updatedAt: new Date() })
        .where(eq(aiGeneration.id, generationId));
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`upload-list:${ip}`, 30, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const url = new URL(request.url);
    const limit = Math.min(50, Math.max(5, parseInt(url.searchParams.get("limit") || "20", 10)));

    const data = await db
      .select({
        id: fileMateri.id,
        namaFile: fileMateri.namaFile,
        tipeMime: fileMateri.tipeMime,
        ukuranBytes: fileMateri.ukuranBytes,
        lokasi: fileMateri.lokasi,
        imagekitFileId: fileMateri.imagekitFileId,
        status: fileMateri.status,
        kategori: fileMateri.kategori,
        guruId: fileMateri.guruId,
        kursusId: fileMateri.kursusId,
        skillId: fileMateri.skillId,
        createdAt: fileMateri.createdAt,
        updatedAt: fileMateri.updatedAt,
      })
      .from(fileMateri)
      .where(eq(fileMateri.guruId, session.userId!))
      .orderBy(fileMateri.createdAt)
      .limit(limit);

    const sanitized = data.map((f) => ({
      ...f,
      linkAkses: `/api/v1/storage/${f.id}`,
    }));

    return NextResponse.json({ data: sanitized });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Upload list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}