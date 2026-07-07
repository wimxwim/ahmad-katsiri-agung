import "server-only";
import { importSPKI, importPKCS8, exportJWK } from "jose";

export function hs256Secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(s);
}

let privateKey: CryptoKey | Uint8Array | null = null;
let publicKey: CryptoKey | Uint8Array | null = null;

export function hasES256Keys(): boolean {
  return !!process.env.JWT_PRIVATE_KEY && !!process.env.JWT_PUBLIC_KEY;
}

export async function getSigningKey(): Promise<CryptoKey | Uint8Array> {
  if (hasES256Keys()) {
    if (!privateKey) {
      privateKey = await importPKCS8(process.env.JWT_PRIVATE_KEY!, "ES256");
    }
    return privateKey;
  }
  return hs256Secret();
}

export async function getVerifyingKey(): Promise<CryptoKey | Uint8Array> {
  if (hasES256Keys()) {
    if (!publicKey) {
      publicKey = await importSPKI(process.env.JWT_PUBLIC_KEY!, "ES256");
    }
    return publicKey;
  }
  return hs256Secret();
}

export async function getPublicJWK(): Promise<Record<string, unknown>> {
  const key = await importSPKI(process.env.JWT_PUBLIC_KEY!, "ES256");
  const jwk = await exportJWK(key) as Record<string, unknown>;
  jwk.alg = "ES256";
  jwk.use = "sig";
  return jwk;
}
