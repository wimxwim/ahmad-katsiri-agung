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

    // Get all sheets and read DiskusiBalasan
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sid });
    const titles = meta.data.sheets?.map(s => s.properties?.title) || [];

    // Try reading DiskusiBalasan
    let balasanData: any = null;
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sid,
        range: "DiskusiBalasan!A:F",
      });
      balasanData = res.data.values || [];
    } catch (e: any) {
      balasanData = `ERR: ${e.message}`;
    }

    return NextResponse.json({
      sheetTitles: titles,
      hasBalasan: titles.includes("DiskusiBalasan"),
      hasDiskusi: titles.includes("Diskusi"),
      balasanData,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
