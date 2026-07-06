---
name: website-maintenance
description: SOP maintenance bulanan untuk website klien. Mencakup pengecekan uptime, update dependency, backup database, rotasi log, dan laporan ke klien.
metadata:
  author: Agensi
  version: "2.0"
  category: Layanan
---

# WEBSITE MAINTENANCE — SOP Maintenance Bulanan

## Jadwal Maintenance

| Frekuensi | Aktivitas | Tools |
|-----------|-----------|-------|
| **Harian** | Cek uptime (otomatis) | uptime-monitoring skill, BetterUptime |
| **Mingguan** | Cek error log | Cloudflare Analytics, Supabase Logs |
| **Bulanan** | Update dependency, backup DB | npm audit, Supabase CLI |
| **Bulanan** | Laporan ke klien | template di bawah |
| **Tahunan** | Perpanjang domain | domain-management skill |

## Checklist Maintenance Bulanan

```
□ Uptime: cek status website (100%?)
□ Error rate: cek 404/500 di Cloudflare Analytics
□ Form submission: test apakah form masih jalan
□ Backup DB: download dari Supabase
□ Dependency: npm audit — fix jika ada critical
□ SSL: cek masih active (Full Strict?)
□ Disk usage: cek Supabase (masih di bawah 2GB?)
□ Performance: cek Lighthouse score
□ Core Web Vitals: cek di Search Console tiap bulan
□ Domain: cek expiry date
□ Laporan: kirim ke klien (template di bawah)
```

## Template Laporan Bulanan ke Klien

```
─── LAPORAN MAINTENANCE ───
Bulan: [Bulan] [Tahun]
Website: [domain]

✅ STATUS: SEMUA BAIK

Uptime: 99.9% (tidak ada downtime)
Error: 0 error dalam 30 hari terakhir
Backup DB: ✅
SSL: ✅ Active (Full Strict)
Performance: ✅ (Lighthouse 85+)
Domain: ✅ Active (expiry [tanggal])

AGENSI [Nama]
WA: [nomor]
```

## Biaya Maintenance (acuan)

| Layanan | Harga | Catatan |
|---------|-------|---------|
| Maintenance bulanan | Rp [50k-200k]/bln | Optional — tidak wajib |
| Update konten | Rp [25k-100k]/revisi | Per perubahan |
| Fix bug darurat | Rp [100k-500k] | Diluar maintenance rutin |
| Backup & monitoring | Gratis | Sudah include di awal |

## Catatan 2026

- Cloudflare Pages free tier: unlimited bandwidth, 500 builds/month, 100 sites. Stabil — tidak ada perubahan harga.
- R2 Storage free 10GB + 1 juta Class A ops + 10 juta Class B ops. Zero egress fee.
- WordPress maintenance: PHP 8.2+ sekarang standar. WP 6.x terbaru. Pastikan update keamanan rutin.
