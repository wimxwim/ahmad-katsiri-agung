---
name: payment-security-review
description: Payment Security Review — 5 FASE KEAMANAN SEKELAS STARTUP INTERNASIONAL. Audit implementasi pembayaran berbasis riset 2026. Wajib dipakai SETIAP KALI membangun atau meninjau fitur pembayaran. Fokus: threat modeling (STRIDE), perlindungan server key, validasi signature webhook SHA512, anti-IDOR/CSRF/XSS/SQLi/amount tampering, rate limiting (JICS 2025 — DDoS mitigation), secret management, TLS 1.3, larangan self-host snap.js, kepatuhan OWASP ASVS. Semua klaim diverifikasi dari dokumentasi resmi Midtrans, JICS Paper 2025, Snyk, dan npm. Trigger: 'payment security', 'review pembayaran', 'audit payment', 'midtrans security', 'keamanan pembayaran', 'payment audit', 'gunakan skills midtrans', 'midtrans', 'skill midtrans', '5 fase security', 'donasi manual', 'audit donasi', 'payment review', 'verifikasi pembayaran', 'transfer manual', 'bukti transfer', 'payment proof', atau saat membuat endpoint pembayaran/webhook baru atau endpoint verifikasi donasi/fundraising manual.
---

# 🛡️ Payment Security Review — 6 Fase Keamanan Kelas Startup Internasional

> **JANGAN PERNAH menganggap sistem pembayaran aman secara default.**
> Setiap implementasi pembayaran WAJIB melewati **5 Fase Security** ini sebelum satu baris kode ditulis.

```
┌─────────────────────────────────────────────────────────────┐
│    6 FASE KEAMANAN PAYMENT GATEWAY (Standar Internasional)   │
├─────────────────────────────────────────────────────────────┤
│ FASE 1: THREAT MODELING  — STRIDE, aset, vektor serangan   │
│ FASE 2: ASSET PROTECTION — Server Key, secrets, env vars   │
│ FASE 3: IMPLEMENTATION  〓 Kode aman, webhook, rate limit  │
│ FASE 4: PENETRATION     — Uji IDOR, XSS, SQLi, CSRF, tamper│
│ FASE 5: PRE-PROD GATE   — Checklist + grep sebelum deploy │
│ FASE 6: MANUAL CASH     — Donasi manual, file upload, scope│
└─────────────────────────────────────────────────────────────┘
```

Skill ini bekerja untuk **SEMUA payment gateway** (Midtrans, Xendit, Stripe, iPaymu, Doku, dll) dengan contoh spesifik Midtrans.

---

## 📋 Daftar Isi — 5 Fase

| Fase | Level | Isi |
|------|-------|-----|
| **Fase 1 — Threat Modeling** | 🟡 Strategis | STRIDE per komponen, identifikasi aset, analisis vektor serangan |
| **Fase 2 — Asset Protection** | 🔴 Kritis | Server Key, env vars, larangan self-host, TLS 1.3 |
| **Fase 3 — Secure Implementation** | 🔵 Teknis | Snap token, webhook, rate limiting, pola kode aman |
| **Fase 4 — Security Testing** | 🟠 Forensik | IDOR, XSS, SQLi, CSRF, amount tampering, race condition |
| **Fase 5 — Pre-Production Gate** | 🟢 Final | Audit checklist, grep commands, env verification |
| **Fase 6 — Manual Payment Flow** | 🟠 Extended | Transfer + bukti foto, file upload security, distributed rate limit, cross-tenant scope, anti-replay |

---

## Fase 1 — Threat Modeling (STRIDE)

> *Startup internasional tidak coding sebelum paham ancaman.*

Sebelum menulis kode pembayaran, jawab ini:

### 1. Identifikasi Aset & Kepercayaan

| Aset | Lokasi | Risiko jika bocor |
|------|--------|-------------------|
| Midtrans Server Key | Server (env var) | Transaksi fraudulent unlimited |
| Midtrans Client Key | Frontend (aman) | Rendah (read-only) |
| Transaction Token (snap_token) | Frontend (sementara) | Pembayaran ditransfer akun lain |
| Order ID / external_id | Frontend + Backend | Duplicate/IDOR transaksi |
| Webhook Signature Key | Server (env var) | Webhook palsu → update order palsu |
| Database transaksi | Database | Data finansial bocor |
| Log server | Log files | PII/transaksi bocor via log |

### 2. Identifikasi Vektor Serangan (STRIDE per komponen)

| Komponen | Spoofing | Tampering | Repudiation | Info Disc | DoS | Elevation |
|----------|----------|-----------|-------------|-----------|-----|-----------|
| Snap Token API | ✓ | ✓ | | ✓ | ✓ | |
| Webhook Handler | ✓ | ✓ | ✓ | | | ✓ |
| Payment Status API | ✓ | ✓ | | ✓ | ✓ | ✓ |
| Frontend Checkout | ✓ | | | ✓ | | |
| Order Completion | | ✓ | ✓ | ✓ | | ✓ |

### 3. Mitigasi Prioritas

1. **Server Key hanya di server** — jangan pernah dikirim ke frontend
2. **Webhook signature WAJIB diverifikasi** — `X-Midtrans-Signature`
3. **Order ID unik + ownership check** — cegah IDOR
4. **Rate limiting ketat** — endpoint payment = target brute force
5. **HTTPS + HSTS** — TLS non-negotiable

---

## Fase 2 — Asset Protection (Server Key & Secrets)

### 🚨 Server Key / API Key

```
Midtrans Server Key   → 🔴 RAHASIA → env var server-only
Midtrans Client Key   → 🟢 publik → di frontend (aman)
Xendit Secret Key     → 🔴 RAHASIA → env var server-only
Stripe Secret Key     → 🔴 RAHASIA → env var server-only
```

### ❌ DILARANG KERAS

```typescript
// 🔴 BAHAYA — Server Key dikirim ke frontend
const response = await fetch('/api/midtrans/charge', {
  body: JSON.stringify({ server_key: process.env.MIDTRANS_SERVER_KEY })
})

// 🔴 BAHAYA — Server key hardcode di kode
const midtrans = new Midtrans({ isProduction: false, serverKey: 'SB-Mid-server-xxxx' })

// 🔴 BAHAYA — Server key bocor di error response
return NextResponse.json({ error: 'Gagal', detail: { serverKey: midtrans.serverKey } })
```

### ✅ AMAN

```typescript
// Server key hanya dipakai di server, tidak dikirim ke manapun
import { MidtransClient } from 'midtrans-node'

const snap = new MidtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,  // env var
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
})

export async function createTransaction(orderId: string, amount: number) {
  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: orderId,
      gross_amount: amount
    }
  })
  return { token: transaction.token }  // snap_token, bukan server key
}
```

### Aturan Emas Server Key

| ✅ WAJIB | ❌ JANGAN |
|----------|-----------|
| Hanya di server-side code | Dikirim ke `fetch()` dari browser |
| Di `process.env` / env var production | Hardcode di file `.ts` / `.js` |
| Di-validasi keberadaannya di startup | Masuk log/error message |
| Hanya backend yang akses | Diekspos di response API |

---

## Fase 3 — Secure Implementation (Midtrans-Specific)

### Snap Token — Mekanisme & Risiko

```
Frontend ──POST /api/checkout──→ Backend ──Midtrans API──→ Snap Token
                                                                 │
Frontend ←──── { token } ────── Backend ←──── snap_token ───────┘
    │
    ├── Snap popup (client key + token)
    │
    └── Customer bayar → Midtrans kirim webhook → Backend verifikasi
```

**Risiko Snap Token:**
- Token curian → pembayaran mengatasnamakan user lain
- Token expired (biasanya 1-2 jam) → transaksi gagal
- Token bisa dipakai hanya SEKALI → replay tidak mungkin

**Mitigasi:**
- Snap token hanya dibuat setelah autentikasi/otorisasi backend
- Order ID di token harus diverifikasi milik user yang sedang login
- Jangan izinkan frontend memilih order_id — backend yang menentukan

### Verifikasi Signature Webhook Midtrans

```typescript
// 🔴 Kode ini RENTAN — tidak verifikasi signature
export async function POST(req: Request) {
  const body = await req.json()
  if (body.transaction_status === 'settlement') {
    // LANGSUNG update order — berbahaya!
  }
}
```

```typescript
// ✅ AMAN — verifikasi signature Midtrans
import crypto from 'crypto'

function verifyMidtransWebhook(
  body: Record<string, unknown>,
  signatureKey: string,
  serverKey: string
): boolean {
  // Order ID dari body webhook
  const orderId = body.order_id as string
  // Status code dari body
  const statusCode = body.status_code as string
  // Gross amount dari body  
  const grossAmount = body.gross_amount as string
  // Signature dari header
  const signature = signatureKey

  // 1. Hash: SHA512(order_id + status_code + gross_amount + server_key)
  const hash = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex')

  // 2. Bandingkan dengan timingSafeEqual (cegah timing attack)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}
```

### Webhook Handler Lengkap

```typescript
export async function POST(req: Request) {
  const body = await req.json()
  const signatureKey = req.headers.get('x-midtrans-signature') || ''
  const serverKey = process.env.MIDTRANS_SERVER_KEY!

  // ✅ WAJIB: verifikasi signature
  if (!verifyMidtransWebhook(body, signatureKey, serverKey)) {
    console.error('[MIDTRANS] Signature mismatch:', body.order_id)
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { transaction_status, fraud_status, order_id, transaction_id } = body

  // ✅ Handle semua status transaksi
  switch (transaction_status) {
    case 'capture':
      if (fraud_status === 'accept') {
        // Pembayaran berhasil — update database
        await markOrderAsPaid(order_id, transaction_id, body)
      } else if (fraud_status === 'deny') {
        await markOrderAsFailed(order_id, 'Fraud detected')
      } else if (fraud_status === 'challenge') {
        await markOrderAsChallenge(order_id)
      }
      break
    case 'settlement':
      // Pembayaran settled (dana masuk)
      await markOrderAsPaid(order_id, transaction_id, body)
      break
    case 'pending':
      // Pembayaran menunggu
      break
    case 'deny':
      await markOrderAsFailed(order_id, 'Denied by Midtrans')
      break
    case 'cancel':
    case 'expire':
      await markOrderAsFailed(order_id, `Payment ${transaction_status}`)
      break
    case 'refund':
    case 'partial_refund':
      await markOrderAsRefunded(order_id, body)
      break
  }

  // ✅ WAJIB: idempotency — response 200 meski sudah diproses
  return Response.json({ status: 'ok' })
}
```

### Core API / Charge — Aman

Jika menggunakan Core API (bukan Snap):

```typescript
// ✅ AMAN — charge dari backend, bukan frontend
export async function chargeCreditCard(orderId: string, amount: number, tokenId: string) {
  const core = new MidtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
  })

  // ❌ JANGAN: kirim serverKey ke sini
  // ❌ JANGAN: biarkan frontend pilih order_id, amount, dll

  const chargeResponse = await core.charge({
    payment_type: 'credit_card',
    transaction_details: {
      order_id: orderId,   // DIBIKIN OLEH BACKEND, bukan dari body request!
      gross_amount: amount  // DARI DATABASE/LOGIKA, bukan dari body request!
    },
    credit_card: {
      token_id: tokenId,
      authentication: true  // 3DS untuk keamanan ekstra
    }
  })

  return chargeResponse
}
```

---

### Persyaratan TLS/HTTPS (Resmi Midtrans)

Berdasarkan dokumentasi resmi Midtrans (2026):

| Persyaratan | Detail |
|-------------|--------|
| ✅ **HTTPS Wajib** | Semua komunikasi dengan Midtrans via HTTPS saja — tidak boleh plain HTTP |
| ✅ **TLS 1.3 direkomendasikan** | Handshake lebih cepat, latency lebih rendah untuk mobile e-wallet |
| ✅ **TLS 1.2 minimum** | TLS 1.0/1.1 sudah dinonaktifkan (rentan) |
| ✅ **Cipher modern** | `TLS_AES_128_GCM_SHA256`, `CHACHA20_POLY1305`, `ECDHE-RSA-AES128-GCM-SHA256` |
| ✅ **Key Exchange** | `x25519` untuk performa, `secp256r1` untuk kompatibilitas |
| ✅ **HTTP/2 support** | Multiplexing mempercepat batch request |

**Wajib dipastikan di deployment:**
- Gunakan sertifikat TLS valid (Let's Encrypt, Cloudflare, dll)
- Jangan nonaktifkan verifikasi sertifikat di production
- Uji koneksi: `openssl s_client -connect api.midtrans.com:443 -tls1_3`

### JANGAN Self-Host snap.js

```diff
- ❌ DILARANG: download dan host snap.js di server sendiri
- <script src="/assets/js/snap.js"></script>

+ ✅ WAJIB: load dari Midtrans
+ <script src="https://app.midtrans.com/snap/snap.js" 
+   data-client-key="<NEXT_PUBLIC_MIDTRANS_CLIENT_KEY>"></script>
```

Midtrans secara eksplisit melarang self-hosting `midtrans.min.js` dan `snap.js` karena:
1. Keamanan — versi terbaru selalu di-patch Midtrans
2. Enkripsi — file di-host via HTTPS dengan TLS
3. Update otomatis — tanpa self-host, merchant selalu dapat versi terbaru

---

## Fase 4 — Security Testing (Vektor Serangan & Mitigasi)

### 1. 🔴 API Key Leakage

| Sumber Kebocoran | Deteksi | Mitigasi |
|-----------------|---------|----------|
| Hardcode di source code | `grep -r "SB-Mid-server\|MIDTRANS_SERVER" src/` | Env var + .gitignore |
| Response API error | Cek semua error handler | Jangan expose secret di response |
| Log server | Audit log statements | Filter/redact sebelum log |
| Frontend JS bundle | Cek `NEXT_PUBLIC_*` hanya untuk client key | Server key tidak boleh `NEXT_PUBLIC_*` |
| Commit history | `git log -p --all \| grep "SB-Mid-server"` | Git scrub + rotasi key |

### 2. 🔴 IDOR (Insecure Direct Object Reference)

```typescript
// ❌ RENTAN: siapa pun bisa cek status order siapa pun
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('order_id')
  const order = await db.order.findUnique({ where: { id: orderId } })
  return Response.json(order)  // 🔴 order milik user lain bocor!
}

// ✅ AMAN: ownership check
export async function GET(req: Request) {
  const session = await getAuthSession()
  if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('order_id')
  const order = await db.order.findUnique({ where: { id: orderId } })

  // ✅ WAJIB: verifikasi kepemilikan
  if (!order || order.userId !== session.userId) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({ status: order.status })
}
```

### 3. 🔴 CSRF pada Endpoint Pembayaran

```typescript
// ✅ Proteksi CSRF di semua endpoint state-changing
import { csrfProtection } from '@/lib/csrf'

export const POST = csrfProtection(async (req: Request) => {
  // Hanya diproses jika CSRF token valid
  const body = await req.json()
  // ... process payment
})
```

### 4. 🟡 XSS (jika ada refund/status page)

```typescript
// ❌ RENTAN: user input langsung di-render
<div>{transaction.transaction_id}</div>

// ✅ AMAN: escape output
<div>{String(transaction.transaction_id)}</div>
```

### 5. 🟡 SQL Injection

```typescript
// ❌ BAHAYA: concatenation
const query = `SELECT * FROM orders WHERE order_id = '${orderId}'`

// ✅ AMAN: parameterized
const order = await db.order.findUnique({ where: { id: orderId } })
// atau SQL raw dengan bind param
await db.$queryRaw`SELECT * FROM orders WHERE order_id = ${orderId}`
```

### 6. 🟡 Amount Tampering

```typescript
// ❌ RENTAN: frontend mengirim amount
async function createPayment(req: Request) {
  const { amount, orderId } = await req.json()
  // 🔴 user bisa kirim Rp 1 untuk barang Rp 100.000
}

// ✅ AMAN: amount dari database
async function createPayment(req: Request) {
  const session = await getAuthSession()
  const { orderId } = await req.json()
  const order = await db.order.findUnique({
    where: { id: orderId, userId: session!.userId }
  })
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })
  // ✅ amount dari database, bukan request body!
  const amount = order.totalAmount
}
```

### 7. 🟡 Race Condition (Double Charge)

```typescript
// ❌ RENTAN: race condition — dua webhook settlement masuk bersamaan
async function markOrderAsPaid(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order) return
  if (order.status === 'paid') return  // 🔴 masih bisa terjadi race
  // ... update ke paid
}

// ✅ AMAN: atomic update + idempotency key
async function markOrderAsPaid(orderId: string) {
  await db.order.updateMany({
    where: {
      id: orderId,
      status: { not: 'paid' }  // ✅ atomic: hanya update jika belum paid
    },
    data: { status: 'paid', paidAt: new Date() }
  })
}
```

---

### Secure Implementation Patterns

### Pattern 1: Create Transaction (Snap)

```typescript
// app/api/payments/create/route.ts
import { NextResponse } from 'next/server'
import { MidtransClient } from 'midtrans-node'
import { getAuthSession } from '@/lib/auth'
import { z } from 'zod'

const snap = new MidtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
})

const CreatePaymentSchema = z.object({
  orderId: z.string().min(1)
})

export async function POST(request: Request) {
  try {
    // 1. ✅ Autentikasi
    const session = await getAuthSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ✅ Validasi input
    const body = await request.json().catch(() => ({}))
    const parsed = CreatePaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { orderId } = parsed.data

    // 3. ✅ Otorisasi + amount dari database
    const order = await db.order.findUnique({ where: { id: orderId } })
    if (!order || order.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 409 })
    }

    // 4. ✅ Buat transaksi di Midtrans
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: `${orderId}-${Date.now()}`,  // unik untuk setiap percobaan
        gross_amount: order.totalAmount          // dari database
      },
      customer_details: {
        first_name: session.userName,
        email: session.userEmail
      }
    })

    // 5. ✅ Simpan snap token untuk tracking
    await db.paymentAttempt.create({
      data: {
        orderId: order.id,
        snapToken: transaction.token,
        snapRedirectUrl: transaction.redirect_url,
        userId: session.userId
      }
    })

    // ✅ HANYA snap token yang dikirim — bukan server key!
    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url
    })

  } catch (error) {
    console.error('[PAYMENT] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
```

### Pattern 2: Rate Limiting (Krusial — Riset JICS 2025)

> **Penelitian terverifikasi (JICS 2025):** Midtrans API tanpa rate limiting rentan terhadap DDoS.
> Dengan `express-rate-limit`, latency menurun signifikan dan stabilitas sistem terjaga.
> HTTP 429 digunakan untuk menolak request berlebih. (Sumber: JICS Paper, tested on Node.js)

```typescript
// app/api/payments/create/route.ts — tambah rate limit
import { rateLimit } from '@/lib/rate-limit'

// Rate limit KETAT untuk endpoint pembayaran — target utama DDoS
const limiter = rateLimit({
  interval: 60 * 1000,   // 1 menit
  max: 5                  // max 5 request per menit per user
})

export async function POST(request: Request) {
  // ✅ Rate limit berdasarkan IP atau user ID
  const session = await getAuthSession()
  const identifier = session?.userId || request.headers.get('x-forwarded-for') || 'unknown'
  const { success, limit, remaining } = await limiter.check(identifier)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': String(remaining) } }
    )
  }

  // ... lanjut buat transaksi
}
```

### Pattern 3: Status Check Aman

```typescript
// app/api/payments/status/route.ts — cek status transaksi
export async function GET(request: Request) {
  const session = await getAuthSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get('transaction_id')

  if (!transactionId) {
    return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 })
  }

  // ✅ WAJIB: verifikasi ownership — user hanya bisa cek transaksi miliknya
  const payment = await db.paymentAttempt.findUnique({
    where: { id: transactionId },
    include: { order: { select: { userId: true } } }
  })

  if (!payment || payment.order.userId !== session.userId) {
    // Jangan bedakan "not found" vs "not yours" — hindari IDOR oracle
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    status: payment.status,
    amount: payment.amount
  })
}
```

### Pattern 4: Core API Charge Aman

```typescript
// app/api/payments/core-charge/route.ts
export async function POST(request: Request) {
  // 1. Autentikasi
  const session = await getAuthSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validasi input — hanya token_id, bukan amount/order_id
  const { tokenId, orderId } = await request.json()
  if (!tokenId || !orderId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // 3. Otorisasi + amount dari database
  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // 4. Charge — amount dari database, BUKAN dari request
  const core = new MidtransClient.CoreApi({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
  })

  const charge = await core.charge({
    payment_type: 'credit_card',
    transaction_details: {
      order_id: orderId,
      gross_amount: order.totalAmount  // ✅ dari DB
    },
    credit_card: {
      token_id: tokenId,
      authentication: true
    }
  })

  return NextResponse.json(charge)
}
```

---

### Webhook Handling Wajib

### Aturan Emas Webhook

| Aturan | Keterangan |
|--------|------------|
| ✅ **Verifikasi signature** | Setiap webhook wajib diverifikasi SHA512 atau pakai `notification()` |
| ✅ **Idempotency** | Webhook bisa dikirim >1 kali → handler harus idempoten |
| ✅ **Atomic update** | Gunakan `updateMany` dengan kondisi `status != 'paid'` |
| ✅ **Log + monitor** | Catat semua webhook masuk untuk audit trail |
| ✅ **Timeout handling** | Jangan timeout — balas 200 dulu, proses async |
| ❌ **Trust body blindly** | Verifikasi signature SEBELUM baca body |

### Alternatif: Pakai Official Library

Official `midtrans-client` (npm) sudah menyediakan method `notification()` yang otomatis melakukan verifikasi ke Midtrans API (GET Status), bukan sekadar hash comparison:

```typescript
const midtransClient = require('midtrans-client')

let apiClient = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
})

export async function POST(req: Request) {
  const notificationJson = await req.json()

  // ✅ Auto-verifikasi: method ini internally panggil GET Status API ke Midtrans
  //   untuk memastikan notifikasi benar-benar dari Midtrans
  const statusResponse = await apiClient.transaction.notification(notificationJson)

  let orderId = statusResponse.order_id
  let transactionStatus = statusResponse.transaction_status
  let fraudStatus = statusResponse.fraud_status

  // Gunakan statusResponse seperti biasa
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') {
      await markOrderAsPaid(orderId, statusResponse)
    } else if (fraudStatus === 'challenge') {
      await markOrderAsChallenge(orderId)
    }
  } else if (transactionStatus === 'settlement') {
    await markOrderAsPaid(orderId, statusResponse)
  } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
    await markOrderAsFailed(orderId, transactionStatus)
  }

  return Response.json({ status: 'ok' })
}
```

### Error Webhook yang Sering

| Error | Penyebab | Solusi |
|-------|----------|--------|
| Signature mismatch | Server key di env berbeda dengan dashboard | Cek env production vs staging |
| Webhook ganda | Midtrans kirim ulang | Pastikan idempotent |
| Order not found | Order ID tidak dikenal | Verifikasi order_id di body webhook |
| Status sudah paid | Duplicate webhook settlement | Update atomic — skip jika sudah paid |

---

---

## Fase 5 — Pre-Production Gate (Audit Checklist)

Gunakan checklist ini SETIAP KALI menulis/mereview kode pembayaran:

### 🔴 CRITICAL — Harus Dipenuhi Sebelum Deploy

- [ ] **Server key tidak pernah** dikirim ke frontend (cek semua fetch call)
- [ ] **Webhook signature** diverifikasi SHA512 atau pakai `notification()` official library
- [ ] **Amount di-backend** — tidak pernah percaya amount dari frontend
- [ ] **Order ID dari backend** — user tidak bisa memilih order_id sendiri
- [ ] **Ownership check** — setiap akses order/transaksi periksa kepemilikan
- [ ] **Rate limiting** — maksimal 5 percobaan pembayaran per menit per user (JICS: krusial cegah DDoS)
- [ ] **HTTPS + TLS 1.2+** — TLS 1.3 preferred, HTTP/2 untuk performa
- [ ] **snap.js dari Midtrans** — jangan self-host
- [ ] **Card data jangan disimpan** — merchant dilarang rekam card credential (kecuali PCI DSS certified)

### 🟡 HIGH — Wajib Diperhatikan

- [ ] Autentikasi di semua endpoint pembayaran
- [ ] Otorisasi — user hanya bisa akses data miliknya
- [ ] CSRF protection di endpoint state-changing
- [ ] Input validation dengan schema (Zod/Yup)
- [ ] Idempotency — webhook dan duplicate request
- [ ] Amount minimal — validasi nominal transaksi
- [ ] Error message tidak bocor sensitive info
- [ ] Secret key tidak ada di log
- [ ] NoSQL/SQL injection prevention
- [ ] Snap token dikelola backend, tidak di-frontend

### 🟢 MEDIUM

- [ ] Transaction status dikirim via webhook, bukan polling frontend
- [ ] HSTS headers aktif
- [ ] Content Security Policy (CSP)
- [ ] CORS dibatasi (jika ada payment API)
- [ ] Dependencies terbaru (npm audit bersih)

---

### Pre-Deploy Gate Commands

Sebelum deploy ke production:

```bash
# 1. Cek hardcoded secret di kode
grep -rn "SB-Mid-server\|MIDTRANS_SERVER_KEY=" src/ --include="*.ts" --include="*.tsx"
#   → hasilnya harus KOSONG (hanya di .env)

# 2. Cek env var terisi
grep -r "process.env.MIDTRANS_SERVER_KEY" src/ --include="*.ts"
#   → hanya di server-side file

# 3. Cek NEXT_PUBLIC_MIDTRANS_SERVER_KEY (BAHAYA kalau ada)
grep -rn "NEXT_PUBLIC_MIDTRANS_SERVER_KEY\|NEXT_PUBLIC_.*SERVER_KEY" .
#   → harus TIDAK ADA

# 4. Cek server key di git history
git log -p --all | grep "SB-Mid-server"
#   → harus KOSONG — kalau ada, rotasi key & scrub git history

# 5. Cek XSS/parameterized query
#   → sudah pakai parameterized query?
#   → sudah escape output untuk data transaksi di frontend?

# 6. Cek ownership check
#   → setiap endpoint yang terima order_id punya session?.userId check?
```

### Environment Variables — Wajib

```env
# Server-only (JANGAN NEXT_PUBLIC_)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_WEBHOOK_KEY=xxxxx             # opsional, untuk validasi tambahan
DATABASE_URL=postgresql://...

# Boleh publik (NEXT_PUBLIC_)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
NEXT_PUBLIC_APP_URL=https://example.com
```

---

---

## ⚡ Fase 6 — Extended: Manual Payment Flow Security (Transfer + Foto Bukti)

> *Berdasarkan audit kode donasi manual (gotong-royong-pwa, Jun 2026). Belum ada payment gateway → celah berbeda.*

Tidak semua proyek menggunakan payment gateway otomatis. Donasi manual (transfer bank + foto bukti) punya vektor serangan yang berbeda. Fase ini menutup celah yang ditemukan saat audit proyek nyata.

---

### 6.1 🔴 CRITICAL — Authorization Gap di Endpoint Verifikasi

```typescript
// ❌ RENTAN: tidak ada role/community check di Server Action verifikasi
export async function verifikasiDonasi(formData: FormData): Promise<void> {
  const user = await getUser()
  if (!user) return              // 🔴 siapa pun yang login bisa verify/reject donasi

  const parsed = verifikasiDonasiSchema.safeParse({ ... })
  if (!parsed.success) return    // 🔴 error silent — user tidak tahu gagal

  await supabase.from("donations").update({ status, catatan, verifikator_id: user.id })
    .eq("id", parsed.data.donationId)
  // 🔴 RLS di DB mungkin tolak, tapi user dapat response 200 — FALSE SENSE OF SECURITY
}
```

✅ **Aturan Emas:**
- **Role check di kode (bukan hanya RLS)** — RLS adalah lapisan terakhir, bukan satu-satunya
- **Community scope check** — verifikasi bahwa record milik komunitas user
- **Return error ke user** — jangan silent `Promise<void>` pada aksi finansial

```typescript
// ✅ AMAN — authorization + scope + error handling
export async function verifikasiDonasi(formData: FormData): Promise<ActionState> {
  const user = await getUser()
  if (!user) return { error: "Harus masuk dulu." }

  const parsed = verifikasiDonasiSchema.safeParse({ ... })
  if (!parsed.success) return { error: "Data tidak valid." }

  const supabase = await createClient()

  // ✅ Verifikasi role + community scope dalam SATU query
  const { data: donation } = await supabase.from("donations")
    .select("community_id, status")
    .eq("id", parsed.data.donationId)
    .single()

  if (!donation) return { error: "Donasi tidak ditemukan." }
  if (!await isPengurus(supabase, donation.community_id, user.id))
    return { error: "Hanya pengurus yang bisa verifikasi." }
  if (donation.status !== "menunggu")
    return { error: "Donasi sudah diverifikasi sebelumnya." }

  // ✅ Update dengan optimistic concurrency
  const { error } = await supabase.from("donations")
    .update({ status: parsed.data.status, catatan: parsed.data.catatan || null, verifikator_id: user.id })
    .eq("id", parsed.data.donationId)
    .eq("status", "menunggu")          // atomic: hanya jika masih menunggu

  if (error) return { error: error.message }

  revalidatePath("/donasi")
  return { success: true }
}
```

### 6.2 🟡 File Upload Security — Payment Proofs

| Celah | Dampak | Mitigasi |
|-------|--------|----------|
| MIME type spoofing | Upload non-gambar (script/HTML) | ✅ Cek magic bytes, bukan cuma `content-type` header |
| Eksekusi server-side | File diupload → diakses → dieksekusi | ✅ Simpan di private bucket (bukan public) |
| Path traversal | `../../../etc/passwd` di nama file | ✅ Sanitasi filename + path dari backend |
| Ukuran file besar | DoS storage/bloat | ✅ Batasi ukuran (5 MB cukup) |
| No magic byte check | Gambar palsu/tidak valid diterima | ✅ Validasi magic bytes sebelum upload |

```typescript
// ❌ RENTAN: hanya cek MIME type header (bisa spoof)
if (!file.type.startsWith("image/")) return { error: "Hanya file gambar." }

// ✅ AMAN: validasi magic bytes (signature file)
const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xFF, 0xD8, 0xFF])],
  "image/png":  [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])],  // RIFF header
  "image/gif":  [new Uint8Array([0x47, 0x49, 0x46, 0x38])],
}

function validateImageMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) return false
  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  )
}

// Di upload function:
const buffer = new Uint8Array(await file.arrayBuffer())
if (!validateImageMagicBytes(buffer, file.type)) {
  return { error: "File tidak dikenali sebagai gambar." }
}
```

### 6.3 🟡 Distributed Rate Limiting untuk Serverless

**Masalah:** Rate limiter in-memory (`Map`) tidak bekerja di Cloudflare Workers/Serverless karena setiap instance punya memory sendiri — attacker bisa bypass dengan rotating IP.

```typescript
// ❌ Serverless-UNSAFE: in-memory Map (tidak shared antar instance)
const store = new Map<string, { count: number; resetAt: number }>()

// ✅ Serverless-SAFE: distributed rate limit via Supabase/Redis/KV
import { createClient } from "@/lib/supabase/server"

export async function checkRateLimitDistributed(
  identifier: string,
  opts: { limit?: number; windowMs?: number } = {},
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = opts.limit ?? 10
  const windowSec = Math.ceil((opts.windowMs ?? 60_000) / 1000)
  const now = Math.floor(Date.now() / 1000)

  const supabase = await createClient()
  const windowStart = now - windowSec

  // Hapus entri lama
  await supabase.from("rate_limits").delete().lt("created_at", windowStart)

  // Insert percobaan baru
  await supabase.from("rate_limits").insert({
    identifier,
    window_start: windowStart,
  })

  // Hitung total dalam window
  const { count } = await supabase.from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .gte("created_at", windowStart)

  return {
    allowed: (count ?? 0) <= limit,
    remaining: Math.max(0, limit - (count ?? 0)),
  }
}
```

**Alternatif (lebih cepat):** Cloudflare Workers + Workers KV dengan TTL — latency < 10ms, `GET` + `PUT` atomic.
**Untuk Supabase / Postgres:** Buat tabel `rate_limits` dengan index `(identifier, created_at)` + auto-cleanup.

### 6.4 🟢 Cross-Tenant Scope Validation

**Masalah:** Endpoint menerima UUID / ID dari formData tanpa verifikasi bahwa record tersebut milik tenant (komunitas) user saat ini.

```typescript
// ❌ RENTAN: tidak ada community scope check
await supabase.from("donations").update({ status }).eq("id", donationId)

// ✅ AMAN: verifikasi scope dalam SATU query atomik
await supabase.from("donations").update({ status })
  .eq("id", donationId)
  .eq("community_id", userActiveCommunityId)   // ✅ tenant scope

// Atau query dulu, baru update:
const donation = await supabase.from("donations")
  .select("community_id")
  .eq("id", donationId)
  .single()
  .then(r => r.data)

if (!donation || donation.community_id !== currentCommunityId) {
  return { error: "Donasi tidak ditemukan." }
}
```

### 6.5 🟢 Anti-Replay Donasi / Duplicate Payment Prevention

```typescript
// ❌ RENTAN: user bisa kirim form bukti transfer yang SAMA berulang kali
// ✅ AMAN: cek apakah donasi dengan nominal, donatur, TANGGAL SAMA sudah ada
const { data: existing } = await supabase.from("donations")
  .select("id")
  .eq("donatur_id", user.id)
  .eq("nominal", parsed.data.nominal)
  .eq("jenis", parsed.data.jenis)
  .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())  // 5 menit terakhir
  .limit(1)

if (existing?.length) {
  return { error: "Donasi serupa sudah dikirim. Tunggu verifikasi." }
}
```

### 6.6 🟢 Database Query Optimization (hindari `.limit()` besar)

```typescript
// ❌ INEFISIEN: memuat 10.000 baris untuk ringkasan
const { data } = await supabase.from("donations")
  .select("jenis, status, nominal")
  .eq("community_id", communityId)
  .limit(10000)              // 🔴 rusak kalau > 10.000 donasi

// ✅ EFISIEN: aggregate di database
const { data } = await supabase.rpc("get_donasi_summary", {
  community_id_param: communityId
})

// Atau pakai raw SQL
const { data } = await supabase.from("donations")
  .select(`
    jenis,
    status,
    count: nominal.count(),
    total: nominal.sum()
  `)
  .eq("community_id", communityId)
```

---

## 🔍 TEMUAN AUDIT — Donasi Manual (Gotong Royong PWA, Jun 2026)

Hasil audit kode donasi nyata. Celah yang ditemukan:

| # | Celah | Severity | File:Baris | Status |
|---|-------|----------|------------|--------|
| 1 | **No authorization check** di `verifikasiDonasi` — siapa pun yang login bisa verifikasi/tolak donasi | 🔴 CRITICAL | `src/actions/donations.ts:69` | Belum diperbaiki |
| 2 | **No rate limit** di `verifikasiDonasi` — endpoint verifikasi tanpa proteksi brute-force | 🟡 HIGH | `src/actions/donations.ts:69` | Belum diperbaaki |
| 3 | **No community scope** — `donationId` dari formData tanpa verifikasi milik komunitas user | 🟡 HIGH | `src/actions/donations.ts:69` | Belum diperbaiki |
| 4 | **Return type `Promise<void>`** — user tidak tahu aksi gagal (RLS di DB mungkin tolak, tapi response 200) | 🟡 HIGH | `src/actions/donations.ts:69` | Belum diperbaiki |
| 5 | **MIME type only** — file upload hanya cek header `content-type`, bukan magic bytes | 🟡 MEDIUM | `src/actions/donations.ts:41` | Belum diperbaiki |
| 6 | **In-memory rate limit** — `Map` store tidak shared di serverless (Cloudflare Workers) | 🟡 MEDIUM | `src/lib/rate-limit.ts:3` | Belum diperbaiki |
| 7 | **`.limit(10000)` alih-alih aggregate** — ringkasan donasi bisa rusak di komunitas besar | 🟢 LOW | `src/lib/donations.ts:103` | Belum diperbaiki |

> **Catatan:** RLS di database (`donations_update_pengurus`) menolak update dari non-pengurus. Tapi karena `verifikasiDonasi` mengembalikan `void`, user mendapat response sukses (200) padahal update-nya ditolak RLS secara silent — **false sense of security**.

---

---

## 📚 Riset Terverifikasi — Semua Sumber 2026

### Sumber Resmi Midtrans

| Sumber | URL | Konten |
|--------|-----|--------|
| Security Info | `https://docs.midtrans.com/docs/payment-security` | PCI DSS L1, ISO 27001, AES-256, FDS |
| Webhook Notification | `https://docs.midtrans.com/docs/https-notification-webhooks` | Signature verification, status handling |
| Access Keys | `https://docs.midtrans.com/docs/access-keys` | Server Key vs Client Key |
| Signature Generation | `https://docs.midtrans.com/reference/signature-generation` | SHA512 formula + B2B RSA |
| Snap Integration | `https://docs.midtrans.com/docs/snap-snap-integration-guide` | Snap token flow, auth headers |
| Core API Card | `https://docs.midtrans.com/docs/coreapi-card-payment-integration` | Card charge + 3DS |
| API Authorization | `https://docs.midtrans.com/docs/api-authorization-headers` | Basic Auth dengan Server Key |
| GitHub (Node.js) | `https://github.com/Midtrans/midtrans-nodejs-client` | Official Node.js client v1.4.3 |
| GitHub (PHP) | `https://github.com/Midtrans/midtrans-php` | Official PHP client |
| JICS Paper 2025 | `https://journal.kawanad.com/index.php/jics/article/download/308/233/1006` | Rate limiting untuk mitigasi DDoS |

### Poin Kritis dari Dokumentasi Resmi (2026)

| Temuan | Sumber | Status di Skill Ini |
|--------|--------|---------------------|
| Server Key WAJIB rahasia, hanya di backend | `docs.midtrans.com/docs/payment-security` | ✅ Sudah |
| Signature = `SHA512(order_id + status_code + gross_amount + ServerKey)` | `docs.midtrans.com/docs/https-notification-webhooks` | ✅ Sudah |
| `gross_amount` dan `order_id` jangan dari frontend — dari backend/DB | `docs.midtrans.com/docs/payment-security` | ✅ Sudah |
| Card data DILARANG disimpan merchant (kecuali PCI DSS certified) | `docs.midtrans.com/docs/payment-security` | ✅ Sudah |
| `snap.js` / `midtrans.min.js` jangan di-self-host — pakai dari Midtrans | `docs.midtrans.com/docs/payment-security` | ✅ Ditambahkan |
| TLS 1.3 preferred, TLS 1.2 minimum | `docs.midtrans.com/docs/payment-security` | ✅ Ditambahkan |
| Rate limiting KRUSIAL untuk mitigasi DDoS (JICS 2025) | JICS Paper (2025) — tested with express-rate-limit | ✅ Ditambahkan |
| Library resmi `midtrans-client` (npm) v1.4.3 — aman, 0 vuln Snyk | Snyk + npm | ✅ Ditambahkan |
| `notification()` method di official library auto-verifikasi signature | GitHub midtrans-nodejs-client README | ✅ Ditambahkan |

## Referensi

- [Midtrans Security Info (Official)](https://docs.midtrans.com/docs/payment-security)
- [Midtrans Webhook Docs (Official)](https://docs.midtrans.com/docs/https-notification-webhooks)
- [Midtrans Snap Integration Guide](https://docs.midtrans.com/docs/snap-snap-integration-guide)
- [Midtrans Core API Card Payment](https://docs.midtrans.com/docs/coreapi-card-payment-integration)
- [Midtrans API Authorization](https://docs.midtrans.com/docs/api-authorization-headers)
- [Midtrans Signature Generation (B2B)](https://docs.midtrans.com/reference/signature-generation)
- [Midtrans Access Keys](https://docs.midtrans.com/docs/access-keys)
- [JICS Paper: Rate Limiting on Midtrans for DDoS Mitigation (2025)](https://journal.kawanad.com/index.php/jics/article/download/308/233/1006)
- [Midtrans Node.js Client (GitHub)](https://github.com/Midtrans/midtrans-nodejs-client)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Payment Security](https://owasp.org/www-project-payment-security/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)

---

> ⚠️ **Peringatan:** Sistem pembayaran adalah target paling menarik bagi attacker. Satu celah bisa menyebabkan kerugian finansial nyata. Jangan pernah terburu-buru. Selalu lakukan threat modeling dan code review sebelum deploy.
