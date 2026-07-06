---
name: whatsapp-widget
description: Pasang tombol/chat widget WhatsApp di website klien. Mencakup floating button, link wa.me, pra-popup pesan, dan tracking klik. Cocok untuk landing page UMKM dan company profile.
metadata:
  author: Agensi
  version: "2.0"
  category: Integrasi
---

# WHATSAPP WIDGET — WA Chat Widget untuk Website Klien

## Metode Pemasangan

### Metode 1: Floating Button (recommended)
Komponen React untuk floating WA di pojok kanan bawah:

```tsx
// components/WhatsAppWidget.tsx
"use client";
import { MessageCircle } from "lucide-react";

const WA_NUMBER = "62812xxxxxxx"; // Ganti dengan nomor klien
const WA_MESSAGE = "Halo, saya tertarik dengan layanan Anda.";

export default function WhatsAppWidget() {
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:bg-green-600 hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
```

### Metode 2: Tombol di Halaman Kontak
```tsx
<a
  href="https://wa.me/62812xxxxxxx"
  target="_blank"
  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-white"
>
  <MessageCircle className="h-5 w-5" />
  Chat WhatsApp
</a>
```

### Metode 3: Link wa.me Sederhana
```
https://wa.me/62812xxxxxxx?text=Halo%2C%20saya%20tertarik%20dengan%20layanan%20Anda.
```

## Konfigurasi per Klien

Simpan nomor WA di env vars atau file konfigurasi:
```
NEXT_PUBLIC_WA_NUMBER=62812xxxxxxx
NEXT_PUBLIC_WA_MESSAGE=Halo, saya tertarik dengan produk Anda.
```

## Best Practices
- Nomor WA diawali `62` (tanpa `+` atau `0`)
- URL-encode pesan agar tidak rusak
- Floating button hanya di halaman publik (bukan di dashboard/admin)
- Tambahkan `rel="noopener noreferrer"` untuk keamanan
- Gunakan `target="_blank"` agar tidak meninggalkan website
- Animasi subtle (scale on hover, shadow)
- Loading state sampai FontAwesome/lucide siap

## Catatan WA Cloud API 2026
- Meta melarang chatbot AI general-purpose (Jan 2026) — widget harus spesifik untuk bisnis, bukan chatbot AI general.
- WA Cloud API sekarang lewat Business Solution Provider (BSP) atau langsung via Meta Developer Platform.
- API versi: cek docs terbaru (`graph.facebook.com/v[VERSION]/`) — versi lama di-deprecate tiap kuartal.

## Cara Pakai
1. Dapatkan nomor WA klien (format: `62812xxxxxxx`)
2. Panggil skill: `gunakan skills whatsapp-widget`
3. Integrasikan komponen ke layout
4. Test klik dari HP
