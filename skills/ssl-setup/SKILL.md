---
name: ssl-setup
description: Setup dan manajemen SSL/TLS certificate untuk website klien via Cloudflare (gratis, auto-renew). Mencakup konfigurasi Full Strict, HSTS, dan troubleshooting SSL.
metadata:
  author: Agensi
  version: "2.0"
  category: Layanan
---

# SSL SETUP — SSL/TLS untuk Website Klien

## SSL Gratis via Cloudflare

Cloudflare menyediakan SSL gratis untuk semua domain yang di-proxy.

### Mode SSL
| Mode | Keamanan | Cocok untuk |
|------|----------|-------------|
| Off | ❌ Tidak aman | Jangan |
| Flexible | ⚠️ Partial (Cloudflare→Browser aman, Server→Cloudflare tidak) | Testing |
| Full | ✅ (Server punya self-signed cert) | Internal |
| **Full (Strict)** | **✅✅ End-to-end aman** | **PRODUCTION — WAJIB** |

### Setup (5 menit)
1. Domain sudah di Cloudflare (proxied)
2. SSL/TLS → Overview → Pilih **Full (Strict)**
3. SSL/TLS → Edge Certificates → Auto Certificate (aktif)
4. Always Use HTTPS → ON
5. Minimum TLS Version → 1.2 (1.3 jika semua client modern)

### HSTS
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
Setup di Cloudflare:
1. SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS)
2. Enable: ON
3. Max Age: 12 bulan (31536000)
4. Include Subdomains: ON
5. Preload: ON (setelah testing aman)

## Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| 525 SSL handshake failed | Origin server tidak support SSL/SNI | Set Full (bukan Full Strict) atau upgrade origin |
| 526 Invalid SSL certificate | Origin cert expired | Perbarui cert di server origin |
| Mixed content (HTTP di halaman HTTPS) | Asset (gambar, CSS) pakai http:// | Ganti semua ke https:// atau protocol-relative |
| ERR_CERT_COMMON_NAME_INVALID | Cert tidak cocok dengan domain | Pastikan domain di-proxy Cloudflare |

## Catatan Penting
- Cloudflare SSL **gratis & auto-renew** — tidak perlu khawatir expiry
- Cloudflare Universal SSL gratis untuk semua domain yang di-proxy. Set ke Full (Strict) untuk keamanan maksimal end-to-end.
- Server origin TIDAK perlu SSL sendiri (cukup HTTP, Cloudflare yang handle HTTPS)
- Kalau origin di Vercel/Netlify: mereka sudah punya SSL sendiri → Full Strict aman
- Kalau origin di VPS: perlu setup SSL atau pakai Flexible

## Alternatif Non-Cloudflare

### Let's Encrypt
- Gratis, sertifikat valid 90 hari, auto-renew via ACME v2
- Tools: Certbot, acme.sh, Caddy (otomatis)
- Cocok untuk server non-Cloudflare

### Self-signed SSL
- Jangan untuk production — browser tampilkan peringatan "Not Secure"
- Hanya untuk development/localhost testing
