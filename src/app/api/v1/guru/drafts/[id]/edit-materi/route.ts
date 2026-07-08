import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { appendEvent } from "@/lib/event-store";

const EditSchema = z.object({
  judul: z.string().min(1).max(200).optional(),
  konten: z.string().min(20).max(8000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = request.cookies.get(SESSION_COOKIE_NAME);
    if (!cookieStore?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(cookieStore.value);
    if (!_ar.success || (_ar.data.role !== "guru" && _ar.data.role !== "owner")) {
      return apiError("Hanya guru yang dapat edit draft", 403);
    }
    const session = _ar.data;

    const { id } = await params;

    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
      .limit(1);
    if (!row) return apiError("Draft tidak ditemukan", 404);
    if (row.materiStatus === "not_generated" || !row.materiKonten) {
      return apiError("Draft materi belum tersedia", 400);
    }

    const rl = await checkRateLimit(`draft-edit-materi:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = EditSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);
    }

    const updates: {
      materiEditedKonten?: string;
      materiJudul?: string;
      materiStatus: "edited";
      updatedAt: Date;
    } = { materiStatus: "edited", updatedAt: new Date() };
    if (parsed.data.konten !== undefined) updates.materiEditedKonten = parsed.data.konten;
    if (parsed.data.judul !== undefined) updates.materiJudul = parsed.data.judul;

    const [updated] = await db
      .update(aiGeneration)
      .set(updates)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
      .returning();

    await appendEvent(`gen:${session.userId}`, "gen.materi_edited", { generationId: id });

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("Edit materi error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
