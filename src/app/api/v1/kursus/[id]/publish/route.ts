import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { appendEvent } from "@/lib/event-store";

const PublishSchema = z.object({
  status: z.enum(["DRAFT", "PUBLIK", "ARSIP"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = request.cookies.get(SESSION_COOKIE_NAME);
    if (!cookieStore?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(cookieStore.value);
    if (!_ar.success || (_ar.data.role !== "guru" && _ar.data.role !== "owner")) {
      return apiError("Hanya guru yang dapat mengubah status kursus", 403);
    }
    const session = _ar.data;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kursus-publish:${ip}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;
    const body = await request.json();
    const parsed = PublishSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Status tidak valid", 400);
    }

    const [existing] = await db
      .select()
      .from(kursus)
      .where(eq(kursus.id, id))
      .limit(1);
    if (!existing) return apiError("Kursus tidak ditemukan", 404);
    if (existing.guruId !== session.userId && session.role !== "owner") {
      return apiError("Anda tidak punya akses ke kursus ini", 403);
    }

    const publishedAt = parsed.data.status === "PUBLIK" ? new Date() : null;

    const [updated] = await db
      .update(kursus)
      .set({
        statusPublikasi: parsed.data.status,
        publishedAt,
        isPublic: parsed.data.status === "PUBLIK",
        updatedAt: new Date(),
      })
      .where(eq(kursus.id, id))
      .returning();

    await appendEvent(`kursus:${id}`, "kursus.status_changed", {
      guruId: session.userId,
      from: existing.statusPublikasi,
      to: parsed.data.status,
      publishedAt: publishedAt?.toISOString() || null,
    });

    return NextResponse.json({ data: updated });
  } catch (e) {
    console.error("Publish error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
