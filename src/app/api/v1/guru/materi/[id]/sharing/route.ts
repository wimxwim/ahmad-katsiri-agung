import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { appendEvent } from "@/lib/event-store";
import { db } from "@/lib/db";
import { materiPublished, materiSharing } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { checkRateLimitPerUser } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ALLOWED_VISIBILITY = new Set(["PRIVAT", "PUBLIK", "KRABAT", "ARSIP"]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`materi-sharing-write:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [materi] = await db
      .select({ id: materiPublished.id, guruId: materiPublished.guruId, judul: materiPublished.judul })
      .from(materiPublished)
      .where(and(eq(materiPublished.id, id), eq(materiPublished.guruId, session.userId!)))
      .limit(1);

    if (!materi) return apiError("Materi tidak ditemukan atau bukan milik Anda", 404);

    const body = await request.json().catch(() => null);
    if (!body || typeof body.visibility !== "string") {
      return apiError("visibility wajib diisi (PRIVAT/PUBLIK/KRABAT/ARSIP)", 400);
    }

    const visibility = body.visibility.toUpperCase();
    if (!ALLOWED_VISIBILITY.has(visibility)) {
      return apiError("Visibility tidak valid. Pilih: PRIVAT, PUBLIK, KRABAT, atau ARSIP.", 400);
    }

    const approvalStatus = visibility === "PUBLIK" ? "PENDING" : "APPROVED";

    await db
      .insert(materiSharing)
      .values({
        materiPublishedId: id,
        visibility: visibility as "PRIVAT" | "PUBLIK" | "KRABAT" | "ARSIP",
        approvalStatus: approvalStatus as "PENDING" | "APPROVED" | "REJECTED",
      })
      .onConflictDoUpdate({
        target: materiSharing.materiPublishedId,
        set: {
          visibility: visibility as "PRIVAT" | "PUBLIK" | "KRABAT" | "ARSIP",
          approvalStatus: approvalStatus as "PENDING" | "APPROVED" | "REJECTED",
          updatedAt: new Date(),
        },
      });

    await appendEvent(`sharing:${session.userId}`, "materi.share", {
      materiPublishedId: id,
      visibility,
      approvalStatus,
      guruId: session.userId,
      at: new Date().toISOString(),
    });

    const message =
      visibility === "PUBLIK"
        ? "Materi diset ke PUBLIK. Menunggu persetujuan developer sebelum tampil di katalog."
        : visibility === "KRABAT"
          ? "Materi diset ke KRABAT. Hanya guru dengan koneksi aktif yang bisa mengakses."
          : visibility === "ARSIP"
            ? "Materi diarsipkan. Hanya Anda yang bisa mengakses."
            : "Materi diset ke PRIVAT. Hanya Anda dan siswa Anda yang bisa mengakses.";

    return NextResponse.json({
      success: true,
      visibility,
      approvalStatus,
      message,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Sharing error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`materi-sharing:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [materi] = await db
      .select({ id: materiPublished.id, guruId: materiPublished.guruId })
      .from(materiPublished)
      .where(and(eq(materiPublished.id, id), eq(materiPublished.guruId, session.userId!)))
      .limit(1);

    if (!materi) return apiError("Materi tidak ditemukan atau bukan milik Anda", 404);

    const [sharing] = await db
      .select()
      .from(materiSharing)
      .where(eq(materiSharing.materiPublishedId, id))
      .limit(1);

    return NextResponse.json({
      visibility: sharing?.visibility ?? "PRIVAT",
      approvalStatus: sharing?.approvalStatus ?? "APPROVED",
      updatedAt: sharing?.updatedAt ?? null,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Sharing GET error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
