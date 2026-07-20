import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiSuccess } from "@/lib/api-response";
import { logAuthEvent } from "@/lib/auth-audit";

const ForgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

const RESET_TOKEN_EXPIRY_MINUTES = 60;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://akalcenter.my.id";

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`forgot-password:${ip}`, 3, 300_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Email tidak valid", 400);
    }

    const email = parsed.data.email.toLowerCase();

    const [user] = await db
      .select({ id: users.id, nama: users.nama, email: users.email, passwordHash: users.passwordHash })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (!user || !user.passwordHash) {
      await logAuthEvent("auth.forgot_password.attempt", {
        email,
        reason: user ? "no_password_set" : "user_not_found",
        ip,
      });
      return apiSuccess({ message: "Jika email terdaftar, link reset password telah dikirim." });
    }

    const token = crypto.randomUUID();
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000),
    });

    const resetLink = `${BASE_URL}/reset-password?token=${token}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "AKAL Center <noreply@akalcenter.my.id>",
            to: [user.email],
            subject: "Reset Password — AKAL Center",
            html: `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;padding:24px;background:#f2fcf7;"><div style="max-width:480px;margin:0 auto;background:#fff;border-radius:24px;padding:32px;border:1px solid rgba(27,107,69,0.15);"><h2 style="color:#005231;font-family:'Bricolage Grotesque',sans-serif;">Reset Password</h2><p>Halo <strong>${user.nama}</strong>,</p><p>Kami menerima permintaan reset password untuk akun Anda di AKAL Center.</p><p style="text-align:center;margin:24px 0;"><a href="${resetLink}" style="display:inline-block;background:#005231;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600;">Reset Password</a></p><p style="font-size:12px;color:#666;">Link ini berlaku selama ${RESET_TOKEN_EXPIRY_MINUTES} menit. Jika Anda tidak meminta reset password, abaikan email ini.</p></div></body></html>`,
          }),
        });
        emailSent = res.ok;
        if (!res.ok) {
          const errBody = await res.text();
          console.error("Resend API error:", errBody);
        }
      } catch (e) {
        console.error("Resend send error:", e);
      }
    }

    await logAuthEvent("auth.forgot_password.requested", {
      userId: user.id,
      email: user.email,
      ip,
      emailSent,
    });

    return apiSuccess({
      message: "Jika email terdaftar, link reset password telah dikirim.",
      ...(emailSent ? {} : { devResetLink: resetLink }),
    });
  } catch (e) {
    console.error("Forgot password error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}