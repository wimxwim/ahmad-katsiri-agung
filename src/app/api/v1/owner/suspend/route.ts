import { NextRequest } from "next/server";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiSuccess } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendSuspendNotification } from "@/lib/telegram-notif";
import { waitUntil } from "@vercel/functions";
import { appendEvent } from "@/lib/event-store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SuspendSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireOwner(request);
    const body = SuspendSchema.parse(await request.json());

    const [user] = await db
      .select({ id: users.id, nama: users.nama, email: users.email, suspendedAt: users.suspendedAt })
      .from(users)
      .where(eq(users.id, body.userId))
      .limit(1);

    if (!user) return apiError("NOT_FOUND", "User tidak ditemukan", undefined, 404);
    if (user.suspendedAt) return apiError("CONFLICT", "User sudah disuspend", undefined, 409);

    await db
      .update(users)
      .set({ suspendedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, body.userId));

    await appendEvent(`owner:${session.userId}`, "user.suspended", {
      userId: body.userId,
      nama: user.nama,
      email: user.email,
      reason: body.reason,
      suspendedBy: session.userId,
    });

    waitUntil(
      sendSuspendNotification({
        userId: body.userId,
        nama: user.nama,
        email: user.email,
        reason: body.reason,
      }).catch((e) => console.error("Telegram suspend notif gagal:", e)),
    );

    return apiSuccess({
      userId: body.userId,
      nama: user.nama,
      suspendedAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof z.ZodError) return apiError("VALIDATION_ERROR", "Data tidak valid", e.issues, 400);
    console.error("Suspend error:", e);
    return apiError("INTERNAL_ERROR", "Gagal suspend user", undefined, 500);
  }
}