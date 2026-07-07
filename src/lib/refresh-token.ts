import "server-only";
import { db } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema";
import { eq, and, isNull, lt, gt } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "crypto";

const REFRESH_TOKEN_BYTES = 48;
const REFRESH_TOKEN_EXPIRY_SECONDS = 30 * 24 * 60 * 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
}

export async function createRefreshToken(userId: string): Promise<string> {
  const family = randomUUID();
  const token = generateRefreshToken();
  const tokenHash = hashToken(token);

  await db.insert(refreshTokens).values({
    userId,
    family,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000),
  });

  return `${family}:${token}`;
}

export async function rotateRefreshToken(
  rawToken: string,
): Promise<{ accessToken: string } | null> {
  const colonIdx = rawToken.indexOf(":");
  if (colonIdx === -1) return null;
  const family = rawToken.slice(0, colonIdx);
  const token = rawToken.slice(colonIdx + 1);
  const tokenHash = hashToken(token);

  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.family, family),
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    // Possible token reuse — revoke all tokens in this family
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.family, family));
    return null;
  }

  // Revoke current token
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, row.id));

  // Issue new token in same family
  const newToken = generateRefreshToken();
  const newHash = hashToken(newToken);

  await db.insert(refreshTokens).values({
    userId: row.userId,
    family,
    tokenHash: newHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000),
  });

  const { signSession } = await import("@/lib/auth");
  const { users } = await import("@/lib/db/schema");
  const { eq: eqD } = await import("drizzle-orm");

  const [userRow] = await db
    .select()
    .from(users)
    .where(eqD(users.id, row.userId))
    .limit(1);

  if (!userRow) return null;

  const accessToken = await signSession({
    userId: userRow.id,
    role: roleToSesiRole(userRow.role),
    nama: userRow.nama,
    email: userRow.email,
  });

  return { accessToken };
}

function roleToSesiRole(role: string): "murid" | "guru" | "owner" | "admin_sekolah" | "orang_tua" {
  if (role === "GURU" || role === "ASISTEN_GURU") return "guru";
  if (role === "OWNER") return "owner";
  if (role === "ADMIN_SEKOLAH") return "admin_sekolah";
  if (role === "ORANG_TUA") return "orang_tua";
  return "murid";
}

export async function revokeUserRefreshTokens(userId: string, family?: string): Promise<void> {
  const conditions = [eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)];
  if (family) conditions.push(eq(refreshTokens.family, family));
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(...conditions));
}

export async function cleanupExpiredRefreshTokens(): Promise<void> {
  await db
    .delete(refreshTokens)
    .where(lt(refreshTokens.expiresAt, new Date()));
}
