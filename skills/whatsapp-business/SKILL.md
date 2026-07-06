---
name: whatsapp-business
description: Integrasi WhatsApp Business API / WhatsApp Cloud API untuk notifikasi otomatis ke klien. Mencakup setup akun WA Business, konfigurasi webhook, template pesan, dan pengiriman notifikasi dari aplikasi.
metadata:
  author: Agensi
  version: "2.0"
  category: Integrasi
---

# WHATSAPP BUSINESS — WA Business API untuk Notifikasi

## Pilihan Integrasi

### Opsi 1: WA Cloud API (resmi, gratis, recommended)
- Via Facebook Developers
- Gratis untuk 1.000 chat pertama/bulan
- Setup: Business Account → WhatsApp → Cloud API
- Kirim pesan via `POST https://graph.facebook.com/v22.0/[PHONE_ID]/messages` (atau versi terbaru, cek docs)

⚠️ CATATAN 2026: Cloud API adalah satu-satunya opsi resmi. On-Premise API sudah sunset sejak Oktober 2025.

### Opsi 2: wa-automate (library Node.js)
❌ Tidak direkomendasikan — melanggar ToS WA 2026
- `npm install @open-wa/wa-automation`
- Butuh Chrome/Chromium

### Opsi 3: WWebJS (whatsapp-web.js)
⚠️ Berisiko diblokir — hanya untuk development/pengujian internal
- `npm install whatsapp-web.js`
- QR code scan sekali

## Arsitektur WA Cloud API

```
Aplikasi → Server Action → fetch() → Graph API → WA user
```

## Implementasi WA Cloud API

```typescript
// lib/whatsapp.ts
const WA_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

export async function sendWA(to: string, message: string) {
  const res = await fetch(
    `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/[^0-9]/g, ""),
        type: "text",
        text: { body: message },
      }),
    }
  );
  return res.json();
}
```

## Perubahan 2026
- Kategori Utility (baru): pesan terkait transaksi — biaya lebih rendah dari Marketing.
- Opt-in wajib tercatat (timestamp, source, persetujuan eksplisit via WhatsApp).
- Batas kualitas: block rate >0.5% → throttled.
- Pricing berubah per 1 Juli 2026 di berbagai negara.

## Template Pesan untuk Klien

### Notifikasi Proyek Selesai
```
Halo [Nama]! 🎉
Website [Proyek] sudah selesai dan bisa diakses di:
[URL]

Silakan cek dan konfirmasi. Setelah pelunasan, website akan online.
```

### Notifikasi Tagihan
```
Halo [Nama],
Ini pengingat untuk invoice [DP/Pelunasan] proyek [Nama Proyek]:
Rp [jumlah]
Silakan transfer ke:
Bank [Bank] — [No Rek] — a.n. [Nama]
```

### Notifikasi Domain Expiry (H-30)
```
Halo [Nama],
Domain [domain] akan expired dalam 30 hari.
Silakan perpanjang via [registrar].
Biaya: Rp [jumlah]/tahun.
```

## Cara Pakai
1. Setup WA Business Account di developers.facebook.com
2. Dapatkan token & phone ID
3. Simpan di env vars: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`
4. Panggil `sendWA(nomor, pesan)` dari Server Action
5. Integrasikan dengan flow notifikasi proyek
