# Xendit Invoice API — Referensi Detail

Sumber asli: https://docs.xendit.co/docs/payment-links-api-overview

## Endpoint

```
POST https://api.xendit.co/v2/invoices
GET  https://api.xendit.co/v2/invoices/:id
```

## Parameter Lengkap

```json
{
  "external_id": "order-unik-123",     // WAJIB — ID dari sistem kamu
  "amount": 150000,                     // WAJIB — dalam IDR, min 10.000
  "payer_email": "user@email.com",      // WAJIB
  "description": "Pembelian Produk X",  // WAJIB
  "currency": "IDR",                    // default IDR
  "success_redirect_url": "https://...",
  "failure_redirect_url": "https://...",
  "invoice_duration": 86400,            // detik, default 24 jam
  "payment_methods": ["QRIS", "BCA", "OVO"],  // kosongkan = tampilkan semua
  "customer": {
    "given_names": "Nama Customer",
    "email": "user@email.com",
    "mobile_number": "+6281234567890"
  },
  "items": [
    {
      "name": "Nama Produk",
      "quantity": 2,
      "price": 75000,
      "category": "Elektronik"
    }
  ],
  "fees": [
    { "type": "Ongkir", "value": 15000 }
  ]
}
```

## Status Invoice

| Status | Arti |
|--------|------|
| `PENDING` | Menunggu pembayaran |
| `PAID` | Sudah dibayar |
| `SETTLED` | Dana sudah settle ke akun |
| `EXPIRED` | Waktu bayar habis |

## Contoh Ambil Status Invoice

```js
const res = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}`, {
  headers: {
    'Authorization': 'Basic ' + btoa(process.env.XENDIT_SECRET_KEY + ':'),
  },
})
const invoice = await res.json()
console.log(invoice.status) // PENDING | PAID | EXPIRED
```
