import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { verifyPassword, hashPassword } from "@/lib/auth-password";
import { signSession } from "@/lib/auth";
import {
  SESSION_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  ROLE_HOME_PATHS,
  INTENT_PORTAL,
  roleToSessionRole,
} from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { logAuthEvent } from "@/lib/auth-audit";

const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
  portalIntent: z.enum(["guru", "siswa"]).optional(),
  redirectTo: z
    .string()
    .refine((v) => v.startsWith("/") && !v.startsWith("//") && !v.includes("://"))
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`login:${ip}`, 3, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Email atau kata sandi tidak valid", 400);
    }

    const { password, redirectTo: customRedirect, portalIntent } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const emailRl = await checkRateLimit(`login-email:${email}`, 5, 900_000);
    if (!emailRl.allowed) return apiRateLimit(emailRl.retryAfter);

    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (rows.length === 0) {
      await bcrypt.hash("akal-dummy-timing", 10);
      logAuthEvent("auth.login.failed", {
        email,
        reason: "user_not_found",
        method: "password",
        ip,
        portal: portalIntent || "unknown",
      }).catch(err => console.error("logAuthEvent failed:", err));
      return apiError("Email atau kata sandi salah", 401);
    }

    const user = rows[0];
    const sessionRole = roleToSessionRole(user.role);

    if (portalIntent && !INTENT_PORTAL[portalIntent].includes(sessionRole)) {
      logAuthEvent("auth.intent_mismatch", {
        userId: user.id,
        email: user.email,
        portal: portalIntent,
        reason: `db_role=${sessionRole}`,
      }).catch(err => console.error("logAuthEvent failed:", err));
      const expected = sessionRole === "murid" || sessionRole === "orang_tua" ? "siswa" : "guru";
      return apiError(
        "INTENT_MISMATCH",
        `Akun ini untuk portal ${expected}, bukan portal yang dipilih. Gunakan portal yang sesuai.`,
        { expected, actual: sessionRole },
        403,
      );
    }

    if (!user.passwordHash) {
      logAuthEvent("auth.login.failed", {
        userId: user.id,
        email: user.email,
        reason: "no_password_set",
        method: "password",
        ip,
        portal: portalIntent || "unknown",
      }).catch(err => console.error("logAuthEvent failed:", err));
      return apiError("NO_PASSWORD_SET", "Akun ini belum punya kata sandi. Masuk lewat Google dulu lalu atur kata sandi di halaman profil.", { email }, 401);
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      return apiError("Akun terkunci karena terlalu banyak percobaan login gagal. Coba lagi dalam " + remainingMinutes + " menit.", 423);
    }

    const result = await verifyPassword(password, user.passwordHash);
    if (!result.valid) {
      const failReason = result.error || "bad_password";
      logAuthEvent("auth.login.failed", {
        userId: user.id,
        email: user.email,
        reason: failReason,
        method: "password",
        ip,
        portal: portalIntent || "unknown",
      }).catch(err => console.error("logAuthEvent failed:", err));
      // Increment failed attempts and lock if threshold reached
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      const lockedUntil = newAttempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000)
        : null;
      await db.update(users)
        .set({
          failedLoginAttempts: newAttempts,
          lockedUntil: lockedUntil,
        })
        .where(eq(users.id, user.id));
      return apiError("Email atau kata sandi salah", 401);
    }

    // Reset failed attempts
    await db.update(users)
      .set({ failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(users.id, user.id));

    if (result.needsRehash) {
      const newHash = await hashPassword(password);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
    }

    const token = await signSession({
      userId: user.id,
      role: sessionRole,
      nama: user.nama,
      email: user.email,
    });

    const { createRefreshToken } = await import("@/lib/refresh-token");
    const refreshToken = await createRefreshToken(user.id);

    const defaultRedirect = ROLE_HOME_PATHS[sessionRole];
    let redirectTo = (customRedirect && !customRedirect.startsWith("//")) ? customRedirect : defaultRedirect;

    // Validate redirectTo matches the role — prevent cross-role redirect
    const roleHome = ROLE_HOME_PATHS[sessionRole];
    if (redirectTo && !redirectTo.startsWith(roleHome)) {
      const otherRolePrefixes = Object.entries(ROLE_HOME_PATHS)
        .filter(([role]) => role !== sessionRole)
        .map(([, path]) => path);
      if (otherRolePrefixes.some(prefix => redirectTo.startsWith(prefix))) {
        redirectTo = defaultRedirect;
      }
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, nama: user.nama, role: user.role, email: user.email },
      redirect: redirectTo,
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/v1/auth/refresh",
      maxAge: 30 * 24 * 60 * 60,
    });
    logAuthEvent("auth.login.success", {
      userId: user.id,
      email: user.email,
      method: "password",
      ip,
      portal: portalIntent || "unknown",
    }).catch(err => console.error("logAuthEvent failed:", err));
    return response;
  } catch (e) {
    console.error("Login error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
