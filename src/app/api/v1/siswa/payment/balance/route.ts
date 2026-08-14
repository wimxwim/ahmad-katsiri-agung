import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { tokenTransactions } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`siswa-payment-balance:${ip}`, 30, 60000);
    if (!rl.allowed) return apiError("Rate limit", 429);
    const session = await requireSiswa(request);

    const [balance] = await db
      .select({
        totalPurchased: sql<number>`COALESCE(SUM(CASE WHEN ${tokenTransactions.amount} > 0 THEN ${tokenTransactions.amount} ELSE 0 END), 0)`.mapWith(Number),
        totalUsed: sql<number>`COALESCE(SUM(CASE WHEN ${tokenTransactions.amount} < 0 THEN ABS(${tokenTransactions.amount}) ELSE 0 END), 0)`.mapWith(Number),
      })
      .from(tokenTransactions)
      .where(
        and(
          eq(tokenTransactions.userId, session.userId!),
          eq(tokenTransactions.status, "COMPLETED"),
        ),
      );

    const currentBalance = (balance?.totalPurchased ?? 0) - (balance?.totalUsed ?? 0);

    return NextResponse.json({
      data: {
        balance: currentBalance,
        totalUsed: balance?.totalUsed ?? 0,
        totalPurchased: balance?.totalPurchased ?? 0,
        lastTransaction: null,
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa payment balance error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}