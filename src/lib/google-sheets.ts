import { google, sheets_v4 } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getClient() {
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!key) throw new Error("GOOGLE_SHEETS_PRIVATE_KEY not set");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function appendRow(range: string, values: string[][]) {
  if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID not set");
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function readRows(range: string): Promise<string[][]> {
  if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID not set");
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return res.data.values || [];
}

export async function findRow(
  range: string,
  columnIndex: number,
  value: string
): Promise<number | null> {
  const rows = await readRows(range);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][columnIndex]?.toLowerCase() === value.toLowerCase()) {
      return i;
    }
  }
  return null;
}
