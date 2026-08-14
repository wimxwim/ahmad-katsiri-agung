import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): DrizzleDb {
  // Supavisor transaction mode: connection-per-query, not connection-per-request.
  // Higher pool max + allowExitOnIdle are safe because Supavisor handles session pooling.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // max:10 untuk analytics 18 query paralel (Supavisor transaction mode aman)
    // Supavisor transaction mode: prepared statements must be disabled
    // @ts-expect-error - pg PoolConfig types lag behind runtime `prepare` option
    prepare: false,
    allowExitOnIdle: true,
    application_name: "akal-center",
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 8000,
    statement_timeout: 15000,
    idle_in_transaction_session_timeout: 15000,
  });
  pool.on("error", (err) => console.error("DB pool error:", err));
  return drizzle(pool, { schema });
}

let _db: DrizzleDb | null = null;

const globalForDb = globalThis as unknown as { db?: DrizzleDb };

export const db = new Proxy({} as DrizzleDb, {
  get(_, prop) {
    if (process.env.NODE_ENV !== "production" && globalForDb.db) {
      const val = globalForDb.db[prop as keyof DrizzleDb];
      return typeof val === "function" ? val.bind(globalForDb.db) : val;
    }
    if (!_db) _db = createDb();
    if (process.env.NODE_ENV !== "production") {
      globalForDb.db = _db;
    }
    const val = _db[prop as keyof DrizzleDb];
    return typeof val === "function" ? val.bind(_db) : val;
  },
});
