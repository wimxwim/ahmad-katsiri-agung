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
import { fileMateri, kursus, users, aiGeneration, kelas } from "@/lib/db/schema";
import { and, eq, desc, lt, or } from "drizzle-orm";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { extractText } from "@/lib/text-extractor";
import { incrementUploadCount, getSubscriptionStatus, requireNotSuspended } from "@/lib/token-service";
import { MIN_TOPUP } from "@/lib/token-constants";
import { z } from "zod";
import crypto from "crypto";
import JSZip from "jszip";

const uuidSchema = z.string().uuid();

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function tingkatToFase(tingkat: number): string {
  if (tingkat <= 2) return "A";
  if (tingkat <= 4) return "B";
  if (tingkat <= 6) return "C";
  if (tingkat <= 9) return "D";
  if (tingkat <= 10) return "E";
  return "F";
}

async function resolveKelasId(
  kelasIdRaw: unknown,
  guruId: string,
): Promise<{ id: string; tingkat: number; nama: string } | null> {
  const raw = typeof kelasIdRaw === "string" ? kelasIdRaw.trim() : "";
  const isEmpty = raw === "" || kelasIdRaw === null || kelasIdRaw === undefined;
  if (!isEmpty) {
    if (!uuidSchema.safeParse(raw).success) {
      // invalid UUID — skip DB query to avoid PG invalid input syntax, fall through to fallback
    } else {
      const [owned] = await db
        .select({ id: kelas.id, tingkat: kelas.tingkat, nama: kelas.nama, guruId: kelas.guruId })
        .from(kelas)
        .where(and(eq(kelas.id, raw), eq(kelas.guruId, guruId)))
        .limit(1);
      if (owned) return { id: owned.id, tingkat: owned.tingkat, nama: owned.nama };
      const [orphan] = await db
        .select({ id: kelas.id, tingkat: kelas.tingkat, nama: kelas.nama, guruId: kelas.guruId })
        .from(kelas)
        .where(eq(kelas.id, raw))
        .limit(1);
      if (orphan) {
        if (!orphan.guruId) {
          await db.update(kelas).set({ guruId }).where(eq(kelas.id, orphan.id));
          return { id: orphan.id, tingkat: orphan.tingkat, nama: orphan.nama };
        }
        if (orphan.guruId !== guruId) {
          // milik guru lain — jangan return, lanjut fallback ke kelas pertama / auto-create
        } else {
          return { id: orphan.id, tingkat: orphan.tingkat, nama: orphan.nama };
        }
      }
    }
  }
  const [existing] = await db
    .select({ id: kelas.id, tingkat: kelas.tingkat, nama: kelas.nama })
    .from(kelas)
    .where(eq(kelas.guruId, guruId))
    .limit(1);
  if (existing) return { id: existing.id, tingkat: existing.tingkat, nama: existing.nama };
  const [created] = (await db
    .insert(kelas)
    .values({ guruId, nama: "Kelas 7A", tingkat: 7 })
    .returning({ id: kelas.id, tingkat: kelas.tingkat, nama: kelas.nama })
    .onConflictDoNothing() as unknown as { id: string; tingkat: number; nama: string }[]);
  if (created) return created;
  return null;
}

async function resolveKursusId(kursusIdRaw: unknown, guruId: string): Promise<string | null> {
  const raw = typeof kursusIdRaw === "string" ? kursusIdRaw.trim() : "";
  const isEmpty = raw === "" || kursusIdRaw === null || kursusIdRaw === undefined;
  if (!isEmpty) {
    if (!uuidSchema.safeParse(raw).success) {
      // invalid UUID — skip DB query to avoid PG invalid input syntax, fall through to fallback
    } else {
      const [owned] = await db.select({ id: kursus.id }).from(kursus).where(and(eq(kursus.id, raw), eq(kursus.guruId, guruId))).limit(1);
      if (owned) return owned.id;
      const [orphan] = await db.select({ id: kursus.id, guruId: kursus.guruId }).from(kursus).where(eq(kursus.id, raw)).limit(1);
      if (orphan) {
        if (!orphan.guruId) {
          await db.update(kursus).set({ guruId }).where(eq(kursus.id, orphan.id));
          return orphan.id;
        }
        if (orphan.guruId !== guruId) {
          // milik guru lain — jangan return, lanjut fallback
        } else {
          return orphan.id;
        }
      }
    }
  }
  const [existing] = await db.select({ id: kursus.id }).from(kursus).where(eq(kursus.guruId, guruId)).limit(1);
  if (existing) return existing.id;
  const slugBase = `kursus-awal-${guruId.slice(0, 8)}-${Date.now().toString(36)}`;
  const [created] = (await db
    .insert(kursus)
    .values({ guruId, judul: "Kursus Umum", slug: slugBase, deskripsi: "Kursus otomatis", statusPublikasi: "DRAFT" })
    .returning({ id: kursus.id })
    .onConflictDoNothing() as unknown as { id: string }[]);
  if (created) return created.id;
  return null;
}

const ALLOWED_EXT = new Set(["pdf", "docx"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_SIZE = 10 * 1024 * 1024;

const MAGIC_BYTES: { ext: string; bytes: number[] }[] = [
  { ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // %PDF- = 255044462d (5 bytes)
  { ext: "docx", bytes: [0x50, 0x4b, 0x03, 0x04] },
];
// 504b0506 empty archive, 504b0708 spanned, d0cf11e0 OLE doc — handled via frontend validation, backend allows 504b03* only for docx (strict OOXML via JSZip)

const IMAGEKIT_HOSTS = new Set(["ik.imagekit.io", "upload.imagekit.io"]);

function isAllowedImageKitUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    if (u.port !== "" || u.username !== "" || u.password !== "") return false;
    if (IMAGEKIT_HOSTS.has(u.hostname)) return true;
    return u.hostname.endsWith(".ik.imagekit.io");
  } catch {
    return false;
  }
}

async function isValidDocxBytes(buf: Buffer): Promise<boolean> {
  try {
    const zip = await JSZip.loadAsync(buf, { checkCRC32: false });
    return Boolean(zip.file("[Content_Types].xml") && zip.file("word/document.xml"));
  } catch {
    return false;
  }
}

async function isFileContentValid(buf: Buffer, ext: string): Promise<boolean> {
  const detected = detectExtension(buf);
  if (!detected || detected !== ext) return false;
  if (ext === "docx") return isValidDocxBytes(buf);
  return true;
}

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

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Path direct-upload: browser telah mengupload file besar langsung ke ImageKit
 * (upload.imagekit.io) untuk menghindari limit body request Vercel (4.5MB).
 * Route ini hanya memvalidasi metadata, menyimpan baris DB, lalu men-download
 * file dari ImageKit secara server-to-server untuk ekstraksi teks.
 */
async function handleDirectUpload(
  request: NextRequest,
  session: Awaited<ReturnType<typeof requireGuru>>,
): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as {
    imagekitFileId?: unknown;
    linkAkses?: unknown;
    fileName?: unknown;
    sizeBytes?: unknown;
    kursusId?: unknown;
    kelasId?: unknown;
  } | null;

  if (!body || typeof body !== "object") return apiError("Body JSON tidak valid", 400);

  const { imagekitFileId, linkAkses, fileName, sizeBytes, kursusId, kelasId } = body;

  if (typeof imagekitFileId !== "string" || !imagekitFileId) {
    return apiError("imagekitFileId wajib diisi", 400);
  }
  if (typeof linkAkses !== "string" || !linkAkses) {
    return apiError("linkAkses wajib diisi", 400);
  }
  if (!isAllowedImageKitUrl(linkAkses)) {
    return apiError("linkAkses harus URL ImageKit yang valid", 400);
  }
  if (typeof fileName !== "string" || !fileName) {
    return apiError("fileName wajib diisi", 400);
  }
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return apiError("sizeBytes wajib berupa angka positif", 400);
  }
  const parsedKursus = uuidSchema.safeParse(kursusId);
  if (!parsedKursus.success) return apiError("kursusId harus UUID", 400);
  const resolvedKursusId: string | null = await resolveKursusId(parsedKursus.data, session.userId);
  if (!resolvedKursusId) return apiError("Kursus tidak ditemukan untuk akun guru ini", 404);
  let resolvedKelas: { id: string; tingkat: number; nama: string } | null = null;
  if (kelasId === "" || kelasId === null || kelasId === undefined) {
    resolvedKelas = await resolveKelasId(null, session.userId);
    if (!resolvedKelas) return apiError("Pilih kelas dulu — buat kelas di /guru/kelas", 400);
  } else {
    const parsedKelas = uuidSchema.safeParse(kelasId);
    if (!parsedKelas.success) return apiError("kelasId tidak valid — pilih kelas dari daftar", 400);
    resolvedKelas = await resolveKelasId(parsedKelas.data, session.userId);
    if (!resolvedKelas) return apiError("Pilih kelas dulu — buat kelas di /guru/kelas", 400);
  }
  const kelasRow: { id: string; tingkat: number; nama: string } = resolvedKelas;

  if (sizeBytes > MAX_SIZE) {
    return apiError(`File terlalu besar (maks 10MB)`, 413);
  }

  const originalName = fileName
    .normalize("NFKC")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/\.\./g, "")
    .slice(0, 255)
    .trim();
  if (!originalName) {
    return NextResponse.json({ success: false, error: "Nama file tidak valid." }, { status: 400 });
  }
  const lowerName = originalName.toLowerCase();
  const extFromName = lowerName.split(".").pop() || "";
  if (!ALLOWED_EXT.has(extFromName)) {
    return apiError(`Ekstensi .${extFromName} tidak diizinkan. Gunakan PDF/DOCX.`, 415);
  }
  const detected = extFromName;
  const tipeMime = detected === "docx" ? DOCX_MIME : "application/pdf";

  const subStatus = await getSubscriptionStatus(session.userId);
  if (!subStatus.canUpload) {
    return apiError(
      "SUBSCRIPTION_LOCKED",
      `Batas upload gratis tercapai (${subStatus.uploadCount}/${subStatus.uploadLimit}). Top-up minimal Rp${MIN_TOPUP.toLocaleString("id-ID")} untuk upload unlimited.`,
      undefined,
      402,
    );
  }

  let job: { fileId: string; generationId: string };
  try {
    job = await db.transaction(async (tx) => {
      const [fm] = await tx
        .insert(fileMateri)
        .values({
          namaFile: originalName,
          tipeMime,
          ukuranBytes: sizeBytes,
          lokasi: "IMAGEKIT",
          imagekitFileId,
          linkAkses,
          kursusId: resolvedKursusId,
          kelasId: resolvedKelas.id,
          guruId: session.userId,
          status: "uploaded",
          kategori: detectKategori(originalName, detected),
        })
        .returning({ id: fileMateri.id });

      const [gen] = await tx.insert(aiGeneration).values({ fileMateriId: fm.id, guruId: session.userId, kursusId: resolvedKursusId, sourceFileName: originalName, status: "queued", tingkat: kelasRow.tingkat, fase: tingkatToFase(kelasRow.tingkat) }).returning({ id: aiGeneration.id });

      return { fileId: fm.id, generationId: gen.id };
    });
  } catch (e: any) {
    const c = e?.cause ?? e;
    const is42703 = c?.code === "42703" || String((e as any).message ?? "").includes("does not exist") || String(c?.message ?? "").includes("does not exist");
    if (is42703) {
      const msg = String((e as any).message ?? "") + String(c?.message ?? "") + String(c?.detail ?? "");
      console.warn("[upload] 42703 fallback, retry minimal", msg.slice(0, 200));
      try {
        const res2 = await db.transaction(async (tx) => {
          let fmRow: any;
          try {
            [fmRow] = await tx
              .insert(fileMateri)
              .values({
                namaFile: originalName,
                tipeMime,
                ukuranBytes: sizeBytes,
                lokasi: "IMAGEKIT",
                imagekitFileId,
                linkAkses,
                kursusId: resolvedKursusId,
                kelasId: resolvedKelas.id,
                guruId: session.userId,
                status: "uploaded",
                kategori: detectKategori(originalName, detected),
              })
              .returning({ id: fileMateri.id });
          } catch (fmErr: any) {
            const fc = fmErr?.cause ?? fmErr;
            if (fc?.code === "42703" || String(fmErr.message ?? "").includes("kelas_id") || String(fmErr.message ?? "").includes("does not exist")) {
              [fmRow] = await tx
                .insert(fileMateri)
                .values({
                  namaFile: originalName,
                  tipeMime,
                  ukuranBytes: sizeBytes,
                  lokasi: "IMAGEKIT",
                  imagekitFileId,
                  linkAkses,
                  kursusId: resolvedKursusId,
                  guruId: session.userId,
                  status: "uploaded",
                  kategori: detectKategori(originalName, detected),
                })
                .returning({ id: fileMateri.id });
            } else throw fmErr;
          }
          const [genRow] = await tx.insert(aiGeneration).values({ fileMateriId: fmRow.id, guruId: session.userId, kursusId: resolvedKursusId, sourceFileName: originalName, status: "queued" }).returning({ id: aiGeneration.id });
          return { fmRow, genRow };
        });
        job = { fileId: res2.fmRow.id, generationId: res2.genRow.id };
      } catch (retryErr) {
        throw retryErr;
      }
    } else throw e;
  }

  // Update status to "extracting" so frontend can show progress
  await db.update(aiGeneration)
    .set({ status: "extracting" })
    .where(eq(aiGeneration.id, job.generationId));

  // Download file dari ImageKit (server-to-server fetch, tidak kena limit body request),
  // lalu ekstraksi teks dari bytes yang sudah di memori.
  let extractionStatus: "extracted" | "queued" = "queued";
  let downloadedBytes: Buffer | null = null;
  try {
    const res = await fetch(linkAkses, { signal: AbortSignal.timeout(90_000), redirect: "error" });
    if (!res.ok) throw new Error(`ImageKit download gagal (${res.status})`);
    const cl = res.headers.get("content-length");
    if (cl && parseInt(cl, 10) > MAX_SIZE) throw new Error(`File terlalu besar (maks 10MB)`);
    downloadedBytes = Buffer.from(await res.arrayBuffer());

    if (!(await isFileContentValid(downloadedBytes, detected))) {
      throw new Error("Isi file tidak sesuai dengan ekstensi yang dikirim");
    }

    const text = await extractText(downloadedBytes, detected);
    if (text && text.length >= 50) {
      await db.update(fileMateri)
        .set({ extractionText: text, status: "extracted", updatedAt: new Date() })
        .where(eq(fileMateri.id, job.fileId));
      await db.update(aiGeneration)
        .set({ status: "extracted", leaseUntil: null, updatedAt: new Date() })
        .where(eq(aiGeneration.id, job.generationId));
      extractionStatus = "extracted";
      appendEvent(`gen:${session.userId}`, "gen.extracted", { generationId: job.generationId, textLength: text.length }).catch(() => {});
    }
  } catch (extractErr) {
    console.error("Inline extraction failed (file will be retried via Buat AI):", extractErr);
    // file tetap di ImageKit, user bisa retry lewat tombol Buat AI
  }

  incrementUploadCount(session.userId).catch(() => {});

  const guru = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { nama: true },
  });
  const guruNama = guru?.nama ?? "Guru";

  appendEvent(`upload:${session.userId}`, "doc.uploaded", {
    jobId: job.fileId,
    generationId: job.generationId,
    guruId: session.userId,
    kursusId: resolvedKursusId,
    fileName: originalName,
    sizeBytes,
    mime: tipeMime,
    ext: detected,
    fileHash: downloadedBytes ? sha256(downloadedBytes) : null,
    imagekitFileId,
    link: linkAkses,
    at: new Date().toISOString(),
  }).catch(() => {});

  appendEvent("owner:notif", "upload.masuk", {
    guruId: session.userId,
    guruNama,
    fileName: originalName,
    fileId: job.fileId,
    generationId: job.generationId,
    kursusId: resolvedKursusId,
    sizeBytes,
    ext: detected,
    link: linkAkses,
    at: new Date().toISOString(),
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    fileId: job.fileId,
    jobId: job.generationId,
    fileName: originalName,
    status: extractionStatus,
    message: extractionStatus === "extracted"
      ? "Dokumen diterima dan berhasil diekstrak. Buka halaman Draft AI untuk generate materi."
      : "Dokumen diterima. Ekstraksi gagal — klik Buat AI di halaman Draft untuk mencoba lagi.",
  }, { status: 202 });
}

export async function POST(request: NextRequest) {
  let imagekitFileId: string | null = null;
  let imagekitLink: string | null = null;

  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    await requireNotSuspended(session.userId!);

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

    // Direct-upload path: browser sudah upload file > 4MB langsung ke ImageKit,
    // route ini hanya menerima metadata + ekstraksi teks via server-to-server fetch.
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return handleDirectUpload(request, session);
    }

    const fd = await request.formData();
    const file = fd.get("file");
    const kursusId = fd.get("kursusId");
    const kelasId = fd.get("kelasId");

    if (!(file instanceof File)) return apiError("File tidak ditemukan", 400);
    const parsedKursusForm = uuidSchema.safeParse(kursusId);
    if (!parsedKursusForm.success) return apiError("kursusId harus UUID", 400);
    const resolvedKursusId2: string | null = await resolveKursusId(parsedKursusForm.data, session.userId!);
    if (!resolvedKursusId2) return apiError("Kursus tidak ditemukan untuk akun guru ini", 404);
    let resolvedKelas2: { id: string; tingkat: number; nama: string } | null = null;
    if (kelasId === "" || kelasId === null || kelasId === undefined) {
      resolvedKelas2 = await resolveKelasId(null, session.userId!);
      if (!resolvedKelas2) return apiError("Pilih kelas dulu — buat kelas di /guru/kelas", 400);
    } else {
      const parsedKelasForm = uuidSchema.safeParse(kelasId);
      if (!parsedKelasForm.success) return apiError("kelasId tidak valid — pilih kelas dari daftar", 400);
      resolvedKelas2 = await resolveKelasId(parsedKelasForm.data, session.userId!);
      if (!resolvedKelas2) return apiError("Pilih kelas dulu — buat kelas di /guru/kelas", 400);
    }
    const kelasIdStr2 = resolvedKelas2.id;
    const kelasRow2: { id: string; tingkat: number; nama: string } = resolvedKelas2;

    if (file.size > MAX_SIZE) {
      return apiError(`File terlalu besar (maks 10MB)`, 413);
    }
    if (file.size === 0) {
      return apiError("File kosong", 400);
    }

    const originalName = file.name
      .normalize("NFKC")
      .replace(/[\x00-\x1f\x7f]/g, "")
      .replace(/\.\./g, "")
      .slice(0, 255)
      .trim();
    if (!originalName) {
      return NextResponse.json({ success: false, error: "Nama file tidak valid." }, { status: 400 });
    }
    const lowerName = originalName.toLowerCase();
    const extFromName = lowerName.split(".").pop() || "";
    if (!ALLOWED_EXT.has(extFromName)) {
      return apiError(`Ekstensi .${extFromName} tidak diizinkan. Gunakan PDF/DOCX.`, 415);
    }
    if (!file.type || !ALLOWED_MIME.has(file.type)) {
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
    if (detected === "docx" && !(await isValidDocxBytes(bytes))) {
      return apiError("DOCX tidak valid (struktur OOXML tidak ditemukan)", 415);
    }

    const fileHash = sha256(bytes);

    const resolvedKursusId = resolvedKursusId2;
    const resolvedKelasId = kelasIdStr2;
    const kelasRow: { id: string; tingkat: number; nama: string } = kelasRow2;

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

    let job: { fileId: string; generationId: string };
    try {
      job = await db.transaction(async (tx) => {
        const [fm] = await tx
          .insert(fileMateri)
          .values({
            namaFile: originalName,
            tipeMime: file.type || `application/${detected}`,
            ukuranBytes: file.size,
            lokasi: "IMAGEKIT",
            imagekitFileId: uploadResult.fileId,
            linkAkses: uploadResult.link,
            kursusId: resolvedKursusId,
            kelasId: resolvedKelasId,
            guruId: session.userId!,
            status: "uploaded",
            kategori: detectKategori(originalName, detected),
          })
          .returning({ id: fileMateri.id });

        const [gen] = await tx.insert(aiGeneration).values({ fileMateriId: fm.id, guruId: session.userId!, kursusId: resolvedKursusId, sourceFileName: originalName, status: "queued", tingkat: kelasRow.tingkat, fase: tingkatToFase(kelasRow.tingkat) }).returning({ id: aiGeneration.id });

        return { fileId: fm.id, generationId: gen.id };
      });
    } catch (e: any) {
      const c = e?.cause ?? e;
      const is42703 = c?.code === "42703" || String((e as any).message ?? "").includes("does not exist") || String(c?.message ?? "").includes("does not exist");
      if (is42703) {
        const msg = String((e as any).message ?? "") + String(c?.message ?? "") + String(c?.detail ?? "");
        console.warn("[upload] 42703 fallback, retry minimal", msg.slice(0, 200));
        try {
          const res2 = await db.transaction(async (tx) => {
            let fmRow: any;
            try {
              [fmRow] = await tx
                .insert(fileMateri)
                .values({
                  namaFile: originalName,
                  tipeMime: file.type || `application/${detected}`,
                  ukuranBytes: file.size,
                  lokasi: "IMAGEKIT",
                  imagekitFileId: uploadResult.fileId,
                  linkAkses: uploadResult.link,
                  kursusId: resolvedKursusId,
                  kelasId: resolvedKelasId,
                  guruId: session.userId!,
                  status: "uploaded",
                  kategori: detectKategori(originalName, detected),
                })
                .returning({ id: fileMateri.id });
            } catch (fmErr: any) {
              const fc = fmErr?.cause ?? fmErr;
              if (fc?.code === "42703" || String(fmErr.message ?? "").includes("kelas_id") || String(fmErr.message ?? "").includes("does not exist")) {
                [fmRow] = await tx
                  .insert(fileMateri)
                  .values({
                    namaFile: originalName,
                    tipeMime: file.type || `application/${detected}`,
                    ukuranBytes: file.size,
                    lokasi: "IMAGEKIT",
                    imagekitFileId: uploadResult.fileId,
                    linkAkses: uploadResult.link,
                    kursusId: resolvedKursusId,
                    guruId: session.userId!,
                    status: "uploaded",
                    kategori: detectKategori(originalName, detected),
                  })
                  .returning({ id: fileMateri.id });
              } else throw fmErr;
            }
            const [genRow] = await tx.insert(aiGeneration).values({ fileMateriId: fmRow.id, guruId: session.userId!, kursusId: resolvedKursusId, sourceFileName: originalName, status: "queued" }).returning({ id: aiGeneration.id });
            return { fmRow, genRow };
          });
          job = { fileId: res2.fmRow.id, generationId: res2.genRow.id };
        } catch (retryErr) {
          throw retryErr;
        }
      } else throw e;
    }

    // Update status to "extracting" so frontend can show progress
    await db.update(aiGeneration)
      .set({ status: "extracting" })
      .where(eq(aiGeneration.id, job.generationId));

    // Ekstrak teks langsung dari bytes (sudah di memori, tidak perlu download ulang dari ImageKit)
    let extractionStatus: "extracted" | "queued" = "queued";
    try {
      const text = await extractText(bytes, detected);
      if (text && text.length >= 50) {
        await db.update(fileMateri)
          .set({ extractionText: text, status: "extracted", updatedAt: new Date() })
          .where(eq(fileMateri.id, job.fileId));
        await db.update(aiGeneration)
          .set({ status: "extracted", leaseUntil: null, updatedAt: new Date() })
          .where(eq(aiGeneration.id, job.generationId));
        extractionStatus = "extracted";
        appendEvent(`gen:${session.userId}`, "gen.extracted", { generationId: job.generationId, textLength: text.length }).catch(() => {});
      }
    } catch (extractErr) {
      console.error("Inline extraction failed (file will be retried via Buat AI):", extractErr);
      // file tetap di ImageKit, user bisa retry lewat tombol Buat AI
    }

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
      kursusId: resolvedKursusId,
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
      kursusId: resolvedKursusId,
      sizeBytes: file.size,
      ext: detected,
      link: uploadResult.link,
      at: new Date().toISOString(),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      fileId: job.fileId,
      jobId: job.generationId,
      fileName: originalName,
      status: extractionStatus,
      message: extractionStatus === "extracted"
        ? "Dokumen diterima dan berhasil diekstrak. Buka halaman Draft AI untuk generate materi."
        : "Dokumen diterima. Ekstraksi gagal — klik Buat AI di halaman Draft untuk mencoba lagi.",
    }, { status: 202 });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);

    if (imagekitFileId && imagekitLink) {
      try {
        const adapter = await getStorageAdapter("cleanup");
        await adapter.delete(imagekitFileId);
      } catch {}
    }

    const cause = (e as any)?.cause ?? (e as any)?.originalError ?? e;
    const pgCode = cause?.code;
    const pgDetail = cause?.detail ?? cause?.message ?? "";
    console.error("Upload error:", e, "cause:", cause, "pgCode:", pgCode, "pgDetail:", pgDetail);
    if (pgCode === "42703" && String(pgDetail).includes("tingkat") || String((e as Error).message).includes("tingkat")) {
      // missing column fallback handled in insert — don't leak
    }
    const friendly = pgCode === "23503" ? "Kursus atau kelas tidak valid — coba refresh halaman" : pgCode === "57014" ? "Waktu proses habis, coba lagi" : "Gagal menyimpan — coba lagi atau hubungi admin";
    // don't leak Failed query
    const msg = String((e as Error).message).startsWith("Failed query:") ? friendly + (pgDetail ? ` (${pgDetail})` : "") : (e as Error).message;
    return apiError(msg, pgCode === "23503" ? 409 : 500);
  }
}

function encodeCursor(row: { createdAt: Date; id: string }): string {
  return Buffer.from(JSON.stringify({ createdAt: row.createdAt.toISOString(), id: row.id })).toString("base64url");
}

function decodeCursor(raw: string): { createdAt: Date; id: string } | null {
  try {
    // Try base64 JSON first (new format)
    const json = Buffer.from(raw, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.createdAt === "string" && typeof parsed.id === "string") {
      const d = new Date(parsed.createdAt);
      if (!isNaN(d.getTime())) return { createdAt: d, id: parsed.id };
    }
  } catch {}
  try {
    // Fallback: plain ISO string (legacy)
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return { createdAt: d, id: "" };
  } catch {}
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`upload-list:${ip}`, 30, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const url = new URL(request.url);
    const cursorRaw = url.searchParams.get("cursor");
    const limit = Math.min(50, Math.max(5, parseInt(url.searchParams.get("limit") || "20", 10)));

    const whereConditions = [eq(fileMateri.guruId, session.userId!)];
    if (cursorRaw) {
      const decoded = decodeCursor(cursorRaw);
      if (decoded) {
        if (decoded.id) {
          // Composite tie-breaker: (createdAt < cursorDate) OR (createdAt = cursorDate AND id < cursorId)
          whereConditions.push(
            or(
              lt(fileMateri.createdAt, decoded.createdAt),
              and(eq(fileMateri.createdAt, decoded.createdAt), lt(fileMateri.id, decoded.id)),
            )!,
          );
        } else {
          whereConditions.push(lt(fileMateri.createdAt, decoded.createdAt));
        }
      }
    }

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
      .where(and(...whereConditions))
      .orderBy(desc(fileMateri.createdAt), desc(fileMateri.id))
      .limit(limit + 1);

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;

    const sanitized = items.map((f) => ({
      id: f.id,
      namaFile: f.namaFile,
      sizeBytes: f.ukuranBytes,
      status: f.status,
      createdAt: f.createdAt,
      linkAkses: `/api/v1/storage/${f.id}`,
    }));

    const nextCursor = hasMore && items.length > 0
      ? encodeCursor({ createdAt: items[items.length - 1].createdAt, id: items[items.length - 1].id })
      : null;

    return NextResponse.json({ data: sanitized, nextCursor });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Upload list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
