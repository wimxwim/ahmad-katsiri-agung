import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { apiError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { fileMateri } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const sessionCookie = _request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
  const _ar = await verifySession(sessionCookie.value);
  if (!_ar.success) return apiError("Sesi tidak valid", 401);
  const session = _ar.data;

  const { fileId } = await params;

  const [row] = await db
    .select()
    .from(fileMateri)
    .where(and(eq(fileMateri.id, fileId), eq(fileMateri.guruId, session.userId!)))
    .limit(1);

  if (!row) return apiError("File tidak ditemukan", 404);

  const adapter = await getStorageAdapter(session.userId!);
  const link = adapter.getLink(row.imagekitFileId || row.driveFileId || row.id);

  return NextResponse.redirect(link, 302);
}