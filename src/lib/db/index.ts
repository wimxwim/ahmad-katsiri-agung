import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): DrizzleDb {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
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
