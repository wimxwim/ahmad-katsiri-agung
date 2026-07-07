import "dotenv/config";
import { spawnSync } from "child_process";

const DRY_RUN = process.argv.includes("--dry-run");

interface ScriptResult {
  name: string;
  success: boolean;
  error?: string;
}

const SCRIPTS = [
  { name: "Migrasi CMS → DB", file: "migrate-cms-to-db.ts" },
  { name: "Migrasi Siswa", file: "migrate-siswa.ts" },
  { name: "Migrasi Nilai", file: "migrate-nilai.ts" },
] as const;

function runScript(file: string): ScriptResult {
  const args = DRY_RUN ? ["--dry-run"] : [];
  const proc = spawnSync("npx", ["tsx", `scripts/migrate/${file}`, ...args], {
    stdio: "inherit",
    env: { ...process.env },
  });

  return {
    name: file,
    success: proc.status === 0,
    error: proc.status !== 0 ? `exit code ${proc.status}` : undefined,
  };
}

async function runAll() {
  console.log("\n\x1b[1;35m╔══════════════════════════════════════╗\x1b[0m");
  console.log("\x1b[1;35m║   🔄 MIGRASI MASTER — AKAL Center   ║\x1b[0m");
  console.log("\x1b[1;35m╚══════════════════════════════════════╝\x1b[0m\n");

  if (DRY_RUN) {
    console.log("\x1b[33m⚡ MODE DRY-RUN — tidak ada data ditulis ke database\x1b[0m\n");
  }

  if (!process.env.GOOGLE_SHEET_ID) {
    console.error("\x1b[31m❌ GOOGLE_SHEET_ID tidak di-set di environment.\x1b[0m");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("\x1b[31m❌ DATABASE_URL tidak di-set di environment.\x1b[0m");
    process.exit(1);
  }

  const results: ScriptResult[] = [];

  for (const script of SCRIPTS) {
    console.log(`\n\x1b[1;33m──▶ Menjalankan: ${script.name}\x1b[0m`);

    try {
      const result = runScript(script.file);
      results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ name: script.file, success: false, error: message });
      console.error(`\x1b[31m❌ ${script.name} CRASH: ${message}\x1b[0m`);
    }
  }

  console.log("\n\x1b[1;35m╔══════════════════════════════════════╗\x1b[0m");
  console.log("\x1b[1;35m║        📊 RINGKASAN MIGRASI          ║\x1b[0m");
  console.log("\x1b[1;35m╚══════════════════════════════════════╝\x1b[0m\n");

  let successCount = 0;
  let failCount = 0;

  for (const r of results) {
    if (r.success) {
      console.log(`   ✅ \x1b[32m${r.name}\x1b[0m — BERHASIL`);
      successCount++;
    } else {
      console.log(`   ❌ \x1b[31m${r.name}\x1b[0m — GAGAL${r.error ? ` (${r.error})` : ""}`);
      failCount++;
    }
  }

  console.log(`\n   Total: ${results.length} script | ✅ ${successCount} berhasil | ❌ ${failCount} gagal\n`);

  process.exit(failCount > 0 ? 1 : 0);
}

runAll().catch((e) => {
  console.error("\x1b[31m❌ run-all crash:\x1b[0m", e);
  process.exit(1);
});
