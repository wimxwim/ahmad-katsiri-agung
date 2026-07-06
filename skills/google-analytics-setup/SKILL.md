---
name: google-analytics-setup
description: Setup Google Analytics 4 (GA4) untuk website klien. Mencakup instalasi, konfigurasi event, dashboard, dan template laporan bulanan.
metadata:
  author: Agensi
  version: "2.0"
  category: SEO
---

# GOOGLE ANALYTICS SETUP — GA4 untuk Website Klien

## Instalasi

### Via @next/third-parties (Next.js)
```tsx
// app/layout.tsx
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
```

### Via Script Langsung
```tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}');`}
</Script>
```

## Event Tracking

### Event Dasar (otomatis via GA4)
- page_view, session_start, first_visit
- scroll, click, site_search

### Event Kustom (recommended untuk klien)
```tsx
// WA click tracking
gtag("event", "whatsapp_click", { page: window.location.pathname });

// Form submit
gtag("event", "form_submit", { form_name: "kontak" });

// Outbound link
gtag("event", "outbound_click", { url: "https://instagram.com/..." });
```

## Consent Mode v2
WAJIB pasang Consent Mode v2 untuk kepatuhan UU PDP. Mode Advanced memungkinkan cookieless ping.

## Cross-channel Import
GA4 sekarang bisa import data dari Meta, TikTok, Pinterest langsung (native integration).

## Thresholding
Ketika Google Signals aktif, data dengan jumlah kecil akan di-threshold (disembunyikan). Matikan Google Signals jika perlu data granular.

## Template Laporan Bulanan untuk Klien

```
─── LAPORAN GOOGLE ANALYTICS ───
Bulan: [Bulan] [Tahun]
Website: [domain]

📊 PENGUNJUNG
Pengunjung: [X] orang
Page views: [X] kali
Rata-rata/hari: [X] orang

🌏 SUMBER TRAFFIC
• Pencarian Google: [X]%
• Langsung: [X]%
• Media sosial: [X]%
• Lainnya: [X]%

📄 HALAMAN TERPOPULER
1. [halaman] — [X] views
2. [halaman] — [X] views
3. [halaman] — [X] views

📱 PERANGKAT
• HP: [X]%
• Desktop: [X]%
• Tablet: [X]%

🔥 TINDAKAN
• Klik WA: [X] kali
• Form kontak terisi: [X] kali
```

## Cara Pakai
1. Buka analytics.google.com → Buat akun GA4
2. Dapatkan Measurement ID (`G-XXXXXXXX`)
3. Simpan di env var: `NEXT_PUBLIC_GA_ID`
4. Pasang kode tracking
5. Verifikasi via Real-time report
6. Kirim laporan bulanan ke klien
