import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const results: Record<string, unknown> = {
    hasToken: !!BOT_TOKEN,
    hasChatId: !!CHAT_ID,
    tokenPrefix: BOT_TOKEN ? BOT_TOKEN.slice(0, 15) + "..." : "MISSING",
    chatId: CHAT_ID || "MISSING",
  };

  // Test sendMessage
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: "🧪 <b>DEBUG TEST</b>\n\nDari Vercel serverless function.",
        parse_mode: "HTML",
      }),
    });
    const body = await res.text();
    results.sendMessage = {
      status: res.status,
      ok: res.ok,
      body: body.slice(0, 300),
    };
  } catch (e) {
    results.sendMessage = {
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // Test sendPhoto with a public image
  try {
    const testPhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png";
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        photo: testPhotoUrl,
        caption: "🧪 <b>DEBUG PHOTO TEST</b>",
        parse_mode: "HTML",
      }),
    });
    const body = await res.text();
    results.sendPhoto = {
      status: res.status,
      ok: res.ok,
      body: body.slice(0, 300),
    };
  } catch (e) {
    results.sendPhoto = {
      error: e instanceof Error ? e.message : String(e),
    };
  }

  return Response.json(results);
}