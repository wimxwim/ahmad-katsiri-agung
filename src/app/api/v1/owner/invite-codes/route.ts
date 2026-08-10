// POST /api/v1/owner/invite-codes - Buat kode undangan guru
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireOwner, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiSuccess, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users, guruInviteCodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  code: z.string().min(4).max(16).regex(/^[A-Z0-9-]+$/, "Hanya huruf besar, angka, dan tanda hubung"),
  guruId: z.string().uuid("Guru ID tidak valid"),
  maxUses: z.number().int().min(1).max(10).default(3),
  trialDays: z.number().int().min(1).max(365).default(30),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`owner-invite:${ip}`, 20, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    await requireOwner(request); // throws GuardError if not owner

    const body = await request.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const { code, guruId, maxUses, trialDays, expiresAt } = parsed.data;

    // Verify the guru exists
    const guruExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, guruId))
      .limit(1);
    if (guruExists.length === 0) return apiError("NOT_FOUND", "Guru tidak ditemukan", undefined, 404);

    const [created] = await db
      .insert(guruInviteCodes)
      .values({
        code,
        issuingGuruId: guruId,
        maxUses,
        trialDays,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return apiSuccess({ inviteCode: created });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    if (e instanceof z.ZodError) return apiError("VALIDATION_ERROR", "Data tidak valid", e.issues, 400);
    console.error("Create invite code error:", e);
    return apiError("INTERNAL_ERROR", "Gagal membuat kode undangan", undefined, 500);
  }
}