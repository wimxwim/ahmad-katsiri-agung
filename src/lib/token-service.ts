import { db } from "@/lib/db";
import { tokenBalances } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const GENERATE_COST = 132;

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
  const current = await getBalance(userId);

  await db
    .update(tokenBalances)
    .set({
      balance: current.balance - amount,
      totalSpent: current.totalSpent + amount,
      updatedAt: new Date(),
    })
    .where(eq(tokenBalances.userId, userId));

  return getBalance(userId);
}

export async function deductGenerateCost(userId: string): Promise<TokenBalance> {
  return deductBalance(userId, GENERATE_COST);
}

export async function creditBalance(userId: string, amount: number): Promise<TokenBalance> {
  const current = await getBalance(userId);

  await db
    .update(tokenBalances)
    .set({
      balance: current.balance + amount,
      totalTopup: current.totalTopup + amount,
      lastTopupAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tokenBalances.userId, userId));

  return getBalance(userId);
}

export function getGenerateCost(): number {
  return GENERATE_COST;
}