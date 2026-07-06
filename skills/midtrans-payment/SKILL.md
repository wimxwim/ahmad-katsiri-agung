---
name: midtrans-payment
description: Integrasi Midtrans (payment gateway paling populer di Indonesia) untuk website klien. Mencakup Snap API, Core API, notifikasi webhook, dan handle status pembayaran.
metadata:
  author: Agensi
  version: "2.0"
  category: Integrasi
---

# MIDTRANS PAYMENT — Payment Gateway Indonesia

## Overview
Midtrans (dulu Veritrans) adalah payment gateway #1 di Indonesia.
Support: GoPay, OVO, Dana, LinkAja, ShopeePay, QRIS, Transfer Bank, Kartu Kredit, Indomaret/Alfamart, BSI VA, Seabank, Akulaku, PayLah, Pixel.

## Mode
| Mode | Harga | Cocok untuk |
|------|-------|-------------|
| Sandbox | Gratis | Testing |
| Production | Rp 0 (biaya per transaksi ~2-3%) | Live |

## Arsitektur

```
User → Pilih Bayar → Server Create Transaction → Midtrans Snap
  → User bayar di halaman Midtrans → Midtrans Redirect → Halaman sukses
  → Midtrans Webhook → Server Update Status
```

## Implementasi

```typescript
// lib/midtrans.ts
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1"
  : "https://app.sandbox.midtrans.com/snap/v1";

export async function createTransaction(order: {
  orderId: string;
  amount: number;
  customer: { name: string; email: string; phone: string };
  items: { name: string; price: number; quantity: number }[];
}) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: order.orderId,
        gross_amount: order.amount,
      },
      credit_card: { secure: true },
      customer_details: order.customer,
      item_details: order.items,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
        error: `${process.env.NEXT_PUBLIC_URL}/payment/error`,
      },
    }),
  });
  return res.json(); // { token, redirect_url }
}

// Client-side: render Snap
// <script src="https://app.midtrans.com/snap/snap.js" data-client-key="...">
// window.snap.pay(token, { onSuccess, onPending, onError })
```

## Webhook Handler (API Route)

```typescript
// app/api/midtrans-webhook/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const { transaction_status, order_id, gross_amount } = body;

  // Verifikasi signature
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const hash = crypto
    .createHash("sha512")
    .update(order_id + body.status_code + gross_amount + serverKey)
    .digest("hex");

  if (hash !== body.signature_key) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (transaction_status === "settlement" || transaction_status === "capture") {
    // Update status order di database
    await prisma.order.update({
      where: { id: order_id },
      data: { status: "paid" },
    });
  }

  return Response.json({ ok: true });
}
```

## BI SNAP
Midtrans mendukung standar BI SNAP (Standardisasi Nasional Pembayaran).
Implementasi signature HMAC-SHA256 untuk keamanan ekstra.

## IRIS Payout
IRIS API untuk payout otomatis ke merchant (BI FAST, GoPay, VA, Bank Transfer).
Dokumentasi: docs.midtrans.com

## Env Variables
```
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_MERCHANT_ID=
```

## Cara Pakai
1. Daftar akun Midtrans (midtrans.com)
2. Dapatkan Server Key + Client Key
3. Mode Sandbox → Production setelah testing
4. Pasang webhook endpoint
5. Test semua metode pembayaran
6. Catat: biaya transaksi ~2-3% per transaksi (bukan biaya bulanan)
