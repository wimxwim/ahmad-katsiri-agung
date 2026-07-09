import "server-only";
import { hash, verify } from "@node-rs/argon2";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
  });
}

export function isLegacyHash(storedHash: string): boolean {
  return storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (isLegacyHash(storedHash)) {
    const valid = await bcrypt.compare(password, storedHash);
    return { valid, needsRehash: valid };
  }
  try {
    const valid = await verify(storedHash, password, { algorithm: 2 });
    return { valid, needsRehash: false };
  } catch (error) {
    console.error("[auth-password] verifyPassword failed:", error);
    return { valid: false, needsRehash: false };
  }
}
