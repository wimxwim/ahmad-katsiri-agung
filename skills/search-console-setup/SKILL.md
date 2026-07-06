---
name: search-console-setup
description: Setup Google Search Console untuk website klien. Verifikasi kepemilikan, submit sitemap, monitoring performa pencarian, dan identifikasi masalah indexing.
metadata:
  author: Agensi
  version: "2.0"
  category: SEO
---

# SEARCH CONSOLE SETUP — Google Search Console

## Verifikasi Kepemilikan

### Metode: DNS TXT Record (recommended)
1. Buka search.google.com/search-console
2. Masukkan domain → Pilih verifikasi DNS
3. Dapatkan TXT record: `google-site-verification=...`
4. Tambahkan di Cloudflare DNS:
   - Type: TXT
   - Name: `@`
   - Value: `google-site-verification=...`
5. Klik Verify di Search Console

### Metode: HTML Tag (alternatif)
```tsx
// app/layout.tsx
export const metadata = {
  verification: {
    google: "google-site-verification-code",
  },
};
```

## Submit Sitemap

### Generate Sitemap Otomatis (Next.js)
```tsx
// app/sitemap.ts
export default async function sitemap() {
  const baseUrl = "https://domain.com";

  const staticPages = [
    "", "/tentang", "/layanan", "/kontak",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return [...staticPages];
}
```

### Submit ke Search Console
1. Search Console → Sitemaps
2. Masukkan URL: `https://domain.com/sitemap.xml`
3. Submit
4. Cek status: Success

## Fitur Baru 2026

### AI Performance Reports (Juni 2026)
Lihat impressions website di AI Overviews, AI Mode, dan Discover.

### FAQ Rich Results
FAQ Rich Results dihapus per 7 Mei 2026. Ganti tracking ke AI Overview citation.

### AI-powered Configuration
Filter laporan pakai bahasa natural — misal: "tampilkan klik dari mobile 30 hari terakhir".

### May 2026 Core Update
Selesai 2 Juni 2026. Volatilitas tinggi.

## Monitoring Berkala

### Yang Dicek Bulanan
```
□ Total impressions (tren naik/turun?)
□ Total clicks
□ Average position
□ Coverage errors (404, soft 404, duplicate)
□ Mobile usability issues
□ Search queries that drive traffic
```

### Kirim ke Klien
```
Google Search Console — [domain]
Impressions: [X] (naik/turun [X]% dari bulan lalu)
Clicks: [X]
Rata-rata posisi: [X]
Error indexing: [X] halaman (semua ✅)

⚠️ [jika ada masalah: sebutkan dan rekomendasi]
```

## Cara Pakai
1. Verifikasi domain di GSC
2. Generate sitemap
3. Submit sitemap
4. Monitor coverage tiap bulan
5. Lapor ke klien jika ada masalah
