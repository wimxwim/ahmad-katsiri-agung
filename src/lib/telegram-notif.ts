const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_BOT_ID || "";

async function sendMessage(text: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("[telegram-notif] TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diset");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
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

export async function sendTopupNotification(params: {
  userId: string;
  nama: string;
  email: string;
  amount: number;
  proofUrl: string;
  newBalance: number;
  loginTerakhir?: string;
}): Promise<void> {
  const message = [
    "💰 <b>TOP-UP BARU</b>",
    "",
    `👤 <b>Nama:</b> ${escapeHtml(params.nama)}`,
    `📧 <b>Email:</b> ${escapeHtml(params.email)}`,
    `🆔 <b>User ID:</b> <code>${params.userId}</code>`,
    `💵 <b>Nominal:</b> Rp${params.amount.toLocaleString("id-ID")}`,
    `🏦 <b>Saldo Sekarang:</b> Rp${params.newBalance.toLocaleString("id-ID")}`,
    `📎 <b>Bukti:</b> ${params.proofUrl}`,
    params.loginTerakhir ? `🕐 <b>Login Terakhir:</b> ${params.loginTerakhir}` : "",
    `⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
  ].filter(Boolean).join("\n");

  await sendMessage(message);
}

export async function sendDonationNotification(params: {
  userId: string;
  nama: string;
  email: string;
  proofUrl?: string;
  loginTerakhir?: string;
}): Promise<void> {
  const message = [
    "🤲 <b>DONASI BARU</b>",
    "",
    `👤 <b>Nama:</b> ${escapeHtml(params.nama)}`,
    `📧 <b>Email:</b> ${escapeHtml(params.email)}`,
    `🆔 <b>User ID:</b> <code>${params.userId}</code>`,
    params.proofUrl ? `📎 <b>Bukti:</b> ${params.proofUrl}` : "📎 <b>Bukti:</b> Tidak diupload (hamba Allah)",
    params.loginTerakhir ? `🕐 <b>Login Terakhir:</b> ${params.loginTerakhir}` : "",
    `⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
  ].filter(Boolean).join("\n");

  await sendMessage(message);
}

export async function sendSuspendNotification(params: {
  userId: string;
  nama: string;
  email: string;
  reason: string;
}): Promise<void> {
  const message = [
    "🚫 <b>AKUN DISUSPEND</b>",
    "",
    `👤 <b>Nama:</b> ${escapeHtml(params.nama)}`,
    `📧 <b>Email:</b> ${escapeHtml(params.email)}`,
    `🆔 <b>User ID:</b> <code>${params.userId}</code>`,
    `📝 <b>Alasan:</b> ${escapeHtml(params.reason)}`,
    `⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
  ].join("\n");

  await sendMessage(message);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}