# AGENTS.md — AKAL Center (Single Source of Truth untuk AI Coding Agent)

<!--
  FILE INI SUDAH DI-UPGRADE untuk kondisi project terbaru.
  Fokus baru: platform multi-guru berbasis Vercel + Supabase + ImageKit,
  bukan lagi website single-guru lama.
-->

## IDENTITAS PROJECT

<project>
  <name>AKAL Center</name>
  <tagline>Platform Guru-Siswa + AI Document Generator</tagline>
  <description>
    Platform pembelajaran yang sedang dirombak total dari website PAI single-guru
    menjadi platform multi-guru dengan alur yang lebih jelas untuk guru, siswa,
    dan sekolah. Prioritas utama saat ini adalah: auth yang rapi, landing page baru,
    dashboard guru/siswa baru, upload dokumen, dan AI generator dari PDF/DOCX ke
    materi, quiz, dan soal.
  </description>
  <domain>https://akalcenter.my.id</domain>
  <repo>https://github.com/wimxwim/ahmad-katsiri-agung</repo>
  <status>REBUILD ACTIVE — live lama boleh diganti</status>
  <klien>Ahmad Katsiri Agung, S.Pd. (WA: 0851-5879-5502)</klien>
</project>

## KEPUTUSAN STRATEGIS YANG SUDAH TERKUNCI

<locked-decisions>
  <decision id="D-001">ORM final = Drizzle</decision>
  <decision id="D-002">Fase sekarang = Vercel + Supabase + ImageKit</decision>
  <decision id="D-003">VPS ditunda sampai user, siswa, dan guru sudah banyak</decision>
  <decision id="D-004">Keystatic dibekukan untuk FITUR BARU</decision>
  <decision id="D-005">Konten lama Keystatic tetap dibaca sebagai legacy/read-only selama transisi</decision>
  <decision id="D-006">Payment online ditunda; sementara CTA ke WhatsApp manual</decision>
  <decision id="D-007">AI prioritas utama = generator PDF/DOCX → materi + quiz + soal</decision>
  <decision id="D-008">Hasil AI wajib draft dulu, tidak boleh auto-publish</decision>
  <decision id="D-009">Auth harus memisahkan intent guru vs siswa secara tegas</decision>
  <decision id="D-010">Live lama tidak wajib dipertahankan UX-nya; boleh dirombak total</decision>
</locked-decisions>

## STACK TEKNIS RESMI SAAT INI

<stack>
  <framework>Next.js 16.2.7 (App Router)</framework>
  <language>TypeScript strict</language>
  <css>Tailwind CSS v4</css>
  <animation>motion/react</animation>
  <icons>lucide-react</icons>
  <fonts>Bricolage Grotesque, Inter, Amiri, JetBrains Mono</fonts>
  <hosting>Vercel (fase sekarang)</hosting>
  <database>Supabase Postgres (Singapore)</database>
  <orm>Drizzle ORM</orm>
  <storage>ImageKit untuk PDF, foto, dan media</storage>
  <auth>JWT app-level + Google OAuth/Supabase integration</auth>
  <validation>zod</validation>
  <legacy-cms>Keystatic (dibekukan untuk fitur baru)</legacy-cms>
  <legacy-data>Google Sheets (bridge/transisi, jangan dihapus gegabah)</legacy-data>
  <notifications>Telegram legacy + email/Resend nanti</notifications>
  <package-manager>npm</package-manager>
</stack>

## STATUS IMPLEMENTASI TERBARU

<implementation-status>
  <done>
    <item>Landing page publik sudah mulai dirombak ke narasi platform baru</item>
    <item>Intent login guru vs siswa sudah mulai dipisahkan di backend dan frontend</item>
    <item>/masuk-guru sekarang diarahkan ke /masuk?portal=guru</item>
    <item>/daftar sudah dibuat sebagai entry onboarding baru</item>
    <item>Build sudah lolos kembali setelah heap Node build dinaikkan</item>
  </done>
  <in-progress>
    <item>Rombak total auth flow, dashboard baru, dan workspace multi-guru</item>
    <item>Freeze Keystatic untuk fitur baru dan migrasi bertahap ke DB-driven content</item>
    <item>Storage abstraction ke ImageKit</item>
    <item>AI document pipeline</item>
  </in-progress>
  <not-done>
    <item>Google OAuth end-to-end final</item>
    <item>Register guru final</item>
    <item>Dashboard owner/admin sekolah/orang tua</item>
    <item>AI generator dokumen hidup</item>
    <item>Cutover penuh dari legacy Google Sheets</item>
  </not-done>
</implementation-status>

## PRIORITAS PENGERJAAN (URUTAN WAJIB)

<priority-order>
  <p0>
    <item>Auth architecture final (guru/siswa tidak boleh campur)</item>
    <item>Landing page publik baru</item>
    <item>Register/login flow baru</item>
    <item>Role-based redirect & route protection</item>
    <item>Freeze Keystatic untuk fitur baru</item>
  </p0>
  <p1>
    <item>Workspace guru multi-tenant</item>
    <item>Dashboard siswa baru</item>
    <item>ImageKit upload pipeline</item>
    <item>Bridge konten lama -> konten baru</item>
  </p1>
  <p2>
    <item>AI document generator</item>
    <item>Analitik dasar guru</item>
    <item>Remedial recommendation awal</item>
  </p2>
  <p3>
    <item>Payment online</item>
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
  <rule priority="HIGH">Semua type/interface explicit, jangan pakai any</rule>
  <rule priority="HIGH">Gunakan cn() dari src/lib/utils.ts untuk className kondisional</rule>
  <rule priority="HIGH">Semua desain tetap mobile-first: px-3 sm:px-5 lg:px-8</rule>
  <rule priority="HIGH">Semua route auth harus memisahkan intent guru vs siswa dengan jelas</rule>
  <rule priority="HIGH">JANGAN izinkan akun siswa masuk dari portal guru tanpa error eksplisit</rule>
  <rule priority="HIGH">JANGAN izinkan akun guru masuk dari portal siswa tanpa error eksplisit</rule>
  <rule priority="HIGH">JANGAN buat fitur baru lewat Keystatic/content/*</rule>
  <rule priority="HIGH">Semua fitur baru yang melibatkan materi/quiz/soal harus DB-driven</rule>
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
  <rule priority="MEDIUM">Ikuti naming convention file tetangga kecuali memang sedang membuat arsitektur baru yang lebih rapi</rule>
  <rule priority="MEDIUM">Refactor besar boleh dilakukan jika memang menghapus alur legacy yang kacau, asalkan build tetap hijau</rule>
</rules>

## PROTOKOL SAAT MENEMUKAN ERROR BERULANG

<error-recovery-protocol>
  <step>1. Baca pesan error kata per kata dan identifikasi file, symbol, dan library yang terlibat.</step>
  <step>2. Cek apakah masalahnya berasal dari asumsi agent, API library yang berubah, atau schema project yang belum sinkron.</step>
  <step>3. Jika 1-2 patch pertama gagal, JANGAN lanjut tebak-tebakan — buka file sumber yang relevan dan baca export/typing/library docs resmi.</step>
  <step>4. Jika sudah 3x gagal, wajib ganti mode dari "patch" ke "root-cause analysis".</step>
  <step>5. Kalau docs resmi tersedia, utamakan docs resmi 2026. Jangan ambil solusi internal-path, workaround rapuh, atau hack sementara kalau ada API publik yang benar.</step>
  <step>6. Setelah fix, verifikasi dengan build dan cek apakah solusi itu benar-benar cocok dengan desain sistem jangka menengah.</step>
</error-recovery-protocol>

## STANDAR KUALITAS SOLUSI

<solution-quality-bar>
  <rule>Solusi terbaik = bukan yang paling cepat lolos build, tetapi yang paling benar secara arsitektur.</rule>
  <rule>Kalau library menyediakan API publik yang jelas, gunakan itu. Hindari mengimpor file internal package path dalam `node_modules` kecuali tidak ada opsi lain dan alasannya didokumentasikan.</rule>
  <rule>Kalau schema project belum mendukung fitur, perbaiki schema dengan benar dulu — jangan paksa route/controller menebak field yang belum ada.</rule>
  <rule>Kalau UI sudah berhasil tampil tapi alurnya masih membingungkan user, anggap tugas belum selesai.</rule>
  <rule>Untuk frontend, nilai keberhasilan bukan cuma compile, tapi juga hierarchy visual, intent UX, dan mobile-first quality.</rule>
  <rule>Untuk backend, nilai keberhasilan bukan cuma request 200, tapi juga role guard, data ownership, dan failure state yang aman.</rule>
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

## STRUKTUR BARU YANG HARUS JADI ACUAN

<target-structure>
  <public>
    <route>/</route>
    <route>/masuk</route>
    <route>/daftar</route>
    <route>/fitur</route>
    <route>/harga</route>
    <route>/tentang</route>
  </public>
  <dashboards>
    <route>/guru</route>
    <route>/guru/kursus</route>
    <route>/guru/siswa</route>
    <route>/guru/analytics</route>
    <route>/guru/uploads</route>
    <route>/siswa</route>
    <route>/siswa/materi</route>
    <route>/siswa/quiz</route>
    <route>/siswa/cbt</route>
    <route>/owner</route>
    <route>/admin-sekolah</route>
    <route>/orang-tua</route>
  </dashboards>
  <note>
    Folder dashboard lama boleh dipakai sebagai referensi, tapi jangan dianggap arsitektur final.
  </note>
</target-structure>

## LEGACY YANG MASIH BOLEH HIDUP SEMENTARA

<legacy>
  <item>src/lib/google-sheets.ts</item>
  <item>src/app/api/siswa/cek/route.ts</item>
  <item>src/app/api/kuis/selesai/route.ts</item>
  <item>src/app/api/kuis/rekap/route.ts</item>
  <item>src/lib/cms.ts</item>
  <item>src/lib/cms-data.ts</item>
  <item>src/app/api/assets/[...path]/route.ts</item>
  <rule>Legacy ini tidak boleh dijadikan dasar fitur baru. Hanya bridge selama transisi.</rule>
</legacy>

## AUTH PRINCIPLES

<auth-principles>
  <principle>Auth flow harus tunggal, tegas, dan deterministik</principle>
  <principle>/masuk dan /daftar adalah entry utama publik</principle>
  <principle>/masuk-guru hanya alias/redirect, bukan flow auth berbeda</principle>
  <principle>Role sumber kebenaran berasal dari DB/session, bukan dari URL halaman semata</principle>
  <principle>Intent dari portal dipakai untuk validasi UX dan guard pesan error</principle>
  <principle>Jika role tidak cocok dengan portal, tampilkan error eksplisit</principle>
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
  <file path="prd/TODO-V2-MULTI-GURU.md">todo implementasi aktif</file>
</required-reading>

## TUGAS YANG SUDAH SELESAI / JANGAN DIULANG

<done-tasks>
  <item>Fondasi pemisahan intent login guru vs siswa sudah mulai ditanam</item>
  <item>/daftar sudah dibuat</item>
  <item>Landing page publik sudah mulai diarahkan ke platform baru</item>
  <item>Build OOM sudah diperbaiki lewat NODE_OPTIONS di script build</item>
  <item>User sudah mengonfirmasi TODO 1-3 sudah dikerjakan</item>
</done-tasks>

## TUGAS KRITIKAL BERIKUTNYA

<next-critical>
  <task priority="P0">Finalisasi auth architecture</task>
  <task priority="P0">Register guru + siswa yang benar</task>
  <task priority="P0">Route dashboard baru (/guru, /siswa, dst)</task>
  <task priority="P0">Freeze Keystatic untuk fitur baru</task>
  <task priority="P1">Implementasi ImageKit adapter nyata</task>
  <task priority="P1">AI document upload + extraction + draft generation</task>
</next-critical>

## BUILD / VERIFICATION RULE

<verification>
  <rule>Setelah perubahan berarti, jalankan `npm run build`</rule>
  <rule>JANGAN klaim selesai kalau build masih merah</rule>
  <rule>Kalau build gagal, selesaikan error kritikal dulu sebelum lanjut UI kosmetik</rule>
  <rule>Jika ada perubahan auth/routing, uji alur guru vs siswa secara eksplisit</rule>
</verification>

## CARA BERPIKIR AGENT

<execution-style>
  <item>Jangan berpikir seperti sedang menambah halaman kecil ke website lama</item>
  <item>Berpikir seperti sedang membentuk platform baru di atas fondasi lama</item>
  <item>Prioritaskan hal yang menghilangkan kekacauan pipeline dan auth dulu</item>
  <item>Yang ringan dan kosmetik boleh dikerjakan belakangan oleh agent lain</item>
  <item>Kalau harus memilih, pilih perbaikan yang memperjelas arsitektur dan peran user</item>
  <item>Jangan kerja seperti "asal bisa lanjut" — kerja seperti tech lead yang memilih keputusan paling benar, paling tahan lama, dan paling sulit disalahpahami oleh agent berikutnya</item>
  <item>Kalau menemukan pendekatan yang technically works tapi terasa rapuh, anggap itu sinyal untuk cari solusi yang lebih baik sebelum lanjut</item>
</execution-style>
