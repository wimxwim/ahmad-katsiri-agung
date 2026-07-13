const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function sendTopupNotification(params: {
  userId: string;
  nama: string;
  amount: number;
  proofUrl: string;
  newBalance: number;
}): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("[telegram-notif] TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diset");
    return;
  }

  const message = [
    "🔔 Top-up baru!",
    `User: ${params.nama} (ID: ${params.userId})`,
    `Nominal: Rp${params.amount.toLocaleString("id-ID")}`,
    `Bukti: ${params.proofUrl}`,
    `Saldo sekarang: Rp${params.newBalance.toLocaleString("id-ID")}`,
  ].join("\n");

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("[telegram-notif] Gagal kirim:", res.status, err.slice(0, 200));
    }
  } catch (e) {
    console.error("[telegram-notif] Error:", e instanceof Error ? e.message : String(e));
  }
}