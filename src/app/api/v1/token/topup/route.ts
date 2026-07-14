import { NextRequest } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { MIN_TOPUP, MAX_TOPUP, MAX_TOPUP_PER_DAY } from "@/lib/token-constants";
import { db } from "@/lib/db";
import { tokenTransactions } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const TopupRequestSchema = z.object({
  amount: z.number().int().min(MIN_TOPUP).max(MAX_TOPUP),
});

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);
    const body = TopupRequestSchema.parse(await request.json());

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tokenTransactions)
      .where(
        and(
          eq(tokenTransactions.userId, session.userId),
          eq(tokenTransactions.type, "TOPUP"),
          gte(tokenTransactions.createdAt, todayStart),
        ),
      );

    if ((countResult?.count ?? 0) >= MAX_TOPUP_PER_DAY) {
      return apiError(
        "RATE_LIMITED",
        `Maksimal ${MAX_TOPUP_PER_DAY}x top-up per hari. Coba lagi besok.`,
        undefined,
        429,
      );
    }

    return apiSuccess({
      amount: body.amount,
      qrisImageUrl: "/api/v1/qris",
      instructions: [
        "Scan QRIS GoPay di bawah menggunakan aplikasi GoPay/e-wallet kamu",
        "Pastikan nominal sesuai: Rp" + body.amount.toLocaleString("id-ID"),
        "Setelah transfer berhasil, upload bukti pembayaran",
        "Saldo akan otomatis bertambah setelah bukti terupload",
      ],
      nextStep: "upload_bukti",
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof z.ZodError) return apiError("VALIDATION_ERROR", "Nominal tidak valid", e.issues, 400);
    console.error("Topup request error:", e);
    return apiError("INTERNAL_ERROR", "Gagal membuat permintaan top-up", undefined, 500);
  }
}