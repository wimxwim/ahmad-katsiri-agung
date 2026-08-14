import { NextRequest, after } from "next/server";
import { createHash, randomUUID } from "crypto";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { requireNotSuspended, SubscriptionLockedError, InsufficientBalanceError, getBalance } from "@/lib/token-service";
import { MIN_TOPUP, MAX_TOPUP, MAX_TOPUP_PER_DAY } from "@/lib/token-constants";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { sendTopupNotification } from "@/lib/telegram-notif";
import { db } from "@/lib/db";
import { tokenTransactions, payments, users } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { checkRateLimitPerUser } from "@/lib/rate-limit";

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

// PATCH: idempotency key TIDAK boleh mengandung `amount` (nilai bisnis yang bisa berubah).
// Pola Stripe: key deterministik dari identitas request (user-attached object = file bukti),
// bukan dari nominal. Kalau key memuat amount, file bukti yang sama dengan nominal beda
// menghasilkan key beda -> bisa double-credit. Sekarang key = `${userId}:${fileHash}`.
function buildIdempotencyKey(userId: string, fileBuffer: Buffer): string {
  const fileHash = createHash("sha256").update(fileBuffer).digest("hex").slice(0, 16);
  return `${userId}:${fileHash}`;
}

export async function POST(request: NextRequest) {
  let imageKitFileId: string | null = null;
  let adapter: Awaited<ReturnType<typeof getStorageAdapter>> | null = null;

  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`topup:${session.userId}`, MAX_TOPUP_PER_DAY, 86400);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    await requireNotSuspended(session.userId);

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
    if (!file.type || !ALLOWED_MIME.has(file.type)) {
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

    const idempotencyKey = buildIdempotencyKey(session.userId, bytes);

    const [existingDuplicate] = await db
      .select({ id: tokenTransactions.id })
      .from(tokenTransactions)
      .where(
        and(
          eq(tokenTransactions.userId, session.userId),
          eq(tokenTransactions.type, "TOPUP"),
          eq(tokenTransactions.referenceId, idempotencyKey),
        ),
      )
      .limit(1);

    if (existingDuplicate) {
      return apiError("DUPLICATE_PROOF", "Bukti ini sudah pernah diproses. Tidak dapat digunakan lagi.", undefined, 409);
    }

    // Also check payments duplicate via proof? optional

    adapter = await getStorageAdapter(session.userId);
    const folder = `/akal/bukti/guru-${session.userId}`;

    const uploadResult = await adapter.upload(bytes, {
      nama: `topup-${Date.now()}-${file.name}`,
      tipeMime: file.type || `application/${detected}`,
      folder,
    });

    imageKitFileId = uploadResult.fileId;

    // F10-1: Topup verify pending + chainHash — JANGAN langsung credit balance.
    // TODO: credit hanya setelah verifiedBy admin atau Midtrans webhook.
    // Flow pending: create payments status pending + tokenTransactions PENDING dengan chainHash.
    // Admin akan verifikasi via dashboard admin atau webhook, baru update balance += amount dan status COMPLETED.
    const currentBalance = await getBalance(session.userId);

    // chainHash = sha256(prevHash + amount + nonce), prevHash dari last transaction chainHash
    const [lastTx] = await db
      .select({ chainHash: tokenTransactions.chainHash })
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, session.userId))
      .orderBy(desc(tokenTransactions.createdAt))
      .limit(1);

    const prevHash = lastTx?.chainHash ?? "GENESIS";
    const nonce = randomUUID().replace(/-/g, "").slice(0, 16);
    const chainHash = createHash("sha256").update(`${prevHash}:${amount}:${nonce}`).digest("hex");

    // Create payments record pending
    const [payment] = await db
      .insert(payments)
      .values({
        userId: session.userId,
        amount,
        paymentType: "qris_static",
        status: "pending",
        proofImageUrl: uploadResult.link,
        notes: `Top-up Rp${amount.toLocaleString("id-ID")} via QRIS GoPay — menunggu verifikasi admin`,
      })
      .returning({ id: payments.id });

    // Create tokenTransactions PENDING (no balance credit yet)
    const [pendingTx] = await db
      .insert(tokenTransactions)
      .values({
        userId: session.userId,
        type: "TOPUP",
        status: "PENDING",
        amount,
        balanceBefore: currentBalance.balance,
        balanceAfter: currentBalance.balance, // no credit yet, sama dengan before
        paymentMethod: "QRIS_GOPAY",
        proofFileId: uploadResult.fileId,
        proofLink: uploadResult.link,
        referenceId: idempotencyKey,
        chainHash,
        prevHash,
        nonce,
        notes: `Menunggu verifikasi admin — payment ${payment.id}`,
      })
      .returning({ id: tokenTransactions.id });

    const guru = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { nama: true, email: true, lastActiveAt: true },
    });

    after(async () => {
      try {
        await sendTopupNotification({
          userId: session.userId,
          transactionId: pendingTx.id,
          nama: guru?.nama ?? "Guru",
          email: guru?.email ?? session.email ?? "",
          amount,
          proofUrl: uploadResult.link,
          newBalance: currentBalance.balance,
          loginTerakhir: guru?.lastActiveAt
            ? new Date(guru.lastActiveAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
            : undefined,
        });
      } catch (e) {
        console.error("[topup] Telegram notif gagal:", e);
      }
    });

    return apiSuccess({
      transactionId: pendingTx.id,
      paymentId: payment.id,
      proofUrl: uploadResult.link,
      balance: currentBalance.balance,
      isUnlocked: currentBalance.isUnlocked,
      status: "PENDING",
      chainHash,
      message: "Menunggu verifikasi admin — bukti berhasil diupload, saldo akan bertambah setelah diverifikasi (1x24 jam).",
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);

    if (e instanceof SubscriptionLockedError) {
      return apiError("ACCOUNT_SUSPENDED", e.message, undefined, 403);
    }

    if (e instanceof InsufficientBalanceError) {
      return apiError("INSUFFICIENT_BALANCE", e.message, { currentBalance: e.currentBalance, required: e.required }, 409);
    }

    if (imageKitFileId && adapter) {
      adapter.delete(imageKitFileId).catch((delErr) =>
        console.error("[topup] Gagal membersihkan file ImageKit:", delErr),
      );
    }

    console.error("[topup] Upload error:", e);
    return apiError("INTERNAL_ERROR", "Gagal memproses bukti pembayaran. Pastikan file jelas, berformat JPG, PNG, WebP, atau PDF, dan ukurannya maksimal 5 MB.", undefined, 500);
  }
}
