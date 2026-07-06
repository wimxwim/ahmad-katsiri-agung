---
name: business-email
description: Setup email bisnis untuk klien menggunakan Cloudflare Email Routing (gratis) atau Google Workspace (berbayar). Mencakup konfigurasi DNS, email forwarding, dan panduan setup di HP.
metadata:
  author: Agensi
  version: "2.0"
  category: Layanan
---

# BUSINESS EMAIL — Setup Email Bisnis untuk Klien

## Opsi Email Bisnis

### Opsi 1: Cloudflare Email Routing (GRATIS)
- Forward ke email pribadi (Gmail, dll)
- Custom domain: `nama@domainku.com`
- Max 100 email/detik
- Setup: 5 menit di Cloudflare Dashboard

**Cara setup:**
1. Domain sudah di Cloudflare (proxied)
2. Email → Email Routing → Get started
3. Tambah custom address: `nama@domainku.com` → forward ke `personal@gmail.com`
4. DNS otomatis ditambahkan (MX record)

### Opsi 2: Google Workspace (berbayar, profesional)
- ~$12/user/bulan (Business Starter, harga 2026 stabil)
- Rp 30.000/bln/akun (Business Starter)
- Inbox real, send from custom domain
- Google Drive, Meet, Calendar
- Setup: 15 menit

**Cara setup:**
1. Beli Google Workspace (workspace.google.com)
2. Verifikasi domain via TXT record di Cloudflare
3. Tambah MX record dari Google
4. Buat akun user (admin@domainku.com, info@domainku.com)

## Perbandingan

| Fitur | Cloudflare Email (Gratis) | Google Workspace (Berbayar) |
|-------|--------------------------|----------------------------|
| Biaya | Rp 0 | Rp 30k/bln/akun |
| Kirim email | Forward only | Native Gmail interface |
| Storage | Unlimited (forward) | 30 GB/akun |
| Setup | 5 menit | 15 menit |
| Cocok untuk | UMKM, profil perusahaan | Perusahaan serius |

### Opsi 3: Resend.com (alternatif transaksional)
- API-first, cocok untuk notifikasi sistem (OTP, invoice, alert)
- Harga: free tier 100 email/hari, paid mulai $10/bulan
- Domain verification + built-in SPF/DKIM
- Setup via API key, SDK untuk Node.js/Python/Go

### Opsi 4: Cloudflare Email Routing (forwarding)
- Free, forwarding custom domain email ke inbox pribadi
- Anti-spam built-in, DNS otomatis
- Max 100 email/detik
- Cocok untuk UMKM yang cukup terima email saja

## Catatan Penting 2026
- SPF, DKIM, dan DMARC adalah WAJIB 2026 untuk deliverability — tanpa ini email masuk spam
- Cek deliverability via mail-tester.com atau Google Postmaster Tools

## Template Info ke Klien

```
Untuk email bisnis, ada 2 opsi:

1️⃣ GRATIS — Cloudflare Email Routing
   Email: nama@domainku.com (forward ke Gmail pribadi)
   Bisa TERIMA email saja, balas dari Gmail biasa.
   Setup: 5 menit, gratis.

2️⃣ BERBAYAR — Google Workspace
   Email: nama@domainku.com (inbox asli di Gmail)
   Bisa KIRIM & TERIMA dari alamat @domainku.com
   Termasuk Google Drive, Meet, Calendar.
   Biaya: Rp 30.000/bln/akun.

Saran saya: opsi 1 dulu, nanti upgrade kalau sudah besar.
```
