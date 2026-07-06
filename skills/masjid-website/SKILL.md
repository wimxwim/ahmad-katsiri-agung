---
name: masjid-website
description: Template website masjid — jadwal sholat, pengumuman, kegiatan, donasi, lokasi. Multi-tenant siap (satu deployment banyak masjid).
metadata:
  author: Agensi
  version: "2.0"
  category: Template
---

# MASJID WEBSITE — Website Masjid

## Struktur Halaman

```
Beranda (/)       → Hero nama masjid, jadwal sholat hari ini, CTA
Profil (/profil)  → Sejarah masjid, visi-misi, pengurus
Jadwal (/jadwal)  → Jadwal sholat 1 bulan (Aladhan API), imsyak
Kegiatan (/keg)   → Kajian, pengajian, PHBI, agenda
Donasi (/donasi)  → Info rekening, progress pembangunan, foto bukti
Galeri (/galeri)  → Foto masjid, kegiatan
Kontak (/kontak)  → Alamat, maps, WA, email
```

## Jadwal Sholat — API Gratis 2026
- myquran.com: API gratis jadwal sholat untuk seluruh Indonesia, metode sesuai Kemenag
- aladhan.com: API internasional, support berbagai metode kalkulasi
- Cukup fetch dari client-side (static site compatible) atau Workers sebagai proxy cache

## Donasi
- Integrasi Midtrans: payment gateway populer di Indonesia, support QRIS, transfer, CC
- Alternatif sederhana: QRIS static (cukup scan → transfer) — tanpa biaya integrasi
- Tampilkan progress donasi dan bukti transfer untuk transparansi

## Fitur Khusus Masjid
| Fitur | Sumber Data |
|-------|-------------|
| Jadwal sholat otomatis | Aladhan API (metode 20 = Kemenag) |
| Waktu imsyak & berbuka | Kalkulasi otomatis |
| Arah kiblat | Google Maps + kompas |
| Pengumuman kegiatan | CMS atau form WA |
| Donasi & infak | Manual transfer + bukti foto |
| Galeri foto | Upload via dashboard |

## Integrasi dengan GRPWA
Website masjid bisa pakai infra GRPWA yang sudah ada:
- Auth: Supabase (login pengurus)
- Jadwal sholat: reuse prayer_cache
- Donasi: reuse donations + kas_entries
- Multi-tenant: setiap masjid punya community_id sendiri

## Data yang Perlu Diminta
```
□ Nama masjid
□ Alamat lengkap + Google Maps link
□ Logo/icon masjid (opsional)
□ Sejarah singkat
□ Jadwal kegiatan rutin (kajian, yasinan, dll)
□ Nomor rekening donasi
□ Foto masjid & kegiatan (min 5)
□ Kontak pengurus (WA)
□ Media sosial (jika ada)
```

## Hosting: Cloudflare Pages
- Gratis, unlimited bandwidth, support static + dynamic via Workers
- Deploy dari GitHub, auto-build tiap push
- SSL otomatis, CDN global

## Estimasi
- 3-5 hari (Tipe A dengan 5 halaman)
- Bisa pakai template GRPWA jika butuh fitur komunitas
- Harga acuan: Rp 500k - 1.5jt
