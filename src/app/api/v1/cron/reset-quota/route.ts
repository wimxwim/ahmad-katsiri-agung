import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tokenBalances, quotaUsages, quotas } from "@/lib/db/schema";
import { eq, and, lt, isNull, or } from "drizzle-orm";
import { apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return apiError("CRON_SECRET tidak dikonfigurasi di environment variable", 500);
  }
  const tokenParam = request.nextUrl.searchParams.get("token");
  const authHeader = request.headers.get("Authorization");
  const isAuthorized =
    (tokenParam && tokenParam === cronSecret) ||
    (authHeader && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return apiError("Unauthorized", 401);
  }

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const freeUsers = await db
    .select({ userId: tokenBalances.userId })
    .from(tokenBalances)
    .where(
      and(
        eq(tokenBalances.tier, "free"),
        or(
          isNull(tokenBalances.resetAt),
          lt(tokenBalances.resetAt, now),
        ),
      ),
    );

  const userIds = freeUsers.map((u) => u.userId);

  if (userIds.length === 0) {
    return NextResponse.json({ success: true, resetCount: 0, message: "Tidak ada kuota yang perlu di-reset" });
  }

  const freeQuotaIds = await db
    .select({ id: quotas.id })
    .from(quotas)
    .where(
      and(
        eq(quotas.role, "guru"),
        eq(quotas.resourceType, "ai_generation"),
        eq(quotas.isActive, true),
      ),
    );

  const quotaIdList = freeQuotaIds.map((q) => q.id);

  if (quotaIdList.length > 0) {
    for (const userId of userIds) {
      for (const quotaId of quotaIdList) {
        await db
          .update(quotaUsages)
          .set({ currentUsage: 0, windowStart: now, updatedAt: new Date() })
          .where(
            and(
              eq(quotaUsages.userId, userId),
              eq(quotaUsages.quotaId, quotaId),
            ),
          );
      }
    }
  }

  for (const userId of userIds) {
    await db
      .update(tokenBalances)
      .set({ resetAt: nextMonth })
      .where(eq(tokenBalances.userId, userId));
  }

  return NextResponse.json({
    success: true,
    resetCount: userIds.length,
    nextReset: nextMonth.toISOString(),
  });
}