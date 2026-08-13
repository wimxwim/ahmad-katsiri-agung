import { defineConfig } from "drizzle-kit";

// drizzle-kit tidak otomatis membaca .env.local — load manual via Node bawaan
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local tidak ada — lanjut, error DATABASE_URL akan muncul jika memang belum diset
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
