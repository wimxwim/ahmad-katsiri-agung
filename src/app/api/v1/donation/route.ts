import { NextRequest } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { requireNotSuspended } from "@/lib/token-service";
import { apiError, apiSuccess, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { recordDonation } from "@/lib/token-service";
import { sendDonationNotification } from "@/lib/telegram-notif";
import { db } from "@/lib/db";
import { users, tokenTransactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`donation:${ip}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const session = await requireGuru(request);
    await requireNotSuspended(session.userId);

    const idempotencyKey = request.headers.get("x-idempotency-key");
    if (idempotencyKey) {
      const [existing] = await db
        .select({ id: tokenTransactions.id })
        .from(tokenTransactions)
        .where(
          and(
            eq(tokenTransactions.userId, session.userId),
            eq(tokenTransactions.type, "DONATION"),
            eq(tokenTransactions.referenceId, idempotencyKey),
          ),
        )
        .limit(1);
      if (existing) {
        return apiSuccess({
          message: "Dukungan sudah tercatat. Terima kasih!",
          qrisImageUrl: "/api/v1/qris",
          idempotent: true,
        });
      }
    }

    await recordDonation(session.userId, idempotencyKey ? { referenceId: idempotencyKey } : undefined);

    const guru = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { nama: true, email: true, lastActiveAt: true },
    });

    await sendDonationNotification({
      userId: session.userId,
      nama: guru?.nama ?? "Guru",
      email: guru?.email ?? session.email ?? "",
      loginTerakhir: guru?.lastActiveAt
        ? new Date(guru.lastActiveAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
        : undefined,
    }).catch((e) => console.error("Telegram donasi notif gagal:", e));

    return apiSuccess({
      message: "Terima kasih! Dukungan Anda membantu kami terus berinovasi.",
      qrisImageUrl: "/api/v1/qris",
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Donation error:", e);
    return apiError("INTERNAL_ERROR", "Gagal mencatat donasi", undefined, 500);
  }
}