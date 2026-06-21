import { google } from "googleapis";
import { NextResponse } from "next/server";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL!,
      key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const existing = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const existingTitles = existing.data.sheets?.map(s => s.properties?.title) || [];

    const results: string[] = [];
    const tabs: Record<string, string[]> = {
      RefleksiDiri: ["ID", "Nama", "Pelajaran", "AkhlakBaik", "PerluDiperbaiki", "Waktu"],
      Diskusi: ["ID", "Nama", "Kategori", "Judul", "Isi", "Waktu", "Slug"],
      DiskusiBalasan: ["ID", "SlugInduk", "Nama", "Isi", "", "Waktu"],
    };

    for (const [title, headers] of Object.entries(tabs)) {
      if (existingTitles.includes(title)) {
        results.push(`✅ ${title} already exists`);
        continue;
      }
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests: [{ addSheet: { properties: { title } } }] },
      });
      results.push(`✅ ${title} created`);

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${title}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
      results.push(`  → Headers: ${headers.join(", ")}`);
    }

    return NextResponse.json({ ok: true, results, existing: existingTitles });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
