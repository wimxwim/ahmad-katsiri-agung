# AGENTS.md — AKAL Center (Untuk Kimi K2.7 Code)

<!-- 
  KONTEKS UNTUK KIMI K2.7 CODE:
  File ini adalah single-source-of-truth untuk AI yang akan mengerjakan coding.
  Tulis dengan struktur XML — Kimi merespon paling baik ke format ini.
  Gunakan instruksi eksplisit step-by-step — jangan asumsikan Kimi tahu konteks.
  Kimi K2.7 = always-thinking model. Reasoning_content selalu aktif. JANGAN dimatikan.
  Kimi K2.7 context = 262K token. File ini + referensi harus muat dalam itu.
-->

## IDENTITAS PROJECT

<project>
  <name>AKAL Center</name>
  <tagline>Deep Learning Akidah Akhlak</tagline>
  <description>Platform e-learning PAI SMP/MTs — Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning</description>
  <domain>https://akalcenter.my.id</domain>
  <repo>https://github.com/wimxwim/ahmad-katsiri-agung</repo>
  <status>LIVE — 27 sesi pengerjaan selesai</status>
  <klien>Ahmad Katsiri Agung, S.Pd. (WA: 0851-5879-5502)</klien>
</project>

## STACK TEKNIS (JANGAN DIGANTI)

<stack>
  <framework>Next.js 16.2.7 (App Router)</framework>
  <language>TypeScript ^5 (strict mode)</language>
  <css>Tailwind CSS v4 (custom oklch @theme)</css>
  <animation>motion/react ^12.40.0 (ease curve [0.16, 1, 0.3, 1] as const)</animation>
  <icons>lucide-react</icons>
  <fonts>Bricolage Grotesque (heading), Inter (body), Amiri (Quran), JetBrains Mono</fonts>
  <hosting>Vercel Hobby (gratis)</hosting>
  <cdn>Cloudflare Worker reverse proxy</cdn>
  <cms>Keystatic (git-based, OAuth GitHub)</cms>
  <sheets>googleapis ^173.0.0</sheets>
  <analytics>@vercel/analytics, @vercel/speed-insights, GoogleAnalytics</analytics>
  <auth>jose (JWT HS256)</auth>
  <validation>zod v4</validation>
  <utils>clsx, tailwind-merge</utils>
  <package-manager>npm</package-manager>
</stack>

## ATURAN CODING WAJIB

<rules>
  <rule priority="CRITICAL">JANGAN hapus vercel.json — file ini critical untuk framework detection</rule>
  <rule priority="CRITICAL">JANGAN tambah komentar di kode (kecuali untuk fix bug)</rule>
  <rule priority="CRITICAL">JANGAN ganti warna/font/design system yang sudah ada</rule>
  <rule priority="CRITICAL">JANGAN ubah animasi pattern (ease curve, stagger, duration)</rule>
  <rule priority="HIGH">Semua animasi pakai whileInView + viewport={{ once: true }}</rule>
  <rule priority="HIGH">Layout mobile-first: px-3 sm:px-5 lg:px-8</rule>
  <rule priority="HIGH">Teks font: heading = font-bricolage, body = font-inter, arab = font-amiri</rule>
  <rule priority="HIGH">JANGAN import library baru tanpa ijin eksplisit</rule>
  <rule priority="HIGH">Gunakan library yang sudah ada di package.json</rule>
  <rule priority="MEDIUM">Naming convention ikuti file yang sudah ada di project</rule>
  <rule priority="MEDIUM">Semua type/interface harus explicit, jangan pakai any</rule>
  <rule priority="MEDIUM">Gunakan cn() dari src/lib/utils.ts untuk conditional className</rule>
</rules>

## DESIGN SYSTEM (PAKAI YANG SUDAH ADA)

<design>
  <colors>
    <primary>#005231 (hijau gelap premium)</primary>
    <tertiary>#5a4200 (gold accent)</tertiary>
    <surface>#f2fcf7 (putih kehijauan)</surface>
    <glass>rgba(255,255,255,0.6) + backdrop-blur-2xl</glass>
    <border>rgba(27,107,69,0.15)</border>
    <shimmer>linear-gradient(90deg, #eec055, #ffdf9b, #eec055, #ffdf9b)</shimmer>
  </colors>
  <radius>sm:0.25rem, md:0.75rem, lg:1rem, xl:1.5rem, custom:32px-80px</radius>
  <shadow>shadow-glass, shadow-glass-lg, shadow-glass-xl</shadow>
</design>

## STRUKTUR FOLDER (HANYA FILE PENTING)

<structure>
  <folder name="src/app">
    <file>layout.tsx</file>
    <file>globals.css</file>
    <file>page.tsx (Beranda)</file>
    <folder name="materi">
      <file>page.tsx (daftar bab)</file>
      <folder name="[slug]"><file>page.tsx (detail bab)</file></folder>
    </folder>
    <file>pendidik/page.tsx</file>
    <file>game/page.tsx</file>
    <file>evaluasi/page.tsx</file>
    <file>video/page.tsx</file>
    <file>hafalan/page.tsx</file>
    <file>tentang/page.tsx</file>
    <file>peserta-didik/page.tsx (placeholder)</file>
    <file>login/page.tsx</file>
    <file>masuk/page.tsx</file>
    <file>masuk-guru/page.tsx</file>
    <file>proxy.ts (auth gate)</file>
    <folder name="api">
      <folder name="doa"><file>route.ts</file></folder>
      <folder name="siswa/cek"><file>route.ts</file></folder>
      <folder name="kuis/selesai"><file>route.ts</file></folder>
      <folder name="kuis/rekap"><file>route.ts</file></folder>
      <folder name="masuk"><file>route.ts</file></folder>
      <folder name="keystatic/[...params]"><file>route.ts</file></folder>
    </folder>
    <folder name="keystatic"><file>layout.tsx</file></folder>
  </folder>
  <folder name="src/components">
    <folder name="beranda"><file>HeroSection.tsx</file><file>FeatureGrid.tsx</file><file>DualCTACards.tsx</file><file>AyatBlock.tsx</file><file>RuangDoa.tsx</file></folder>
    <folder name="layout"><file>Navbar.tsx</file><file>BottomTabBar.tsx</file><file>Footer.tsx</file><file>FloatingWA.tsx</file></folder>
    <folder name="materi"><file>MateriDetailClient.tsx</file></folder>
    <folder name="evaluasi"><file>QuizEngine.tsx</file><file>QuizLogin.tsx</file></folder>
    <folder name="providers"><file>Providers.tsx</file></folder>
  </folder>
  <folder name="src/data">
    <file>materi.ts (14 bab, 484 baris)</file>
    <file>soal.ts (8 bank soal)</file>
    <file>hafalan.ts (9 dalil)</file>
    <file>dalil.ts (analisis QS Al-Isra:34)</file>
  </folder>
  <folder name="src/lib">
    <file>utils.ts (cn utility)</file>
    <file>google-sheets.ts</file>
    <file>telegram.ts</file>
    <file>auth.ts (JWT sign/verify)</file>
    <file>rate-limit.ts</file>
    <file>sanitize.ts</file>
    <file>validation.ts (Zod schemas)</file>
  </folder>
  <folder name="workers/akal-centre">
    <file>index.ts (Cloudflare Worker proxy)</file>
    <file>wrangler.jsonc</file>
  </folder>
</structure>

## PRD REFERENSI (BACA SEBELUM MULAI KERJA)

<prd>
  <file path="prd/01-ringkasan-eksekutif.md">Visi, status terkini, ADR, model bisnis</file>
  <file path="prd/02-audit-kondisi-saat-ini.md">Deep dive repo existing</file>
  <file path="prd/03-arsitektur-target.md">Arsitektur VPS multi-tenant</file>
  <file path="prd/04-matriks-fitur-per-role.md">Fitur Guru/Siswa/Admin/Ortu</file>
  <file path="prd/05-spesifikasi-mesin-analitik.md">Rumus IRT, BKT, Elo, Risk Score, TRI</file>
  <file path="prd/06-model-data.md">Schema database</file>
  <file path="prd/07-rencana-migrasi.md">Langkah konkret</file>
  <file path="prd/08-riset-2026-rekomendasi.md">Update stack 2026</file>
</prd>

## SKILLS YANG TERSEDIA (GUNAKAN SESUAI KEBUTUHAN)

<skills>
  <relevant>
    <skill name="ui-ux-pro-max" desc="67 styles, 96 palettes, 57 fonts, 13 stacks. GUNAKAN untuk desain UI komponen baru."/>
    <skill name="vercel-react-best-practices" desc="React/Next.js performance dari Vercel Engineering. GUNAKAN saat menulis/review kode React."/>
    <skill name="design-taste-frontend" desc="Senior UI/UX Engineer. GUNAKAN untuk audit visual komponen baru."/>
    <skill name="cloudflare" desc="Cloudflare Workers, Pages, KV, D1. GUNAKAN saat ubah Worker atau DNS."/>
    <skill name="seo-audit" desc="Technical SEO audit. GUNAKAN saat tambah halaman baru."/>
    <skill name="local-seo-indonesia" desc="SEO lokal Indonesia. GUNAKAN untuk optimasi Google Indonesia."/>
    <skill name="schema" desc="JSON-LD structured data. GUNAKAN untuk SEO schema markup."/>
    <skill name="analytics" desc="GA4 tracking. GUNAKAN untuk setup event tracking."/>
    <skill name="midtrans-payment" desc="Midtrans payment gateway. GUNAKAN untuk fitur pembayaran."/>
    <skill name="xendit-payment" desc="Xendit payment gateway. GUNAKAN jika klien pilih Xendit."/>
    <skill name="whatsapp-widget" desc="WA floating button. SUDAH ADA di FloatingWA.tsx."/>
    <skill name="domain-management" desc="Domain .id/.my.id. GUNAKAN saat setup domain baru."/>
    <skill name="ssl-setup" desc="SSL via Cloudflare. GUNAKAN untuk konfigurasi SSL."/>
    <skill name="uptime-monitoring" desc="BetterUptime/Upptime. GUNAKAN untuk setup monitoring."/>
    <skill name="backup-automation" desc="Backup database otomatis. GUNAKAN saat setup VPS."/>
    <skill name="google-analytics-setup" desc="GA4 setup. SUDAH TERPASANG di layout.tsx."/>
    <skill name="search-console-setup" desc="Google Search Console. GUNAKAN untuk setup GSC."/>
    <skill name="pwa-checklist" desc="PWA audit. GUNAKAN untuk PWA readiness."/>
    <skill name="core-web-vitals" desc="CWV optimization. GUNAKAN untuk audit performa."/>
    <skill name="pdf" desc="PDF generation. GUNAKAN untuk fitur sertifikat."/>
    <skill name="diskusi" desc="Triple-Layer Intelligence Engine. GUNAKAN untuk analisis project mendalam."/>
    <skill name="debug" desc="Root Cause Analysis Engine. GUNAKAN saat ada bug/error."/>
    <skill name="scanweb" desc="Website scanner. GUNAKAN untuk audit halaman existing."/>
    <skill name="client-handoff" desc="Dokumentasi serah terima. GUNAKAN saat handover ke klien."/>
    <skill name="privacy-policy" desc="Kebijakan Privasi Indonesia. GUNAKAN untuk UU PDP compliance."/>
    <skill name="sekolah-website" desc="Template website sekolah. GUNAKAN sebagai referensi struktur."/>
    <skill name="web-perf" desc="Web performance audit. GUNAKAN untuk optimasi Core Web Vitals."/>
  </relevant>
  <skip>
    <skill name="hunt-* (semua hunting skill)">TIDAK RELEVAN — ini untuk security testing, bukan development</skill>
    <skill name="bug-bounty">TIDAK RELEVAN</skill>
    <skill name="pentest-*">TIDAK RELEVAN</skill>
    <skill name="crypto-*">TIDAK RELEVAN</skill>
    <skill name="blockchain-*">TIDAK RELEVAN</skill>
  </skip>
</skills>

## KONVENSI ANIMASI (IKUTI PERSIS PATTERN INI)

<animation-rules>
  <hero>Hero/heading: initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}</hero>
  <grid>Stagger grid: variants + staggerChildren: 0.08 per item</grid>
  <sidebar>Sidebar kiri: x: -30, sidebar kanan: x: 30</sidebar>
  <ease>Ease curve: [0.16, 1, 0.3, 1] — WAJIB pakai as const</ease>
  <duration>0.5–0.7 detik, delay stagger 0.08–0.15</duration>
  <viewport>Semua scroll reveal pakai whileInView + viewport={{ once: true }} + initial/animate</viewport>
  <mobile>@media (max-width: 640px): backdrop-blur dikurangi (8px → 2px)</mobile>
</animation-rules>

## CSS PATTERN WAJIB

<css-patterns>
  <glass>className="bg-glass" = bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px]"</glass>
  <shimmer>className="shimmer-text" = gradien emas berkilau</shimmer>
  <safe>className="pb-safe" = padding-bottom: env(safe-area-inset-bottom)</safe>
  <mobile-blur>@media (max-width: 640px) { .bg-glass { backdrop-filter: blur(2px); } }</mobile-blur>
</css-patterns>

## YANG BELUM SELESAI (QUICK WINS)

<todo>
  <task prio="RENDAH">PROTA Kelas 8 PDF — nunggu Bang Agung</task>
  <task prio="RENDAH">Soal Tabayyun PDF — nunggu Bang Agung</task>
  <task prio="RENDAH">2 video YouTube (Nabi & Rasul, Adab Islam) — nunggu link</task>
  <task prio="RENDAH">/peserta-didik — halaman masih placeholder</task>
  <task prio="SEDANG">CMS Navbar overflow (>8 item dari CMS) — perlu filter di keystatic.config.ts</task>
  <task prio="SEDANG">Bang Agung belum punya akun GitHub untuk CMS — nunggu klien</task>
</todo>

## CARA DEPLOY

<deploy>
  <step>1. Build dulu: npx next build (PASTIKAN zero errors)</step>
  <step>2. Commit: git add -A && git commit -m "pesan"</step>
  <step>3. Push: git push origin main</step>
  <step>4. Deploy Vercel: npx vercel --prod --yes</step>
  <step>5. Deploy Worker: cd workers/akal-centre && npx wrangler deploy</step>
  <note>git config user.name harus wimxwim</note>
  <note>JANGAN hapus vercel.json</note>
</deploy>

## INSTRUKSI UNTUK KIMI K2.7 CODE

Kamu adalah Senior Frontend Engineer yang mengerjakan platform AKAL Center.
Tugasmu: membaca file ini, memahami konteks, lalu mengeksekusi instruksi coding
secara presisi. JANGAN mengubah design system. JANGAN menambah library baru.
IKUTI pattern yang sudah ada di kode. Setiap perubahan harus konsisten dengan
file tetangga.

Saat mengerjakan fitur baru:
1. BACA dulu komponen yang mirip di folder tetangga
2. PAKAI warna/font/animation pattern yang sama
3. TEST dengan npx next build sebelum menyatakan selesai
4. LAPORAN singkat: file apa yang diubah, kenapa, next step apa

Untuk pertanyaan arsitektur — BACA PRD di folder prd/.
Untuk debugging — GUNAKAN skill debug.
Untuk analisis mendalam — GUNAKAN skill diskusi.
