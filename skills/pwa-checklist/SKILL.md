---
name: pwa-checklist
description: Audit PWA readiness untuk website klien. Mencakup manifest, service worker, offline fallback, installability, dan test di HP sungguhan.
metadata:
  author: Agensi
  version: "2.0"
  category: Optimasi
---

# PWA CHECKLIST — Audit PWA Readiness

**PWA 2026:** semua browser utama support (Chrome, Safari 16+, Firefox, Edge).
iOS Safari dukung PWA penuh sejak iOS 16.4 — sudah matang.

## Checklist PWA Dasar

### Manifest (web manifest)
```
□ Nama aplikasi (name + short_name)
□ Ikon 192×192 + 512×512 (maskable)
□ theme_color = warna brand (#10B981, #005231, dll)
□ background_color
□ display = standalone (atau minimal-ui)
□ start_url = /
□ scope = /
□ display_override = [ "window-controls-overlay", "standalone" ]
□ orientation = any (atau portrait)
```

### Service Worker
```
□ SW terdaftar (navigator.serviceWorker.register)
□ SW meng-handle fetch events
□ Cache strategy: cache-first untuk static assets, network-first untuk API
□ Cache strategy untuk API (Network First / Network Only)
□ Offline fallback page
□ SW update flow (skipWaiting, claim)
```

### Installability
```
□ manifest.json valid (cek via DevTools → Application → Manifest)
□ SW aktif dan terdaftar
✅ HTTPS (Cloudflare SSL otomatis)
□ beforeinstallprompt event terdeteksi — masih ada di Chrome, tidak di Safari
□ Test install dari Chrome ⋮ → Install
□ Test install dari Samsung Internet
```

## Test Checklist (HP Sungguhan)

```
□ Buka URL di Chrome Android
□ ⋮ → Add to Home Screen
□ Buka dari Home Screen (terlihat seperti app?)
□ Matikan internet → buka lagi (ada offline page?)
□ Cek icon sudah benar
□ Cek splash screen warna sesuai
□ Test navigation lancar?
□ Test form submission (seharusnya kasih tahu "no internet")
```

## Implementasi PWA Minimal

```tsx
// app/manifest.ts
export default function manifest() {
  return {
    name: "Nama Aplikasi",
    short_name: "Aplikasi",
    description: "Deskripsi",
    start_url: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    background_color: "#ffffff",
    theme_color: "#10B981",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Maskable icon wajib untuk adaptive icons di Android
  };
}
```

## Lighthouse PWA Audit
Jalankan Lighthouse → PWA section:
- ✅ installable
- ✅ configured for custom splash screen
- ✅ sets a theme color
- ✅ content is sized correctly for viewport
- ✅ has a `<meta name="viewport">`

## Catatan untuk Klien
- PWA bisa di-install ke Home Screen HP seperti aplikasi native
- Ukuran kecil (biasanya < 1MB vs aplikasi native 50-200MB)
- Bisa jalan offline untuk konten yang sudah di-cache
- Update otomatis tanpa lewat Play Store
- Tidak bisa akses fitur HP tertentu (sensor, NFC, bluetooth) — untuk itu perlu Flutter/React Native
