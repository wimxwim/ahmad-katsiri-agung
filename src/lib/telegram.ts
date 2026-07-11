const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_IDS = [
  process.env.TELEGRAM_CHAT_ID,
  process.env.TELEGRAM_CHAT_ID_2,
].filter(Boolean) as string[];

const TELEGRAM_MAX_LENGTH = 4000;

export function escapeMarkdown(text: string): string {
  return text
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/`/g, "\\`")
    .replace(/\[/g, "\\[")
    .replace(/\(/g, "\\(");
}

export async function sendTelegram(message: string) {
  if (!BOT_TOKEN || CHAT_IDS.length === 0) return;
  const truncated =
    message.length > TELEGRAM_MAX_LENGTH
      ? message.slice(0, TELEGRAM_MAX_LENGTH) + "\n\n*Pesan dipotong* — terlalu panjang"
      : message;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await Promise.all(
    CHAT_IDS.map((chat_id) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id,
          text: truncated,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }).catch((err) => console.error("Telegram send failed:", err))
    )
  );
}
