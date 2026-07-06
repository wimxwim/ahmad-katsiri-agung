---
name: local-seo-indonesia
description: Optimasi website untuk pencarian Google Indonesia dan Google Maps. Mencakup Google My Business, Google Maps embed, keyword lokal, dan struktur data untuk bisnis lokal.
metadata:
  author: Agensi
  version: "2.0"
  category: SEO
---

# LOCAL SEO INDONESIA — SEO untuk Pasar Indonesia

## Komponen Utama

**Catatan 2026:** Google Business Profile (GBP) adalah #1 ranking factor untuk lokal.
Google May 2026 Core Update: brand lokal dengan EEAT diutamakan.
FAQ rich results sudah tidak muncul (7 Mei 2026) — fokus ke konten Q&A biasa.

### 1. Google Business Profile (GBP) — WAJIB
Gratis, paling berdampak untuk bisnis lokal.
Setup: https://business.google.com
- Isi profil lengkap: nama, alamat, no WA, jam operasional, foto
- Pilih kategori bisnis yang tepat
- Minta review dari pelanggan
- Posting foto & update rutin

### 2. Google Maps Embed di Website
```tsx
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!..."
  width="100%"
  height="300"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
```
Dapatkan embed link dari Google Maps → Share → Embed

### 3. Struktur Data LocalBusiness (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Nama Bisnis",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Contoh No. 123",
    "addressLocality": "Kota",
    "addressRegion": "Provinsi",
    "postalCode": "12345",
    "addressCountry": "ID"
  },
  "telephone": "+62812xxxxxxx",
  "openingHours": "Mo-Fr 08:00-17:00",
  "url": "https://domain.com",
  "image": "https://domain.com/og-image.jpg"
}
```

### 4. Keyword Lokal di Konten
- Gunakan nama kota/kecamatan di halaman: "jasa [layanan] di [kota]"
- Judul halaman: "[Nama Bisnis] — [Layanan] di [Kota]"
- Meta description: include lokasi

### 5. Google Maps Review Widget
Embed ulasan Google Maps di website (via third-party atau manual).

## Checklist Local SEO
```
□ Google My Business terisi lengkap
□ Nama, alamat, no WA konsisten di semua platform (NAP consistency)
□ Google Maps embed di halaman kontak
□ JSON-LD LocalBusiness di homepage
□ Keyword lokal di title & meta description
□ Google Analytics terpasang
□ Google Search Console terverifikasi
□ Review dari pelanggan (min 5)
□ Google Maps ranking: foto asli (bukan stok), ulasan aktif, NAP konsisten
□ Foto bisnis di GMB (min 3)
□ Posting rutin di GMB (min 1x/minggu)
```

## Tools Gratis
- Google My Business (business.google.com)
- Google Search Console (search.google.com/search-console)
- Google Analytics (analytics.google.com)
- Google Maps
- Structured Data Testing Tool
