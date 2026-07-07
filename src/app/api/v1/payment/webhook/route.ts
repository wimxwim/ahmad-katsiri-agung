import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { transaksi, siswaKursus } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySignature } from "@/lib/midtrans";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";

const WebhookSchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.string().min(1),
  status_code: z.string().min(1),
  gross_amount: z.string().min(1),
  signature_key: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rateLimit = await checkRateLimit(`midtrans-webhook:${ip}`, 20, 60_000);
    if (!rateLimit.allowed) return apiRateLimit(rateLimit.retryAfter);

    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const parsed = WebhookSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid payload", 400);
    }

    const { order_id, transaction_status, status_code, gross_amount, signature_key } = parsed.data;

    if (!order_id || !transaction_status || !signature_key) {
      return apiError("Invalid payload", 400);
    }

    const valid = verifySignature(
      String(order_id),
      String(status_code),
      String(gross_amount),
      String(signature_key)
    );

    if (!valid) {
      console.warn("[Midtrans Webhook] Invalid signature for order:", order_id);
      return apiError("Invalid signature", 403);
    }

    console.log("[Midtrans Webhook] order_id:", order_id, "status:", transaction_status);

    const txRows = await db
      .select()
      .from(transaksi)
      .where(eq(transaksi.paymentGatewayRef, order_id))
      .limit(1);

    if (txRows.length === 0) {
      console.warn("[Midtrans Webhook] Transaction not found:", order_id);
      return apiError("Transaction not found", 404);
    }

    const transaksiRow = txRows[0];

    switch (transaction_status) {
      case "capture":
      case "settlement": {
        await db.transaction(async (dbtx) => {
          await dbtx
            .update(transaksi)
            .set({ status: "SUCCESS", paidAt: new Date() })
            .where(eq(transaksi.id, transaksiRow.id));

          const existing = await dbtx
            .select({ id: siswaKursus.id })
            .from(siswaKursus)
            .where(
              and(
                eq(siswaKursus.siswaId, transaksiRow.siswaId),
                eq(siswaKursus.kursusId, transaksiRow.kursusId)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            await dbtx.insert(siswaKursus).values({
              siswaId: transaksiRow.siswaId,
              kursusId: transaksiRow.kursusId,
              status: "AKTIF",
            });
          }
        });

        console.log("[Midtrans Webhook] Payment SUCCESS — order:", order_id);
        break;
      }
      case "pending":
        await db
          .update(transaksi)
          .set({ status: "PENDING" })
          .where(eq(transaksi.id, transaksiRow.id));
        break;
      case "deny":
        await db
          .update(transaksi)
          .set({ status: "DENY" })
          .where(eq(transaksi.id, transaksiRow.id));
        break;
      case "expire":
        await db
          .update(transaksi)
          .set({ status: "EXPIRED" })
          .where(eq(transaksi.id, transaksiRow.id));
        break;
      case "cancel":
        await db
          .update(transaksi)
          .set({ status: "CANCELLED" })
          .where(eq(transaksi.id, transaksiRow.id));
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (e) {
    console.error("[Midtrans Webhook] Error:", e);
    return apiError("Internal error", 500);
  }
}
