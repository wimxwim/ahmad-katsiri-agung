import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { requireNotSuspended, SubscriptionLockedError } from "@/lib/token-service";
import { checkRateLimitPerUser } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { kelas } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf-server";
import { cacheGet, cacheSet, cacheDel } from "@/lib/cache-layer";

export const runtime = "nodejs";

const CreateKelasSchema = z.object({
  nama: z.string().min(1).max(50),
  tingkat: z.number().int().min(1).max(20),
  kursusId: z.string().min(1).optional(),
});

const KelasQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`kelas-list:${session.userId}`, 60, 30000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const parsed = KelasQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Parameter tidak valid", 400);
    const { limit } = parsed.data;

    const cacheKey = `kelas:guru:${session.userId}:limit:${limit}`;
    const cached = await cacheGet<{ data: typeof kelas.$inferSelect[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } });
    }

    const data = await db
      .select()
      .from(kelas)
      .where(and(eq(kelas.guruId, session.userId), isNull(kelas.deletedAt)))
      .orderBy(desc(kelas.createdAt))
      .limit(limit);

    const result = { data };
    await cacheSet(cacheKey, result, 60);
    return NextResponse.json(result, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kelas list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireGuru(request);
    await requireNotSuspended(session.userId);

    const rl = await checkRateLimitPerUser(`kelas-create:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = CreateKelasSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);

    const [newKelas] = await db
      .insert(kelas)
      .values({
        nama: sanitizeText(parsed.data.nama, 50),
        tingkat: parsed.data.tingkat,
        guruId: session.userId,
        kursusId: parsed.data.kursusId ?? null,
      })
      .returning();

    await cacheDel(`kelas:guru:${session.userId}:limit:50`);
    await cacheDel(`kelas:guru:${session.userId}:limit:100`);

    return NextResponse.json({ data: newKelas }, { status: 201 });
  } catch (e) {
    if (e instanceof SubscriptionLockedError) return apiError(e.message, 403);
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kelas create error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
