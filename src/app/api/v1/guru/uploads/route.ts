import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import {
  checkRateLimit,
  checkRateLimitPerUser,
  checkConcurrentLimit,
  releaseConcurrent,
  ipFromRequest,
} from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { fileMateri, aiGeneration, kursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { runGeneration, GenerationTimeoutError, GenerationSchemaError } from "@/lib/ai-generator";
import { checkQuota, QuotaExceededError } from "@/lib/quota-guard";

const ALLOWED_EXT = new Set(["pdf", "docx"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_CONCURRENT_PER_GURU = 2;

const MAGIC_BYTES: { ext: string; bytes: number[] }[] = [
  { ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  { ext: "docx", bytes: [0x50, 0x4b, 0x03, 0x04] },
];

function detectExtension(buf: Buffer): string | null {
  for (const m of MAGIC_BYTES) {
    if (m.bytes.every((b, i) => buf[i] === b)) return m.ext;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
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

    const [ownedKursus] = await db
      .select({ id: kursus.id })
      .from(kursus)
      .where(and(eq(kursus.id, kursusId), eq(kursus.guruId, session.userId!)))
      .limit(1);
    if (!ownedKursus) return apiError("Kursus tidak ditemukan untuk akun guru ini", 404);

    const adapter = await getStorageAdapter(session.userId!);
    const folder = `/akal/dokumen/guru-${session.userId}`;

    const uploadResult = await adapter.upload(bytes, {
      nama: originalName,
      tipeMime: file.type || `application/${detected}`,
      folder,
    });

    const [row] = await db
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
      })
      .returning({ id: fileMateri.id });

    const jobId = row.id;
    await appendEvent(
      `upload:${session.userId}`,
      "doc.uploaded",
      {
        jobId,
        guruId: session.userId,
        kursusId,
        fileName: originalName,
        sizeBytes: file.size,
        mime: file.type || null,
        ext: detected,
        imagekitFileId: uploadResult.fileId,
        link: uploadResult.link,
        at: new Date().toISOString(),
      },
    );

    const [generation] = await db
      .insert(aiGeneration)
      .values({
        fileMateriId: row.id,
        guruId: session.userId!,
        kursusId,
        sourceFileName: originalName,
        status: "queued",
      })
      .returning();

    const concRl = await checkConcurrentLimit(
      `gen:${session.userId}`,
      MAX_CONCURRENT_PER_GURU,
    );

    if (concRl.allowed) {
      try {
        await checkQuota(session.userId!, session.role, "ai_generation");
} catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
        if (e instanceof QuotaExceededError) {
          await db
            .update(aiGeneration)
            .set({ status: "failed", errorMessage: e.message })
            .where(eq(aiGeneration.id, generation.id));
          return NextResponse.json(
            { success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } },
            { status: 429 },
          );
        }
        throw e;
      }

      after(async () => {
        try {
          await runGeneration(generation.id, bytes, detected);
        } catch (e) {
          console.error("Generation async error:", e);
          const isTimeout = e instanceof GenerationTimeoutError;
          const isSchema = e instanceof GenerationSchemaError;
          if (isSchema) {
            await appendEvent(`gen:${session.userId}`, "gen.schema_failed", {
              generationId: generation.id,
              field: e.field,
            });
          } else if (isTimeout) {
            await appendEvent(`gen:${session.userId}`, "gen.timeout", {
              generationId: generation.id,
              stage: e.stage,
            });
          }
        } finally {
          releaseConcurrent(`gen:${session.userId}`);
        }
      });
    } else {
      await db
        .update(aiGeneration)
        .set({
          status: "failed",
          errorMessage: `Terlalu banyak job aktif (maks ${MAX_CONCURRENT_PER_GURU}). Tunggu job sebelumnya selesai.`,
        })
        .where(eq(aiGeneration.id, generation.id));
    }

    return NextResponse.json({
      success: true,
      jobId,
      fileId: row.id,
      fileName: originalName,
      sizeBytes: file.size,
      ext: detected,
      generationId: generation.id,
      message: concRl.allowed
        ? "File tersimpan ke ImageKit. Pipeline AI berjalan di background."
        : "File tersimpan, tapi AI generation di-queue (job lain masih aktif).",
    });
  } catch (e) {
    if (e instanceof QuotaExceededError) {
      return NextResponse.json(
        { success: false, error: e.message, quota: { limit: e.limitValue, used: e.currentUsage } },
        { status: 429 },
      );
    }
    console.error("Upload error:", e);
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan server";
    return apiError(msg, 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`upload-list:${ip}`, 30, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const data = await db
      .select()
      .from(fileMateri)
      .where(eq(fileMateri.guruId, session.userId!))
      .orderBy(fileMateri.createdAt);

    const sanitized = data.map((f) => ({
      ...f,
      sizeBytes: f.ukuranBytes,
      linkAkses: `/api/v1/storage/${f.id}`,
    }));

    return NextResponse.json({ data: sanitized });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Upload list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
