# SUB-AGENT 3: Audit PRD/Strategy
**Toolcalls:** 36 · **Durasi:** 7m 49s · **Model:** GPT 5.5
**Prompt:** Lakukan audit read-only terhadap dokumen PRD di /home/ngome/agensi/proyek/akal-center/prd dan ringkasan/deploy docs. Fokus konsistensi antar PRD vs kode nyata, roadmap, model bisnis, fitur yang missing, over-engineering, risiko VPS 2026, hal jarang dipikirkan tapi penting untuk platform e-learning Indonesia. Jangan edit file. Return diagnosis, konflik dokumen, prioritas jalur. Thoroughness: very thorough.

---

## File yang diaudit

PRD utama:
- /home/ngome/agensi/proyek/akal-center/prd/01-ringkasan-eksekutif.md
- /home/ngome/agensi/proyek/akal-center/prd/02-audit-kondisi-saat-ini.md
- /home/ngome/agensi/proyek/akal-center/prd/03-arsitektur-target.md
- /home/ngome/agensi/proyek/akal-center/prd/04-matriks-fitur-per-role.md
- /home/ngome/agensi/proyek/akal-center/prd/05-spesifikasi-mesin-analitik.md
- /home/ngome/agensi/proyek/akal-center/prd/06-model-data.md
- /home/ngome/agensi/proyek/akal-center/prd/07-rencana-migrasi.md
- /home/ngome/agensi/proyek/akal-center/prd/08-riset-2026-rekomendasi.md
- /home/ngome/agensi/proyek/akal-center/prd/01-tech-stack-overview.md
- /home/ngome/agensi/proyek/akal-center/prd/diskusi.md

Dokumen ringkasan/deploy:
- /home/ngome/agensi/proyek/akal-center/README.md
- /home/ngome/agensi/proyek/akal-center/DEPLOY.md
- /home/ngome/agensi/proyek/akal-center/RINGKASAN_KLIEN.md
- /home/ngome/agensi/proyek/akal-center/AGENTS.md

Kode nyata sampling:
- /home/ngome/agensi/proyek/akal-center/package.json
- /home/ngome/agensi/proyek/akal-center/drizzle.config.ts
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts
- /home/ngome/agensi/proyek/akal-center/src/lib/db/index.ts
- /home/ngome/agensi/proyek/akal-center/Dockerfile
- /home/ngome/agensi/proyek/akal-center/docker-compose.prod.yml
- /home/ngome/agensi/proyek/akal-center/.env.production.example
- beberapa route aktual di /home/ngome/agensi/proyek/akal-center/src/app/api/**

---

## 1. Diagnosis utama

AKAL Center sekarang berada di kondisi transisi separuh jalan:
1. Versi live v1 sudah nyata dan cukup matang  
Ada Next.js 16, Keystatic, Google Sheets, Telegram, login gate, CSP/HSTS, Zod, sanitasi, Cloudflare Worker, dan konten PAI.
2. Dokumen PRD sudah sangat ambisius, tetapi tidak lagi sinkron satu sama lain  
PRD 01–07 banyak menulis blueprint Prisma + Neon + Event Sourcing + Hexagonal. PRD 08 mengoreksi menjadi Drizzle + PostgreSQL VPS + simplifikasi. Kode nyata sudah mengikuti sebagian PRD 08: sudah ada Drizzle, schema Drizzle, Docker, Postgres, Redis.
3. Kode nyata sudah bergerak lebih jauh daripada README/PRD lama, tetapi belum sampai ke blueprint analitik  
Di kode sudah ada:
- drizzle-orm
- pg
- src/lib/db/schema.ts
- beberapa route /api/v1/auth/*, /api/v1/kursus/*, /api/v1/enroll/*
- Dockerfile + Docker Compose production
Tetapi banyak fitur masih mock/in-memory/kerangka:
- /api/v1/kursus masih memakai mockKursus dari /src/data/mock.ts
- beberapa dashboard guru masih hardcoded "Ahmad Katsiri Agung"
- schema belum mencakup semua tabel yang dijanjikan PRD
- belum terlihat pipeline analitik BKT/IRT/Risk yang benar-benar hidup
- RLS belum aktif di migration snapshot
- belum ada worker Redis yang nyata untuk analitik
4. Risiko terbesar bukan "kurang fitur", tetapi "roadmap terlalu besar tanpa pagar fase"  
Kalau semua PRD dieksekusi mentah-mentah, project bisa terseret ke enterprise LMS sebelum value inti divalidasi. Untuk konteks single-guru/PAI Indonesia, prioritas pertama harus tetap: multi-guru sederhana, data nilai aman, dashboard guru yang membantu, bukan Event Sourcing penuh atau AI Tutor sejak awal.

---

## 2. Konflik besar antar dokumen

### 2.1 Prisma vs Drizzle
Konflik:
- /home/ngome/agensi/proyek/akal-center/prd/06-model-data.md masih menulis "Database: Neon PostgreSQL, ORM: Prisma".
- /home/ngome/agensi/proyek/akal-center/prd/07-rencana-migrasi.md masih memberi instruksi pnpm add prisma @prisma/client.
- /home/ngome/agensi/proyek/akal-center/prd/08-riset-2026-rekomendasi.md sudah mengoreksi: Prisma → Drizzle.
- Kode nyata sudah memakai Drizzle:
- /home/ngome/agensi/proyek/akal-center/package.json
- /home/ngome/agensi/proyek/akal-center/drizzle.config.ts
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts
- /home/ngome/agensi/proyek/akal-center/src/lib/db/index.ts
Diagnosis:
- PRD 08 menang dan kode sudah condong ke PRD 08.
- PRD 06 dan PRD 07 sudah berbahaya jika diberikan ke AI agent tanpa catatan, karena bisa membuat agent menginstal Prisma lagi dan menduplikasi arsitektur.
Prioritas:
- Tetapkan satu keputusan resmi: Drizzle + PostgreSQL VPS untuk production.
- PRD 06 seharusnya dijadikan ERD/logical model saja, bukan instruksi Prisma.
- PRD 07 perlu dianggap outdated untuk bagian Prisma.

### 2.2 Neon Postgres vs PostgreSQL di VPS
Konflik:
- PRD 01 menyebut target VPS self-hosted, tetapi timeline masih menulis "Neon Postgres schema".
- PRD 03 menggambar VPS dengan Postgres lokal, tetapi juga menulis Managed Cloud Layer: "Neon Postgres — Data Utama".
- PRD 06 secara eksplisit: "Database: Neon PostgreSQL".
- PRD 08 mengoreksi: "PostgreSQL di VPS, Neon untuk staging/development".
- DEPLOY sudah menulis arsitektur Postgres lokal di Docker Compose.
Diagnosis:
- Ada 3 narasi berbeda:
1. Neon sebagai data utama.
2. Postgres lokal VPS sebagai data utama.
3. Dual Postgres lokal + Neon.
Rekomendasi keputusan:
- Production: PostgreSQL lokal di VPS.
- Staging/dev optional: Neon atau Docker lokal, tapi bukan sumber kebenaran production.
- Dokumentasi harus menghindari istilah "Neon Postgres data utama" jika deploy target adalah Biznet VPS 4GB.

### 2.3 Vercel Hobby vs VPS vs Cloudflare Pages
Konflik:
- README masih menyebut hosting: Vercel Hobby.
- AGENTS juga masih menyebut hosting: Vercel Hobby + Cloudflare Worker reverse proxy.
- DEPLOY.md sudah menjadi "Deployment Guide VPS".
- PRD 03 menyebut Vercel Hobby sebagai staging/development.
- Audit global agensi memberi catatan: Vercel Hobby tidak cocok untuk situs klien komersial.
Diagnosis:
- Untuk v1 live, Vercel masih realitas.
- Untuk v2 komersial/multi-guru, Vercel Hobby harus dikeluarkan dari production plan.
- Dokumentasi sekarang membuat AI agent bingung: deploy ke Vercel atau VPS?
Rekomendasi:
- Status resmi:
- v1 legacy/live: Vercel + Cloudflare Worker.
- v2 production: VPS Biznet + Caddy + Docker + Postgres + Redis.
- Vercel: hanya staging sementara atau fallback non-komersial.

### 2.4 Event Sourcing: wajib atau ditunda?
Konflik:
- PRD 01, PRD 03, PRD 05, PRD 06, PRD 07 mendorong EventStore + hash-chain.
- PRD 08 menyatakan Event Sourcing over-engineering untuk fase 1 dan menyarankan cukup jawaban_log.
- Kode nyata src/lib/db/schema.ts belum memiliki EventStore.
- Route quiz lama /api/kuis/selesai/route.ts masih menulis ke Google Sheets, bukan EventStore/Postgres.
Diagnosis:
- PRD lama terlalu cepat memasukkan Event Sourcing.
- Untuk platform kecil/menengah, Event Sourcing penuh dapat menggandakan kompleksitas:
- versi event
- replay
- snapshot
- worker idempotency
- debug lebih sulit
- biaya mental solo developer tinggi
Rekomendasi:
- Fase 1: gunakan jawaban_log append-only + audit fields + idempotency.
- Fase 2: tambahkan audit_log sederhana untuk perubahan nilai/kursus.
- Fase 3: EventStore/hash-chain hanya untuk:
- sertifikat
- perubahan nilai manual
- consent orang tua
- transaksi pembayaran
- Jangan hash-chain setiap jawaban siswa sejak awal kecuali ada kebutuhan hukum/audit kuat.

### 2.5 Hexagonal Architecture vs Next.js App Router pragmatis
Konflik:
- PRD 03 menyarankan folder domain/, application/, infrastructure/, interfaces/.
- PRD 08 menyarankan tidak perlu hexagonal penuh; cukup App Router + lib/db, lib/analytics, lib/auth.
- Kode nyata masih mengikuti struktur Next.js standar.
Diagnosis:
- Untuk solo developer dan MVP, hexagonal penuh akan memperlambat.
- Namun pure function untuk analitik tetap perlu dipisah agar bisa dites.
Rekomendasi:
- Struktur pragmatis:
- /src/lib/db/ untuk schema + query
- /src/lib/analytics/ untuk BKT, Elo, Risk, SM-2 pure functions
- /src/lib/auth/ atau file auth yang sudah ada
- /src/app/api/v1/** untuk route
- tidak perlu interfaces/http dan repository class berlapis dulu

### 2.6 Puppeteer vs @react-pdf/renderer
Konflik:
- PRD 07 menyarankan Puppeteer untuk sertifikat.
- PRD 08 menyarankan @react-pdf/renderer.
- Diskusi panjang kadang menyarankan Puppeteer lagi.
- Kode belum punya dependensi PDF.
Diagnosis:
- VPS 4GB tidak ideal untuk Chrome/Puppeteer jika banyak generate PDF.
- Tetapi @react-pdf/renderer bisa bermasalah untuk teks Arab/RTL.
Rekomendasi:
- Sertifikat standar tanpa teks Arab panjang: @react-pdf/renderer.
- Jika sertifikat harus memuat Arab/RTL: fallback Puppeteer hanya untuk template tertentu, jalankan sebagai job antrean, bukan request langsung.

### 2.7 Xendit vs Midtrans
Konflik:
- PRD 01: QRIS Payment Integration umum.
- PRD 07: Xendit/Midtrans.
- PRD 08: Midtrans spesifik.
- AGENTS menyebut skill Midtrans dan Xendit, Midtrans prioritas.
Diagnosis:
- Untuk Indonesia, Midtrans lebih familiar dan Snap mengurangi beban PCI.
- Xendit tetap alternatif bagus, tapi jangan desain dua gateway di awal.
Rekomendasi:
- Fase awal: Midtrans saja.
- Abstraksi payment adapter boleh disiapkan ringan, tetapi jangan implementasi dua gateway sampai ada kebutuhan.

### 2.8 "Tidak perlu halaman login" vs auth gate wajib login
Konflik:
- /home/ngome/agensi/proyek/akal-center/RINGKASAN_KLIEN.md baris catatan klien: "Tidak perlu halaman login".
- README/PRD/AGENTS menyebut auth gate dan semua konten locked.
- Kode nyata memiliki /login, /masuk, /masuk-guru, src/proxy.ts, session cookie.
Diagnosis:
- Ini konflik produk penting. Kemungkinan kebutuhan berubah setelah security audit, tetapi dokumen klien belum dibersihkan.
- Jika klien membaca RINGKASAN_KLIEN, dia bisa merasa fitur login bertentangan dengan permintaan awal.
Rekomendasi:
- Tetapkan bahasa produk:
- v1 awal: klien minta tanpa login.
- setelah fitur evaluasi/siswa resmi/security: login gate diterapkan untuk perlindungan data.
- Untuk v2 multi-guru: login wajib, tetapi landing page publik tetap boleh tanpa login.

---

## 3. Konflik PRD vs kode nyata

### 3.1 PRD menyebut 18 halaman statis; kode sudah lebih luas
README/PRD lama menyebut halaman utama v1, tetapi kode nyata sudah punya banyak route tambahan:
- /dashboard-guru
- /dashboard-guru/kursus
- /dashboard-guru/kursus/[id]
- /dashboard-guru/kursus/[id]/nilai
- /register
- /register-guru
- /kursus
- /kursus/[slug]
- /refleksi
- /diskusi
- /quran
- /admin/bulk-soal
- /api/v1/auth/*
- /api/v1/kursus/*
- /api/v1/enroll/*
Artinya PRD 02 dan README bagian struktur project sudah tertinggal.

### 3.2 Schema Drizzle ada, tetapi tidak lengkap dibanding PRD
Kode nyata di /src/lib/db/schema.ts sudah memiliki:
- sekolah
- users
- kursus
- skill
- siswa_kursus
- soal
- quiz_session
- jawaban_log
- student_ability
- skill_mastery
- risk_snapshot
- remedial_recommendation
- sertifikat
- transaksi
- file_materi
- feature_flag
Tetapi dibanding PRD, masih missing/berbeda:
1. Tidak ada google_drive_auth / GoogleDriveAuth  
Padahal PRD menjadikan Google Drive per guru sebagai killer feature.
2. Tidak ada teacher_readiness_snapshot  
Padahal TRI adalah salah satu pembeda utama.
3. Tidak ada event_store  
Bagus jika memang ditunda, tetapi dokumen lama masih menganggap wajib.
4. Tidak ada model_audit_log  
Padahal PRD 05 menulis setiap perubahan formula/bobot harus dicatat.
5. Tidak ada consent status/parental consent eksplisit  
Hanya ada tanggalLahir dan parentId, belum cukup untuk compliance data anak.
6. UUID masih defaultRandom()  
Ini UUID random, bukan UUID v7/time-ordered seperti beberapa diskusi/PRD minta.
7. RLS belum aktif  
Snapshot migration menunjukkan isRLSEnabled: false.

### 3.3 Route v1 sudah ada, tetapi sebagian masih mock
/home/ngome/agensi/proyek/akal-center/src/app/api/v1/kursus/route.ts:
- GET mengembalikan mockKursus.
- POST push ke array mockKursus in-memory.
Ini bukan production-safe:
- data hilang saat process restart
- tidak multi-user
- tidak tenant-aware
- tidak auth-bound ke guru
- tidak masuk Postgres
/home/ngome/agensi/proyek/akal-center/src/app/api/v1/enroll/route.ts:
- hanya return success, tidak insert DB.
Diagnosis:
- Ada facade v2 API, tetapi belum real persistence.
Prioritas:
- Ini harus jadi pekerjaan pertama sebelum analitik/AI.

### 3.4 Quiz masih Google Sheets, bukan Postgres analytics pipeline
/home/ngome/agensi/proyek/akal-center/src/app/api/kuis/selesai/route.ts:
- validasi dan security cukup serius
- tulis ke Google Sheets RekapNilai
- kirim Telegram
- belum tulis ke jawaban_log
- belum update skill_mastery
- belum update risk/remedial
Diagnosis:
- Google Sheets masih source of truth operasional untuk nilai.
- PRD "Quiz Engine v2" belum tercapai.
Rekomendasi:
- Jangan langsung matikan Google Sheets.
- Tambahkan parallel write: Postgres utama, Sheets fallback/legacy.
- Setelah 1-2 bulan stabil, baru Sheets jadi export/cadangan.

### 3.5 Hardcoded single-guru masih ada
Ditemukan di:
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/page.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/dashboard-guru/layout.tsx
- /home/ngome/agensi/proyek/akal-center/src/app/tentang/page.tsx
- metadata di /home/ngome/agensi/proyek/akal-center/src/app/layout.tsx
Diagnosis:
- PRD benar: single-guru hardcode masih hambatan multi-guru.
- Namun untuk v1 live, fallback ke Ahmad masih boleh.
Rekomendasi:
- Ubah bertahap:
- dashboard guru: dari session user
- tentang/branding: dari tenant/site config
- SEO metadata: masih boleh default AKAL Center, bukan nama guru hardcoded untuk semua tenant

### 3.6 Security docs vs kode nyata
Kode nyata:
- masih memakai bcryptjs di /src/lib/auth-password.ts
- rate limiter masih in-memory
- cookie sameSite lax, httpOnly, secure production
- Zod ada
- CSP ada di sistem lama
- RLS belum aktif
- DB pool max 20
- compose env masih punya kredensial default akaldev
PRD/security checklist:
- Argon2id
- CSRF double submit
- account lockout
- audit trail login
- 2FA admin
- Redis rate limiter
- RLS
Diagnosis:
- Untuk v1, security di atas rata-rata.
- Untuk v2 multi-guru, security belum cukup terutama karena data anak dan multi-tenant.
Prioritas high:
1. RLS atau enforce tenant isolation di query layer.
2. Jangan expose default password DB di production docs.
3. CSRF untuk mutasi browser.
4. Audit trail login/nilai.
5. Account lockout.
6. Argon2id sebelum open registration publik.

---

## 4. Over-engineering yang perlu ditahan

### 4.1 IRT 3PL terlalu cepat
IRT 3PL butuh data besar. PRD sendiri menyebut minimal 100 jawaban per soal.
Masalah:
- Untuk satu guru dan 8 bank soal, data belum cukup.
- 3PL dengan parameter a,b,c bisa memberikan angka palsu yang terlihat ilmiah.
- Guru bisa salah percaya pada theta/IRT sebelum valid.
Rekomendasi:
- Fase awal:
- gunakan skor per skill
- BKT sederhana
- trend skor
- waktu jawab
- completion rate
- IRT baru aktif per soal setelah jumlah jawaban cukup.
- UI harus menampilkan "estimasi awal" / "data belum cukup" agar tidak overclaim.

### 4.2 TRI terlalu sensitif secara sosial
Teacher Readiness Index bisa berguna, tapi berisiko:
- guru merasa diawasi/dihakimi
- kepala sekolah bisa menyalahgunakan untuk ranking guru
- data belum cukup bisa memberi label tidak adil
Rekomendasi:
- Jangan tampilkan TRI ke admin sekolah di awal.
- Fase awal tampilkan "Saran Penguatan Mengajar" pribadi ke guru.
- Bahasa harus suportif, bukan "guru kurang siap".
- Butuh policy: siapa boleh lihat TRI?

### 4.3 Event Sourcing penuh tidak perlu untuk semua jawaban
Sudah dibahas di konflik. Ini fitur mahal secara kompleksitas. Cukup append-only jawaban_log dulu.

### 4.4 AI Tutor dan AI Grading jangan masuk sebelum data dasar rapi
AI akan menambah:
- biaya
- risiko jawaban agama/akidah yang salah
- moderasi konten
- privacy data anak
- prompt injection
- ekspektasi klien
Untuk PAI/Akidah Akhlak, AI Tutor lebih sensitif daripada matematika umum. Salah tafsir dalil/hadits bisa merusak kepercayaan.
Rekomendasi:
- Mulai AI sebagai "draft untuk guru", bukan langsung ke siswa.
- AI auto-generate soal harus selalu "guru approve".
- AI Tutor siswa hanya boleh menjawab dari konten materi terverifikasi, bukan bebas.

### 4.5 Offline exam + HMAC + Service Worker terlalu berat untuk fase awal
Koneksi Indonesia memang tidak selalu stabil, tetapi offline exam aman itu kompleks. Untuk awal:
- autosave jawaban ke localStorage/IndexedDB
- retry submit
- idempotency key
- warning koneksi
HMAC/offline sync bisa fase lanjut.

---

## 5. Risiko VPS 2026 untuk AKAL Center

Target: Biznet Gio NEO Lite 2 vCPU, 4GB RAM, 60GB SSD.

### Risiko utama

### 5.1 RAM 4GB adalah batas bawah, bukan nyaman
Komponen:
- Next.js runtime
- Postgres
- Redis
- Caddy
- Docker overhead
- build process
- OS
- worker background
PRD 03 mengalokasikan app 1500MB, worker 512MB, Postgres 400MB, Redis 150MB, Caddy 128MB, OS/Docker 500MB. Itu hanya menyisakan sekitar 746MB di atas kertas. Dalam dunia nyata:
- Next.js build bisa spike tinggi
- Postgres shared buffers/cache bisa naik
- Node heap bukan satu-satunya memori
- Docker image/layer/log bisa makan disk
- backup dump bisa spike disk dan CPU
Rekomendasi:
- Build image di luar VPS kalau bisa, VPS hanya pull/run.
- Jika build di VPS, siapkan swap 2-4GB.
- Batasi log Docker.
- Jangan jalankan Puppeteer request langsung.
- Worker analitik dimatikan dulu sampai data cukup.

### 5.2 Dockerfile Node version mismatch
PRD sering menyebut Node 20, Dockerfile memakai node:22-alpine.
File:
- /home/ngome/agensi/proyek/akal-center/Dockerfile
Diagnosis:
- Next.js 16 mungkin jalan di Node 22, tetapi docs internal belum sinkron.
- Alpine + jemalloc path harus dipastikan lewat build production; jangan hanya asumsi.
Rekomendasi:
- Tetapkan Node version resmi.
- Jika tetap Node 22, update PRD/DEPLOY.
- Jika mau konservatif, Node 20/22 harus dites build + runtime.

### 5.3 Compose production masih mengandung kredensial default
File:
- /home/ngome/agensi/proyek/akal-center/docker-compose.prod.yml
- /home/ngome/agensi/proyek/akal-center/.env.production.example
Contoh:
- POSTGRES_PASSWORD: akaldev
- DATABASE_URL=postgresql://akal:akaldev@postgres:5432/akal_center
Diagnosis:
- Mungkin hanya contoh, tapi dalam compose production ini berbahaya jika dipakai mentah.
Rekomendasi:
- Compose production harus membaca password dari .env.production.
- .env.production.example boleh placeholder, tapi jangan memberi kesan "jangan diubah" untuk password DB.
- Pastikan tidak expose port Postgres keluar host.

### 5.4 RLS belum aktif
Migration snapshot menunjukkan isRLSEnabled: false.
Risiko:
- Jika ada bug query tenant, guru A bisa lihat data guru B.
- Untuk multi-tenant, ini critical.
Rekomendasi:
- Minimal fase awal: semua query harus filter guruId/sekolahId.
- Fase sebelum public multi-guru: aktifkan RLS atau audit query isolation secara sistematis.
- Jangan klaim "RLS" di PRD sebagai sudah ada jika belum migration.

### 5.5 Backup ada, restore belum matang
DEPLOY backup masih:
pg_dump > akal_backup.sql
Belum cukup:
- belum terenkripsi
- belum offsite
- belum restore drill
- belum retention
- belum monitoring backup gagal
Rekomendasi:
- Fase wajib sebelum data siswa real:
- backup harian encrypted
- upload ke R2/Drive owner
- restore test bulanan
- dokumentasikan RPO/RTO sederhana

### 5.6 Origin bypass Cloudflare
DEPLOY menyebut:
- origin.akalcenter.my.id DNS only → VPS IP
Risiko:
- Jika origin dapat diakses langsung publik, attacker bisa bypass Cloudflare WAF/rate limit.
Rekomendasi:
- UFW allow 80/443 hanya dari Cloudflare IP.
- Atau gunakan Cloudflare Tunnel.
- Jangan hanya mengandalkan "domain origin tidak diketahui".

### 5.7 Rate limiter in-memory tidak cukup untuk multi-instance
Saat ini rate limit in-memory cocok untuk single process. Jika nanti ada beberapa app instance, limiter tidak sinkron.
Rekomendasi:
- Untuk satu container: masih boleh.
- Sebelum multi-instance/worker public: pindah rate limiter ke Redis.

---

## 6. Risiko model bisnis

### 6.1 Harga Rp99.000/bulan Guru Pro perlu validasi pasar
Fitur yang dijanjikan untuk Guru Pro terlalu banyak:
- unlimited kursus
- 500 siswa/kursus
- Google Drive
- Risk Score
- BKT
- AI Grading
- Sertifikat QR
- gamifikasi
Masalah:
- Biaya support guru bisa lebih besar daripada Rp99.000/bulan.
- AI grading 50x/bulan perlu biaya API dan moderation.
- Guru individu Indonesia sensitif harga; banyak terbiasa gratis.
Rekomendasi:
- Paket awal lebih realistis:
- Gratis: 1 kursus, 30-50 siswa, quiz dasar.
- Pro Basic: Rp49k-99k, fitur gradebook + Drive + sertifikat.
- Pro AI: lebih mahal atau add-on AI.
- Sekolah: fokus onboarding/support, bukan unlimited tanpa batas.

### 6.2 Paket Sekolah Rp2.500.000/tahun mungkin terlalu murah jika include dedicated support
Dedicated support + white-label + unlimited siswa/guru + AI bisa tidak masuk margin.
Rekomendasi:
- Bedakan:
- Sekolah Basic: Rp2,5 juta/tahun, tanpa dedicated assistant, batas guru/siswa.
- Sekolah Pro: harga lebih tinggi, SLA/support.
- Setup fee white-label/domain/migrasi data.

### 6.3 "Siswa tidak bayar" perlu ditegaskan
PRD/diskusi menyebut siswa tidak bayar kecuali kursus berbayar. Model ini perlu dikunci:
- Apakah guru menjual kursus ke siswa?
- Atau sekolah/guru membayar SaaS?
- Jika guru menjual kursus, perlu revenue split, payout, pajak, refund, dispute.
Rekomendasi:
- Fase awal: SaaS ke guru/sekolah, bukan marketplace kursus.
- Payment marketplace ditunda sampai legal/operasional siap.

---

## 7. Fitur missing yang paling penting

### Missing produk inti
1. Real DB-backed kursus API
- Saat ini masih mock.
- Ini blocker multi-guru.
2. Real DB-backed enrollment
- /api/v1/enroll belum insert DB.
3. Quiz v2 parallel write
- Google Sheets tetap jalan, tapi Postgres harus mulai mengumpulkan jawaban_log.
4. Skill tagging dari soal
- Tanpa tagging skill, BKT/remedial tidak punya akar masalah.
5. Dashboard guru berbasis data nyata
- Sekarang sebagian dashboard guru masih mock/hardcoded.
6. Google Drive auth per guru
- Schema belum ada.
- Ini killer feature tapi belum terimplementasi.
7. TeacherReadinessSnapshot
- Schema belum ada.
8. Consent orang tua/data anak
- Belum cukup untuk konteks SMP/MTs.
9. Audit trail perubahan nilai
- Sangat penting di sekolah.
10. Export data siswa/guru
- UU PDP dan trust.

---

## 8. Hal jarang dipikirkan tapi penting untuk e-learning Indonesia

### 8.1 Data anak dan izin orang tua
Target SMP/MTs berarti banyak user di bawah umur.
Wajib dipikirkan:
- persetujuan orang tua/wali
- minimisasi data
- jangan kumpulkan NIK jika tidak perlu
- tanggal lahir cukup untuk verifikasi, tapi tetap data pribadi
- mekanisme hapus/anonimisasi
- siapa yang boleh lihat nilai dan risk status
Rekomendasi:
- Jangan minta NIK.
- Gunakan data minimal: nama, kelas, tanggal lahir/ID internal sekolah.
- Risk status anak jangan dibuka publik/leaderboard.

### 8.2 "Risk Score" bisa melabeli anak
Jika siswa diberi label "kritis/berisiko", dampaknya psikologis.
Rekomendasi UX:
- Untuk guru: "Butuh perhatian", bukan "gagal".
- Untuk orang tua: "Perlu didampingi minggu ini".
- Untuk siswa: "Ayo ulangi bagian ini", bukan "kamu lemah".

### 8.3 AI untuk PAI/Akidah Akhlak harus sangat hati-hati
Risiko:
- hallucination dalil
- salah sumber hadits
- tafsir sensitif
- jawaban agama yang tidak sesuai madzhab/konteks sekolah
Rekomendasi:
- AI hanya menjawab dari materi terverifikasi.
- Setiap jawaban AI mencantumkan "berdasarkan materi guru".
- AI tidak memberi fatwa.
- Untuk soal/essay: guru approve wajib.

### 8.4 Internet dan perangkat siswa
Banyak siswa akan pakai:
- HP Android murah
- kuota terbatas
- sinyal tidak stabil
- layar kecil
Rekomendasi:
- PDF harus dikompres.
- Video YouTube jangan autoplay.
- Quiz autosave.
- UI harus nyaman satu tangan.
- Jangan dashboard siswa terlalu berat chart/animasi.

### 8.5 Tahun ajaran Indonesia
Platform perlu entitas:
- Tahun ajaran
- Semester
- Kelas rombel
- Mapel
- CP/TP/ATP Kurikulum Merdeka
- remedial per semester
- arsip kelas lama
Schema sekarang belum eksplisit punya tahunAjaran, semester, kelas/rombel.
Ini penting sebelum multi-sekolah.

### 8.6 Operasional guru lebih penting daripada fitur canggih
Guru sering butuh:
- import siswa dari Excel
- cetak rekap
- download nilai
- edit nilai manual
- lupa password siswa
- pindah kelas
- siswa nama dobel
- absen/nomor induk
- WhatsApp broadcast
Ini kurang dominan di PRD yang terlalu fokus analitik.

### 8.7 Compliance PSE/UU PDP
Jika menjadi platform komersial nasional:
- perlu Kebijakan Privasi
- Syarat Layanan
- persetujuan pemrosesan data
- kontak pengendali data
- mekanisme permintaan hapus data
- jika skala besar, pertimbangkan PSE Kominfo

### 8.8 Domain .my.id / .id
Ada lesson learned global: domain .my.id bisa clientHold jika verifikasi PANDI tidak beres.
Untuk platform pendidikan, downtime domain sangat merusak trust.
Rekomendasi:
- Pastikan status domain OK.
- Monitoring expiry.
- Backup domain/subdomain.
- Cloudflare alert.

---

## 9. Prioritas jalur yang disarankan

Jalur yang sebaiknya dipilih: "V2 Pragmatic Data Foundation"
Bukan "Enterprise LMS full stack" dan bukan "AI psikometri penuh".
Tujuan 4-8 minggu:
- multi-guru dasar
- database benar
- nilai aman
- dashboard guru real
- Google Sheets tetap fallback
- belum mengejar AI/IRT penuh

### Prioritas P0 — Stop kebingungan dokumen
1. Tetapkan keputusan resmi:
- Drizzle, bukan Prisma.
- PostgreSQL VPS untuk production.
- Vercel hanya legacy/staging.
- Event Sourcing ditunda.
- Midtrans sebagai payment pertama.
- PDF: @react-pdf/renderer default.
2. Tandai dokumen outdated:
- /prd/06-model-data.md bagian Prisma
- /prd/07-rencana-migrasi.md bagian Prisma/Event Sourcing fase awal
- /prd/01-tech-stack-overview.md karena isinya bukan PRD bersih, lebih seperti draft prompt
- /prd/diskusi.md karena berisi dump percakapan sangat panjang, campur instruksi, klaim, dan rencana
3. Jadikan /prd/08-riset-2026-rekomendasi.md sebagai koreksi resmi atas PRD 01-07.

### Prioritas P1 — Data foundation nyata
1. Ganti /api/v1/kursus dari mock ke Drizzle DB.
2. Ganti /api/v1/enroll dari fake success ke insert siswa_kursus.
3. Buat query tenant-aware berdasarkan session user.
4. Tambahkan teacher_readiness_snapshot jika TRI masih roadmap.
5. Tambahkan google_drive_auth jika Google Drive tetap killer feature.
6. Tambahkan tahun_ajaran, semester, dan kelas/rombel atau minimal desainnya sebelum data real banyak masuk.
7. Pastikan migration RLS/tenant isolation plan jelas.

### Prioritas P2 — Quiz v2 tanpa mematikan v1
1. Tetap pertahankan Google Sheets route lama.
2. Tambahkan Postgres write ke jawaban_log.
3. Tambahkan mapping soal → skill.
4. Buat gradebook dari Postgres.
5. Tambahkan idempotency untuk submit quiz.
6. Tambahkan export nilai CSV/XLSX untuk guru.

### Prioritas P3 — Dashboard guru yang langsung bernilai
Bangun yang guru butuh dulu:
1. Daftar siswa.
2. Rekap nilai per bab/quiz.
3. Siswa belum mengerjakan.
4. Siswa nilai turun.
5. Materi paling sering salah.
6. Saran remedial rule-based.
Ini lebih penting daripada IRT 3PL awal.

### Prioritas P4 — Analytics sederhana dulu
Urutan sehat:
1. Completion rate.
2. Average score per skill.
3. Trend skor 3 quiz terakhir.
4. Waktu jawab tidak normal.
5. BKT sederhana setelah skill tagging stabil.
6. Risk Score v1 rule-based.
7. IRT/Elo setelah data cukup.

### Prioritas P5 — VPS hardening minimum sebelum production data anak
1. Ganti password default DB.
2. Compose baca secret dari env, bukan hardcode.
3. UFW hanya Cloudflare IP untuk 80/443.
4. Docker log rotation.
5. Backup encrypted offsite.
6. Restore test.
7. Monitoring /api/health + DB + Redis.
8. CSRF untuk mutasi.
9. Audit login dan perubahan nilai.
10. Git secret scan.

### Prioritas P6 — Google Drive per guru
Ini fitur bagus, tetapi jangan sebelum data foundation.
MVP Drive:
1. Guru connect Google Drive.
2. Simpan refresh token encrypted.
3. Upload file ke folder "AKAL Center".
4. Simpan metadata di file_materi.
5. Jika Drive gagal, fallback local/beri pesan jelas.
6. Jangan upload video besar ke VPS.

### Prioritas P7 — Monetisasi
Sebelum payment gateway:
1. Validasi willingness-to-pay ke 5-10 guru.
2. Tentukan model: SaaS guru/sekolah, bukan marketplace.
3. Buat plan limits di DB.
4. Baru integrasi Midtrans.
5. Jangan aktifkan "jual kursus" sampai refund/dispute/payout jelas.

---

## 10. Keputusan yang sebaiknya dicatat sebagai ADR

Saya sarankan minimal ADR berikut:
1. ADR-001: Drizzle over Prisma
- Alasan: kode sudah Drizzle, lebih ringan di VPS 4GB.
2. ADR-002: PostgreSQL VPS as production source of truth
- Neon hanya staging/dev optional.
3. ADR-003: Keystatic retained for static content
- Konten lama tidak dimigrasi total ke DB.
4. ADR-004: Google Sheets parallel write during migration
- Zero downtime untuk nilai lama.
5. ADR-005: Event Sourcing deferred
- Append-only jawaban_log dulu.
6. ADR-006: AI features require teacher approval
- Khusus PAI/Akidah Akhlak.
7. ADR-007: Data anak minimization
- Tidak kumpulkan NIK, consent orang tua untuk underage.
8. ADR-008: Vercel legacy/staging only
- Production v2 di VPS/Cloudflare.

---

## 11. Ringkasan konflik paling berbahaya

Konflik
Prisma docs vs Drizzle code
Neon vs Postgres VPS
Event Sourcing wajib vs ditunda
Mock API v1 dianggap production
RINGKASAN_KLIEN "tidak perlu login" vs auth gate
RLS diklaim tapi belum aktif
Google Drive killer feature tapi schema auth belum ada
TRI/AI/IRT dijanjikan terlalu awal
VPS 4GB + full stack + Puppeteer/worker
Payment marketplace terlalu cepat

---

## 12. Rekomendasi akhir

Jalur utama:
Bangun V2 Pragmatic Data Foundation dulu: Drizzle + Postgres VPS + auth role + kursus DB + enrollment DB + quiz parallel write + dashboard guru berbasis data nyata.

Tunda dulu:
Event Sourcing penuh, IRT 3PL, TRI untuk admin sekolah, AI Tutor siswa, marketplace kursus, offline HMAC exam, hexagonal architecture penuh.

Kenapa:
AKAL Center sudah punya MVP live yang bernilai. Risiko terbesar sekarang adalah membongkar terlalu besar dan kehilangan stabilitas. Yang paling menghasilkan value untuk guru Indonesia bukan "arsitektur enterprise", tetapi: data siswa aman, nilai rapi, remedial jelas, dashboard mudah dibaca, dan file tetap milik guru di Google Drive.

Urutan prioritas praktis:
1. Bersihkan keputusan dokumen: Drizzle/Postgres VPS/Event Sourcing ditunda.
2. Ubah API mock ke DB nyata.
3. Tambahkan quiz parallel write ke Postgres.
4. Bangun gradebook dan dashboard guru real.
5. Tambahkan skill tagging + BKT sederhana.
6. Tambahkan Google Drive per guru.
7. Hardening VPS + backup restore.
8. Baru monetisasi dan AI.

---

> *Dokumen ini adalah salinan verbatim dari output sub-agent GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli.*
