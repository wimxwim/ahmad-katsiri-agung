import { NextRequest, NextResponse } from "next/server";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { materiSharing, materiPublished, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireOwner(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`owner-sharing-approve:${ip}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json().catch(() => null);
    if (!body || typeof body.materiPublishedId !== "string" || !body.materiPublishedId) {
      return apiError("materiPublishedId wajib diisi", 400);
    }

    const { materiPublishedId } = body;

    const [sharing] = await db
      .select()
      .from(materiSharing)
      .where(eq(materiSharing.materiPublishedId, materiPublishedId))
      .limit(1);

    if (!sharing) return apiError("Data sharing tidak ditemukan", 404);
    if (sharing.visibility !== "PUBLIK") {
      return apiError("Hanya materi dengan visibility PUBLIK yang bisa di-approve", 400);
    }
    if (sharing.approvalStatus !== "PENDING") {
      return apiError(`Status approval sudah ${sharing.approvalStatus}`, 409);
    }

    await db
      .update(materiSharing)
      .set({ approvalStatus: "APPROVED", updatedAt: new Date() })
      .where(eq(materiSharing.materiPublishedId, materiPublishedId));

    const [materi] = await db
      .select({ judul: materiPublished.judul, guruId: materiPublished.guruId })
      .from(materiPublished)
      .where(eq(materiPublished.id, materiPublishedId))
      .limit(1);

    const [guru] = await db
      .select({ nama: users.nama })
      .from(users)
      .where(eq(users.id, materi?.guruId ?? ""))
      .limit(1);

    await appendEvent("owner:sharing", "materi.sharing_approved", {
      materiPublishedId,
      judul: materi?.judul,
      guruId: materi?.guruId,
      guruNama: guru?.nama,
      approvedBy: session.userId,
      at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Materi "${materi?.judul}" oleh ${guru?.nama} telah disetujui untuk katalog publik.`,
      approvalStatus: "APPROVED",
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Owner approve error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}