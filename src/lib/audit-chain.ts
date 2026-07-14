import { createHash, randomBytes } from "crypto";

/**
 * Immutable audit trail using SHA-256 hash chain.
 * Setiap transaksi memiliki hash yang terhubung ke hash transaksi sebelumnya.
 * Jika ada perubahan, seluruh chain patah — tamper-evident.
 */
export function computeHash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export function computeChainHash(
  prevHash: string,
  userId: string,
  action: string,
  amount: number,
  timestamp: number,
  nonce: string
): string {
  const payload = `${prevHash}|${userId}|${action}|${amount}|${timestamp}|${nonce}`;
  return computeHash(payload);
}

export function verifyChain(
  chain: { hash: string; prevHash: string; userId: string; action: string; amount: number; timestamp: number; nonce: string }[]
): { valid: boolean; brokenAt?: number } {
  for (let i = 0; i < chain.length; i++) {
    const expected = computeChainHash(
      chain[i].prevHash,
      chain[i].userId,
      chain[i].action,
      chain[i].amount,
      chain[i].timestamp,
      chain[i].nonce
    );
    if (expected !== chain[i].hash) {
      return { valid: false, brokenAt: i };
    }
    if (i > 0 && chain[i].prevHash !== chain[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}