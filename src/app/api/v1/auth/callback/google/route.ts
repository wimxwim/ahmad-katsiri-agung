import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, or } from "drizzle-orm";
import { exchangeCodeAndGetProfile } from "@/lib/google-oauth";
import { signSession } from "@/lib/auth";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  ROLE_HOME_PATHS,
  INTENT_PORTAL,
  roleToSessionRole,
  type SesiRole,
} from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { logAuthEvent } from "@/lib/auth-audit";

const TEMP_COOKIES = ["akal_google_state", "akal_google_portal", "akal_google_return"];

function clearTempCookies(response: NextResponse) {
  for (const name of TEMP_COOKIES) {
    response.cookies.delete(name);
  }
}

/**
 * GET /api/v1/auth/callback/google
 *
 * Tukar `code` dari Google menjadi:
 *   - login user yang sudah ada (by googleId atau email)
 *   - link googleId ke user existing (login pertama via Google)
 *
 * Setelah login sukses → redirect ke role-home (atau returnTo jika valid).
 */
export async function GET(request: NextRequest) {
  // Di development, selalu pakai origin dari request supaya OAuth redirect tidak
  // kabur ke domain production (NEXT_PUBLIC_APP_URL) saat tes di localhost.
  const isDev = process.env.NODE_ENV !== "production";
  const redirectBase = (isDev ? request.nextUrl.origin : (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin)).replace(/\/$/, "");

  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`google-callback:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.redirect(`${redirectBase}/masuk?error=terlalu_banyak_percobaan`, 302);
    }

    const params = request.nextUrl.searchParams;
    const code = params.get("code");
    const state = params.get("state");
    const errorParam = params.get("error");

    const cookieStore = request.cookies;
    const expectedState = cookieStore.get("akal_google_state")?.value;
    const portal = cookieStore.get("akal_google_portal")?.value as "guru" | "siswa" | undefined;
    const returnTo = cookieStore.get("akal_google_return")?.value;

    if (errorParam) {
      await logAuthEvent("auth.login.failed", { ip, reason: `google:${errorParam}`, method: "google", portal: portal || "unknown" });
      const resp = NextResponse.redirect(`${redirectBase}/masuk?error=login_google_dibatalkan`, 302);
      clearTempCookies(resp);
      return resp;
    }

    if (!code || !state || !expectedState || state !== expectedState) {
      await logAuthEvent("auth.login.failed", { ip, reason: "google:state_mismatch", method: "google", portal: portal || "unknown" });
      const resp = NextResponse.redirect(`${redirectBase}/masuk?error=sesi_google_tidak_valid`, 302);
      clearTempCookies(resp);
      return resp;
    }

    let profile;
    try {
      profile = await exchangeCodeAndGetProfile(code);
    } catch (e) {
      console.error("Google exchange error:", e);
      await logAuthEvent("auth.login.failed", { ip, reason: "google:exchange_failed", method: "google", portal: portal || "unknown" });
      const resp = NextResponse.redirect(`${redirectBase}/masuk?error=tidak_terhubung_google`, 302);
      clearTempCookies(resp);
      return resp;
    }

    if (!profile.emailVerified) {
      await logAuthEvent("auth.login.failed", { ip, reason: "google:email_unverified", method: "google", portal: portal || "unknown" });
      const resp = NextResponse.redirect(`${redirectBase}/masuk?error=email_google_belum_diverifikasi`, 302);
      clearTempCookies(resp);
      return resp;
    }

    const matches = await db
      .select()
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          or(eq(users.googleId, profile.googleId), eq(users.email, profile.email)),
        ),
      )
      .limit(1);

    if (matches.length === 0) {
      const newRole: SesiRole = portal === "guru" ? "guru" : "murid";
      const dbRole = newRole === "guru" ? "GURU" : "SISWA";
      const sessionRole = newRole;

      if (portal && !INTENT_PORTAL[portal].includes(sessionRole)) {
        await logAuthEvent("auth.intent_mismatch", {
          email: profile.email,
          portal,
          reason: "google_signup_first_time_no_user_created",
        });
        const resp = NextResponse.redirect(
          `${redirectBase}/masuk/role-mismatch?expected=${portal}&actual=${sessionRole}&reason=google_signup_first_time`,
          302,
        );
        clearTempCookies(resp);
        return resp;
      }

      const inserted = await db
        .insert(users)
        .values({
          role: dbRole,
          nama: profile.nama,
          email: profile.email,
          googleId: profile.googleId,
        })
        .returning({ id: users.id, role: users.role, email: users.email, nama: users.nama });

      const user = inserted[0];

      const token = await signSession({
        userId: user.id,
        role: sessionRole,
        nama: user.nama,
        email: user.email,
      });
      const { createRefreshToken } = await import("@/lib/refresh-token");
      const refreshToken = await createRefreshToken(user.id);
      const target = (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//"))
        ? returnTo
        : ROLE_HOME_PATHS[sessionRole];
      await logAuthEvent("auth.register.success", { userId: user.id, email: user.email, method: "google", portal: portal || "unknown", ip });
      await logAuthEvent("auth.login.success", { userId: user.id, email: user.email, method: "google", portal: portal || "unknown", ip });
      await logAuthEvent("auth.google.linked", { userId: user.id, email: user.email, ip });

      const resp = NextResponse.redirect(`${redirectBase}${target}`, 302);
      clearTempCookies(resp);
      resp.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION_SECONDS,
      });
      resp.cookies.set("akal_refresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth/refresh",
        maxAge: 30 * 24 * 60 * 60,
      });
      return resp;
    }

    const user = matches[0];
    const sessionRole = roleToSessionRole(user.role);

    if (portal && !INTENT_PORTAL[portal].includes(sessionRole)) {
      await logAuthEvent("auth.intent_mismatch", {
        userId: user.id,
        email: user.email,
        portal,
        reason: "google_existing_role_mismatch",
      });
      const resp = NextResponse.redirect(
        `${redirectBase}/masuk/role-mismatch?expected=${portal}&actual=${sessionRole}&reason=google_existing`,
        302,
      );
      clearTempCookies(resp);
      return resp;
    }

    if (!user.googleId) {
      await db
        .update(users)
        .set({ googleId: profile.googleId, updatedAt: new Date() })
        .where(eq(users.id, user.id));
      await logAuthEvent("auth.google.linked", { userId: user.id, email: user.email, ip });
    } else if (user.googleId !== profile.googleId) {
      await logAuthEvent("auth.login.failed", {
        userId: user.id,
        email: user.email,
        reason: "google:id_mismatch_with_existing_link",
        method: "google",
        ip,
      });
      const resp = NextResponse.redirect(`${redirectBase}/masuk?error=akun_google_tidak_cocok`, 302);
      clearTempCookies(resp);
      return resp;
    }

    const token = await signSession({
      userId: user.id,
      role: sessionRole,
      nama: user.nama,
      email: user.email,
    });
    const { createRefreshToken } = await import("@/lib/refresh-token");
    const refreshToken = await createRefreshToken(user.id);
    const target = (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//"))
      ? returnTo
      : ROLE_HOME_PATHS[sessionRole];
    await logAuthEvent("auth.login.success", { userId: user.id, email: user.email, method: "google", portal: portal || "unknown", ip });

    const resp = NextResponse.redirect(`${redirectBase}${target}`, 302);
    clearTempCookies(resp);
    resp.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    resp.cookies.set("akal_refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth/refresh",
      maxAge: 30 * 24 * 60 * 60,
    });
    return resp;
  } catch (e) {
    console.error("Google callback fatal error:", e);
    const isDbError =
      e instanceof Error &&
      (e.message.includes("ECONNREFUSED") ||
        e.message.includes("database") ||
        e.message.includes("connection") ||
        /connect\s+ECONNREFUSED/i.test(e.message));
    const errorCode = isDbError ? "db_tidak_terhubung" : "login_google_gagal";
    const resp = NextResponse.redirect(`${redirectBase}/masuk?error=${errorCode}`, 302);
    clearTempCookies(resp);
    return resp;
  }
}
