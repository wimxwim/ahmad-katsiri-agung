import "server-only";
import { sql } from "drizzle-orm";
import { db } from "./index";
import type { SesiRole } from "@/lib/session";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

type DrizzleDb = NodePgDatabase<typeof schema>;

/**
 * Execute database operations within a tenant-scoped context.
 * Sets app-level session variables for RLS policies to function.
 *
 * Usage:
 *   const result = await withTenant(userId, role, sekolahId, async (tx) => {
 *     return tx.select().from(kursus).where(eq(kursus.id, kursusId));
 *   });
 */
export async function withTenant<T>(
  userId: string,
  role: SesiRole,
  sekolahId: string | null,
  fn: (tx: DrizzleDb) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`
      SELECT set_config('app.current_user_id', ${userId}, TRUE);
      SELECT set_config('app.current_role', ${role}, TRUE);
      SELECT set_config('app.current_tenant_id', ${sekolahId ?? ''}, TRUE);
    `);
    return fn(tx as DrizzleDb);
  });
}

/**
 * Set RLS context for raw queries.
 * Must be called at the start of each request handler.
 */
export async function setRlsContext(
  userId: string,
  role: SesiRole,
  sekolahId: string | null,
): Promise<void> {
  await db.execute(sql`
    SELECT set_config('app.current_user_id', ${userId}, TRUE);
    SELECT set_config('app.current_role', ${role}, TRUE);
    SELECT set_config('app.current_tenant_id', ${sekolahId ?? ''}, TRUE);
  `);
}
