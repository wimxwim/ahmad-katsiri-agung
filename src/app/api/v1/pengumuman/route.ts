import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { requireRole } from "@/lib/route-guard-v2";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { pengumuman } from "@/lib/db/schema";
import { desc, eq, or, and, gte, sql } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";

const CreateSchema = z.object({
  judul: z.string().min(1).max(255),
  konten: z.string().min(1),
  target: z.enum(["SEMUA", "GURU", "SISWA"]).optional().default("SEMUA"),
  kursusId: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
  isPinned: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
  const ip = ipFromRequest(request);
  const rl = await checkRateLimit(`pengumuman-list:${ip}`, 30, 15000);
  if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const result = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = result?.success ? result.data : null;

  const now = new Date();
  const rows = await db
    .select()
    .from(pengumuman)
    .where(
      and(
        or(
          eq(pengumuman.target, "SEMUA"),
          ...(session ? [eq(pengumuman.target, session.role === "guru" ? "GURU" : "SISWA")] : []),
        ),
        or(
          sql`${pengumuman.expiresAt} IS NULL`,
          gte(pengumuman.expiresAt, now),
        ),
      ),
    )
    .orderBy(desc(pengumuman.isPinned), desc(pengumuman.publishedAt))
    .limit(50);

  return NextResponse.json({ data: rows.map(({ konten: _, ...rest }) => rest) }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } });
  } catch (e) {
    console.error("Pengumuman GET error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;
  const session = await requireRole(request, ["guru", "owner", "admin_sekolah"]);

  const ip = ipFromRequest(request);
  const rl = await checkRateLimit(`pengumuman-create:${ip}`, 10, 60000);
  if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);
  }

  const { judul, konten, target = "SEMUA", kursusId, expiresAt, isPinned = false } = parsed.data;

  if (!session.userId) return apiError("Session tidak valid", 401);

  const [row] = await db
    .insert(pengumuman)
    .values({
      judul, konten, target, kursusId: kursusId || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPinned, guruId: session.userId,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error("Pengumuman POST error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
