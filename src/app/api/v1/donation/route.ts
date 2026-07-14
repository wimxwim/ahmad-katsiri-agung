import { NextRequest } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { recordDonation } from "@/lib/token-service";
import { sendDonationNotification } from "@/lib/telegram-notif";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    await recordDonation(session.userId);

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
      message: "Terima kasih atas donasi Anda. Semoga menjadi amal jariyah.",
      qrisImageUrl: "/api/v1/qris",
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Donation error:", e);
    return apiError("INTERNAL_ERROR", "Gagal mencatat donasi", undefined, 500);
  }
}