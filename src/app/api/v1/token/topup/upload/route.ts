import { NextRequest } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { topUpBalance } from "@/lib/token-service";
import { MIN_TOPUP, MAX_TOPUP, MAX_TOPUP_PER_DAY } from "@/lib/token-constants";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { sendTopupNotification } from "@/lib/telegram-notif";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { waitUntil } from "@vercel/functions";

export const dynamic = "force-dynamic";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);

const MAGIC_BYTES: { ext: string; bytes: number[] }[] = [
  { ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { ext: "webp", bytes: [0x52, 0x49, 0x46, 0x46] },
  { ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
];

const MAX_SIZE = 5 * 1024 * 1024;

function detectExtension(buf: Buffer): string | null {
  for (const m of MAGIC_BYTES) {
    if (m.bytes.every((b, i) => buf[i] === b)) return m.ext;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`topup:${session.userId}`, MAX_TOPUP_PER_DAY, 86400);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const fd = await request.formData();
    const file = fd.get("file");
    const amountStr = fd.get("amount");

    if (!(file instanceof File)) return apiError("VALIDATION_ERROR", "File bukti wajib diupload", undefined, 400);
    if (typeof amountStr !== "string" || !amountStr) {
      return apiError("VALIDATION_ERROR", "Nominal top-up wajib diisi", undefined, 400);
    }

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount < MIN_TOPUP || amount > MAX_TOPUP) {
      return apiError("VALIDATION_ERROR", `Nominal harus antara Rp${MIN_TOPUP.toLocaleString("id-ID")} - Rp${MAX_TOPUP.toLocaleString("id-ID")}`, undefined, 400);
    }

    if (file.size > MAX_SIZE) {
      return apiError("VALIDATION_ERROR", "File terlalu besar (maks 5MB)", undefined, 413);
    }
    if (file.size === 0) {
      return apiError("VALIDATION_ERROR", "File kosong", undefined, 400);
    }

    const lowerName = file.name.toLowerCase();
    const extFromName = lowerName.split(".").pop() || "";
    if (!ALLOWED_EXT.has(extFromName)) {
      return apiError("VALIDATION_ERROR", `Tipe file .${extFromName} tidak diizinkan. Gunakan JPG/PNG/WebP/PDF.`, undefined, 415);
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return apiError("VALIDATION_ERROR", `MIME type ${file.type} tidak diizinkan`, undefined, 415);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const detected = detectExtension(bytes);
    if (!detected) {
      return apiError("VALIDATION_ERROR", "File bukan gambar/PDF yang valid (magic bytes tidak cocok)", undefined, 415);
    }
    if (detected !== extFromName && !(extFromName === "jpg" && detected === "jpeg")) {
      return apiError("VALIDATION_ERROR", `Ekstensi .${extFromName} tidak cocok dengan isi file (.${detected})`, undefined, 415);
    }

    const adapter = await getStorageAdapter(session.userId);
    const folder = `/akal/bukti/guru-${session.userId}`;

    const uploadResult = await adapter.upload(bytes, {
      nama: `topup-${Date.now()}-${file.name}`,
      tipeMime: file.type || `application/${detected}`,
      folder,
    });

    const { balance, transaction } = await topUpBalance(session.userId, amount, {
      paymentMethod: "QRIS_GOPAY",
      proofFileId: uploadResult.fileId,
      proofLink: uploadResult.link,
      notes: `Top-up Rp${amount.toLocaleString("id-ID")} via QRIS GoPay`,
    });

    const guru = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { nama: true, email: true, lastActiveAt: true },
    });

    waitUntil(
      sendTopupNotification({
        userId: session.userId,
        nama: guru?.nama ?? "Guru",
        email: guru?.email ?? session.email ?? "",
        amount,
        proofUrl: uploadResult.link,
        newBalance: balance.balance,
        loginTerakhir: guru?.lastActiveAt
          ? new Date(guru.lastActiveAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
          : undefined,
      }).catch((e) => console.error("Telegram notif gagal:", e)),
    );

    return apiSuccess({
      balance: balance.balance,
      transactionId: transaction.id,
      proofUrl: uploadResult.link,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Topup upload error:", e);
    return apiError("INTERNAL_ERROR", "Gagal memproses bukti pembayaran", undefined, 500);
  }
}