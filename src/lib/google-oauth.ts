import { google } from "googleapis";

/**
 * Google OAuth 2.0 client untuk flow login/signup AKAL Center.
 *
 * Pakai `googleapis` (sudah ada di package.json — tidak menambah library baru).
 *
 * Scope yang diminta HANYA `openid email profile` — minimum yang dibutuhkan untuk
 * identifikasi user. Tidak meminta scope sensitif lain (drive, calendar, dll).
 *
 * Flow:
 *   1. GET /api/v1/auth/google?portal=guru → generate state, simpan ke cookie, redirect ke Google
 *   2. GET /api/v1/auth/callback/google?code=...&state=... → tukar code jadi token, baca profil
 *   3. Handler bisnis (login vs register) memutuskan langkah berikutnya
 */

const SCOPES = ["openid", "email", "profile"];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} belum di-set di environment`);
  }
  return value;
}

function buildRedirectUri(): string {
  const explicit = process.env.GOOGLE_REDIRECT_URI;
  if (explicit) return explicit;
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/v1/auth/callback/google`;
}

export function getOAuthClient() {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri = buildRedirectUri();

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function buildAuthUrl(state: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state,
    prompt: "consent",
    include_granted_scopes: true,
  });
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  nama: string;
  picture?: string;
}

export async function exchangeCodeAndGetProfile(code: string): Promise<GoogleProfile> {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) {
    throw new Error("Google tidak mengembalikan id_token");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: requireEnv("GOOGLE_CLIENT_ID"),
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Payload id_token kosong");
  }
  if (!payload.sub || !payload.email) {
    throw new Error("Profile Google tidak memiliki sub/email");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: Boolean(payload.email_verified),
    nama: payload.name || payload.email.split("@")[0],
    picture: payload.picture || undefined,
  };
}
