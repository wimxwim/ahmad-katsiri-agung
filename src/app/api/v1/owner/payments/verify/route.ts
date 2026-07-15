import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateCsrf } from "@/lib/csrf-server";
import { topUpBalance } from "@/lib/token-service";

const PaymentVerifySchema = z.object({
  paymentId: z.string().min(1),
  action: z.enum(["confirm", "reject"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireOwner(request);

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const rl = await checkRateLimitPerUser(`payment-verify:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { paymentId, action } = PaymentVerifySchema.parse(await request.json());

    const newStatus = action === "confirm" ? "confirmed" : "rejected";

    const result = await db.transaction(async (dbtx) => {
      const [payment] = await dbtx
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .for("update")
        .limit(1);
      if (!payment) throw new Error("Pembayaran tidak ditemukan");
      if (payment.status !== "pending") return { alreadyProcessed: true } as const;

      await dbtx
        .update(payments)
        .set({
          status: newStatus,
          verifiedBy: session.userId,
          verifiedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      if (action === "confirm") {
        await topUpBalance(payment.userId, payment.amount, {
          paymentMethod: payment.paymentType,
          proofLink: payment.proofImageUrl ?? undefined,
          proofFileId: paymentId,
        });
      }

      return { alreadyProcessed: false } as const;
    });

    if (result.alreadyProcessed) {
      return apiError("Pembayaran sudah diverifikasi sebelumnya", 409);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Payment verify error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
