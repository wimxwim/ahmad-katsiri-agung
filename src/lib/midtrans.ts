import "server-only";
import crypto from "crypto";

export interface SnapTransactionParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  courseName: string;
}

export interface SnapTransactionResult {
  token: string;
  redirect_url: string;
}

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_MERCHANT_ID = process.env.MIDTRANS_MERCHANT_ID || "";
const MIDTRANS_API_URL =
  process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";

export const IS_MIDTRANS_READY = Boolean(MIDTRANS_SERVER_KEY && MIDTRANS_MERCHANT_ID);

export async function createSnapTransaction(
  params: SnapTransactionParams
): Promise<SnapTransactionResult> {
  if (!IS_MIDTRANS_READY) {
    throw new Error("Midtrans is not configured. Set MIDTRANS_SERVER_KEY and MIDTRANS_MERCHANT_ID.");
  }

  const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
    },
    item_details: [
      {
        id: params.orderId,
        price: params.amount,
        quantity: 1,
        name: params.courseName,
      },
    ],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/siswa/kursus`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/siswa/payment`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/siswa/payment`,
    },
  };

  const response = await fetch(MIDTRANS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_messages?.[0] || "Midtrans API error");
  }

  return {
    token: data.token,
    redirect_url: data.redirect_url,
  };
}

export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  if (!MIDTRANS_SERVER_KEY) return false;

  const computed = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY)
    .digest("hex");

  if (computed.length !== signatureKey.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureKey));
}
