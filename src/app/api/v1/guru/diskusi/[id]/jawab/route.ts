import { NextRequest } from "next/server";
import { z } from "zod";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { apiError, apiRateLimit, apiSuccess, apiValidationError } from "@/lib/api-response";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { materiDiskusi, materiPublished } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

const JawabSchema = z.object({
  jawaban: z.string().trim().min(1, "Jawaban wajib diisi").max(2000, "Jawaban maksimal 2000 karakter"),
});

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const csrfErr = validateCsrf(req);
    if (csrfErr) return csrfErr;

    const session = await requireGuru(req);

    const rl = await checkRateLimitPerUser(`guru-diskusi-jawab:${session.userId}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;
    if (!id) return apiError("ID diskusi wajib diisi", 400);

    const body = await req.json().catch(() => null);
    const parsed = JawabSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return apiValidationError([{ field: first.path.join(".") || "jawaban", message: first.message }]);
    }
    const { jawaban } = parsed.data;

    // Verify diskusi belongs to guru's materi via materiPublished.guruId join
    const [owned] = await db
      .select({ id: materiDiskusi.id })
      .from(materiDiskusi)
      .innerJoin(materiPublished, eq(materiDiskusi.materiId, materiPublished.id))
      .where(and(eq(materiDiskusi.id, id), eq(materiPublished.guruId, session.userId)))
      .limit(1);

    if (!owned) return apiError("Diskusi tidak ditemukan", 404);

    const sanitized = escapeHtml(jawaban.trim().slice(0, 2000));

    const [updated] = await db
      .update(materiDiskusi)
      .set({ jawaban: sanitized })
      .where(eq(materiDiskusi.id, id))
      .returning();

    if (!updated) return apiError("Gagal menyimpan jawaban", 500);

    return apiSuccess(updated);
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Guru diskusi jawab error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
