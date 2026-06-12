import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
};

export interface QuizTokenPayload extends JWTPayload {
  nama: string;
  kelas: string;
}

export async function signQuizToken(nama: string, kelas: string): Promise<string> {
  return new SignJWT({ nama, kelas })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(getSecret());
}

export async function verifyQuizToken(token: string): Promise<QuizTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as QuizTokenPayload;
  } catch {
    return null;
  }
}
