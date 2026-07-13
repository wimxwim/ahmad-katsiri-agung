import { db } from "@/lib/db";
import { materiSharing, krabatConnections } from "@/lib/db/schema";
import { and, eq, or } from "drizzle-orm";

export type VisibilityCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string; status: number };

export async function checkMateriAccess(
  materiPublishedId: string,
  userId: string,
  userRole: string,
): Promise<VisibilityCheckResult> {
  const [sharing] = await db
    .select()
    .from(materiSharing)
    .where(eq(materiSharing.materiPublishedId, materiPublishedId))
    .limit(1);

  const visibility = sharing?.visibility ?? "PRIVAT";

  if (visibility === "PRIVAT") {
    return { allowed: true };
  }

  if (visibility === "ARSIP") {
    const guruRoles = ["GURU", "ASISTEN_GURU", "OWNER", "ADMIN_SEKOLAH"];
    if (!guruRoles.includes(userRole)) {
      return { allowed: false, reason: "Materi ini diarsipkan dan tidak dapat diakses", status: 403 };
    }
    return { allowed: true };
  }

  if (visibility === "PUBLIK") {
    if (sharing?.approvalStatus !== "APPROVED") {
      return { allowed: false, reason: "Materi ini belum disetujui untuk katalog publik", status: 403 };
    }
    return { allowed: true };
  }

  if (visibility === "KRABAT") {
    const guruRoles = ["GURU", "ASISTEN_GURU", "OWNER", "ADMIN_SEKOLAH"];
    if (!guruRoles.includes(userRole)) {
      return { allowed: false, reason: "Materi KRABAT hanya untuk guru", status: 403 };
    }

    const [conn] = await db
      .select({ id: krabatConnections.id })
      .from(krabatConnections)
      .where(
        or(
          and(
            eq(krabatConnections.guruId, userId),
            eq(krabatConnections.status, "ACTIVE"),
          ),
          and(
            eq(krabatConnections.connectedGuruId, userId),
            eq(krabatConnections.status, "ACTIVE"),
          ),
        ),
      )
      .limit(1);

    if (!conn) {
      return { allowed: false, reason: "Materi KRABAT hanya bisa diakses guru dengan koneksi aktif", status: 403 };
    }

    return { allowed: true };
  }

  return { allowed: false, reason: "Visibility tidak dikenal", status: 400 };
}