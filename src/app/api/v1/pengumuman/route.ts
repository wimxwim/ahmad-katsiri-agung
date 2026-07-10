import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/dal";
import { checkRateLimitSync, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { pengumuman } from "@/lib/db/schema";
import { desc, eq, or, and, gte, sql } from "drizzle-orm";
import { apiError, apiRateLimit, apiUnauthorized } from "@/lib/api-response";

const CreateSchema = z.object({
  judul: z.string().min(1).max(255),
  konten: z.string().min(1),
  target: z.enum(["SEMUA", "GURU", "SISWA"]).optional().default("SEMUA"),
  kursusId: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
  isPinned: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  const ip = ipFromRequest(request);
  const rl = checkRateLimitSync(`pengumuman-list:${ip}`, 30, 15000);
  if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const session = await getSession();

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

  return NextResponse.json(rows.map(({ konten: _, ...rest }) => rest));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return apiUnauthorized();

  if (session.role !== "guru" && session.role !== "owner" && session.role !== "admin_sekolah") {
    return apiError("Hanya guru yang bisa membuat pengumuman", 403);
  }

  const ip = ipFromRequest(request);
  const rl = checkRateLimitSync(`pengumuman-create:${ip}`, 10, 60000);
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
}
