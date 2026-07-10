import { NextRequest, NextResponse } from "next/server";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await requireOwner(request);
    const body = await request.json();
    const { paymentId, action } = body as { paymentId: string; action: "confirm" | "reject" };

    if (!paymentId || !["confirm", "reject"].includes(action)) {
      return apiError("paymentId dan action (confirm/reject) wajib", 400);
    }

    const newStatus = action === "confirm" ? "confirmed" : "rejected";

    await db
      .update(payments)
      .set({
        status: newStatus,
        verifiedBy: session.userId,
        verifiedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    return NextResponse.json({ success: true, status: newStatus });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Payment verify error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
