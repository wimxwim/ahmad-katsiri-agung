import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth-password";
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
import { users, tokenBalances, guruInviteCodes } from "@/lib/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { logAuthEvent } from "@/lib/auth-audit";
import { appendEvent } from "@/lib/event-store";
import { INITIAL_TOKEN_BALANCE } from "@/lib/token-constants";

const RegisterSchema = z.object({
  nama: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter")
    .refine((val) => /[A-Z]/.test(val), "Password harus mengandung minimal 1 huruf besar")
    .refine((val) => /[a-z]/.test(val), "Password harus mengandung minimal 1 huruf kecil")
    .refine((val) => /[0-9]/.test(val), "Password harus mengandung minimal 1 angka"),
  role: z.enum(["SISWA", "ORANG_TUA", "GURU", "ASISTEN_GURU", "OWNER", "ADMIN_SEKOLAH"]).optional().default("SISWA"),
  kelas: z.string().max(10).optional(),
  noAbsen: z.string().max(5).optional(),
  nis: z.string().max(30).optional(),
  kodeUndangan: z.string().min(4).max(24).optional(),
  portal: z.enum(["guru", "siswa"]).optional(),
  redirectTo: z.string().refine((v) => v.startsWith("/") && !v.startsWith("//") && !v.includes("://")).optional(),
});

class InviteError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "InviteError";
    this.code = code;
    this.status = status;
  }
}

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

    const { nama, password, kelas, noAbsen, nis, role, portal: portalRaw, redirectTo, kodeUndangan } = parsed.data;
    const portal = portalRaw ?? "siswa";
    const email = parsed.data.email.toLowerCase();

    const requireInvite = process.env.GURU_REGISTER_REQUIRE_INVITE === "1" && role === "GURU";

    const allowedRoles = INTENT_PORTAL[portal];
    const sessionRoleOfRequested = roleToSessionRole(role);
    if (!allowedRoles.includes(sessionRoleOfRequested)) {
      logAuthEvent("auth.intent_mismatch", { email, portal, reason: `register_role=${role}` }).catch(err => console.error("logAuthEvent failed:", err));
      return apiError(`Portal ${portal} tidak menerima role ${role}.`, 400);
    }

    const existing = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existing.length > 0) {
      logAuthEvent("auth.register.duplicate", { email, reason: "duplicate", ip }).catch(err => console.error("logAuthEvent failed:", err));
      return apiError("Email sudah terdaftar. Silakan masuk atau gunakan email lain.", 409);
    }

    if (requireInvite && !kodeUndangan) {
      logAuthEvent("auth.register.invite_required", { email, ip }).catch(err => console.error("logAuthEvent failed:", err));
      return apiError("INVITE_REQUIRED", "Guru harus memiliki kode undangan", undefined, 403);
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db.transaction(async (tx) => {
      let isFoundingMember = false;

      if (role === "GURU" && kodeUndangan) {
        // Read-only probe first to distinguish error types
        const probe = await tx
          .select()
          .from(guruInviteCodes)
          .where(eq(guruInviteCodes.code, kodeUndangan))
          .limit(1);

        if (probe.length === 0) throw new InviteError("INVALID_CODE", "Kode undangan tidak ditemukan", 404);
        if (probe[0].expiresAt && probe[0].expiresAt < new Date()) throw new InviteError("CODE_EXPIRED", "Kode undangan sudah kedaluwarsa", 400);

        // First use of the code = founding member unlock
        isFoundingMember = probe[0].usedCount === 0;

        // Atomic consume - conditional UPDATE inside the same transaction as user insert
        const consumed = await tx.execute(
          sql`UPDATE guru_invite_codes SET used_count = used_count + 1, updated_at = now()
              WHERE code = ${kodeUndangan} AND used_count < max_uses
                AND (expires_at IS NULL OR expires_at > now())
              RETURNING id, issuing_guru_id, trial_days`
        );

        if (consumed.rowCount === 0) throw new InviteError("CODE_EXHAUSTED", "Kode undangan sudah digunakan", 422);
      }

      const [newUser] = await tx
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

      await tx.insert(tokenBalances).values({ userId: newUser.id, balance: INITIAL_TOKEN_BALANCE });

      if (isFoundingMember) {
        await tx
          .update(tokenBalances)
          .set({ isUnlocked: true })
          .where(eq(tokenBalances.userId, newUser.id));
      }

      return [newUser];
    });

    appendEvent("token:system", "token.granted", {
      userId: user.id,
      amount: INITIAL_TOKEN_BALANCE,
      reason: "new_user_bonus",
      at: new Date().toISOString(),
    }).catch(err => console.error("appendEvent failed:", err));

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
    logAuthEvent("auth.register.success", {
      userId: user.id,
      email: user.email,
      method: "password",
      ip,
      portal: portal || "unknown",
    }).catch(err => console.error("logAuthEvent failed:", err));
    logAuthEvent("auth.login.success", {
      userId: user.id,
      email: user.email,
      method: "password",
      ip,
      portal: portal || "unknown",
    }).catch(err => console.error("logAuthEvent failed:", err));
    return response;
  } catch (e) {
    if (e instanceof InviteError) {
      return apiError(e.code, e.message, undefined, e.status);
    }
    console.error("Register error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
