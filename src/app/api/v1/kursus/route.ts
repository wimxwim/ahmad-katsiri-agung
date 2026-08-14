import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { requireRole, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { desc, eq, isNull, lt, and, or, sql } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { isUserUnlocked } from "@/lib/token-service";
import { FREE_TIER_COURSE_LIMIT } from "@/lib/token-constants";

export const runtime = "nodejs";

const KursusSchema = z.object({
  judul: z.string().min(1).max(200),
  deskripsi: z.string().max(500).optional().default(""),
  kelas: z.enum(["7", "8", "9"]).optional().default("7"),
  coverColor: z.string().max(20).optional().default("#005231"),
  slug: z.string().min(1).max(100),
});

const KursusQuerySchema = z.object({
  slug: z.string().optional(),
  scope: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  cursor: z.string().optional(),
});

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function encodeKursusCursor(row: { createdAt: Date; id: string }): string {
  return Buffer.from(JSON.stringify({ createdAt: row.createdAt.toISOString(), id: row.id })).toString("base64url");
}

function decodeKursusCursor(raw: string): { createdAt: Date; id: string } | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.createdAt === "string" && typeof parsed.id === "string") {
      const d = new Date(parsed.createdAt);
      if (!isNaN(d.getTime())) return { createdAt: d, id: parsed.id };
    }
  } catch {}
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return { createdAt: d, id: "" };
  } catch {}
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kursus-list:${ip}`, 30, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const result = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    const session = result?.success ? result.data : null;

    const isOwner = session?.role === "owner";
    const isGuruLike = session?.role === "guru" || isOwner || session?.role === "admin_sekolah";

    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = KursusQuerySchema.safeParse(rawParams);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Parameter tidak valid", 400);
    const { slug, scope, limit, offset, cursor } = parsed.data;

    let query = db.select({
      id: kursus.id,
      judul: kursus.judul,
      slug: kursus.slug,
      deskripsi: kursus.deskripsi,
      statusPublikasi: kursus.statusPublikasi,
      isPublic: kursus.isPublic,
      harga: kursus.harga,
      guruId: kursus.guruId,
      createdAt: kursus.createdAt,
    }).from(kursus).where(isNull(kursus.deletedAt)).$dynamic();

    if (isGuruLike) {
      if (isOwner && scope === "all") {
      } else if (session?.userId) {
        query = query.where(eq(kursus.guruId, session.userId));
      }
    } else {
      query = query.where(eq(kursus.statusPublikasi, "PUBLIK"));
    }

    if (slug) {
      query = query.where(eq(kursus.slug, slug));
    }

    // Cursor tie-breaker: (createdAt < cursorDate) OR (createdAt = cursorDate AND id < cursorId)
    if (cursor) {
      const decoded = decodeKursusCursor(cursor);
      if (decoded) {
        if (decoded.id) {
          query = query.where(
            or(
              lt(kursus.createdAt, decoded.createdAt),
              and(eq(kursus.createdAt, decoded.createdAt), lt(kursus.id, decoded.id)),
            )!,
          );
        } else {
          query = query.where(lt(kursus.createdAt, decoded.createdAt));
        }
      }
    }

    const data = await query.orderBy(desc(kursus.createdAt), desc(kursus.id)).limit(limit).offset(cursor ? 0 : offset);
    const hasMore = data.length === limit;
    const nextCursor = hasMore && data.length > 0 ? encodeKursusCursor({ createdAt: data[data.length - 1].createdAt, id: data[data.length - 1].id }) : null;
    return NextResponse.json({ data, limit, offset: cursor ? 0 : offset, nextCursor, hasMore }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60", "Vary": "Cookie" } });
  } catch (e) {
    console.error("Kursus GET error:", e);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireRole(request, ["guru", "owner"]);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kursus-create:${ip}`, 5, 60000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = KursusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    // F10-4: enforce FREE_TIER_COURSE_LIMIT — jika belum unlock dan kursus sudah >=15, block 403
    const isUnlocked = await isUserUnlocked(session.userId);
    if (!isUnlocked) {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(kursus)
        .where(and(eq(kursus.guruId, session.userId), isNull(kursus.deletedAt)));
      const kursusCount = countRow?.count ?? 0;
      if (kursusCount >= FREE_TIER_COURSE_LIMIT) {
        return apiError("FREE_TIER_LIMIT", `Batas kursus gratis ${FREE_TIER_COURSE_LIMIT}, topup untuk unlimited`, undefined, 403);
      }
    }

    const generatedSlug = parsed.data.slug || slugify(parsed.data.judul);
    const [newKursus] = await db
      .insert(kursus)
      .values({
        judul: sanitizeText(parsed.data.judul, 200),
        slug: generatedSlug,
        deskripsi: sanitizeText(parsed.data.deskripsi || "", 500),
        guruId: session.userId,
        harga: 0,
        isPublic: false,
      })
      .returning();

    return NextResponse.json({ data: newKursus }, { status: 201 });
  } catch (e) {
    if (e instanceof GuardError) {
      return apiError(e.code, e.message, undefined, e.status);
    }
    const pgError = e as { code?: string; constraint?: string };
    if (pgError.code === "23505" && pgError.constraint === "kursus_slug_sekolah_unique") {
      return apiError("Judul kursus sudah digunakan. Gunakan judul yang berbeda.", 409);
    }
    console.error("Kursus POST error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
