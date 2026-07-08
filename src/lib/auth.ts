import "server-only";
import { SignJWT, jwtVerify, errors, type JWTPayload } from "jose";
import { randomUUID } from "crypto";
import type { SesiPayload } from "./session";
import {
  getSigningKey,
  getVerifyingKey,
  hs256Secret,
  hasES256Keys,
} from "./auth-keys";

export type AuthErrorCode = "expired" | "invalid" | "internal";

export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; code: AuthErrorCode };

export interface QuizTokenPayload extends JWTPayload {
  nama: string;
  kelas: string;
}

export async function signQuizToken(nama: string, kelas: string): Promise<string> {
  return new SignJWT({ nama, kelas })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(hs256Secret());
}

export async function verifyQuizToken(token: string): Promise<AuthResult<QuizTokenPayload>> {
  try {
    const { payload } = await jwtVerify(token, hs256Secret());
    return { success: true, data: payload as QuizTokenPayload };
  } catch (err) {
    if (err instanceof errors.JWTExpired) return { success: false, code: "expired" };
    console.error("[verifyQuizToken] unexpected error:", err);
    return { success: false, code: "internal" };
  }
}

export async function signSession(payload: Omit<SesiPayload, "iss" | "exp" | "iat">): Promise<string> {
  const key = await getSigningKey();
  const alg = hasES256Keys() ? "ES256" : "HS256";
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setAudience("akal-center-api")
    .setJti(randomUUID())
    .sign(key);
}

export async function verifySession(token: string): Promise<AuthResult<SesiPayload>> {
  if (hasES256Keys()) {
    try {
      const key = await getVerifyingKey();
      const { payload } = await jwtVerify(token, key);
      return { success: true, data: payload as SesiPayload };
    } catch (err) {
      if (err instanceof errors.JWTExpired) {
        return { success: false, code: "expired" };
      }
      if (!(err instanceof errors.JWSSignatureVerificationFailed)) {
        console.error("[verifySession] ES256 verification error:", err);
      }
    }
  }
  try {
    const { payload } = await jwtVerify(token, hs256Secret());
    return { success: true, data: payload as SesiPayload };
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      return { success: false, code: "expired" };
    }
    console.error("[verifySession] verification failed:", err);
    return { success: false, code: "internal" };
  }
}
