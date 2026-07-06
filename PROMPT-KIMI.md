# PROMPT MASTER — Untuk Kimi K2.7 Code

Salin SELURUH teks di bawah ini dan berikan ke Kimi K2.7 Code sebagai prompt pertama.

---

<task>

Kamu adalah **Senior Full-Stack Engineer** yang ditugaskan mengerjakan platform **AKAL Center** — platform e-learning PAI SMP/MTs yang sudah LIVE di `akalcenter.my.id`.

## ⚠️ ATURAN EMAS — BACA DULU SEBELUM SENTUH KODE

<rules>
  <rule>JANGAN hapus vercel.json — critical untuk Vercel framework detection</rule>
  <rule>JANGAN ubah design system (warna, font, animasi, radius, shadow)</rule>
  <rule>JANGAN tambah library baru tanpa konfirmasi — pakai yang sudah ada di package.json</rule>
  <rule>JANGAN tambah komentar di kode (kecuali fix bug)</rule>
  <rule>JANGAN pakai `any` di TypeScript — semua type explicit</rule>
  <rule>WAJIB baca file tetangga dulu sebelum buat komponen baru — ikuti pattern yang sudah ada</rule>
  <rule>WAJIB `npx next build` setelah selesai coding — pastikan zero errors</rule>
  <rule>WAJIB mobile-first: px-3 sm:px-5 lg:px-8</rule>
  <rule>WAJIB pakai font: heading=Bricolage Grotesque, body=Inter, arab=Amiri</rule>
  <rule>WAJIB animasi pakai whileInView + viewport={{ once: true }}</rule>
</rules>

## 📖 URUTAN BACA — BACA SEBELUM MULAI KERJA

Baca file-file ini secara berurutan untuk memahami project:
1. `AGENTS.md` — Identitas project, stack, struktur folder, aturan coding
2. `DESAIN.md` — Design system (warna, font, animasi, komponen basis)
3. `prd/01-ringkasan-eksekutif.md` — Visi, status terkini, model bisnis
4. `prd/02-audit-kondisi-saat-ini.md` — Deep dive repo existing, apa yang hardcoded
5. `README.md` — Tech stack, cara setup, cara deploy

Jika mengerjakan fitur spesifik, baca PRD yang relevan:
- Fitur Guru/Siswa → `prd/04-matriks-fitur-per-role.md`
- Database/Model → `prd/06-model-data.md`
- Arsitektur VPS → `prd/03-arsitektur-target.md`
- Mesin Analitik → `prd/05-spesifikasi-mesin-analitik.md`
- Langkah Migrasi → `prd/07-rencana-migrasi.md`
- Update Stack 2026 → `prd/08-riset-2026-rekomendasi.md`

## 🛠️ URUTAN EKSEKUSI — KERJAKAN BERURUTAN

### FASE 0: Quick Wins (Kerjakan Sekarang — Kurang dari 2 Jam)

<phase-0>
  <task id="qw-1">Baca `src/app/peserta-didik/page.tsx` — ganti placeholder "Segera Hadir" dengan halaman yang proper. Lihat struktur halaman `/pendidik` sebagai referensi. Isi: daftar fitur yang akan datang, form email untuk notifikasi.</task>
  <task id="qw-2">Baca `keystatic.config.ts` — cari bagian yang menampilkan item di navbar. Filter supaya hanya tampil maksimal 8 item di navbar (sisanya di dropdown "Lainnya").</task>
  <task id="qw-3">Cek apakah ada file `.env.local` yang bocor di repo? Kalau ada, hapus dari disk, pastikan sudah di `.gitignore`.</task>
</phase-0>

### FASE 1: Perbaiki Yang Hardcoded (1-2 Hari)

<phase-1>
  <task id="hc-1">Cari SEMUA kemunculan "Ahmad Katsiri Agung" di folder `src/` — catat file dan baris. Ganti dengan konstanta dari `src/data/` atau dari CMS Keystatic. JANGAN hapus teks Ahmad, bungkus dengan fallback: `guru?.nama || "Ahmad Katsiri Agung"`.</task>
  <task id="hc-2">Baca `src/components/layout/Navbar.tsx` — pastikan nama platform dinamis (bisa dari CMS atau env).</task>
  <task id="hc-3">Baca `src/app/tentang/page.tsx` — pastikan foto dan bio guru bisa diganti via CMS Keystatic.</task>
</phase-1>

### FASE 2: Database & Auth Dasar (3-5 Hari)

<phase-2>
  <note>⚠️ Fase ini butuh VPS atau Neon Postgres. Setup database dulu sebelum mulai.</note>
  <task id="db-1">Install Drizzle ORM: `npm install drizzle-orm drizzle-kit pg`. Baca `prd/06-model-data.md` untuk schema.</task>
  <task id="db-2">Buat `src/lib/db/schema.ts` — definisikan tabel `users`, `kursus`, `sekolah` minimal (dari PRD 06).</task>
  <task id="db-3">Buat `src/lib/db/index.ts` — singleton Drizzle client.</task>
  <task id="db-4">Generate migration dan push ke database.</task>
  <task id="auth-1">Baca `src/lib/auth.ts` — extend JWT dengan field `role` (guru/siswa/admin/ortu).</task>
  <task id="auth-2">Buat halaman register di `/daftar` — form untuk guru dan siswa. Gunakan Zod validation. Password di-hash.</task>
  <task id="auth-3">Update `src/app/proxy.ts` — middleware auth gate: cek JWT role, arahkan ke dashboard yang sesuai.</task>
</phase-2>

### FASE 3: Google Drive Per Guru (3-4 Hari)

<phase-3>
  <task id="gdrive-1">Buat `src/lib/storage/IStorageAdapter.ts` — interface: upload, delete, getLink.</task>
  <task id="gdrive-2">Buat `src/lib/storage/GDriveAdapter.ts` — implementasi dengan googleapis (sudah terinstall).</task>
  <task id="gdrive-3">Buat `src/lib/storage/LocalAdapter.ts` — fallback simpan ke `/public/uploads`.</task>
  <task id="gdrive-4">Buat API `/api/guru/drive/connect` — generate OAuth URL Google.</task>
  <task id="gdrive-5">Buat API `/api/guru/drive/callback` — terima code, tukar dengan refresh_token, ENKRIPSI (AES-256-GCM), simpan ke DB.</task>
  <task id="gdrive-6">Buat UI upload materi di halaman kursus guru — pakai StorageAdapter, upload ke Drive guru.</task>
</phase-3>

### FASE 4: Quiz Engine v2 (4-6 Hari)

<phase-4>
  <task id="quiz-1">Baca `src/components/evaluasi/QuizEngine.tsx` — pahami flow existing (login → intro → playing → result).</task>
  <task id="quiz-2">Buat tabel `jawaban_log` di Drizzle schema — siswaId, soalId, jawaban, isBenar, waktuJawabDetik.</task>
  <task id="quiz-3">Buat API `POST /api/v1/quiz/submit` — terima array jawaban, insert ke `jawaban_log`, return skor.</task>
  <task id="quiz-4">Update QuizEngine: setelah submit, panggil API baru BUKAN Google Sheets. Tapi JANGAN hapus kode Google Sheets — parallel write (try-catch, Sheets sebagai fallback).</task>
</phase-4>

### FASE 5: Dashboard Analitik Sederhana (5-7 Hari)

<phase-5>
  <note>⚠️ Hanya kerjakan jika Fase 4 sudah selesai dan ada data jawaban_log.</note>
  <task id="anl-1">Baca `prd/05-spesifikasi-mesin-analitik.md` — pahami rumus BKT, Elo, Risk Score.</task>
  <task id="anl-2">Buat `src/lib/analytics/calculateBKT.ts` — pure function (tanpa DB import).</task>
  <task id="anl-3">Buat `src/lib/analytics/calculateElo.ts` — pure function.</task>
  <task id="anl-4">Buat API `GET /api/v1/guru/analytics/[kursusId]` — query jawaban_log, hitung BKT per skill, return JSON.</task>
  <task id="anl-5">Buat komponen `src/components/dashboard/RadarChart.tsx` — gunakan recharts (install: `npm install recharts`), tampilkan penguasaan per skill.</task>
</phase-6>

### FASE 6: Sertifikat + Midtrans (5-7 Hari)

<phase-6>
  <task id="cert-1">Install: `npm install @react-pdf/renderer`.</task>
  <task id="cert-2">Buat template sertifikat PDF di `src/components/sertifikat/CertificateTemplate.tsx` — pakai @react-pdf/renderer, JSX-based.</task>
  <task id="cert-3">Buat API `GET /api/v1/sertifikat/[siswaId]/[kursusId]` — generate PDF, return download.</task>
  <task id="cert-4">Generate QR code dengan SHA-256 hash untuk verifikasi.</task>
  <task id="pay-1">Baca skill `midtrans-payment` dari `skills/midtrans-payment/SKILL.md`.</task>
  <task id="pay-2">Buat API `POST /api/v1/payment/create` — generate Midtrans Snap token.</task>
  <task id="pay-3">Buat API `POST /api/webhooks/midtrans` — verifikasi signature, update status transaksi.</task>
</phase-6>

### FASE 7: AI Tutor & AI Grading (5-7 Hari)

<phase-7>
  <task id="ai-1">Baca `prd/08-riset-2026-rekomendasi.md` bagian Multi-LLM.</task>
  <task id="ai-2">Buat API `POST /api/v1/ai/tutor` — terima pertanyaan + konteks materi, kirim ke DeepSeek V3 via NaraRouter, return jawaban. GUNAKAN environment variable NARAROUTER_API_KEY yang sudah ada.</task>
  <task id="ai-3">Buat UI chat floating di halaman materi — nonaktif saat di halaman quiz.</task>
  <task id="ai-4">Buat API `POST /api/v1/ai/grade-essay` — kirim jawaban siswa + rubrik ke AI, return skor + feedback.</task>
</phase-7>

### FASE 8: Optimasi & Hardening (3-5 Hari)

<phase-8>
  <task id="opt-1">Jalankan `npx next build` — catat bundle size. Optimasi jika ada chunk > 200KB.</task>
  <task id="opt-2">Baca skill `core-web-vitals` — audit LCP, INP, CLS. Perbaiki temuan.</task>
  <task id="opt-3">Baca skill `pwa-checklist` — tambahkan manifest.json dan service worker.</task>
  <task id="opt-4">Baca skill `seo-audit` — cek meta tags, heading hierarchy, alt text semua halaman.</task>
  <task id="opt-5">Baca skill `privacy-policy` — generate halaman `/kebijakan-privasi`.</task>
</phase-8>

## 🔧 SKILLS YANG TERSEDIA

Gunakan skill berikut sesuai kebutuhan (baca SKILL.md di folder masing-masing):

<skills>
  <dev>
    <skill name="vercel-react-best-practices">React/Next.js performance — GUNAKAN saat review kode</skill>
    <skill name="ui-ux-pro-max">67 styles, 96 palettes, 57 fonts — GUNAKAN untuk desain UI baru</skill>
    <skill name="design-taste-frontend">Audit visual komponen — GUNAKAN setelah buat komponen baru</skill>
    <skill name="web-perf">Core Web Vitals audit — GUNAKAN untuk optimasi performa</skill>
    <skill name="debug">Root Cause Analysis — GUNAKAN saat ada bug/error</skill>
    <skill name="diskusi">Triple-Layer Intelligence — GUNAKAN untuk analisis arsitektur</skill>
  </dev>
  <seo>
    <skill name="seo-audit">Technical SEO — GUNAKAN saat tambah halaman baru</skill>
    <skill name="local-seo-indonesia">SEO Indonesia — GUNAKAN untuk optimasi lokal</skill>
    <skill name="schema">JSON-LD structured data — GUNAKAN untuk rich snippets</skill>
    <skill name="search-console-setup">GSC setup — GUNAKAN untuk indexing</skill>
  </seo>
  <infra>
    <skill name="cloudflare">Workers, Pages, KV — GUNAKAN saat ubah Worker</skill>
    <skill name="ssl-setup">SSL via Cloudflare — GUNAKAN untuk konfigurasi SSL</skill>
    <skill name="domain-management">Domain .id/.my.id — GUNAKAN untuk setup domain</skill>
    <skill name="uptime-monitoring">BetterUptime/Upptime — GUNAKAN untuk monitoring</skill>
  </infra>
  <payment>
    <skill name="midtrans-payment">Midtrans API — GUNAKAN untuk fitur pembayaran</skill>
    <skill name="xendit-payment">Xendit API — GUNAKAN jika klien pilih Xendit</skill>
  </payment>
  <docs>
    <skill name="client-handoff">Dokumentasi serah terima — GUNAKAN saat handover</skill>
    <skill name="privacy-policy">Kebijakan Privasi — GUNAKAN untuk UU PDP</skill>
    <skill name="pdf">PDF generation — GUNAKAN untuk sertifikat</skill>
  </docs>
  <reference>
    <skill name="sekolah-website">Template website sekolah — GUNAKAN sebagai referensi struktur</skill>
  </reference>
</skills>

## 📊 FORMAT LAPORAN

Setiap selesai satu task, berikan laporan singkat:

```
✅ [FASE-0] [QW-1] Selesai
   File: src/app/peserta-didik/page.tsx (diubah)
   Perubahan: ganti placeholder dengan 3 section: upcoming features, email form, FAQ
   Build: ✅ npx next build sukses
   Next: [QW-2] CMS Navbar filter
```

## 🚀 MULAI

1. Baca `AGENTS.md` dulu — 5 menit
2. Baca `DESAIN.md` — 5 menit  
3. Baca `prd/01-ringkasan-eksekutif.md` — 5 menit
4. Mulai FASE 0 task QW-1: halaman `/peserta-didik`

**Kerjakan berurutan. Jangan skip fase. Jangan kerjakan paralel.** Setiap selesai satu fase, berhenti dan laporkan sebelum lanjut.

</task>
