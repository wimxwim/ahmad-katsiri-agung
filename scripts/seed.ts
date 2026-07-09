import "dotenv/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth-password";
import { eq } from "drizzle-orm";

async function main() {
  const pass = await hashPassword("admin123");

  const owners = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@akalcenter.my.id"))
    .limit(1);

  if (owners.length === 0) {
    await db.insert(users).values({
      nama: "Admin AKAL",
      email: "admin@akalcenter.my.id",
      passwordHash: pass,
      role: "OWNER",
    });
    console.log("✓ Admin created (admin@akalcenter.my.id / admin123)");
  } else {
    console.log("– Admin already exists");
  }

  const gurus = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "guru@akalcenter.my.id"))
    .limit(1);

  if (gurus.length === 0) {
    await db.insert(users).values({
      nama: "Ahmad Katsiri Agung",
      email: "guru@akalcenter.my.id",
      passwordHash: pass,
      role: "GURU",
    });
    console.log("✓ Guru created (guru@akalcenter.my.id / admin123)");
  } else {
    console.log("– Guru already exists");
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
