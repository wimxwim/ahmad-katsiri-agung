import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { kursus, transaksi } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { createSnapTransaction, IS_MIDTRANS_READY } from "@/lib/midtrans";
import { apiError, apiRateLimit } from "@/lib/api-response";

const PaymentCreateSchema = z.object({
  kursusId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return apiError("Silakan login terlebih dahulu", 401);
    }
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success || _ar.data.role !== "murid") {
      return apiError("Hanya siswa yang dapat melakukan pembayaran", 403);
    }
    const session = _ar.data;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`payment-create:${ip}`, 3, 30000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = PaymentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const kursusRows = await db
      .select()
      .from(kursus)
      .where(and(eq(kursus.id, parsed.data.kursusId), eq(kursus.isPublic, true)))
      .limit(1);

    if (kursusRows.length === 0) {
      return apiError("Kursus tidak ditemukan", 404);
    }

    const course = kursusRows[0];

    if (!course.harga || course.harga <= 0) {
      return apiError("BAD_REQUEST", "Kursus ini gratis — tidak perlu pembayaran. Daftar langsung melalui /api/v1/enroll.", undefined, 400);
    }

    const ts = Date.now();
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const orderId = `AKAL-${ts}-${random4}`;

    const [tx] = await db
      .insert(transaksi)
      .values({
        siswaId: session.userId!,
        kursusId: course.id,
        jumlah: course.harga,
        paymentGatewayRef: orderId,
        status: "PENDING",
      })
      .returning();

    if (!IS_MIDTRANS_READY) {
      return NextResponse.json({
        message: "midtrans_not_configured",
        mode: "mock",
        orderId,
        transaksiId: tx.id,
        jumlah: course.harga,
      });
    }

    const snap = await createSnapTransaction({
      orderId,
      amount: course.harga,
      customerName: session.nama,
      customerEmail: session.email || `${session.nama.toLowerCase().replace(/\s+/g, ".")}@siswa.akal`,
      courseName: course.judul,
    });

    return NextResponse.json({
      orderId,
      transaksiId: tx.id,
      redirectUrl: snap.redirect_url,
      token: snap.token,
    });
  } catch (e) {
    console.error("Payment create error:", e);
    return apiError("INTERNAL_ERROR", "Terjadi kesalahan server", undefined, 500);
  }
}
