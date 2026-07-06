# Xendit Webhook — Referensi Detail

Sumber asli: https://docs.xendit.co/apidocs/payment-token-webhook-notification

## Setup di Dashboard

1. Buka Dashboard Xendit
2. Settings → Developer Settings → Callbacks
3. Isi URL endpoint kamu per event:
   - **Invoice Paid** → `/api/webhook/xendit/invoice`
   - **VA Paid** → `/api/webhook/xendit/va`
   - **Ewallet** → `/api/webhook/xendit/ewallet`
4. Salin **Callback Token** → simpan di `.env` sebagai `XENDIT_CALLBACK_TOKEN`

## Verifikasi Keamanan

Selalu verifikasi `x-callback-token` header sebelum proses webhook:

```js
const callbackToken = req.headers.get('x-callback-token')
if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}
```

## Payload Contoh — Invoice Paid

```json
{
  "id": "invoice_xxx",
  "external_id": "order-123",
  "user_id": "user_xxx",
  "status": "PAID",
  "merchant_name": "Nama Toko",
  "amount": 150000,
  "paid_amount": 150000,
  "paid_at": "2026-01-15T10:30:00.000Z",
  "payer_email": "customer@email.com",
  "payment_method": "BCA",
  "payment_channel": "BCA",
  "payment_destination": "1234567890"
}
```

## Idempotency — Cegah Double Proses

```js
// Simpan invoice ID yang sudah diproses di database
const alreadyProcessed = await db.payment.findUnique({
  where: { xenditInvoiceId: body.id }
})

if (alreadyProcessed) {
  return Response.json({ received: true }) // abaikan duplikat
}

// Proses pembayaran...
await db.payment.create({ data: { xenditInvoiceId: body.id, ... } })
```

## Testing Lokal

```bash
# Install ngrok
npm install -g ngrok

# Jalankan tunnel
ngrok http 3000

# Hasilnya seperti: https://abc123.ngrok-free.app
# Daftarkan di Dashboard Xendit:
# https://abc123.ngrok-free.app/api/webhook/xendit/invoice
```
