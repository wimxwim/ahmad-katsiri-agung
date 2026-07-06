---
name: website-migration
description: Migrasi website dari Wix, WordPress, Blogger, atau HTML statis ke Next.js + Cloudflare. Termasuk ekspor konten, konversi halaman, redirect 301, dan SEO preservation.
metadata:
  author: Agensi
  version: "2.0"
  category: Migration
---

# WEBSITE MIGRATION — Migrasi ke Next.js + Cloudflare

## Dari WordPress

### Ekspor Konten
1. WordPress Dashboard → Tools → Export → Export All
2. Dapatkan file XML (WXR)
3. Parse XML → dapatkan posts, pages, images sebagai JSON

```bash
# Convert WordPress XML ke Markdown
npx wordpress-export-to-markdown --input export.xml --output ./content
```

### Yang Perlu Diperhatikan
- ✅ URL structure: pastikan sama atau redirect 301
- ✅ Images: download dari `wp-content/uploads/` ke `public/images/`
- ✅ SEO: copy meta titles, descriptions
- ❌ Plugin: tidak bisa migrasi — cari alternatif Next.js
- ❌ Comments: biasanya tidak perlu dipertahankan
- ❌ Forms: ganti dengan form baru

### Pitfall WordPress ke Next.js
- Plugin dependensi: WooCommerce, WPForms, Elementor — semua harus diganti manual
- SEO URL structure: pastikan slug sama persis atau redirect 301
- Gambar: download semua dari `wp-content/uploads/` — jangan hotlink

## Dari Wix / Squarespace

### Ekspor via Wix
1. Wix Dashboard → Settings → Export Data
2. Dapatkan CSV + file media
3. Parse CSV untuk konten halaman

### Catatan Khusus Wix / Squarespace
- Wix/Squarespace menggunakan format proprietary — ekspor terbatas
- Foto: download manual dari Wix Media Manager / Squarespace
- Halaman: copy-paste konten (re-build dari nol)
- Redirect: setup 301 di Cloudflare

## Dari HTML Statis

```bash
# Copy semua file HTML
cp -r old-site/* public/old/

# Atau konversi per halaman ke komponen React
# Buat layout + komponen untuk setiap halaman
```

## Redirect 301 (Cloudflare)

```js
// _redirects atau di worker
/club /komunitas 301
/tentang-kami /tentang 301
/blog/* /artikel/:splat 301
```

Atau di Cloudflare Dashboard → Bulk Redirects.

## Checklist Migrasi
```
□ Semua halaman ter-migrasi (cek jumlah)
□ URL structure preserved — redirect 301 untuk semua URL lama
□ Images ter-download semua
□ Meta tags (title, description, OG) ter-copy
□ Google Analytics ID sama
□ Search Console → submit sitemap baru → pantau indexing
□ Cek broken links setelah migrasi
□ Test semua form
□ Test di HP dan desktop
□ Bandingkan performa (Lighthouse sebelum vs sesudah)
```

## Keuntungan Migrasi
| Sebelum (WordPress/Wix) | Sesudah (Next.js + Cloudflare) |
|--------------------------|-------------------------------|
| Loading 3-5 detik | Loading <1 detik |
| Perlu hosting bayar | Hosting gratis |
| Rentan hack | Lebih aman (static + edge) |
| Keterbatasan desain | Fleksibel total |
| Biaya maintenance | Rp 0/bulan |
