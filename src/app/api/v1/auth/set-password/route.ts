import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth-password";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { logAuthEvent } from "@/lib/auth-audit";

const SetPasswordSchema = z.object({
  newPassword: z.string().min(8).max(128),
});

/**
 * POST /api/v1/auth/set-password
 *
 * Set password untuk user yang sebelumnya signup via Google (passwordHash null).
 * Memerlukan session valid (cookies SESSION_COOKIE_NAME).
 *
 * Setelah set password, user bisa login dengan email + password dari form biasa.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`set-password:${ip}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return apiError("Sesi tidak ditemukan. Masuk dulu sebelum mengatur kata sandi.", 401);
    }
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success) {
      return apiError("Sesi tidak valid", 401);
    }
    const session = _ar.data;

    const body = await request.json();
    const parsed = SetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Kata sandi tidak valid", 400);
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    const [updated] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, session.userId!))
      .returning({ id: users.id });

    if (!updated) {
      return apiError("User tidak ditemukan", 404);
    }

    await logAuthEvent("auth.password.set", {
      userId: session.userId,
      email: session.email,
      ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Set password error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
