import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth-password";
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

const RegisterSchema = z.object({
  nama: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["SISWA", "GURU", "ASISTEN_GURU", "ORANG_TUA"]).optional().default("SISWA"),
  kelas: z.string().max(10).optional(),
  noAbsen: z.string().max(5).optional(),
  nis: z.string().max(30).optional(),
  portal: z.enum(["guru", "siswa"]).optional(),
  redirectTo: z.string().startsWith("/").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`register:${ip}`, 3, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const { nama, password, kelas, noAbsen, nis, role, portal: portalRaw, redirectTo } = parsed.data;
    const portal = portalRaw ?? "siswa";
    const email = parsed.data.email.toLowerCase();

    const allowedRoles = INTENT_PORTAL[portal];
    const sessionRoleOfRequested = roleToSessionRole(role);
    if (!allowedRoles.includes(sessionRoleOfRequested)) {
      await logAuthEvent("auth.intent_mismatch", { email, portal, reason: `register_role=${role}` });
      return apiError(`Portal ${portal} tidak menerima role ${role}.`, 400);
    }

    const existing = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existing.length > 0) {
      await logAuthEvent("auth.register.duplicate", { email, reason: "duplicate", ip });
      return apiError("Email sudah terdaftar. Silakan masuk atau gunakan email lain.", 409);
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        nama,
        email,
        passwordHash,
        role,
        kelas: kelas || null,
        noAbsen: noAbsen || null,
        nis: nis || null,
      })
      .returning({ id: users.id, nama: users.nama, role: users.role, email: users.email });

    const sessionRole = roleToSessionRole(user.role);
    const token = await signSession({
      userId: user.id,
      role: sessionRole,
      nama: user.nama,
      email: user.email,
    });

    const { createRefreshToken } = await import("@/lib/refresh-token");
    const refreshToken = await createRefreshToken(user.id);

    const target = (redirectTo && !redirectTo.startsWith("//"))
      ? redirectTo
      : ROLE_HOME_PATHS[sessionRole];

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, nama: user.nama, role: user.role, email: user.email },
      redirect: target,
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
    await logAuthEvent("auth.register.success", {
      userId: user.id,
      email: user.email,
      method: "password",
      ip,
      portal: portal || "unknown",
    });
    await logAuthEvent("auth.login.success", {
      userId: user.id,
      email: user.email,
      method: "password",
      ip,
      portal: portal || "unknown",
    });
    return response;
  } catch (e) {
    console.error("Register error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
