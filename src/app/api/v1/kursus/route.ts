import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";

const KursusSchema = z.object({
  judul: z.string().min(1).max(200),
  deskripsi: z.string().max(500).optional().default(""),
  kelas: z.enum(["7", "8", "9"]).optional().default("7"),
  coverColor: z.string().max(20).optional().default("#005231"),
  slug: z.string().min(1).max(100),
});

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kursus-list:${ip}`, 30, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    const session = _ar && _ar.success ? _ar.data : null;

    if (!session) {
      return apiError("Silakan login terlebih dahulu", 401);
    }

    const isOwner = session.role === "owner";
    const isGuruLike = session.role === "guru" || isOwner || session.role === "admin_sekolah";

    const slug = request.nextUrl.searchParams.get("slug");
    const scope = request.nextUrl.searchParams.get("scope");
    let query = db.select().from(kursus).$dynamic();

    if (isGuruLike) {
      if (isOwner && scope === "all") {
        // owner dengan scope=all → lihat semua kursus
      } else if (session.userId) {
        query = query.where(eq(kursus.guruId, session.userId));
      }
    } else {
      query = query.where(eq(kursus.isPublic, true));
    }

    if (slug) {
      query = query.where(eq(kursus.slug, slug));
    }
    const data = await query.orderBy(desc(kursus.createdAt));
    return NextResponse.json({ data });
  } catch (e) {
    console.error("Kursus GET error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return apiError("Silakan login terlebih dahulu", 401);
    }
    const _ar2 = await verifySession(sessionCookie.value);
    if (!_ar2.success || (_ar2.data.role !== "guru" && _ar2.data.role !== "owner")) {
      return apiError("Hanya guru yang dapat membuat kursus", 403);
    }
    const session = _ar2.data;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kursus-create:${ip}`, 5, 60000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = KursusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const generatedSlug = parsed.data.slug || slugify(parsed.data.judul);
    const [newKursus] = await db
      .insert(kursus)
      .values({
        judul: sanitizeText(parsed.data.judul, 200),
        slug: generatedSlug,
        deskripsi: sanitizeText(parsed.data.deskripsi || "", 500),
        guruId: session.userId || "",
        harga: 0,
        isPublic: true,
      })
      .returning();

    return NextResponse.json({ data: newKursus }, { status: 201 });
  } catch (e) {
    console.error("Kursus POST error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
