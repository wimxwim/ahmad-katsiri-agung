import { NextRequest, NextResponse } from "next/server";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiValidationError } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { db } from "@/lib/db";
import { materiDiskusi, materiPublished, siswaKursus } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export const runtime = "nodejs";

const MAX_PERTANYAAN = 2000;

interface MateriCheck {
  materi: { id: string; kursusId: string } | null;
  reason: string;
  status: number;
}

async function findMateriForSiswa(
  materiId: string,
  siswaId: string,
): Promise<MateriCheck> {
  const [row] = await db
    .select({ id: materiPublished.id, kursusId: materiPublished.kursusId })
    .from(materiPublished)
    .where(eq(materiPublished.id, materiId))
    .limit(1);
  if (!row) return { materi: null, reason: "Materi tidak ditemukan", status: 404 };

  const [enrolled] = await db
    .select({ id: siswaKursus.id })
    .from(siswaKursus)
    .where(
      and(
        eq(siswaKursus.siswaId, siswaId),
        eq(siswaKursus.kursusId, row.kursusId),
        eq(siswaKursus.status, "AKTIF"),
      ),
    )
    .limit(1);
  if (!enrolled) {
    return { materi: null, reason: "Anda belum terdaftar di kursus ini", status: 403 };
  }

  return { materi: row, reason: "", status: 200 };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);

    const { id } = await params;

    const rl = await checkRateLimit(`siswa-diskusi-list:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const check = await findMateriForSiswa(id, session.userId!);
    if (!check.materi) return apiError(check.reason, check.status);

    const items = await db
      .select()
      .from(materiDiskusi)
      .where(eq(materiDiskusi.materiId, id))
      .orderBy(asc(materiDiskusi.createdAt));

    return NextResponse.json({ data: items });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa diskusi list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSiswa(request);

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { id } = await params;

    const rl = await checkRateLimit(`siswa-diskusi-create:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const check = await findMateriForSiswa(id, session.userId!);
    if (!check.materi) return apiError(check.reason, check.status);

    const body = await request.json().catch(() => null);
    const pertanyaan =
      typeof body?.pertanyaan === "string" ? body.pertanyaan.trim() : "";
    if (!pertanyaan) {
      return apiValidationError([{ field: "pertanyaan", message: "Pertanyaan wajib diisi" }]);
    }
    if (pertanyaan.length > MAX_PERTANYAAN) {
      return apiValidationError([
        { field: "pertanyaan", message: `Pertanyaan maksimal ${MAX_PERTANYAAN} karakter` },
      ]);
    }

    const [inserted] = await db
      .insert(materiDiskusi)
      .values({
        materiId: id,
        userId: session.userId!,
        userName: session.nama || "Siswa",
        role: "SISWA",
        pertanyaan,
      })
      .returning();

    return NextResponse.json({ data: inserted }, { status: 201 });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa diskusi create error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}