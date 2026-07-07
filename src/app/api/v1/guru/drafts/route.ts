import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const session = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  if (!session || (session.role !== "guru" && session.role !== "owner")) {
    return apiError("FORBIDDEN", "Akses ditolak", undefined, 403);
  }

  const rows = await db
    .select()
    .from(aiGeneration)
    .where(eq(aiGeneration.guruId, session.userId!))
    .orderBy(desc(aiGeneration.createdAt))
    .limit(50);

  return NextResponse.json({ data: rows });
}
