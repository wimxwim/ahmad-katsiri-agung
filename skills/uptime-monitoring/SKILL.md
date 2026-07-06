---
name: uptime-monitoring
description: Pantau status website klien 24/7 dengan BetterUptime (gratis) atau Upptime (open source). Dapat notifikasi WA/Telegram jika website down.
metadata:
  author: Agensi
  version: "2.0"
  category: Layanan
---

# UPTIME MONITORING — Pantau Website Klien

## Opsi Gratis

### Opsi 1: BetterUptime (recommended)
- 3 monitor gratis
- Status page publik
- Notifikasi: email, Slack, Telegram
- Cek setiap 1 menit
- https://betteruptime.com

### Opsi 2: Upptime (open source, GitHub Actions)
- 100% gratis
- GitHub Pages status page
- Notifikasi via email
- https://upptime.js.org

### Opsi 3: Cloudflare Analytics (built-in)
- Traffic analytics bawaan Cloudflare
- 5xx error rate terpantau
- Cloudflare Health Checks: tersedia gratis di dashboard
- Tidak perlu setup tambahan

### Opsi 4: Uptime Robot
- Free: monitor 5 URL tiap 5 menit
- Notifikasi email
- Masih oke untuk budget kosong

### Opsi 5: Checkly
- Populer 2026 untuk monitoring + browser checks
- Bisa test journey end-to-end (login, checkout, etc)
- Status page built-in

## Setup BetterUptime (15 menit)
1. Daftar di betteruptime.com
2. Add monitor: URL website klien
3. Pilih interval: 1 menit
4. Set notifikasi: Telegram (via bot) atau email
5. Optional: buat status page publik `status.domain-klien.com`

## Template Laporan Downtime

```
⚠️ LAPORAN DOWNTIME

Website: [domain]
Waktu: [tanggal] [jam] WIB
Durasi: [X] menit
Status: ✅ Sudah normal kembali

Penyebab: [penjelasan]
Tindakan: [apa yang dilakukan]
```

## Best Practice Status Page
- Hosting status page di subdomain status.domain.com
- Pakai Cloudflare Pages (gratis) + Better Uptime / Checkly API

## Daftar Monitor (Internal)
```
| Website | URL | Status | Last Check | Uptime 30h |
|---------|-----|--------|------------|------------|
| AKAL Center | akalcenter.my.id | ✅ Up | 2 menit lalu | 99.99% |
| GRPWA | gotong-royong-pwa... | ✅ Up | 1 menit lalu | 100% |
```

## Cara Pakai
1. Panggil skill: `gunakan skills uptime-monitoring`
2. Tambah monitor untuk setiap proyek live
3. Setup notifikasi ke grup Telegram agensi
4. Cek dashboard seminggu sekali
