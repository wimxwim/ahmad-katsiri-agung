import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyChain } from "@/lib/audit-chain";
import { tokenTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/route-guard-v2";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const ip = ipFromRequest(request);
  const rl = await checkRateLimit(`audit-verify:${ip}`, 30, 60000);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  const session = await requireSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = request.nextUrl.searchParams.get("userId") || session.userId;

  const txs = await db
    .select()
    .from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(tokenTransactions.createdAt)
    .limit(100);

  if (txs.length === 0) {
    return NextResponse.json({ valid: true, count: 0, message: "No transactions yet" });
  }

  const chain = txs.map((tx) => ({
    hash: tx.chainHash || "",
    prevHash: tx.prevHash || "",
    userId: tx.userId,
    action: tx.type,
    amount: tx.amount,
    timestamp: tx.createdAt.getTime(),
    nonce: tx.nonce || "",
  }));

  const result = verifyChain(chain);

  return NextResponse.json({
    valid: result.valid,
    brokenAt: result.brokenAt,
    count: txs.length,
    userId,
  });
}