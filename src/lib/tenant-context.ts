import "server-only";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * Set session context untuk RLS + audit.
 *
 * Dipanggil di awal setiap request/transaksi untuk mengisi
 * app.current_user_id dan app.current_role yang dipakai
 * oleh RLS policies.
 *
 * RLS TIDAK enforced saat ini karena app connect sebagai postgres.
 * Context ini tetap berguna untuk audit dan persiapan RLS aktif.
 */
export async function setSessionContext(userId: string, role: string): Promise<void> {
  await db.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`);
  await db.execute(sql`SELECT set_config('app.current_role', ${role}, true)`);
}

/**
 * Reset session context (dipanggil setelah request selesai).
 */
export async function resetSessionContext(): Promise<void> {
  await db.execute(sql`SELECT set_config('app.current_user_id', '', true)`);
  await db.execute(sql`SELECT set_config('app.current_role', '', true)`);
}
