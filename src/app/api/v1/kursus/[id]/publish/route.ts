import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { appendEvent } from "@/lib/event-store";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";

const PublishSchema = z.object({
  status: z.enum(["DRAFT", "PUBLIK", "PRIVAT", "KRABAT", "ARSIP"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
    const session = await requireGuru(request);

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

    const publishedAt = parsed.data.status === "PUBLIK" ? new Date() : parsed.data.status === "ARSIP" ? existing.publishedAt : null;
    const where = session.role === "owner"
      ? eq(kursus.id, id)
      : and(eq(kursus.id, id), eq(kursus.guruId, session.userId));

    const [updated] = await db
      .update(kursus)
      .set({
        statusPublikasi: parsed.data.status,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(where)
      .returning();

    try {
      await appendEvent(`kursus:${id}`, "kursus.status_changed", {
        guruId: session.userId,
        from: existing.statusPublikasi,
        to: parsed.data.status,
        publishedAt: publishedAt?.toISOString() || null,
      });
    } catch (err) {
      console.error("Failed to append kursus event:", err);
      // Non-blocking: kursus status update already succeeded
    }

    return NextResponse.json({ data: updated });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Publish error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}