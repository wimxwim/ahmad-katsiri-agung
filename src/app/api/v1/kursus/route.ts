import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { requireRole } from "@/lib/route-guard-v2";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";

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

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const result = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    const session = result?.success ? result.data : null;

    const isOwner = session?.role === "owner";
    const isGuruLike = session?.role === "guru" || isOwner || session?.role === "admin_sekolah";

    const slug = request.nextUrl.searchParams.get("slug");
    const scope = request.nextUrl.searchParams.get("scope");
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(request.nextUrl.searchParams.get("offset") || "0", 10), 0);
    let query = db.select({
      id: kursus.id,
      judul: kursus.judul,
      slug: kursus.slug,
      deskripsi: kursus.deskripsi,
      isPublic: kursus.isPublic,
      statusPublikasi: kursus.statusPublikasi,
      guruId: kursus.guruId,
      createdAt: kursus.createdAt,
    }).from(kursus).$dynamic();

    if (isGuruLike) {
      if (isOwner && scope === "all") {
      } else if (session?.userId) {
        query = query.where(eq(kursus.guruId, session.userId));
      }
    } else {
      query = query.where(eq(kursus.isPublic, true));
    }

    if (slug) {
      query = query.where(eq(kursus.slug, slug));
    }
    let data;
    try {
      data = await query.orderBy(desc(kursus.createdAt)).limit(limit).offset(offset);
    } catch (queryError) {
      console.error("Kursus query error:", queryError);
      return NextResponse.json({ error: "Query gagal", detail: String(queryError) }, { status: 500 });
    }
    return NextResponse.json({ data, limit, offset }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60", "Vary": "Cookie" } });
  } catch (e) {
    console.error("Kursus GET error:", e);
    return apiError("Terjadi kesalahan server", 500);
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
    const pgError = e as { code?: string; constraint?: string };
    if (pgError.code === "23505" && (pgError.constraint === "kursus_slug_unique" || pgError.constraint === "kursus_slug_sekolah_unique")) {
      return apiError("Judul kursus sudah digunakan. Gunakan judul yang berbeda.", 409);
    }
    console.error("Kursus POST error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
