import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { apiError, apiUnauthorized } from "@/lib/api-response";
import { db } from "@/lib/db";
import { fileMateri } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getStorageAdapter } from "@/lib/storage/StorageFactory";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await getSession();
  if (!session) return apiUnauthorized();

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