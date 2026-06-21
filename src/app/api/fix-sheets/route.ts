import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const sid = process.env.GOOGLE_SHEET_ID!;

    // Fix DiskusiBalasan: update header row, clear wrong data
    await sheets.spreadsheets.values.update({
      spreadsheetId: sid,
      range: "DiskusiBalasan!A1:F1",
      valueInputOption: "RAW",
      requestBody: { values: [["ID", "SlugInduk", "Nama", "Isi", "Jenis", "Waktu"]] },
    });

    // Clear all data rows (row 2 onwards) in DiskusiBalasan
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sid,
      range: "DiskusiBalasan!A:F",
    });
    const rows = existing.data.values || [];
    if (rows.length > 1) {
      const clearRange = `DiskusiBalasan!A2:F${rows.length}`;
      await sheets.spreadsheets.values.clear({
        spreadsheetId: sid,
        range: clearRange,
      });
    }

    // Also clear wrong data in DiskusiBalasan
    await sheets.spreadsheets.values.update({
      spreadsheetId: sid,
      range: "DiskusiBalasan!A1",
      valueInputOption: "RAW",
      requestBody: { values: [["ID", "SlugInduk", "Nama", "Isi", "Jenis", "Waktu"]] },
    });

    return NextResponse.json({
      ok: true,
      headerFixed: true,
      dataCleared: rows.length > 1 ? rows.length - 1 : 0,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
