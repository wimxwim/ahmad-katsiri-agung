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

function getMidtransServerKey(): string {
  return process.env.MIDTRANS_SERVER_KEY || "";
}

function getMidtransMerchantId(): string {
  return process.env.MIDTRANS_MERCHANT_ID || "";
}

function getMidtransApiUrl(): string {
  return process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

export function isMidtransReady(): boolean {
  return Boolean(getMidtransServerKey() && getMidtransMerchantId());
}

export async function createSnapTransaction(
  params: SnapTransactionParams
): Promise<SnapTransactionResult> {
  if (!isMidtransReady()) {
    throw new Error("Midtrans is not configured. Set MIDTRANS_SERVER_KEY and MIDTRANS_MERCHANT_ID.");
  }

  const auth = Buffer.from(`${getMidtransServerKey()}:`).toString("base64");

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

  const response = await fetch(getMidtransApiUrl(), {
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
  if (!getMidtransServerKey()) return false;

  const computed = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + getMidtransServerKey())
    .digest("hex");

  if (computed.length !== signatureKey.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureKey));
}
