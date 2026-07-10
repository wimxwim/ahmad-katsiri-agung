import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { apiError } from "@/lib/api-response";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const fd = await request.formData();
    const file = fd.get("file");
    const paket = (fd.get("paket") as string) || "premium";
    const jumlah = parseInt((fd.get("jumlah") as string) || "0", 10) || 50000;

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
