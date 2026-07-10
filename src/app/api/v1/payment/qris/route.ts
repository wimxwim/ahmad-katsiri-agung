import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { requireSession, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);

    const rl = await checkRateLimit(`payment:${session.userId}`, 5, 3600000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const amount = parseInt(formData.get("amount") as string || "0", 10);
    const notes = (formData.get("notes") as string) || null;

    if (!file) return apiError("Bukti transfer wajib diupload", 400);
    if (!amount || amount < 10000) return apiError("Jumlah minimal Rp10.000", 400);

    // Upload file ke ImageKit
    let proofUrl: string | null = null;
    try {
      const ikForm = new FormData();
      ikForm.append("file", file);
      ikForm.append("fileName", `payment-${session.userId}-${Date.now()}`);
      ikForm.append("folder", "/payments");
      ikForm.append("useUniqueFileName", "true");

      const ikRes = await fetch("https://upload.imagekit.io/api/v2/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}`,
        },
        body: ikForm,
      });

      if (ikRes.ok) {
        const ikData = (await ikRes.json()) as { url?: string };
        proofUrl = ikData.url || null;
      }
    } catch {
      // Fallback: simpan tanpa URL jika ImageKit gagal
    }

    await db.insert(payments).values({
      userId: session.userId,
      amount,
      paymentType: "qris_static",
      status: "pending",
      proofImageUrl: proofUrl,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Bukti pembayaran berhasil dikirim. Tim kami akan verifikasi dalam 1×24 jam.",
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Payment upload error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
