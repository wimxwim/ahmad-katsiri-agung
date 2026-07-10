import "server-only";
import { hash, verify } from "@node-rs/argon2";
import bcrypt from "bcryptjs";

const ARGON2_ALGORITHM = 2;

export async function hashPassword(password: string): Promise<string> {
  try {
    return await hash(password, {
      algorithm: ARGON2_ALGORITHM,
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
    });
  } catch (error) {
    console.error("[auth-password] hashPassword failed:", error);
    throw new Error("Gagal mengamankan kata sandi. Coba lagi.");
  }
}


// NOTE: isLegacyHash hanya mendeteksi prefix bcrypt ($2a$, $2b$, $2y$).
export function isLegacyHash(storedHash: string): boolean {
  return storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<{ valid: boolean; needsRehash: boolean; error?: string }> {
  if (!storedHash) {
    return { valid: false, needsRehash: false, error: "Kata sandi belum diatur. Masuk lewat Google dulu." };
  }
  if (isLegacyHash(storedHash)) {
    try {
      const valid = await bcrypt.compare(password, storedHash);
      return { valid, needsRehash: valid };
    } catch (error) {
      console.error("[auth-password] bcrypt verify failed:", error);
      return { valid: false, needsRehash: false, error: "Sistem sedang bermasalah. Coba lagi nanti." };
    }
  }
  try {
    const valid = await verify(storedHash, password, { algorithm: ARGON2_ALGORITHM });
    return { valid, needsRehash: false };
  } catch (error) {
    console.error("[auth-password] argon2 verify failed:", error);
    return { valid: false, needsRehash: false, error: "Sistem verifikasi kata sandi bermasalah. Coba lagi nanti atau hubungi dukungan." };
  }
}
