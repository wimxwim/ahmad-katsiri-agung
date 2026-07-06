---
name: cookie-consent-uu-pdp
description: Pasang cookie consent banner yang sesuai dengan UU PDP Indonesia. Mencakup banner, preferensi cookie, dan logging consent.
metadata:
  author: Agensi
  version: "2.0"
  category: Compliance
---

# COOKIE CONSENT UU PDP — Cookie Banner untuk Indonesia

## Latar Belakang
UU PDP Indonesia (UU No. 27/2022) sudah berlaku PENUH sejak 17 Oktober 2024. Mewajibkan:
- Persetujuan pengguna sebelum mengumpulkan data pribadi
- Informasi yang jelas tentang data apa yang dikumpulkan
- Opsi untuk menolak/tarik persetujuan
✅ Sanksi: denda administratif hingga 2% pendapatan tahunan + pidana Rp6 miliar (Pasal 57 UU PDP)
- Lembaga PDP (pengawas independen) mulai beroperasi penuh 2026

Untuk website standar (tidak mengumpulkan data sensitif), cookie consent sederhana sudah cukup.

## Aturan Tambahan UU PDP
- ❌ Dark patterns dilarang (tombol Terima lebih menonjol dari Tolak harus wajar)
- 👶 Data anak butuh persetujuan orang tua
- Re-consent: setelah 12 bulan atau ada perubahan material di kebijakan

## Penyimpanan Consent Record
```typescript
// Simpan consent record untuk audit
interface ConsentRecord {
  timestamp: string; // ISO 8601
  choices: { analytics: boolean; marketing: boolean; functional: boolean };
  policyVersion: string;
}
// Wajib disimpan minimal 12 bulan
```

## Komponen Cookie Banner

```tsx
// components/CookieConsent.tsx
"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
    // Enable GA
    gtag("consent", "update", { analytics_storage: "granted" });
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShow(false);
    // Disable GA
    gtag("consent", "update", { analytics_storage: "denied" });
  };

  const [showPreferences, setShowPreferences] = useState(false);

  if (!show) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <p className="text-sm text-gray-600 flex-1">
            Website ini menggunakan cookie untuk analytics dan pengalaman terbaik.
            Dengan melanjutkan, Anda menyetujui penggunaan cookie sesuai{" "}
            <a href="/kebijakan-privasi" className="underline">Kebijakan Privasi</a>.
          </p>
          <div className="flex gap-2">
            <button onClick={reject} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Tolak
            </button>
            <button onClick={() => setShowPreferences(true)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Preferensi
            </button>
            <button onClick={accept} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              Terima
            </button>
          </div>
        </div>
      </div>

      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Preferensi Cookie</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>Fungsional (wajib)</span>
                <input type="checkbox" checked disabled />
              </label>
              <label className="flex items-center justify-between">
                <span>Analytics</span>
                <input type="checkbox" defaultChecked onChange={(e) => console.log("analytics:", e.target.checked)} />
              </label>
              <label className="flex items-center justify-between">
                <span>Marketing</span>
                <input type="checkbox" onChange={(e) => console.log("marketing:", e.target.checked)} />
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowPreferences(false)} className="px-4 py-2 text-sm border rounded-lg flex-1">
                Tutup
              </button>
              <button onClick={() => { setShowPreferences(false); accept(); }} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg flex-1">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## Integrasi dengan Google Analytics Consent Mode

```tsx
// Di layout.tsx — sebelum GA di-load
<Script id="gtag-consent" strategy="beforeInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', { analytics_storage: 'denied' });
  `}
</Script>
```

## Template Halaman Kebijakan Privasi
```tsx
// app/kebijakan-privasi/page.tsx
export default function PrivacyPage() {
  return (
    <article className="prose max-w-3xl mx-auto py-12 px-4">
      <h1>Kebijakan Privasi</h1>
      <p>Terakhir diperbarui: [tanggal]</p>

      <h2>1. Data yang Kami Kumpulkan</h2>
      <p>Kami mengumpulkan data berikut saat Anda menggunakan website ini:
      • Data analytics (halaman yang dikunjungi, durasi, perangkat)
      • Data yang Anda isi di form kontak (nama, email, no WA)
      • Cookie teknis untuk fungsi dasar website</p>

      <h2>2. Tujuan Penggunaan</h2>
      <p>• Meningkatkan pengalaman pengguna
      • Menganalisis traffic website
      • Merespon pertanyaan dari form kontak</p>

      <h2>3. Penyimpanan & Keamanan</h2>
      <p>Data disimpan di server yang aman (Cloudflare + Supabase).
      Kami tidak menjual data Anda ke pihak ketiga.</p>

      <h2>4. Hak Anda</h2>
      <p>Anda berhak:
      • Menolak cookie kapan saja
      • Meminta penghapusan data Anda
      • Menghubungi kami untuk pertanyaan privasi</p>

      <h2>5. Kontak</h2>
      <p>WA: [nomor]
      Email: [email]</p>
    </article>
  );
}
```
