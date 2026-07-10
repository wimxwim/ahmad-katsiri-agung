import { NextRequest, NextResponse } from "next/server";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { payments, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireOwner(request);
    const status = request.nextUrl.searchParams.get("status") || "pending";

    const data = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        paymentType: payments.paymentType,
        status: payments.status,
        proofImageUrl: payments.proofImageUrl,
        notes: payments.notes,
        verifiedAt: payments.verifiedAt,
        createdAt: payments.createdAt,
        userName: users.nama,
        userEmail: users.email,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .where(eq(payments.status, status))
      .orderBy(desc(payments.createdAt))
      .limit(50);

    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Owner payments error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
