import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";

export const dynamic = "force-dynamic";

const ALLOWED_AMOUNTS = new Set([10000, 15000, 20000, 25000, 30000, 50000]);
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PROOF_SIZE = 5 * 1024 * 1024;
const TOPUP_RATE_LIMIT = 5;
const TOPUP_WINDOW = 86400;

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`topup:${session.userId}`, TOPUP_RATE_LIMIT, TOPUP_WINDOW);
    if (!rl.allowed) {
      return apiError(`Maksimal ${TOPUP_RATE_LIMIT}x top-up per hari. Coba lagi besok.`, 429);
    }

    const fd = await request.formData();
    const amountRaw = fd.get("amount");
    const proofFile = fd.get("proof");

    const amount = typeof amountRaw === "string" ? parseInt(amountRaw, 10) : NaN;
    if (isNaN(amount) || !ALLOWED_AMOUNTS.has(amount)) {
      return apiError("Nominal tidak valid. Pilih: 10.000, 15.000, 20.000, 25.000, 30.000, atau 50.000.", 400);
    }

    if (!(proofFile instanceof File)) {
      return apiError("Bukti pembayaran wajib diupload", 400);
    }
    if (proofFile.size > MAX_PROOF_SIZE) {
      return apiError("File bukti terlalu besar (maks 5MB)", 413);
    }
    if (proofFile.size === 0) {
      return apiError("File bukti kosong", 400);
    }
    if (proofFile.type && !ALLOWED_IMAGE_MIME.has(proofFile.type)) {
      return apiError("Bukti harus berupa gambar (JPG/PNG/WebP)", 415);
    }

    const proofBytes = Buffer.from(await proofFile.arrayBuffer());
    const adapter = await getStorageAdapter(session.userId!);
    const uploadResult = await adapter.upload(proofBytes, {
      nama: `topup-${Date.now()}-${proofFile.name}`,
      tipeMime: proofFile.type || "image/jpeg",
      folder: `/akal/bukti/guru-${session.userId}`,
    });

    await db.insert(payments).values({
      userId: session.userId!,
      amount,
      paymentType: "qris_static",
      status: "pending",
      proofImageUrl: uploadResult.link,
    });

    await appendEvent(`topup:${session.userId}`, "token.topup_requested", {
      userId: session.userId,
      amount,
      proofUrl: uploadResult.link,
      at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Top-up Rp${amount.toLocaleString("id-ID")} sedang diverifikasi. Saldo akan bertambah setelah disetujui.`,
      amount,
      proofUrl: uploadResult.link,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Topup error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}