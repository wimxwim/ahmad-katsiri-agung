import { Pool } from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://akal:akaldev@localhost:5433/akal_center";

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nama VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      password_hash TEXT,
      role VARCHAR(50) NOT NULL DEFAULT 'SISWA',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const pass = await bcrypt.hash("admin123", 12);
  await pool.query(
    `INSERT INTO users (nama, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
    ["Admin AKAL", "admin@akalcenter.my.id", pass, "OWNER"],
  );
  await pool.query(
    `INSERT INTO users (nama, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
    ["Ahmad Katsiri Agung", "guru@akalcenter.my.id", pass, "GURU"],
  );

  console.log("Seed complete: admin + guru created (password: admin123)");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
