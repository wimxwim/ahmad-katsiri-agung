---
name: core-web-vitals
description: Audit dan optimasi Core Web Vitals (LCP, FID/INP, CLS) untuk website klien. Mencakup pengukuran, identifikasi masalah, dan strategi fix.
metadata:
  author: Agensi
  version: "2.0"
  category: Optimasi
---

# CORE WEB VITALS — Optimasi Performa Website

## Metrik Core Web Vitals

| Metrik | Good | Needs Improvement | Poor | Yang Diukur |
|--------|------|-------------------|------|-------------|
| **LCP** (Largest Contentful Paint) | ≤2.5s | 2.5-4.0s | >4.0s | Waktu muat elemen terbesar |
| **INP** (Interaction to Next Paint) | ≤200ms | 200-500ms | >500ms | Responsivitas interaksi |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | 0.1-0.25 | >0.25 | Kestabilan layout |

## Tools Pengukuran
- **Lighthouse** (Chrome DevTools) — audit lokal
- **PageSpeed Insights** (pagespeed.web.dev) — data lab + field
- **Chrome User Experience Report** (CrUX) — data real user; ini sumber kebenaran untuk ranking Google, bukan Lighthouse
- **web-vitals library** — pantau dari production

```bash
# Install web-vitals di Next.js
npm install web-vitals
```

## Strategi Optimasi

### 1. LCP — Largest Contentful Paint
**Penyebab utama:**
- Gambar hero terlalu besar
- Font lambat load
- Server response time lambat

**Fix:**
```tsx
// ✅ Next.js Image dengan priority + fetchpriority
import Image from "next/image";
<Image src="/hero.webp" priority fetchpriority="high" width={1200} height={600} alt="" />

// ✅ Preload font
<link rel="preload" href="/font.woff2" as="font" crossorigin />

// ✅ Cache strategy Cloudflare (static assets)
// Sudah otomatis di Cloudflare Pages
```

### 2. INP — Interaction to Next Paint
**Penyebab utama:**
- JavaScript berat di main thread
- Event handler kompleks
- Rendering ulang tidak efisien

**Fix:**
```tsx
// ✅ Gunakan `useMemo` dan `useCallback`
const sortedItems = useMemo(() => items.sort(), [items]);

// ✅ Hindari layout thrashing — baca dulu, tulis kemudian
// ✅ Lazy load komponen berat
import dynamic from "next/dynamic";
const HeavyChart = dynamic(() => import("./HeavyChart"), { ssr: false });
```

### 3. CLS — Cumulative Layout Shift
**Penyebab utama:**
- Gambar tanpa dimensi
- Font swap (FOUT/FOIT)
- Content injected di atas konten existing
- Iklan/dynamic content tanpa placeholder

**Fix:**
```tsx
// ✅ Selalu set width/height di image
<Image src="/foto.jpg" width={800} height={600} alt="" />

// ✅ Placeholder untuk dynamic content
<div style={{ minHeight: "300px" }}>
  {content ?? <Skeleton />}
</div>

// ✅ Font display swap
@font-face { font-display: swap; }

// ✅ Hindari inject content di atas existing content
```

## Statistik 2026
43-47% website gagal INP. Third-party scripts (chat widget, pixel marketing) adalah penyebab #1.

## Catatan LCP Threshold
Beberapa sumber 2026 menyebut LCP threshold turun ke 2.0s (belum resmi). Pantau Google untuk update.

## Checklist Optimasi
```
□ LCP < 2.5s
□ INP < 200ms
□ CLS < 0.1
□ Images: Next.js Image, WebP, lazy loading
□ Font: swap, preload, subset
□ JS: code splitting, tree shaking
□ CSS: Tailwind (purged), critical CSS inline
□ Cache: Cloudflare max-age optimal
□ Server: edge runtime (Cloudflare Workers)
□ Third-party: minimal, async/defer
```
