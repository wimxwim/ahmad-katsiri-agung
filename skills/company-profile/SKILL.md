---
name: company-profile
description: Template dan panduan membuat company profile website (Tipe A) untuk klien korporat/PT/CV. Mencakup struktur halaman standar, konten yang diperlukan, dan komponen.
metadata:
  author: Agensi
  version: "2.0"
  category: Template
---

# COMPANY PROFILE — Template Website Profil Perusahaan

## Struktur Halaman Standar

```
Home (/)           → Hero, visi-misi singkat, CTA
Tentang (/tentang) → Sejarah, visi-misi, tim
Layanan (/layanan) → Produk/jasa, fitur, harga (opsional)
Portfolio (/porto) → Proyek yang sudah dikerjakan
Blog (/blog)       → Artikel, berita, insight (opsional)
Kontak (/kontak)   → Form, WA, maps, alamat, jam operasional
```

## Halaman Penting per Skenario

| Skenario Klien | Halaman Wajib | Halaman Opsional |
|----------------|---------------|------------------|
| PT/CV/Perusahaan | Home, Tentang, Layanan, Kontak | Portfolio, Blog, Karir |
| Startup | Home, Fitur, Tim, Kontak | Blog, Karir, Pricing |
| Yayasan/NGO | Home, Program, Tentang, Donasi | Blog, Galeri, Relawan |
| Freelancer | Home, Portfolio, Layanan, Kontak | Testimoni, Blog |

## Data yang Perlu Diminta dari Klien

```
□ Logo (PNG/SVG transparan)
□ Nama perusahaan & tagline
□ Sejarah/perusahaan (1-2 paragraf)
□ Visi & misi
□ Foto tim/fasilitas/kantor (min 3 foto)
□ Daftar produk/jasa (nama + deskripsi)
□ Testimoni (jika ada)
□ Kontak: WA, email, alamat, Google Maps link
□ Media sosial: IG, LinkedIn, TikTok
□ Jam operasional
□ Warna brand (jika ada, kami bisa bantu pilihkan)
```

## SEO 2026: EEAT + AI Overviews
- Google AI Overviews prioritaskan brand dengan sinyal EEAT kuat (Experience, Expertise, Authoritativeness, Trustworthiness)
- Struktur konten: byline penulis, tanggal publikasi, sumber tepercaya, sitasi
- Company profile perlu: testimoni asli (nama + foto real), portofolio proyek nyata, studi kasus detail

## FAQ Schema — HAPUS per 7 Mei 2026
- Google menghapus FAQ rich results dari pencarian web
- Ganti FAQ Schema ke konten Q&A biasa (tanpa markup FAQ)
- HowTo schema juga dihapus untuk search — hanya bertahan di Google Assistant

## Fitur Standar yang Selalu Ada
- Hero section dengan CTA
- Navbar responsif + mobile menu
- Footer dengan kontak + sosial media
- Floating WA button (`whatsapp-widget`)
- Google Maps embed
- Form kontak (notifikasi email/Telegram)
- SEO meta tags (OG: image, description)
- Mobile-first responsive
- Loading skeleton
- 404 custom page
- Privacy policy page

## Tech Stack Default
```
Framework: Next.js 16 (App Router)
Styling: Tailwind CSS v4
Animasi: motion
Ikon: lucide-react
Font: Inter (body) + Bricolage Grotesque (heading)
Hosting: Cloudflare Pages
Domain: Cloudflare proxied, SSL Full Strict
```

## Estimasi
- 3-5 halaman: 3-5 hari
- 5-7 halaman + blog: 5-7 hari
- Harga acuan: Rp 500k - 1.5jt (Tipe A)
