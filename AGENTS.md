# AGENTS.md — AKAL Center (Single Source of Truth untuk AI Coding Agent)

<!--
  UPDATE TERAKHIR: 9 Juli 2026 — cutover multi-guru selesai dieksekusi & LIVE.
  Konten single-guru lama (Bang Agung) sudah dihapus total dari kode & branch
  production (main). Platform sekarang murni multi-guru, DB-driven, siap
  dipakai Bang Agung sebagai guru pertama untuk upload materi sendiri.
-->

## IDENTITAS PROJECT

<project>
  <name>AKAL Center</name>
  <tagline>Platform Guru-Siswa + AI Document Generator</tagline>
  <description>
    Platform pembelajaran multi-guru. Cutover dari website PAI single-guru lama
    sudah selesai — branch `main` (production) sekarang identik dengan `master`
    (kode terbaru). Prioritas utama saat ini adalah: guru (Bang Agung) melakukan
    onboarding & upload materi pertama sebagai uji coba fitur, sambil melanjutkan
    gelombang implementasi 14 ke atas (AI document pipeline, dashboard lanjutan).
  </description>
  <domain>https://akalcenter.my.id</domain>
  <repo>https://github.com/wimxwim/ahmad-katsiri-agung</repo>
  <status>LIVE — platform multi-guru sudah production, konten kosong menunggu guru pertama upload</status>
  <klien>Ahmad Katsiri Agung, S.Pd. (WA: 0851-5879-5502)</klien>
</project>

## KEPUTUSAN STRATEGIS YANG SUDAH TERKUNCI

<locked-decisions>
  <decision id="D-001">ORM final = Drizzle</decision>
  <decision id="D-002">Fase sekarang = Vercel + Supabase + ImageKit</decision>
  <decision id="D-003">VPS ditunda sampai user, siswa, dan guru sudah banyak</decision>
  <decision id="D-004">Keystatic dibekukan untuk FITUR BARU (config tetap ada untuk migrasi manual bila perlu, tapi reader lama sudah dihapus)</decision>
  <decision id="D-005">Konten lama Keystatic TIDAK lagi dibaca — dihapus total per 9 Juli 2026 (lihat D-011)</decision>
  <decision id="D-006">Payment online ditunda; sementara CTA ke WhatsApp manual</decision>
  <decision id="D-007">AI prioritas utama = generator PDF/DOCX -> materi + quiz + soal</decision>
  <decision id="D-008">Hasil AI wajib draft dulu, tidak boleh auto-publish</decision>
  <decision id="D-009">Auth harus memisahkan intent guru vs siswa secara tegas</decision>
  <decision id="D-010">Live lama tidak wajib dipertahankan UX-nya; boleh dirombak total</decision>
  <decision id="D-011">Data lama Bang Agung (materi hardcode, Google Sheets, kuis/refleksi/diskusi legacy) DIHAPUS TOTAL — klien memutuskan tidak perlu migrasi, Bang Agung upload ulang sendiri via fitur baru sebagai testing platform (9 Juli 2026)</decision>
  <decision id="D-013">Revenue model: teacher free forever (capacity-limited), revenue from schools (BOS funds), waqf/donors, parents. AI token upgrades as optional top-up.</decision>
  <decision id="D-014">AI model strategy: DeepSeek V4 Flash (Rp9/gen) for 80% tasks, DeepSeek V4 Pro (Rp87/gen) for 20% heavy tasks. Average Rp22/gen — sustainable at scale.</decision>
  <decision id="D-015">Owner monitoring via owner_metrics_daily table + pg_cron — metrics refreshed daily at 3 AM. Real-time queries for lightweight metrics.</decision>
  <decision id="D-016">Payment: QRIS static (GoPay) for now — Midtrans pending approval. Payment page at /pembayaran with manual verification by owner.</decision>
  <decision id="D-017">PSE Registration identified as legal requirement — must register akalcenter.my.id with Komdigi before public launch.</decision></locked-decisions>

## STACK TEKNIS RESMI SAAT INI

<stack>
  <framework>Next.js 16.2.7 (App Router)</framework>
  <language>TypeScript strict</language>
  <css>Tailwind CSS v4</css>
  <animation>motion/react</animation>
  <icons>lucide-react</icons>
  <fonts>Bricolage Grotesque, Inter, Amiri, JetBrains Mono</fonts>
  <hosting>Vercel — project "ahmad-katsiri-agung", production branch = main</hosting>
  <database>Supabase Postgres (Singapore, ap-southeast-1)</database>
  <orm>Drizzle ORM</orm>
  <storage>ImageKit untuk PDF, foto, dan media</storage>
  <auth>JWT app-level (HS256/ES256) + Google OAuth</auth>
  <validation>zod</validation>
  <legacy-cms>Keystatic — config masih ada (content/*), tapi reader (cms.ts/cms-data.ts) sudah dihapus. Tidak dipakai fitur apapun saat ini.</legacy-cms>
  <legacy-data>Google Sheets — DIHAPUS TOTAL per 9 Juli 2026, tidak ada bridge lagi</legacy-data>
  <notifications>email/Resend</notifications>
  <package-manager>npm</package-manager>
</stack>

## STATUS IMPLEMENTASI TERBARU (per 9 Juli 2026)

<implementation-status>
  <done>
    <item>Cutover branch main -> isi master selesai, production akalcenter.my.id LIVE dengan kode multi-guru</item>
    <item>Semua konten legacy single-guru (materi.ts, soal.ts, google-sheets.ts, rute /materi /evaluasi /refleksi /diskusi /hafalan /video /dalil) dihapus total</item>
    <item>Register & Login (password + Google OAuth) sudah diverifikasi jalan di production</item>
    <item>Database Supabase Postgres: semua 14 file migrasi sudah diterapkan manual (kolom google_id, refresh_tokens, ai_generation, dsb sudah ada)</item>
    <item>Environment variables production lengkap tersimpan di Vercel (AI, Supabase, ImageKit, Redis, Google OAuth, Encryption)</item>
    <item>Google Analytics Bang Agung (G-FKHV466K10) tetap terpasang di layout.tsx & content/site-config</item>
    <item>Landing page publik, /masuk, /daftar, /kursus (katalog DB-driven), dashboard guru/siswa/owner/admin-sekolah/orang-tua sudah live</item>
    <item>NaraRouter audit selesai — deepseek-v4-flash (Rp9/gen) dan deepseek-v4-pro (Rp87/gen) terverifikasi. deepseek-chat TIDAK ADA.</item>
    <item>AI model default diubah: heavy tasks → deepseek-v4-pro, light tasks → deepseek-v4-flash</item>
    <item>Owner monitoring: owner_metrics_daily table + last_active_at + migration 0017 applied</item>
    <item>QRIS payment page restored: /pembayaran + /api/v1/payment/qris</item>
    <item>FormMasuk fix: default ke pemilihan portal (bukan siswa), deskripsi kursus netral</item>
    <item>Phase 0-3 TODO items complete (31 items), grand final audit done (97 total items)</item>
  </done>
  <in-progress>
    <item>Bang Agung sebagai guru pertama — belum mulai upload materi/kursus (database kosong by design)</item>
    <item>AI document pipeline (upload PDF/DOCX -> draft materi/quiz/soal)</item>
    <item>Gelombang implementasi 15 ke atas (lihat TODO-V2-MULTI-GURU.md — gelombang 1-15 selesai, progres 166/215=77%)</item>
  </in-progress>
  <not-done>
    <item>ImageKit health-check endpoint masih error_404 di /api/health (bukan blocker fitur, cuma endpoint cek yang salah — perlu audit checkImageKit() di src/app/api/health/route.ts)</item>
    <item>Supabase Auth REST health-check error_401 di /api/health (tidak dipakai untuk auth utama, auth utama via Drizzle+JWT langsung — bisa diabaikan atau diperbaiki endpoint cek-nya)</item>
    <item>Dashboard owner/admin-sekolah/orang-tua — sudah ada rute, belum full battle-tested dengan data nyata</item>
    <item>AI generator dokumen — endpoint ada, belum ada percobaan end-to-end dengan file PDF/DOCX nyata dari guru</item>
  </not-done>
</implementation-status>

## PRIORITAS PENGERJAAN (URUTAN WAJIB)

<priority-order>
  <p0>
    <item>Dampingi Bang Agung upload materi/kursus pertama — pastikan alur upload+ImageKit+draft AI benar-benar jalan end-to-end</item>
    <item>Perbaiki checkImageKit() dan checkSupabase() di /api/health supaya tidak false-alarm "degraded"</item>
  </p0>
  <p1>
    <item>AI document generator end-to-end dengan file nyata (PDF/DOCX -> draft materi/quiz/soal)</item>
    <item>Battle-test dashboard owner/admin-sekolah/orang-tua dengan data nyata</item>
  </p1>
  <p2>
    <item>Analitik dasar guru (BKT/Elo/IRT/spaced-rep sudah ada di src/lib/analytics, perlu dipakai nyata)</item>
    <item>Remedial recommendation awal</item>
  </p2>
  <p3>
    <item>Payment online (Midtrans, sudah ada src/lib/midtrans.ts tapi belum aktif dipakai)</item>
    <item>VPS migration</item>
    <item>Teacher Readiness Index untuk semua guru</item>
  </p3>
</priority-order>

## ATURAN CODING WAJIB

<rules>
  <rule priority="CRITICAL">JANGAN hapus vercel.json</rule>
  <rule priority="CRITICAL">JANGAN tambah komentar di kode kecuali untuk fix bug yang benar-benar perlu</rule>
  <rule priority="CRITICAL">JANGAN ganti design system dasar yang sudah ada</rule>
  <rule priority="CRITICAL">JANGAN ubah ease curve animasi dari [0.16, 1, 0.3, 1] as const</rule>
  <rule priority="CRITICAL">JANGAN tambah library baru tanpa alasan kuat dan tanpa cek package.json dulu</rule>
  <rule priority="CRITICAL">JANGAN pernah hardcode NODE_ENV di .env.local atau .env manapun — biarkan Next.js yang mengatur (dev vs build otomatis beda). Ini pernah menyebabkan seluruh production build gagal (lihat GOTCHAS).</rule>
  <rule priority="CRITICAL">JANGAN PERNAH commit, push, atau tulis file yang mengandung API key, password, token, atau credential dalam bentuk apapun. Repo ini PUBLIC. Kalau perlu catat credential, simpan di Bitwarden atau .env.local (yang sudah di-gitignore).</rule>
  <rule priority="CRITICAL">JANGAN PERNAH membuat file dokumentasi environment (.md/.txt) yang berisi nilai credential asli. Untuk dokumentasi environment, gunakan .env.example DENGAN NILAI DUMMY/PLACEHOLDER.</rule>
  <rule priority="CRITICAL">Sebelum commit, WAJIB jalankan `git diff --cached` dan periksa TIDAK ADA credential (pola: DATABASE_URL dengan password, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, ENCRYPTION_SECRET, GOOGLE_CLIENT_SECRET, IMAGEKIT_PRIVATE_KEY, RESEND_API_KEY, REDIS_URL dengan password, NARAROUTER_API_KEY, SMTP_PASSWORD, OIDC token).</rule>
  <rule priority="HIGH">Semua type/interface explicit, jangan pakai any</rule>
  <rule priority="HIGH">Gunakan cn() dari src/lib/utils.ts untuk className kondisional</rule>
  <rule priority="HIGH">Semua desain tetap mobile-first: px-3 sm:px-5 lg:px-8</rule>
  <rule priority="HIGH">Semua route auth harus memisahkan intent guru vs siswa dengan jelas</rule>
  <rule priority="HIGH">JANGAN izinkan akun siswa masuk dari portal guru tanpa error eksplisit</rule>
  <rule priority="HIGH">JANGAN izinkan akun guru masuk dari portal siswa tanpa error eksplisit</rule>
  <rule priority="HIGH">JANGAN buat fitur baru lewat Keystatic/content/* — reader-nya (cms.ts, cms-data.ts) sudah dihapus, jangan dibuat ulang</rule>
  <rule priority="HIGH">Semua fitur baru yang melibatkan materi/quiz/soal harus DB-driven (Drizzle + Supabase, bukan hardcode file)</rule>
  <rule priority="HIGH">Semua hasil AI harus status draft sampai di-approve guru</rule>
  <rule priority="HIGH">Semua file upload dianggap untrusted content</rule>
  <rule priority="HIGH">JANGAN eksekusi file upload, JANGAN treat file upload sebagai trusted input</rule>
  <rule priority="HIGH">JANGAN kirim secret ke client-side code</rule>
  <rule priority="HIGH">JANGAN return raw AI output tanpa validasi/sanitasi</rule>
  <rule priority="HIGH">JANGAN puas dengan solusi "asal build hijau" kalau arsitektur atau API yang dipilih jelas bukan pilihan terbaik</rule>
  <rule priority="HIGH">Jika sebuah error sudah dicoba perbaiki 3x dan masih gagal, BERHENTI patching lokal — baca ulang source code, docs library resmi, dan evaluasi ulang pendekatan terbaik</rule>
  <rule priority="HIGH">Jika ada lebih dari satu pendekatan yang sama-sama bisa jalan, pilih yang paling future-proof, paling konsisten dengan arsitektur project, dan paling sedikit utang teknis</rule>
  <rule priority="HIGH">JANGAN impor path internal package secara rapuh hanya karena cepat lolos build; utamakan public API library</rule>
  <rule priority="HIGH">Setiap fitur baru yang kompleks wajib diuji bukan hanya build, tapi juga kesesuaian desain, alur UX, dan integrasi data</rule>
  <rule priority="HIGH">JANGAN pernah set env var Postgres/URL lewat `echo "$val" | vercel env add` di shell — karakter spesial ($, @, #, backtick) bisa ketelan shell interpolation. Gunakan node script yang tulis file dulu, atau REST API Vercel langsung dengan payload JSON.</rule>
  <rule priority="HIGH">Password/connection string yang mengandung karakter spesial (!@#$ dll) WAJIB di-encodeURIComponent() dulu sebelum dipasang ke URL Postgres — kalau tidak, parser URL salah membaca password sebagai host/fragment (error: "Invalid URL" atau "SASL: client password must be a string").</rule>
  <rule priority="MEDIUM">Ikuti naming convention file tetangga kecuali memang sedang membuat arsitektur baru yang lebih rapi</rule>
  <rule priority="MEDIUM">Refactor besar boleh dilakukan jika memang menghapus alur legacy yang kacau, asalkan build tetap hijau</rule>
</rules>

## DAFTAR FILE YANG DILARANG KERAS DI-PUSH (REPO PUBLIC)

<forbidden-files>
  <category name="ENVIRONMENT FILES">
    <file pattern=".env">File environment lokal — berisi kredensial asli</file>
    <file pattern=".env.local">File environment lokal Next.js — berisi kredensial asli</file>
    <file pattern=".env.*">Semua varian .env (kecuali .env.example dan .env.production.example)</file>
    <file pattern="*[Ee]nvironment*.md">File dokumentasi environment dalam format markdown</file>
    <file pattern="*[Ee]nvironment*.txt">File dokumentasi environment dalam format teks</file>
    <file pattern="*[Ee]nv*.md">File markdown yang membahas environment variables</file>
  </category>
  <category name="CREDENTIAL FILES">
    <file pattern="*credential*">File apapun mengandung kata credential</file>
    <file pattern="*secret*">File apapun mengandung kata secret (kecuali src/lib/ auth code)</file>
    <file pattern="*password*">File apapun mengandung kata password</file>
    <file pattern="*token*">File apapun mengandung kata token (kecuali src/lib/ code)</file>
    <file pattern="*.pem">Private key / certificate</file>
    <file pattern="*.key">Private key</file>
    <file pattern="id_rsa*">SSH private key</file>
    <file pattern="*.pfx">PKCS#12 certificate bundle</file>
    <file pattern="*.p12">PKCS#12 certificate</file>
    <file pattern="*.crt">Certificate (kecuali kalau public cert)</file>
  </category>
  <category name="BACKUP / TEMP FILES">
    <file pattern="*.bak">File backup</file>
    <file pattern="*.backup">File backup</file>
    <file pattern="*~">File temporary editor</file>
    <file pattern="*.swp">File swap vim</file>
    <file pattern="*.swo">File swap vim</file>
  </category>
  <category name="HANYA DIIZINKAN">
    <file pattern=".env.example">✅ BOLEH — template tanpa nilai asli</file>
    <file pattern=".env.production.example">✅ BOLEH — template tanpa nilai asli</file>
    <file pattern="src/lib/*.ts">✅ BOLEH — kode yang pakai process.env (bukan nilai asli)</file>
  </category>
</forbidden-files>

## PROTOKOL SAAT MENEMUKAN ERROR BERULANG

<error-recovery-protocol>
  <step>1. Baca pesan error kata per kata dan identifikasi file, symbol, dan library yang terlibat.</step>
  <step>2. Cek apakah masalahnya berasal dari asumsi agent, API library yang berubah, atau schema project yang belum sinkron.</step>
  <step>3. Jika 1-2 patch pertama gagal, JANGAN lanjut tebak-tebakan — buka file sumber yang relevan dan baca export/typing/library docs resmi.</step>
  <step>4. Jika sudah 3x gagal, wajib ganti mode dari "patch" ke "root-cause analysis".</step>
  <step>5. Kalau docs resmi tersedia, utamakan docs resmi 2026. Jangan ambil solusi internal-path, workaround rapuh, atau hack sementara kalau ada API publik yang benar.</step>
  <step>6. Setelah fix, verifikasi dengan build dan cek apakah solusi itu benar-benar cocok dengan desain sistem jangka menengah.</step>
  <step>7. Verifikasi di production langsung dengan curl/tes fungsional (bukan cuma build hijau) sebelum klaim "selesai" — kasus nyata: build hijau tapi register/login tetap gagal karena migrasi DB belum diterapkan.</step>
</error-recovery-protocol>

## STANDAR KUALITAS SOLUSI

<solution-quality-bar>
  <rule>Solusi terbaik = bukan yang paling cepat lolos build, tetapi yang paling benar secara arsitektur.</rule>
  <rule>Kalau library menyediakan API publik yang jelas, gunakan itu. Hindari mengimpor file internal package path dalam node_modules kecuali tidak ada opsi lain dan alasannya didokumentasikan.</rule>
  <rule>Kalau schema project belum mendukung fitur, perbaiki schema dengan benar dulu — jangan paksa route/controller menebak field yang belum ada.</rule>
  <rule>Kalau UI sudah berhasil tampil tapi alurnya masih membingungkan user, anggap tugas belum selesai.</rule>
  <rule>Untuk frontend, nilai keberhasilan bukan cuma compile, tapi juga hierarchy visual, intent UX, dan mobile-first quality.</rule>
  <rule>Untuk backend, nilai keberhasilan bukan cuma request 200, tapi juga role guard, data ownership, dan failure state yang aman.</rule>
  <rule>"Build hijau" BUKAN bukti fitur jalan di production — selalu tes fungsional nyata (curl endpoint, coba register/login) sebelum klaim selesai.</rule>
</solution-quality-bar>

## DESIGN SYSTEM (TETAP DIPAKAI)

<design>
  <colors>
    <primary>#005231</primary>
    <tertiary>#5a4200</tertiary>
    <surface>#f2fcf7</surface>
    <glass>rgba(255,255,255,0.6) + backdrop-blur-2xl</glass>
    <border>rgba(27,107,69,0.15)</border>
    <shimmer>linear-gradient(90deg, #eec055, #ffdf9b, #eec055, #ffdf9b)</shimmer>
  </colors>
  <radius>sm:0.25rem, md:0.75rem, lg:1rem, xl:1.5rem, custom:32px-80px</radius>
  <shadow>shadow-glass, shadow-glass-lg, shadow-glass-xl</shadow>
</design>

## STRUKTUR AKTUAL (SUDAH LIVE, BUKAN LAGI TARGET)

<target-structure>
  <public>
    <route>/ (landing baru "Platform Guru-Siswa + AI Document Generator")</route>
    <route>/masuk</route>
    <route>/daftar</route>
    <route>/fitur</route>
    <route>/harga</route>
    <route>/tentang</route>
    <route>/kursus (katalog publik, DB-driven)</route>
    <route>/kursus/[slug]</route>
    <route>/game (fallback kosong, menunggu guru isi)</route>
    <route>/quran (tools generik, tidak terikat data guru)</route>
  </public>
  <dashboards>
    <route>/guru, /guru/kursus, /guru/siswa, /guru/analytics, /guru/upload, /guru/drafts, /guru/kelas, /guru/nilai, /guru/sertifikat</route>
    <route>/siswa, /siswa/materi, /siswa/quiz, /siswa/cbt, /siswa/kursus, /siswa/progres, /siswa/pengumuman, /siswa/payment</route>
    <route>/owner</route>
    <route>/admin-sekolah</route>
    <route>/orang-tua</route>
  </dashboards>
  <note>
    Rute legacy /materi, /evaluasi, /refleksi, /diskusi, /hafalan, /video, /dalil
    SUDAH DIHAPUS (9 Juli 2026). Jangan dibuat ulang — kalau butuh browse materi
    publik pakai /kursus, kalau butuh akses materi siswa pakai /siswa/materi.
  </note>
</target-structure>

## LEGACY — SUDAH DIHAPUS TOTAL (9 Juli 2026)

<legacy>
  <rule priority="CRITICAL">Semua item di bawah ini SUDAH DIHAPUS dari kode. JANGAN buat ulang tanpa izin eksplisit klien.</rule>
  <item status="DIHAPUS">src/lib/google-sheets.ts</item>
  <item status="DIHAPUS">src/app/api/siswa/cek/route.ts</item>
  <item status="DIHAPUS">src/app/api/kuis/selesai/route.ts</item>
  <item status="DIHAPUS">src/app/api/kuis/rekap/route.ts</item>
  <item status="DIHAPUS">src/app/api/doa/route.ts, src/app/api/refleksi/route.ts, src/app/api/diskusi/*</item>
  <item status="DIHAPUS">src/lib/cms.ts, src/lib/cms-data.ts, src/lib/cms-config.ts</item>
  <item status="DIHAPUS">src/data/materi.ts, src/data/soal.ts, src/data/mock.ts (14 bab hardcode Bang Agung lama)</item>
  <item status="DIHAPUS">src/app/materi/*, src/app/evaluasi/*, src/app/refleksi/*, src/app/diskusi/*, src/app/hafalan/*, src/app/video/*, src/app/dalil/*</item>
  <item status="DIHAPUS">scripts/seed-materi.ts, scripts/seed-soal.ts, scripts/migrate-cms.ts, scripts/cleanup-doa.ts, scripts/inspect-doa.ts, scripts/migrate/*</item>
  <item status="MASIH ADA (tidak dipakai)">content/* (Keystatic content files) — dibiarkan di repo sebagai arsip, TIDAK dibaca kode manapun lagi. keystatic.config.ts masih ada untuk kemungkinan migrasi manual di masa depan.</item>
</legacy>

## AUTH PRINCIPLES

<auth-principles>
  <principle>Auth flow harus tunggal, tegas, dan deterministik</principle>
  <principle>/masuk dan /daftar adalah entry utama publik</principle>
  <principle>Role sumber kebenaran berasal dari DB/session, bukan dari URL halaman semata</principle>
  <principle>Intent dari portal dipakai untuk validasi UX dan guard pesan error</principle>
  <principle>Jika role tidak cocok dengan portal, tampilkan error eksplisit</principle>
  <principle>Auth utama: password (argon2 via @node-rs/argon2) + Google OAuth. Redirect URI production: https://akalcenter.my.id/api/v1/auth/callback/google (sudah terdaftar di Google Cloud Console)</principle>
  <principle>Sudah diverifikasi jalan end-to-end di production per 9 Juli 2026 (register password berhasil, tabel users lengkap dengan kolom google_id)</principle>
</auth-principles>

## AI PRINCIPLES

<ai-principles>
  <principle>Prioritas AI saat ini BUKAN chatbot, tetapi document-to-learning pipeline</principle>
  <principle>Input utama: PDF dan DOCX</principle>
  <principle>Output utama: materi + quiz + soal</principle>
  <principle>Semua output harus draft dulu</principle>
  <principle>Guru wajib review sebelum publish</principle>
  <principle>File upload dianggap tidak tepercaya</principle>
  <principle>Ekstrak teks dulu bila memungkinkan; jangan oper file mentah ke subsistem lain tanpa validasi</principle>
</ai-principles>

## PRD & DOKUMEN YANG WAJIB DIBACA SEBELUM FITUR BESAR

<required-reading>
  <file path="prd/01-ringkasan-eksekutif.md">visi dan arah bisnis</file>
  <file path="prd/02-audit-kondisi-saat-ini.md">kondisi codebase nyata</file>
  <file path="prd/03-arsitektur-target.md">arah arsitektur besar</file>
  <file path="prd/06-model-data.md">schema dan model</file>
  <file path="prd/07-rencana-migrasi.md">langkah transisi</file>
  <file path="prd/08-riset-2026-rekomendasi.md">stack terbaru</file>
  <file path="prd/TODO-V2-MULTI-GURU.md">todo implementasi aktif — gelombang 14 ke atas belum selesai</file>
</required-reading>

## TUGAS YANG SUDAH SELESAI / JANGAN DIULANG

<done-tasks>
  <item>Fondasi pemisahan intent login guru vs siswa sudah ditanam</item>
  <item>/daftar dan /masuk sudah jadi entry utama, sudah tes production</item>
  <item>Landing page publik baru sudah live</item>
  <item>Build OOM sudah diperbaiki lewat NODE_OPTIONS di script build</item>
  <item>Cutover total dari single-guru ke multi-guru: konten legacy dihapus, branch main = master, deploy production sukses (9 Juli 2026)</item>
  <item>Migrasi database (14 file SQL) sudah diterapkan manual ke Supabase production</item>
  <item>Environment variables production lengkap (AI/Supabase/ImageKit/Redis/Google OAuth/Encryption)</item>
  <item>Register & login sudah diverifikasi jalan nyata di akalcenter.my.id (bukan cuma build hijau)</item>
</done-tasks>

## TUGAS KRITIKAL BERIKUTNYA

<next-critical>
  <task priority="P0">Dampingi Bang Agung upload materi/kursus pertama sebagai guru — uji end-to-end fitur upload+ImageKit+draft AI</task>
  <task priority="P0">Perbaiki checkImageKit() dan checkSupabase() di src/app/api/health/route.ts supaya tidak false-alarm "degraded" (endpoint yang dicek saat ini salah target)</task>
  <task priority="P1">AI document upload + extraction + draft generation — uji dengan file PDF/DOCX nyata</task>
  <task priority="P1">Lanjutkan gelombang implementasi 14 ke atas sesuai prd/TODO-V2-MULTI-GURU.md</task>
</next-critical>

## BUILD / VERIFICATION RULE

<verification>
  <rule>Setelah perubahan berarti, jalankan `npm run build`</rule>
  <rule>JANGAN klaim selesai kalau build masih merah</rule>
  <rule>Kalau build gagal, selesaikan error kritikal dulu sebelum lanjut UI kosmetik</rule>
  <rule>Jika ada perubahan auth/routing, uji alur guru vs siswa secara eksplisit</rule>
  <rule>Build hijau TIDAK CUKUP — untuk perubahan yang menyentuh auth/DB, wajib tes fungsional nyata di production (curl register/login, cek response 200 + data benar) sebelum klaim selesai</rule>
  <rule>Sebelum push ke branch production (main), pastikan `git diff master main --quiet` (atau branch dev yang dipakai) menunjukkan tidak ada bedanya, supaya tidak ada kejutan konten lama nongol lagi</rule>
</verification>

## PROTOKOL PENGGUNAAN SKILL (WAJIB)

<skill-protocol>
  <rule>Sebelum menulis kode untuk fitur baru, WAJIB load skill yang relevan dari `.agents/skills/` via tool `skill()` — jangan tebak-tebak sendiri</rule>
  <rule>Skill project-specific yang WAJIB dipakai: `auth-flow-akal-center` (auth), `design-taste-frontend` (UI/UX), `vercel-react-best-practices` (performa React/Next.js)</rule>
  <rule>Skill general yang tersedia: `backend-patterns`, `code-review-and-quality`, `security-review`, `cloudflare`, `workers-best-practices`, `wrangler`, `midtrans-payment`, `xendit-payment`, `semgrep`, `web-perf`, `core-web-vitals`, `pwa-checklist`, `site-architecture`, `system-design`, `frontend-design`, `ui-ux-pro-max`, `high-end-visual-design`, `extract-design-system`, `web-design-guidelines`</rule>
  <rule>Untuk perubahan lintas-lapisan (API + DB + UI), load skill dari MULTIPLE kategori sekaligus — jangan cuma satu</rule>
  <rule>Skill `.agents/skills/` lebih hemat token karena memberikan konteks preskriptif, bukan instruksi panjang dari agent</rule>
  <rule>Jangan panggil skill yang tidak ada di daftar `.agents/skills/` — cek dulu dengan `ls .agents/skills/`</rule>
</skill-protocol>

## GOTCHAS KRITIS (YANG SERING TERLEWAT)

<gotchas>
  <item>Role DB enum uppercase ("SISWA", "GURU", "OWNER") -> session role lowercase ("siswa", "guru", "owner") via roleToSessionRole() di src/lib/session.ts</item>
  <item>Build OOM: npm run build sudah pakai NODE_OPTIONS=--max-old-space-size=4096 — jangan ubah</item>
  <item>Auth session cookie: session (httpOnly, secure, sameSite=lax/strict) — middleware verifikasi JWT, set x-user-* headers</item>
  <item>Portal intent: /masuk?portal=guru vs /masuk?portal=siswa — middleware guard beda prefix route</item>
  <item>KKM threshold hardcoded 70 — tidak ada kolom KKM di schema</item>
  <item>Konten legacy (src/data/materi.ts dkk) SUDAH DIHAPUS per 9 Juli 2026 — kalau ada agent lama menyarankan pakai file itu, itu instruksi usang, abaikan</item>
  <item>Keystatic FROZEN & reader dihapus: jangan buat fitur baru lewat content/* atau bikin ulang src/lib/cms.ts — semua konten baru DB-driven</item>
  <item>File upload = untrusted: jangan oper file mentah ke subsistem lain tanpa validasi/sanitasi</item>
  <item>Semua hasil AI wajib status draft sampai di-approve guru</item>
  <item>DATABASE_URL Supabase mengandung password dengan karakter spesial (!@#$) — HARUS di-encodeURIComponent() sebelum dipasang di connection string, kalau tidak parser URL Node pg akan error "Invalid URL" atau "SASL: client password must be a string"</item>
  <item>Migrasi Drizzle (src/lib/db/migrations/*.sql) TIDAK auto-apply ke Supabase — harus dijalankan manual (drizzle-kit push butuh TTY interaktif, atau eksekusi SQL langsung via node pg Pool). Cek dulu dengan query information_schema.columns sebelum asumsi migrasi sudah jalan.</item>
  <item>JANGAN set env var lewat echo "$value" | vercel env add KEY production di shell kalau value mengandung $, backtick, atau karakter shell-sensitive lain — akan ke-interpolasi jadi salah/kosong. Tulis value ke file dulu dengan Node (fs.writeFileSync), baru pipe file itu, atau pakai REST API Vercel langsung dengan JSON payload.</item>
  <item>Vercel API GET /v9/projects/{id}/env TIDAK mengembalikan plaintext value untuk env bertipe sensitive/encrypted (selalu tampil string terenkripsi/kosong) — itu normal, bukan tanda env-nya kosong. Verifikasi env benar-benar terpasang lewat efek nyatanya (redeploy + curl /api/health atau endpoint terkait), bukan dari isi response API.</item>
  <item>Production branch Vercel untuk project ini = main (bukan master). Kalau develop di branch lain, harus di-merge ke main supaya ter-deploy ke akalcenter.my.id.</item>
  <item>INSIDEN 11 JULI 2026: File "AKAL CENTER Environment.md" berisi 12 credential asli (DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, ENCRYPTION_SECRET, GOOGLE_CLIENT_SECRET, IMAGEKIT_PRIVATE_KEY, RESEND_API_KEY, SMTP_PASSWORD, REDIS_URL, NARAROUTER_API_KEY, dll) ter-commit ke repo publik. Sudah dibersihkan dari history (git filter-branch 343 commit) + key di-rotate. JANGAN PERNAH buat file dokumentasi environment dengan nilai asli lagi — gunakan .env.example dengan placeholder.</item>
</gotchas>

## CARA BERPIKIR AGENT

<execution-style>
  <item>Jangan berpikir seperti sedang menambah halaman kecil ke website lama</item>
  <item>Berpikir seperti sedang membentuk platform baru di atas fondasi lama</item>
  <item>Prioritaskan hal yang menghilangkan kekacauan pipeline dan auth dulu</item>
  <item>Yang ringan dan kosmetik boleh dikerjakan belakangan oleh agent lain</item>
  <item>Kalau harus memilih, pilih perbaikan yang memperjelas arsitektur dan peran user</item>
  <item>Jangan kerja seperti "asal bisa lanjut" — kerja seperti tech lead yang memilih keputusan paling benar, paling tahan lama, dan paling sulit disalahpahami oleh agent berikutnya</item>
  <item>Kalau menemukan pendekatan yang technically works tapi terasa rapuh, anggap itu sinyal untuk cari solusi yang lebih baik sebelum lanjut</item>
  <item>Root cause dulu, baru fix — kasus nyata 9 Juli 2026: build gagal karena NODE_ENV salah, health check "degraded" karena password URL tidak di-encode, register gagal karena migrasi DB belum jalan. Semua ditemukan lewat investigasi bertahap (baca log asli, tes lokal dengan kondisi sama seperti production), bukan tebak-tebakan.</item>
</execution-style>
