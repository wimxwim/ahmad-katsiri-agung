import { readRows } from "../src/lib/google-sheets";

const RANGE = "DoaUcapan!A:D";

async function main() {
  const rows = await readRows(RANGE);
  console.log("=== CURRENT DATA (%d rows) ===", rows.length);

  for (let i = 0; i < rows.length; i++) {
    const [id, nama, isi, waktu] = rows[i];
    if (i === 0) {
      console.log("HEADER: ID | Nama | Isi | Waktu");
      console.log("─".repeat(80));
      continue;
    }
    console.log("[%d] ID=%s | Nama=%s | Isi=%s | Waktu=%s", i, id, nama, isi, waktu);
  }
}

main().catch(console.error);
