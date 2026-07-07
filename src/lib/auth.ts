import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomUUID } from "crypto";
import type { SesiPayload } from "./session";
import {
  getSigningKey,
  getVerifyingKey,
  hs256Secret,
  hasES256Keys,
} from "./auth-keys";

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

export async function verifyQuizToken(token: string): Promise<QuizTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, hs256Secret());
    return payload as QuizTokenPayload;
  } catch {
    return null;
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

export async function verifySession(token: string): Promise<SesiPayload | null> {
  if (hasES256Keys()) {
    try {
      const key = await getVerifyingKey();
      const { payload } = await jwtVerify(token, key);
      return payload as SesiPayload;
    } catch {
      // fall through to HS256 fallback
    }
  }
  try {
    const { payload } = await jwtVerify(token, hs256Secret());
    return payload as SesiPayload;
  } catch {
    return null;
  }
}
