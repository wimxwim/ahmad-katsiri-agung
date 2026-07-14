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

async function sendPhoto(photoUrl: string, caption: string): Promise<void> {
  if (!BOT_TOKEN) {
    console.error("[telegram-notif] TELEGRAM_BOT_TOKEN tidak diset");
    return;
  }
  if (!CHAT_ID) {
    console.error("[telegram-notif] TELEGRAM_CHAT_ID tidak diset");
    return;
  }

  console.log("[telegram-notif] Mengirim foto ke Telegram...", { chatId: CHAT_ID.slice(0, 4) + "..." });

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        photo: photoUrl,
        caption,
        parse_mode: "HTML",
      }),
    });

    const body = await res.text().catch(() => "");
    console.log("[telegram-notif] Response:", res.status, body.slice(0, 100));

    if (!res.ok) {
      console.error("[telegram-notif] Gagal kirim foto:", res.status, body.slice(0, 200));
    } else {
      console.log("[telegram-notif] Foto berhasil dikirim ke Telegram");
    }
  } catch (e) {
    console.error("[telegram-notif] Error foto:", e instanceof Error ? e.message : String(e));
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
  const caption = [
    "💰 <b>TOP-UP BARU</b>",
    "",
    `👤 <b>Nama:</b> ${escapeHtml(params.nama)}`,
    `📧 <b>Email:</b> ${escapeHtml(params.email)}`,
    `🆔 <b>User ID:</b> <code>${params.userId}</code>`,
    `💵 <b>Nominal:</b> Rp${params.amount.toLocaleString("id-ID")}`,
    `🏦 <b>Saldo Sekarang:</b> Rp${params.newBalance.toLocaleString("id-ID")}`,
    params.loginTerakhir ? `🕐 <b>Login Terakhir:</b> ${params.loginTerakhir}` : "",
    `⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
  ].filter(Boolean).join("\n");

  await sendPhoto(params.proofUrl, caption);
}

export async function sendDonationNotification(params: {
  userId: string;
  nama: string;
  email: string;
  proofUrl?: string;
  loginTerakhir?: string;
}): Promise<void> {
  const caption = [
    "🤲 <b>DONASI BARU</b>",
    "",
    `👤 <b>Nama:</b> ${escapeHtml(params.nama)}`,
    `📧 <b>Email:</b> ${escapeHtml(params.email)}`,
    `🆔 <b>User ID:</b> <code>${params.userId}</code>`,
    params.loginTerakhir ? `🕐 <b>Login Terakhir:</b> ${params.loginTerakhir}` : "",
    `⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
  ].filter(Boolean).join("\n");

  if (params.proofUrl) {
    await sendPhoto(params.proofUrl, caption);
  } else {
    await sendMessage(caption + "\n📎 <b>Bukti:</b> Tidak diupload (hamba Allah)");
  }
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