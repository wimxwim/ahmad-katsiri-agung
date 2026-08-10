import "server-only";
import { cache } from "react";
import { SignJWT, jwtVerify, errors, type JWTPayload } from "jose";

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
    const { payload } = await jwtVerify<QuizTokenPayload>(token, hs256Secret(), { algorithms: ["HS256"] });
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
  return new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setAudience("akal-center-api")
    .setJti(crypto.randomUUID())
    .sign(key);
}

export const verifySession = cache(async (token: string): Promise<AuthResult<SesiPayload>> => {
  if (hasES256Keys()) {
    try {
      // 1. Try ES256 first (new sessions are ES256-signed)
      const key = await getVerifyingKey();
      const { payload } = await jwtVerify(token, key, { audience: "akal-center-api" });
      return { success: true, data: payload as SesiPayload };
    } catch (err) {
      // jose validates the signature before checking exp, so JWTExpired here
      // means a genuinely expired ES256 token. Expiration is algorithm-
      // independent, so there is no point falling back - HS256 would reject
      // it identically. Short-circuit to keep the "expired" error code.
      if (err instanceof errors.JWTExpired) {
        return { success: false, code: "expired" };
      }
      // 2. Grace period fallback: ES256 verification failed (e.g. this is a
      //    legacy HS256-signed session). Try HS256 so existing sessions keep
      //    working while ES256 is rolled out.
      try {
        const { payload } = await jwtVerify<SesiPayload>(token, hs256Secret(), {
          algorithms: ["HS256"],
          audience: "akal-center-api",
        });
        return { success: true, data: payload };
      } catch (fallbackErr) {
        // 3. Both verifications failed: return invalid
        if (fallbackErr instanceof errors.JWTExpired) {
          return { success: false, code: "expired" };
        }
        if (!(err instanceof errors.JWSSignatureVerificationFailed)) {
          console.error("[verifySession] ES256 verification error:", err);
        }
        console.error("[verifySession] HS256 fallback verification failed:", fallbackErr);
        return { success: false, code: "invalid" };
      }
    }
  }
  try {
    const { payload } = await jwtVerify<SesiPayload>(token, hs256Secret(), { algorithms: ["HS256"], audience: "akal-center-api" });
    return { success: true, data: payload };
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      return { success: false, code: "expired" };
    }
    console.error("[verifySession] verification failed:", err);
    return { success: false, code: "internal" };
  }
});
