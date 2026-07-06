---
name: xendit-payment
description: Integrasi Xendit Payment Gateway ke website atau aplikasi. Gunakan skill ini saat membangun fitur pembayaran dengan Invoice API, Payment Request API, Virtual Account, QRIS, e-wallet (OVO/DANA/GoPay), atau webhook Xendit — di Next.js, Node.js, Laravel, maupun backend lainnya. Cocok untuk proyek Tipe B (toko online) dan Tipe C (aplikasi/kasir) dalam pipeline agensi.
---

# Xendit Payment Gateway

Pengetahuan Xendit API bisa berubah sewaktu-waktu. **Prioritaskan retrieval dari sumber resmi** daripada bergantung pada pre-training.

**Jika ada perbedaan antara skill ini dan dokumentasi resmi, selalu percayai sumber aslinya.**

## Sumber Referensi

| Sumber | URL | Kegunaan |
|--------|-----|----------|
| Docs resmi Xendit | `https://docs.xendit.co` | Endpoint, limit, metode bayar terbaru |
| API Reference (lama) | `https://archive.developers.xendit.co/api-reference/` | QR Code, VA, Invoice detail |
| SDK Node.js | `https://github.com/xendit/xendit-node` | Client resmi untuk Next.js/Node |
| SDK PHP | `https://github.com/xendit/xendit-php` | Client resmi untuk Laravel |
| SDK Go | `https://github.com/xendit/xendit-go` | Client resmi untuk Go |

---

## Prasyarat Sebelum Koding

1. **Daftar Xendit** → [xendit.co](https://xendit.co) → verifikasi bisnis (bisa personal)
2. **Ambil API Key** → Dashboard → Settings → Developer Settings → API Keys
   - `Secret Key` → hanya di server (JANGAN expose ke frontend)
   - `Public Key` → bisa di frontend (untuk tokenisasi kartu)
3. **Mode Test** → gunakan Secret Key test mode, ada saldo test gratis
4. **Setup Webhook** → Dashboard → Settings → Developer Settings → Callbacks

---

## Dua Jalur Integrasi Utama

### Jalur 1 — Invoice API (Termudah, Rekomen untuk Pemula)

Xendit buatkan halaman pembayaran otomatis. Kamu cukup kirim request, Xendit handle UI-nya.

**Kapan pakai:** Toko online, sistem order, project klien yang butuh cepat jalan.

```js
// Next.js — app/api/buat-invoice/route.js
export async function POST(req) {
  const { amount, email, orderId, deskripsi } = await req.json()

  const res = await fetch('https://api.xendit.co/v2/invoices', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(process.env.XENDIT_SECRET_KEY + ':'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: orderId,           // ID unik dari sistem kamu
      amount: amount,                 // dalam Rupiah, min 10000
      payer_email: email,
      description: deskripsi,
      currency: 'IDR',
      success_redirect_url: `${process.env.NEXT_PUBLIC_URL}/sukses`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_URL}/gagal`,
    }),
  })

  const data = await res.json()
  // Redirect user ke data.invoice_url
  return Response.json({ invoiceUrl: data.invoice_url })
}
```

**Response penting:**
```json
{
  "id": "invoice_xxx",
  "external_id": "order-123",
  "invoice_url": "https://checkout.xendit.co/web/xxx",
  "status": "PENDING",
  "amount": 150000
}
```

---

### Jalur 2 — Payment Request API (Lebih Fleksibel)

Untuk kontrol lebih, custom UI, atau integrasi dalam aplikasi kasir.

**Dua endpoint inti:**
- `POST /payment_requests` — buat tagihan / transaksi
- `POST /payment_tokens` — simpan metode bayar user untuk transaksi berikutnya

```js
// Contoh: Buat payment request QRIS
const res = await fetch('https://api.xendit.co/payment_requests', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa(process.env.XENDIT_SECRET_KEY + ':'),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    currency: 'IDR',
    amount: 50000,
    payment_method: {
      type: 'QR_CODE',
      reusability: 'ONE_TIME_USE',
      qr_code: { channel_code: 'QRIS' },
    },
  }),
})
```

---

## Webhook — Wajib Dipasang

Webhook adalah cara Xendit memberi tahu server kamu bahwa pembayaran berhasil/gagal.

```js
// app/api/webhook/xendit/route.js
export async function POST(req) {
  const body = await req.json()

  // Verifikasi callback token (wajib untuk keamanan)
  const callbackToken = req.headers.get('x-callback-token')
  if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (body.status === 'PAID' || body.status === 'SETTLED') {
    const orderId = body.external_id
    // Update database: tandai order sebagai lunas
    // Kirim email konfirmasi ke customer
    // Aktifkan layanan/produk
    console.log('Pembayaran berhasil untuk order:', orderId)
  }

  if (body.status === 'EXPIRED') {
    // Batalkan order, kembalikan stok
  }

  return Response.json({ received: true })
}
```

**Daftarkan URL webhook di Dashboard Xendit:**
Dashboard → Settings → Developer Settings → Callbacks → Invoice Paid

**Testing lokal dengan Ngrok:**
```bash
ngrok http 3000
# Salin URL seperti: https://abc123.ngrok.io
# Pasang di Callbacks: https://abc123.ngrok.io/api/webhook/xendit
```

---

## Metode Pembayaran yang Tersedia (Indonesia)

| Jenis | Channel Code | Keterangan |
|-------|-------------|------------|
| QRIS | `QRIS` | Semua dompet digital via QR |
| Transfer BCA | `BCA` | Virtual Account BCA |
| Transfer BNI | `BNI` | Virtual Account BNI |
| Transfer Mandiri | `MANDIRI` | Virtual Account Mandiri |
| Transfer BRI | `BRI` | Virtual Account BRI |
| OVO | `OVO` | E-wallet OVO |
| DANA | `DANA` | E-wallet DANA |
| GoPay | `LINKAJA` | E-wallet GoPay/LinkAja |
| Alfamart | `ALFAMART` | Bayar di minimarket |
| Indomaret | `INDOMARET` | Bayar di minimarket |
| Kartu Kredit | `CREDIT_CARD` | Visa/Mastercard |

---

## Environment Variables

```env
# .env.local (Next.js) — JANGAN commit ke git
XENDIT_SECRET_KEY=xnd_production_xxxx...
XENDIT_PUBLIC_KEY=xnd_public_development_xxxx...
XENDIT_CALLBACK_TOKEN=xxxxx  # Dari Dashboard → Callbacks
NEXT_PUBLIC_URL=https://websitekamu.com
```

---

## Kesalahan Umum

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `401 Unauthorized` | Secret key salah atau tidak ada | Cek format Basic Auth: `base64(SECRET_KEY + ':')` |
| `422 Unprocessable` | Field wajib kurang / format salah | Cek `amount` min 10.000, `external_id` unik |
| `400 duplicate external_id` | ID order sudah dipakai | Gunakan ID unik per transaksi (timestamp+random) |
| Webhook tidak masuk | URL salah atau server tidak bisa diakses publik | Pakai Ngrok saat development |
| Callback token tidak cocok | Token di env berbeda dengan di Dashboard | Salin ulang dari Dashboard |

---

## Peta Penggunaan di Proyek Agensi

| Tipe Proyek | Metode Xendit yang Dipakai |
|-------------|---------------------------|
| **Tipe B — Toko Online** | Invoice API + Webhook |
| **Tipe C — Kasir/Aplikasi** | Payment Request API + QRIS + Webhook realtime |
| **Landing Page + Order Form** | Invoice API (paling cepat dipasang) |

---

## Quick Checklist Sebelum Deploy

- [ ] Secret Key sudah di env production (bukan test key)
- [ ] Webhook URL sudah didaftarkan di Dashboard Xendit
- [ ] Callback token diverifikasi di kode webhook
- [ ] `external_id` dijamin unik per transaksi
- [ ] Error handling untuk status `EXPIRED` dan `FAILED`
- [ ] Test transaksi dengan mode sandbox sebelum live
