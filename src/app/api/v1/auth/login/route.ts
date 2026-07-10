import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword, hashPassword } from "@/lib/auth-password";
import { signSession } from "@/lib/auth";
import {
  SESSION_COOKIE_NAME,
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
    const rl = await checkRateLimit(`login:${ip}`, 5, 15_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Email atau kata sandi tidak valid", 400);
    }

    const { password, redirectTo: customRedirect, portalIntent } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (rows.length === 0) {
      await logAuthEvent("auth.login.failed", {
        email,
        reason: "user_not_found",
        method: "password",
        ip,
        portal: portalIntent || "unknown",
      });
      return apiError("Email atau kata sandi salah", 401);
    }

    const user = rows[0];
    const sessionRole = roleToSessionRole(user.role);

    if (portalIntent && !INTENT_PORTAL[portalIntent].includes(sessionRole)) {
      await logAuthEvent("auth.intent_mismatch", {
        userId: user.id,
        email: user.email,
        portal: portalIntent,
        reason: `db_role=${sessionRole}`,
      });
      const expected = sessionRole === "murid" || sessionRole === "orang_tua" ? "siswa" : "guru";
      return apiError(
        "INTENT_MISMATCH",
        `Akun ini untuk portal ${expected}, bukan portal yang dipilih. Gunakan portal yang sesuai.`,
        { expected, actual: sessionRole },
        403,
      );
    }

    if (!user.passwordHash) {
      await logAuthEvent("auth.login.failed", {
        userId: user.id,
        email: user.email,
        reason: "no_password_set",
        method: "password",
        ip,
        portal: portalIntent || "unknown",
      });
      return apiError("NO_PASSWORD_SET", "Akun ini belum punya kata sandi. Masuk lewat Google dulu lalu atur kata sandi di halaman profil.", { email }, 401);
    }

    const result = await verifyPassword(password, user.passwordHash);
    if (!result.valid) {
      const failReason = result.error || "bad_password";
      await logAuthEvent("auth.login.failed", {
        userId: user.id,
        email: user.email,
        reason: failReason,
        method: "password",
        ip,
        portal: portalIntent || "unknown",
      });
      if (result.error) {
        return apiError(result.error, 500);
      }
      return apiError("Email atau kata sandi salah", 401);
    }

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
    const redirectTo = (customRedirect && !customRedirect.startsWith("//")) ? customRedirect : defaultRedirect;
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, nama: user.nama, role: user.role, email: user.email },
      redirect: redirectTo,
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    response.cookies.set("akal_refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth/refresh",
      maxAge: 30 * 24 * 60 * 60,
    });
    await logAuthEvent("auth.login.success", {
      userId: user.id,
      email: user.email,
      method: "password",
      ip,
      portal: portalIntent || "unknown",
    });
    return response;
  } catch (e) {
    console.error("Login error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
