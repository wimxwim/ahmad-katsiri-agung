---
name: umkm-landing
description: Template dan panduan landing page untuk UMKM (usaha mikro, kecil, menengah) — toko, kuliner, jasa, fashion. Mobile-first, WA-centric, siap dalam 1-3 hari.
metadata:
  author: Agensi
  version: "2.0"
  category: Template
---

# UMKM LANDING — Landing Page UMKM

## Karakteristik UMKM di Indonesia
- Target: mobile-first (99% akses dari HP)
- Kontak utama: WA (bukan email/form)
- Butuh cepat online (bukan butuh fitur kompleks)
- Budget terbatas
- Tidak butuh CMS (cukup WA untuk update)

## Wajib 2026 untuk UMKM
- WhatsApp click-to-chat: langsung buka WA dengan pesan pra-isi. WAJIB ada di setiap halaman.
- QRIS static/dynamic: wajib untuk pembayaran. QRIS static cukup cetak sekali; QRIS dynamic untuk nominal tertentu.
- Mobile-first design: 80%+ traffic UMKM dari HP. Pastikan touch targets, font size, layout responsive.

## Struktur Halaman Standar

```
Home (/) → 1 halaman length, sections:
  ├── Hero: nama usaha + tagline + CTA WA
  ├── Tentang: cerita singkat (1 paragraf)
  ├── Produk/Layanan: grid foto + nama + harga
  ├── Testimoni: 2-3 kutipan pembeli
  ├── Lokasi: alamat + Google Maps embed
  └── CTA Footer: tombol WA + kontak
```

## Template Hero
```tsx
<section className="min-h-screen flex items-center bg-gradient-to-b from-green-50 to-white">
  <div className="container mx-auto px-4 text-center">
    <h1 className="text-4xl font-bold mb-4">[Nama Usaha]</h1>
    <p className="text-lg text-gray-600 mb-8">[Tagline singkat]</p>
    <a href="https://wa.me/62812xxxxxxx" className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-600 transition">
      <MessageCircle className="w-5 h-5" />
      Pesan via WhatsApp
    </a>
  </div>
</section>
```

## Fitur WA-centric
- Floating WA button (pojok kanan bawah)
- Tombol "Pesan Sekarang" di setiap produk
- Link wa.me dengan pesan pra-isi: `Halo, saya tertarik dengan [nama produk].`
- Form kontak minimal (cukup nama + WA + pesan → notifikasi ke WA agen)

## Data yang Perlu Diminta
```
□ Nama usaha & tagline
□ Logo (boleh WA text aja kalau tidak ada)
□ Foto produk (min 3, resolusi HP juga ok)
□ Harga (bisa ditulis "mulai Rp X" atau "Hubungi WA")
□ Cerita singkat (1 paragraf)
□ Alamat & Google Maps link
□ Nomor WA (utama)
□ Instagram/TikTok (jika ada)
□ Jam operasional
```

## Fitur Teknis
- Single page (semua konten di 1 file)
- Loading super cepat (static page)
- WA sebagai CMS (klien update via WA, kami update)
- Google Maps embed
- Google Analytics (tracking pengunjung)
- OG Image untuk share ke WA/IG

## Estimasi & Harga
- 1-3 hari pengerjaan
- Harga acuan: Rp 300k - 800k (Tipe A sederhana)
- Biaya perawatan: Rp 0 (kecuali update konten)
