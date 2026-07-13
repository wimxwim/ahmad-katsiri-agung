import { db } from "@/lib/db";
import { tokenBalances } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

const GENERATE_COST = 132;

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

export interface TokenBalance {
  userId: string;
  balance: number;
  totalTopup: number;
  totalSpent: number;
  lastTopupAt: Date | null;
}

export async function getBalance(userId: string): Promise<TokenBalance> {
  const [row] = await db
    .select()
    .from(tokenBalances)
    .where(eq(tokenBalances.userId, userId))
    .limit(1);

  if (!row) {
    await db.insert(tokenBalances).values({ userId, balance: 0 });
    return { userId, balance: 0, totalTopup: 0, totalSpent: 0, lastTopupAt: null };
  }

  return {
    userId: row.userId,
    balance: row.balance,
    totalTopup: row.totalTopup,
    totalSpent: row.totalSpent,
    lastTopupAt: row.lastTopupAt,
  };
}

export async function checkBalance(userId: string, amount: number): Promise<boolean> {
  const { balance } = await getBalance(userId);
  return balance >= amount;
}

export async function checkGenerateBalance(userId: string): Promise<boolean> {
  return checkBalance(userId, GENERATE_COST);
}

export async function deductBalance(userId: string, amount: number): Promise<TokenBalance> {
  const [result] = await db
    .update(tokenBalances)
    .set({
      balance: sql`${tokenBalances.balance} - ${amount}`,
      totalSpent: sql`${tokenBalances.totalSpent} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(tokenBalances.userId, userId),
        gte(tokenBalances.balance, amount),
      ),
    )
    .returning({ balance: tokenBalances.balance });

  if (!result) {
    const bal = await getBalance(userId);
    throw new InsufficientBalanceError(
      `Saldo tidak cukup. Butuh Rp${amount}, saldo sekarang Rp${bal.balance}.`,
      bal.balance,
      amount,
    );
  }

  return getBalance(userId);
}

export async function deductGenerateCost(userId: string): Promise<TokenBalance> {
  return deductBalance(userId, GENERATE_COST);
}

export async function refundBalance(userId: string, amount: number): Promise<TokenBalance> {
  await db
    .update(tokenBalances)
    .set({
      balance: sql`${tokenBalances.balance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(tokenBalances.userId, userId));

  return getBalance(userId);
}

export async function topUpBalance(userId: string, amount: number): Promise<TokenBalance> {
  await db
    .update(tokenBalances)
    .set({
      balance: sql`${tokenBalances.balance} + ${amount}`,
      totalTopup: sql`${tokenBalances.totalTopup} + ${amount}`,
      lastTopupAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tokenBalances.userId, userId));

  return getBalance(userId);
}

export function getGenerateCost(): number {
  return GENERATE_COST;
}