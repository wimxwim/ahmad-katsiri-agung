import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword } from "@/lib/auth-password";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiSuccess } from "@/lib/api-response";
import { logAuthEvent } from "@/lib/auth-audit";

const ResetPasswordSchema = z.object({
  token: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`reset-password:${ip}`, 5, 300_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);
    }

    const { token, newPassword } = parsed.data;

    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .limit(1);

    if (!resetToken) {
      return apiError("Token reset tidak valid atau sudah digunakan.", 400);
    }

    if (new Date(resetToken.expiresAt) < new Date()) {
      return apiError("Token reset sudah kadaluarsa. Silakan minta reset password baru.", 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null })
        .where(eq(users.id, resetToken.userId));

      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, resetToken.id));
    });

    logAuthEvent("auth.password.reset", {
      userId: resetToken.userId,
      ip,
    }).catch(err => console.error("logAuthEvent failed:", err));

    return apiSuccess({ message: "Password berhasil direset. Silakan login dengan password baru." });
  } catch (e) {
    console.error("Reset password error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}