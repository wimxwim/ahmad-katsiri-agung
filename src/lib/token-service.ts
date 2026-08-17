import { db } from "@/lib/db";
import { tokenBalances, tokenTransactions, users } from "@/lib/db/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { appendEvent } from "@/lib/event-store";
import { GENERATE_COST, INITIAL_TOKEN_BALANCE, FREE_TIER_UPLOAD_LIMIT, API_INPUT_COST_PER_TOKEN, API_OUTPUT_COST_PER_TOKEN, MARGIN_MULTIPLIER, MIN_GENERATE_CHARGE, MAX_GENERATE_CHARGE, ESTIMATED_OUTPUT_TOKENS, CHARS_PER_TOKEN_ESTIMATE } from "@/lib/token-constants";

export class InsufficientBalanceError extends Error {
  constructor(
    message: string,
    public currentBalance: number,
    public required: number,
  ) {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

export class SubscriptionLockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionLockedError";
  }
}

export class FreeTierLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FreeTierLimitError";
  }
}

export interface TokenBalance {
  userId: string;
  balance: number;
  totalTopup: number;
  totalSpent: number;
  lastTopupAt: Date | null;
  isUnlocked: boolean;
  unlockedAt: Date | null;
}

export interface SubscriptionStatus {
  isUnlocked: boolean;
  unlockedAt: Date | null;
  uploadCount: number;
  uploadLimit: number;
  canGenerate: boolean;
  canUpload: boolean;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  type: "TOPUP" | "GRANT" | "DEDUCT" | "REFUND" | "DONATION";
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  paymentMethod?: string | null;
  proofFileId?: string | null;
  proofLink?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export async function ensureBalanceRow(userId: string): Promise<TokenBalance> {
  const [row] = await db
    .select()
    .from(tokenBalances)
    .where(eq(tokenBalances.userId, userId))
    .limit(1);

  if (!row) {
    await db.insert(tokenBalances).values({
      userId,
      balance: 0,
      totalTopup: 0,
      totalSpent: 0,
      isUnlocked: false,
    });
    return { userId, balance: 0, totalTopup: 0, totalSpent: 0, lastTopupAt: null, isUnlocked: false, unlockedAt: null };
  }

  return {
    userId: row.userId,
    balance: row.balance,
    totalTopup: row.totalTopup,
    totalSpent: row.totalSpent,
    lastTopupAt: row.lastTopupAt,
    isUnlocked: row.isUnlocked,
    unlockedAt: row.unlockedAt,
  };
}

export async function getBalance(userId: string): Promise<TokenBalance> {
  return ensureBalanceRow(userId);
}

export async function checkBalance(userId: string, amount: number): Promise<boolean> {
  const { balance } = await getBalance(userId);
  return balance >= amount;
}

export async function checkGenerateBalance(userId: string): Promise<boolean> {
  return checkBalance(userId, GENERATE_COST);
}

export function estimateGenerationCost(sourceTextLength: number): number {
  const estimatedInputTokens = Math.ceil(sourceTextLength / CHARS_PER_TOKEN_ESTIMATE);
  const totalTokens = estimatedInputTokens + ESTIMATED_OUTPUT_TOKENS;
  const avgCostPerToken = (API_INPUT_COST_PER_TOKEN + API_OUTPUT_COST_PER_TOKEN) / 2;
  const apiCost = totalTokens * avgCostPerToken;
  return Math.min(MAX_GENERATE_CHARGE, Math.max(MIN_GENERATE_CHARGE, Math.ceil(apiCost * MARGIN_MULTIPLIER)));
}

export function calculateActualPrice(tokensIn: number, tokensOut: number): number {
  const inputCost = tokensIn * API_INPUT_COST_PER_TOKEN;
  const outputCost = tokensOut * API_OUTPUT_COST_PER_TOKEN;
  const apiCost = inputCost + outputCost;
  return Math.min(MAX_GENERATE_CHARGE, Math.max(MIN_GENERATE_CHARGE, Math.ceil(apiCost * MARGIN_MULTIPLIER)));
}

export async function deductBalance(
  userId: string,
  amount: number,
  metadata?: { notes?: string; referenceId?: string },
): Promise<TokenBalance> {
  if (amount <= 0) throw new Error("Jumlah harus lebih dari 0");

  const after = await db.transaction(async (tx) => {
    const [bal] = await tx
      .select({ balance: tokenBalances.balance, totalTopup: tokenBalances.totalTopup, totalSpent: tokenBalances.totalSpent, lastTopupAt: tokenBalances.lastTopupAt, isUnlocked: tokenBalances.isUnlocked, unlockedAt: tokenBalances.unlockedAt })
      .from(tokenBalances)
      .where(eq(tokenBalances.userId, userId))
      .for("update")
      .limit(1);

    const before: TokenBalance = {
      userId,
      balance: bal?.balance ?? 0,
      totalTopup: bal?.totalTopup ?? 0,
      totalSpent: bal?.totalSpent ?? 0,
      lastTopupAt: bal?.lastTopupAt ?? null,
      isUnlocked: bal?.isUnlocked ?? false,
      unlockedAt: bal?.unlockedAt ?? null,
    };

    if (metadata?.referenceId) {
      const [existing] = await tx
        .select({ id: tokenTransactions.id })
        .from(tokenTransactions)
        .where(
          and(
            eq(tokenTransactions.userId, userId),
            eq(tokenTransactions.type, "DEDUCT"),
            eq(tokenTransactions.referenceId, metadata.referenceId),
          ),
        )
        .limit(1);

      if (existing) {
        return before;
      }
    }

    if (before.balance < amount) {
      throw new InsufficientBalanceError(
        `Kuota tidak cukup. Butuh Rp${amount}, kuota sekarang Rp${before.balance}.`,
        before.balance,
        amount,
      );
    }

    const [result] = await tx
      .update(tokenBalances)
      .set({
        balance: sql`${tokenBalances.balance} - ${amount}`,
        totalSpent: sql`${tokenBalances.totalSpent} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(tokenBalances.userId, userId))
      .returning({ balance: tokenBalances.balance });

    const afterTx: TokenBalance = {
      ...before,
      balance: result?.balance ?? before.balance - amount,
      totalSpent: before.totalSpent + amount,
    };

    await tx.insert(tokenTransactions).values({
      userId,
      type: "DEDUCT",
      status: "COMPLETED",
      amount,
      balanceBefore: before.balance,
      balanceAfter: afterTx.balance,
      notes: metadata?.notes ?? null,
      referenceId: metadata?.referenceId ?? null,
    });

    return afterTx;
  });

  await appendEvent(`token:${userId}`, "token.deducted", {
    amount,
    balanceBefore: after.balance + amount,
    balanceAfter: after.balance,
    notes: metadata?.notes ?? null,
    referenceId: metadata?.referenceId ?? null,
  }).catch(() => {});

  return after;
}

export async function deductGenerateCost(userId: string, referenceId?: string): Promise<TokenBalance> {
  return deductBalance(userId, GENERATE_COST, { notes: "AI generation cost", referenceId });
}

export async function deductGenerateCostDynamic(
  userId: string,
  sourceTextLength: number,
  referenceId?: string,
): Promise<{ balance: TokenBalance; chargedAmount: number }> {
  if (process.env.FREE_GENERATE_MODE === "true") {
    const bal = await getBalance(userId);
    return { balance: bal, chargedAmount: 0 };
  }
  const estimatedCost = estimateGenerationCost(sourceTextLength);
  const balance = await deductBalance(userId, estimatedCost, {
    notes: `AI generation cost (estimated: Rp${estimatedCost})`,
    referenceId: referenceId ? `gen:${referenceId}` : undefined,
  });
  return { balance, chargedAmount: estimatedCost };
}

export async function refundBalance(
  userId: string,
  amount: number,
  metadata?: { notes?: string; referenceId?: string },
): Promise<TokenBalance> {
  return db.transaction(async (dbtx) => {
    const [bal] = await dbtx
      .select({ balance: tokenBalances.balance, totalTopup: tokenBalances.totalTopup, totalSpent: tokenBalances.totalSpent, lastTopupAt: tokenBalances.lastTopupAt, isUnlocked: tokenBalances.isUnlocked, unlockedAt: tokenBalances.unlockedAt })
      .from(tokenBalances)
      .where(eq(tokenBalances.userId, userId))
      .for("update")
      .limit(1);

    if (metadata?.referenceId) {
      const [existing] = await dbtx
        .select({ id: tokenTransactions.id })
        .from(tokenTransactions)
        .where(
          and(
            eq(tokenTransactions.userId, userId),
            eq(tokenTransactions.type, "REFUND"),
            eq(tokenTransactions.referenceId, metadata.referenceId),
          ),
        )
        .limit(1);

      if (existing) {
        return {
          userId,
          balance: bal?.balance ?? 0,
          totalTopup: bal?.totalTopup ?? 0,
          totalSpent: bal?.totalSpent ?? 0,
          lastTopupAt: bal?.lastTopupAt ?? null,
          isUnlocked: bal?.isUnlocked ?? false,
          unlockedAt: bal?.unlockedAt ?? null,
        };
      }
    }

    const balanceBefore = bal?.balance ?? 0;

    await dbtx
      .update(tokenBalances)
      .set({
        balance: sql`${tokenBalances.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(tokenBalances.userId, userId));

    const [after] = await dbtx
      .select({ balance: tokenBalances.balance, totalTopup: tokenBalances.totalTopup, totalSpent: tokenBalances.totalSpent, lastTopupAt: tokenBalances.lastTopupAt, isUnlocked: tokenBalances.isUnlocked, unlockedAt: tokenBalances.unlockedAt })
      .from(tokenBalances)
      .where(eq(tokenBalances.userId, userId));

    await dbtx.insert(tokenTransactions).values({
      userId,
      type: "REFUND",
      status: "COMPLETED",
      amount,
      balanceBefore,
      balanceAfter: after?.balance ?? 0,
      notes: metadata?.notes ?? null,
      referenceId: metadata?.referenceId ?? null,
    });

    await appendEvent(`token:${userId}`, "token.refunded", {
      amount,
      balanceBefore,
      balanceAfter: after?.balance ?? 0,
      notes: metadata?.notes ?? null,
      referenceId: metadata?.referenceId ?? null,
    }).catch(() => {});

    return {
      userId,
      balance: after?.balance ?? 0,
      totalTopup: after?.totalTopup ?? 0,
      totalSpent: after?.totalSpent ?? 0,
      lastTopupAt: after?.lastTopupAt ?? null,
      isUnlocked: after?.isUnlocked ?? false,
      unlockedAt: after?.unlockedAt ?? null,
    };
  });
}

export async function settleGenerationCost(
  userId: string,
  tokensIn: number,
  tokensOut: number,
  preChargedAmount: number,
  referenceId?: string,
): Promise<{ actualPrice: number; refunded: number; additionalCharged: number }> {
  if (process.env.FREE_GENERATE_MODE === "true") return { actualPrice: 0, refunded: 0, additionalCharged: 0 };
  const actualPrice = calculateActualPrice(tokensIn, tokensOut);
  if (actualPrice === preChargedAmount) return { actualPrice, refunded: 0, additionalCharged: 0 };
  const settleRef = referenceId ? `settle:${referenceId}` : undefined;
  const isRefund = actualPrice < preChargedAmount;
  const diff = Math.abs(actualPrice - preChargedAmount);
  const amount = diff;
  const txType = isRefund ? "REFUND" : "DEDUCT";
  const notes = isRefund
    ? `Refund kelebihan biaya generate. Estimasi: Rp${preChargedAmount}, Aktual: Rp${actualPrice}`
    : `Tambahan biaya generate. Estimasi: Rp${preChargedAmount}, Aktual: Rp${actualPrice}`;

  const result = await db.transaction(async (tx) => {
    if (settleRef) {
      const [existing] = await tx
        .select({ id: tokenTransactions.id })
        .from(tokenTransactions)
        .where(and(eq(tokenTransactions.userId, userId), eq(tokenTransactions.type, txType as "REFUND" | "DEDUCT"), eq(tokenTransactions.referenceId, settleRef)))
        .limit(1);
      if (existing) {
        return { alreadySettled: true as const, actualPrice, refunded: isRefund ? amount : 0, additionalCharged: isRefund ? 0 : amount };
      }
    }
    const [bal] = await tx
      .select({ balance: tokenBalances.balance, totalTopup: tokenBalances.totalTopup, totalSpent: tokenBalances.totalSpent, lastTopupAt: tokenBalances.lastTopupAt, isUnlocked: tokenBalances.isUnlocked, unlockedAt: tokenBalances.unlockedAt })
      .from(tokenBalances)
      .where(eq(tokenBalances.userId, userId))
      .for("update")
      .limit(1);
    const before = bal?.balance ?? 0;
    if (!bal) {
      await tx.insert(tokenBalances).values({ userId, balance: 0, totalTopup: 0, totalSpent: 0, isUnlocked: false }).onConflictDoNothing();
    }
    if (isRefund) {
      await tx.update(tokenBalances).set({ balance: sql`${tokenBalances.balance} + ${amount}`, updatedAt: new Date() }).where(eq(tokenBalances.userId, userId));
    } else {
      if (before < amount) throw new InsufficientBalanceError(`Kuota tidak cukup untuk settle. Butuh Rp${amount}, saldo Rp${before}.`, before, amount);
      await tx.update(tokenBalances).set({ balance: sql`${tokenBalances.balance} - ${amount}`, totalSpent: sql`${tokenBalances.totalSpent} + ${amount}`, updatedAt: new Date() }).where(eq(tokenBalances.userId, userId));
    }
    const [after] = await tx.select({ balance: tokenBalances.balance }).from(tokenBalances).where(eq(tokenBalances.userId, userId));
    const afterBal = after?.balance ?? (isRefund ? before + amount : before - amount);
    // Idempotent insert — ON CONFLICT DO NOTHING handles race between concurrent settle calls
    await tx.insert(tokenTransactions).values({
      userId,
      type: txType as "REFUND" | "DEDUCT",
      status: "COMPLETED",
      amount,
      balanceBefore: before,
      balanceAfter: afterBal,
      notes,
      referenceId: settleRef ?? null,
    }).onConflictDoNothing();
    return { alreadySettled: false as const, actualPrice, refunded: isRefund ? amount : 0, additionalCharged: isRefund ? 0 : amount, before, afterBal };
  });

  if (!result.alreadySettled) {
    await appendEvent(`token:${userId}`, isRefund ? "token.refunded" : "token.deducted", {
      amount,
      balanceBefore: (result as { before: number }).before,
      balanceAfter: (result as { afterBal: number }).afterBal,
      notes,
      referenceId: settleRef ?? null,
    }).catch(() => {});
  }
  return { actualPrice, refunded: isRefund ? amount : 0, additionalCharged: isRefund ? 0 : amount };
}

export async function topUpBalance(
  userId: string,
  amount: number,
  metadata?: {
    paymentMethod?: string;
    proofFileId?: string;
    proofLink?: string;
    notes?: string;
    referenceId?: string;
  },
): Promise<{ balance: TokenBalance; transaction: TokenTransaction; isFirstTopUp: boolean; bonusMessage: string | null }> {
  const before = await ensureBalanceRow(userId);

  const isFirstTopUp = before.totalTopup === 0;
  const bonusMessage = isFirstTopUp
    ? "Selamat! Top-up pertama berhasil. Akun Anda telah di-unlock untuk akses generate AI unlimited."
    : null;

  const { after, txRecord, wasJustUnlocked } = await db.transaction(async (tx) => {
    const [result] = await tx
      .update(tokenBalances)
      .set({
        balance: sql`${tokenBalances.balance} + ${amount}`,
        totalTopup: sql`${tokenBalances.totalTopup} + ${amount}`,
        lastTopupAt: new Date(),
        updatedAt: new Date(),
        isUnlocked: true,
        unlockedAt: before.isUnlocked ? undefined : new Date(),
      })
      .where(eq(tokenBalances.userId, userId))
      .returning({
        balance: tokenBalances.balance,
        totalTopup: tokenBalances.totalTopup,
        totalSpent: tokenBalances.totalSpent,
        lastTopupAt: tokenBalances.lastTopupAt,
        isUnlocked: tokenBalances.isUnlocked,
        unlockedAt: tokenBalances.unlockedAt,
      });

    const afterTx: TokenBalance = {
      userId,
      balance: result.balance,
      totalTopup: result.totalTopup,
      totalSpent: result.totalSpent,
      lastTopupAt: result.lastTopupAt,
      isUnlocked: result.isUnlocked,
      unlockedAt: result.unlockedAt,
    };

    const wasJustUnlockedTx = !before.isUnlocked && result.isUnlocked;

    const [txRecordTx] = await tx
      .insert(tokenTransactions)
      .values({
        userId,
        type: "TOPUP",
        status: "COMPLETED",
        amount,
        balanceBefore: before.balance,
        balanceAfter: afterTx.balance,
        paymentMethod: metadata?.paymentMethod ?? "QRIS_GOPAY",
        proofFileId: metadata?.proofFileId ?? null,
        proofLink: metadata?.proofLink ?? null,
        referenceId: metadata?.referenceId ?? null,
        notes: wasJustUnlockedTx ? "Top-up pertama — fitur generate di-unlock!" : (metadata?.notes ?? null),
      })
      .returning();

    return { after: afterTx, txRecord: txRecordTx, wasJustUnlocked: wasJustUnlockedTx };
  });

  await appendEvent(`token:${userId}`, "token.topped_up", {
    amount,
    balanceBefore: before.balance,
    balanceAfter: after.balance,
    paymentMethod: metadata?.paymentMethod ?? "QRIS_GOPAY",
    proofFileId: metadata?.proofFileId ?? null,
    unlocked: wasJustUnlocked,
  });

  return { balance: after, transaction: txRecord as TokenTransaction, isFirstTopUp, bonusMessage };
}

export async function grantInitialBalance(
  userId: string,
  amount: number,
  reason: string,
): Promise<TokenBalance> {
  return db.transaction(async (dbtx) => {
    const [before] = await dbtx
      .select({ balance: tokenBalances.balance, totalTopup: tokenBalances.totalTopup })
      .from(tokenBalances)
      .where(eq(tokenBalances.userId, userId));

    if (!before) {
      await dbtx.insert(tokenBalances).values({
        userId,
        balance: 0,
        totalTopup: 0,
        totalSpent: 0,
        isUnlocked: false,
      });
      return grantInTx(dbtx, userId, amount, reason, 0);
    }

    if (before.totalTopup > 0 || before.balance > 0) {
      return { userId, balance: before.balance, totalTopup: before.totalTopup, totalSpent: 0, isUnlocked: false, unlockedAt: null } as TokenBalance;
    }

    return grantInTx(dbtx, userId, amount, reason, before.balance);
  });
}

async function grantInTx(
  dbtx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  amount: number,
  reason: string,
  beforeBalance: number,
): Promise<TokenBalance> {
  const [result] = await dbtx
    .update(tokenBalances)
    .set({
      balance: sql`${tokenBalances.balance} + ${amount}`,
      totalTopup: sql`${tokenBalances.totalTopup} + ${amount}`,
      lastTopupAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tokenBalances.userId, userId))
    .returning({
      balance: tokenBalances.balance,
      totalTopup: tokenBalances.totalTopup,
      totalSpent: tokenBalances.totalSpent,
      lastTopupAt: tokenBalances.lastTopupAt,
      isUnlocked: tokenBalances.isUnlocked,
      unlockedAt: tokenBalances.unlockedAt,
    });

  const after: TokenBalance = {
    userId,
    balance: result.balance,
    totalTopup: result.totalTopup,
    totalSpent: result.totalSpent,
    lastTopupAt: result.lastTopupAt,
    isUnlocked: result.isUnlocked,
    unlockedAt: result.unlockedAt,
  };

  await dbtx.insert(tokenTransactions).values({
    userId,
    type: "GRANT",
    status: "COMPLETED",
    amount,
    balanceBefore: beforeBalance,
    balanceAfter: after.balance,
    notes: reason,
  });

  await appendEvent(`token:${userId}`, "token.granted", {
    amount,
    balanceBefore: beforeBalance,
    balanceAfter: after.balance,
    reason,
  });

  return after;
}

export async function getTransactionHistory(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<{ transactions: TokenTransaction[]; total: number }> {
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId));

  const rows = await db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(desc(tokenTransactions.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    transactions: rows as TokenTransaction[],
    total: countResult?.count ?? 0,
  };
}

export async function getAllTransactions(
  limit = 50,
  offset = 0,
  type?: string,
): Promise<{ transactions: (TokenTransaction & { nama?: string; email?: string })[]; total: number }> {
  const conditions = type
    ? [eq(tokenTransactions.type, type as "TOPUP" | "GRANT" | "DEDUCT" | "REFUND" | "DONATION")]
    : [];

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tokenTransactions)
    .where(conditions.length > 0 ? conditions[0] : undefined);

  const rows = await db.query.tokenTransactions.findMany({
    where: conditions.length > 0 ? conditions[0] : undefined,
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
    offset,
    with: {
      user: {
        columns: { nama: true, email: true },
      },
    },
  });

  return {
    transactions: rows.map((r) => ({
      ...r,
      nama: r.user?.nama ?? undefined,
      email: r.user?.email ?? undefined,
    })),
    total: countResult?.count ?? 0,
  };
}

export async function recordDonation(
  userId: string,
  metadata?: {
    proofFileId?: string;
    proofLink?: string;
    referenceId?: string;
  },
): Promise<void> {
  await db.insert(tokenTransactions).values({
    userId,
    type: "DONATION",
    status: "COMPLETED",
    amount: 0,
    balanceBefore: 0,
    balanceAfter: 0,
    proofFileId: metadata?.proofFileId ?? null,
    proofLink: metadata?.proofLink ?? null,
    referenceId: metadata?.referenceId ?? null,
    notes: "Donasi sukarela",
  });

  await appendEvent(`token:${userId}`, "token.donated", {
    proofFileId: metadata?.proofFileId ?? null,
    proofLink: metadata?.proofLink ?? null,
  });
}

export function getGenerateCost(): number {
  return GENERATE_COST;
}

export async function isUserSuspended(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ suspendedAt: users.suspendedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.suspendedAt != null;
}

export async function requireNotSuspended(userId: string): Promise<void> {
  const suspended = await isUserSuspended(userId);
  if (suspended) {
    throw new SubscriptionLockedError(
      "Akun Anda sedang dalam masa penangguhan (suspend). Fitur top-up, upload, generate AI, buat kursus, dan undang siswa dinonaktifkan.",
    );
  }
}

export { INITIAL_TOKEN_BALANCE, FREE_TIER_UPLOAD_LIMIT };

export async function isUserUnlocked(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ isUnlocked: tokenBalances.isUnlocked })
    .from(tokenBalances)
    .where(eq(tokenBalances.userId, userId))
    .limit(1);
  return row?.isUnlocked ?? false;
}

export async function requireUnlocked(userId: string): Promise<void> {
  if (process.env.FREE_GENERATE_MODE === "true") return;
  // F10-3 Dead token fix: allow generate if balance >= MIN_GENERATE_CHARGE (50) even if not unlocked — untuk 15 generate pertama dari INITIAL 2000.
  // TODO trial Rp1k: jika promo aktif, MIN_TOPUP bisa 1000 untuk unlock lebih murah.
  const status = await getSubscriptionStatus(userId);
  if (status.canGenerate) return;
  throw new SubscriptionLockedError(
    "Fitur generate AI terkunci. Silakan top-up minimal Rp5.000 untuk membuka akses unlimited.",
  );
}

export async function getUploadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ uploadCount: users.uploadCount })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.uploadCount ?? 0;
}

export async function incrementUploadCount(userId: string): Promise<{ count: number; limit: number; canUpload: boolean }> {
  const [row] = await db
    .update(users)
    .set({ uploadCount: sql`${users.uploadCount} + 1` })
    .where(eq(users.id, userId))
    .returning({ uploadCount: users.uploadCount });

  const count = row?.uploadCount ?? 0;
  const isUnlocked = await isUserUnlocked(userId);
  const limit = isUnlocked ? Infinity : FREE_TIER_UPLOAD_LIMIT;
  const canUpload = isUnlocked || count <= FREE_TIER_UPLOAD_LIMIT;

  return { count, limit, canUpload };
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const [balance] = await db
    .select({
      isUnlocked: tokenBalances.isUnlocked,
      unlockedAt: tokenBalances.unlockedAt,
      balance: tokenBalances.balance,
    })
    .from(tokenBalances)
    .where(eq(tokenBalances.userId, userId))
    .limit(1);

  const [user] = await db
    .select({ uploadCount: users.uploadCount })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const isUnlocked = balance?.isUnlocked ?? false;
  const currentBalance = balance?.balance ?? 0;
  const uploadCount = user?.uploadCount ?? 0;
  const uploadLimit = isUnlocked ? Infinity : FREE_TIER_UPLOAD_LIMIT;

  // F10-3 Dead token fix INITIAL 2000: user baru dapat 2000 balance gratis ~20 generate.
  // canGenerate harus true jika balance >= MIN_GENERATE_CHARGE (50) meski belum unlock.
  // Untuk 15 generate pertama, jangan block meski isUnlocked false.
  // TODO trial Rp1k: promo topup 1k bisa unlock — cek MIN_TOPUP comment di token-constants.
  const canGenerate = isUnlocked || currentBalance >= MIN_GENERATE_CHARGE;

  return {
    isUnlocked,
    unlockedAt: balance?.unlockedAt ?? null,
    uploadCount,
    uploadLimit,
    canGenerate,
    canUpload: isUnlocked || uploadCount < FREE_TIER_UPLOAD_LIMIT,
  };
}
