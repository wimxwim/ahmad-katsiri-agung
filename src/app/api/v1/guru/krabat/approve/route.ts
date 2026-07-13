import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { krabatConnections, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const body = await request.json().catch(() => null);
    if (!body || typeof body.connectionId !== "string" || !body.connectionId) {
      return apiError("connectionId wajib diisi", 400);
    }
    if (!body.action || !["approve", "reject"].includes(body.action)) {
      return apiError("action harus 'approve' atau 'reject'", 400);
    }

    const { connectionId, action } = body;

    const [conn] = await db
      .select()
      .from(krabatConnections)
      .where(
        and(
          eq(krabatConnections.id, connectionId),
          eq(krabatConnections.connectedGuruId, session.userId!),
        ),
      )
      .limit(1);

    if (!conn) return apiError("Request koneksi tidak ditemukan atau bukan untuk Anda", 404);
    if (conn.status !== "PENDING") {
      return apiError(`Request koneksi sudah ${conn.status === "ACTIVE" ? "aktif" : "ditolak"}`, 409);
    }

    const newStatus = action === "approve" ? "ACTIVE" : "REJECTED";

    await db
      .update(krabatConnections)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(krabatConnections.id, connectionId));

    const [requester] = await db
      .select({ nama: users.nama })
      .from(users)
      .where(eq(users.id, conn.guruId))
      .limit(1);

    await appendEvent(`krabat:${session.userId}`, `krabat.${action}`, {
      connectionId,
      guruId: conn.guruId,
      connectedGuruId: session.userId,
      requesterNama: requester?.nama ?? "Unknown",
      at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      status: newStatus,
      message:
        action === "approve"
          ? `Koneksi dengan ${requester?.nama ?? "guru"} telah disetujui.`
          : `Request koneksi dari ${requester?.nama ?? "guru"} telah ditolak.`,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Krabat approve error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}