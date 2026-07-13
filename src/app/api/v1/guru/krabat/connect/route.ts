import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { krabatConnections, users } from "@/lib/db/schema";
import { and, eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`krabat-connect:${session.userId}`, 10, 3600);
    if (!rl.allowed) {
      return apiError("Terlalu banyak request koneksi. Coba lagi nanti.", 429);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.connectedGuruId !== "string" || !body.connectedGuruId) {
      return apiError("connectedGuruId wajib diisi", 400);
    }

    const { connectedGuruId } = body;

    if (connectedGuruId === session.userId) {
      return apiError("Tidak bisa connect ke diri sendiri", 400);
    }

    const [target] = await db
      .select({ id: users.id, nama: users.nama, role: users.role })
      .from(users)
      .where(eq(users.id, connectedGuruId))
      .limit(1);

    if (!target) return apiError("Guru target tidak ditemukan", 404);
    if (target.role !== "GURU" && target.role !== "ASISTEN_GURU" && target.role !== "OWNER" && target.role !== "ADMIN_SEKOLAH") {
      return apiError("User target bukan guru", 400);
    }

    const [existing] = await db
      .select({ id: krabatConnections.id, status: krabatConnections.status })
      .from(krabatConnections)
      .where(
        or(
          and(
            eq(krabatConnections.guruId, session.userId!),
            eq(krabatConnections.connectedGuruId, connectedGuruId),
          ),
          and(
            eq(krabatConnections.guruId, connectedGuruId),
            eq(krabatConnections.connectedGuruId, session.userId!),
          ),
        ),
      )
      .limit(1);

    if (existing) {
      if (existing.status === "ACTIVE") {
        return apiError("Koneksi sudah aktif", 409);
      }
      if (existing.status === "PENDING") {
        return apiError("Request koneksi sudah ada, menunggu persetujuan", 409);
      }
    }

    await db.insert(krabatConnections).values({
      guruId: session.userId!,
      connectedGuruId,
      status: "PENDING",
    });

    await appendEvent(`krabat:${session.userId}`, "krabat.connect", {
      guruId: session.userId,
      connectedGuruId,
      targetNama: target.nama,
      at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Request koneksi ke ${target.nama} telah dikirim. Menunggu persetujuan.`,
      status: "PENDING",
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Krabat connect error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}