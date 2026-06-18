import { readRows, overwriteRows } from "../src/lib/google-sheets";

const RANGE = "DoaUcapan!A:D";

async function main() {
  const rows = await readRows(RANGE);
  console.log("=== CURRENT DATA (%d rows) ===", rows.length);

  const header = rows[0];
  console.log("HEADER:", header);

  for (let i = 1; i < rows.length; i++) {
    const [id, nama, isi, waktu] = rows[i];
    console.log("[%d] ID=%s | Nama=%s | Isi=%s | Waktu=%s", i, id, nama, isi, waktu);
  }

  const testEntries: [string, string][] = [
    ["Test User", "Test doa dari automated test"],
    ["alert('xss')", "  test"],
    ["Robert\"; DROP TABLE DoaUcapan;--", "SQL injection test"],
    ["blocked:alert(document.cookie)", "click"],
    ["Test User", "Test doa dari browser test  JANGAN SAMPAI KAMU BIKIN ERROR WEBSITE NYA"],
  ];

  const cleanRows = [header];
  let removedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const [id, nama, isi, waktu] = rows[i];
    const isTest = testEntries.some(
      ([tn, ti]) => nama?.trim() === tn && isi?.trim() === ti
    );

    if (isTest) {
      console.log("  → REMOVE [%d]: %s / %s", i, nama, isi);
      removedCount++;
    } else {
      cleanRows.push(rows[i]);
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log("Total rows: %d", rows.length);
  console.log("To remove: %d", removedCount);
  console.log("To keep: %d", cleanRows.length - 1);

  if (removedCount === 0) {
    console.log("No test entries found. Nothing to do.");
    return;
  }

  console.log("\n=== OVERWRITING SHEET ===");
  await overwriteRows(RANGE, cleanRows);
  console.log("Done! Cleaned %d test entries.", removedCount);
}

main().catch(console.error);
