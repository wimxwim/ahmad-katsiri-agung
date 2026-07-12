import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, checkRateLimitPerUser, ipFromRequest } from "@/lib/rate-limit";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SubmitSchema = z.object({
  paket: z.string().min(1).default("premium"),
  jumlah: z.coerce.number().int().positive().default(50000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const ip = ipFromRequest(request);
    const ipRl = await checkRateLimit(`payment-submit-ip:${ip}`, 5, 60_000);
    if (!ipRl.allowed) return apiRateLimit(ipRl.retryAfter);

    const userRl = await checkRateLimitPerUser(`payment-submit:${session.userId}`, 3, 60_000);
    if (!userRl.allowed) return apiRateLimit(userRl.retryAfter);

    const fd = await request.formData();
    const file = fd.get("file");

    const { paket, jumlah } = SubmitSchema.parse({
      paket: fd.get("paket"),
      jumlah: fd.get("jumlah"),
    });

    if (!(file instanceof File)) return apiError("File tidak ditemukan", 400);
    if (file.size > MAX_SIZE) return apiError("File terlalu besar (maks 5MB)", 413);
    if (!ALLOWED_TYPES.includes(file.type)) return apiError("Format tidak didukung (JPG/PNG/WebP)", 415);

    const bytes = Buffer.from(await file.arrayBuffer());
    const adapter = await getStorageAdapter(session.userId);
    const result = await adapter.upload(bytes, {
      nama: `bukti-${Date.now()}.${file.type.split("/")[1]}`,
      tipeMime: file.type,
      folder: `/akal/pembayaran/siswa-${session.userId}`,
    });

    const [payment] = await db
      .insert(payments)
      .values({
        userId: session.userId,
        amount: jumlah,
        paymentType: "qris_static",
        status: "pending",
        proofImageUrl: result.link,
        notes: `Paket: ${paket}`,
      })
      .returning();

    return NextResponse.json({ success: true, paymentId: payment.id });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Payment submit error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
