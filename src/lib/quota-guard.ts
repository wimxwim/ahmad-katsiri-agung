import "server-only";
import { db } from "@/lib/db";
import { quotas, quotaUsages } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

export class QuotaExceededError extends Error {
  resourceType: string;
  limitValue: number;
  currentUsage: number;
  constructor(message: string, resourceType: string, limitValue: number, currentUsage: number) {
    super(message);
    this.resourceType = resourceType;
    this.limitValue = limitValue;
    this.currentUsage = currentUsage;
  }
}

export async function checkQuota(
  userId: string,
  role: string,
  resourceType: string,
): Promise<{ quotaId: string; currentUsage: number; limitValue: number }> {
  const quota = await db.query.quotas.findFirst({
    where: and(eq(quotas.role, role), eq(quotas.resourceType, resourceType), eq(quotas.isActive, true)),
  });

  if (!quota) return { quotaId: "", currentUsage: 0, limitValue: Infinity };

  const usage = await db.query.quotaUsages.findFirst({
    where: and(
      eq(quotaUsages.userId, userId),
      eq(quotaUsages.quotaId, quota.id),
    ),
  });

  const currentUsage = usage?.currentUsage ?? 0;

  if (currentUsage >= quota.limitValue) {
    throw new QuotaExceededError(
      quota.description || `Kuota ${resourceType} tercapai (${quota.limitValue})`,
      resourceType,
      quota.limitValue,
      currentUsage,
    );
  }

  return { quotaId: quota.id, currentUsage, limitValue: quota.limitValue };
}

export async function incrementUsage(userId: string, quotaId: string): Promise<void> {
  if (!quotaId) return;
  await db
    .insert(quotaUsages)
    .values({ userId, quotaId, currentUsage: 1, windowStart: new Date() })
    .onConflictDoUpdate({
      target: [quotaUsages.userId, quotaUsages.quotaId, quotaUsages.windowStart],
      set: { currentUsage: sql`${quotaUsages.currentUsage} + 1`, updatedAt: new Date() },
    });
}
