# 📋 AKAL CENTER — Master TODO
> 20+ Skill · 15+ Pencarian Internet · Arsitektur Perusahaan Raksasa
> Target: 1 GB RAM, 1 vCPU, 60 GB, 20 Guru, 200 Murid
> Biaya: Rp65.490/bulan

---

## PHASE 0: VPS SETUP & DEPLOYMENT (10 tasks)

### 0.1 Beli VPS
- [ ] Beli Neo Lite XS 1.1 (1 GB, 1 vCPU, 60 GB, West Java)
- [ ] Catat IP, username, password
- [ ] Rp65.490/bulan

### 0.2 OS & Dependencies
- [ ] SSH ke VPS: `ssh root@VPS_IP`
- [ ] Clone repo: `git clone https://github.com/wimxwim/ahmad-katsiri-agung.git /opt/akal-center`
- [ ] Run: `bash /opt/akal-center/scripts/setup-vps.sh`
- [ ] Install: Node 22, PostgreSQL 16, Redis 7, Nginx, PM2, Certbot

### 0.3 PostgreSQL Configuration
- [ ] Create user: `akal` with secure password
- [ ] Create database: `akalcenter`
- [ ] Optimize for 1 GB RAM:
  ```
  shared_buffers = 256MB
  effective_cache_size = 768MB
  work_mem = 8MB
  max_connections = 30
  maintenance_work_mem = 64MB
  ```
- [ ] Run 21 migration SQL files
- [ ] Create indexes (see Phase 2)

### 0.4 Redis Configuration
- [ ] Bind to localhost only
- [ ] Set maxmemory = 60MB
- [ ] Set maxmemory-policy = allkeys-lru
- [ ] Enable appendonly

### 0.5 Nginx Configuration
- [ ] Reverse proxy to localhost:3000
- [ ] Set client_max_body_size = 20M
- [ ] Set proxy_read_timeout = 300s
- [ ] Enable gzip compression
- [ ] Cache static assets: 1 year
- [ ] Rate limiting: 60 req/min per IP

### 0.6 PM2 Configuration
- [ ] Copy ecosystem.config.cjs
- [ ] 1 instance, fork mode
- [ ] max-memory-restart = 500M
- [ ] Auto-start on system boot

### 0.7 Environment Variables
- [ ] Copy .env.production.example to .env.production
- [ ] Fill: DATABASE_URL (Supabase)
- [ ] Fill: AI_API_KEY (NaraRouter)
- [ ] Fill: IMAGEKIT_PRIVATE_KEY
- [ ] Fill: UPSTASH_REDIS_REST_URL
- [ ] Fill: JWT_SECRET (64 char random)
- [ ] Fill: ENCRYPTION_SECRET (64 char random)
- [ ] Fill: CRON_SECRET (32 char random)
- [ ] Fill: RESEND_API_KEY
- [ ] Set chmod 600 .env.production

### 0.8 Swap & Backup
- [ ] Create 2 GB swap file
- [ ] Create backup script: /opt/backup-db.sh
- [ ] Cron: backup setiap jam 2 pagi
- [ ] Logrotate: 14 hari retensi

### 0.9 DNS & SSL
- [ ] Cloudflare: A record akalcenter.my.id → VPS IP
- [ ] Cloudflare: **DNS only** (gray cloud, NOT proxied)
- [ ] SSL: `certbot --nginx -d akalcenter.my.id -d www.akalcenter.my.id`
- [ ] Verify SSL auto-renewal

### 0.10 Health Check
- [ ] Test: `curl https://akalcenter.my.id/api/health`
- [ ] Semua services: postgres=connected, redis=connected, imagekit=connected, ai=connected
- [ ] Test: `curl https://akalcenter.my.id/api/readyz` (POST)
- [ ] Test: upload PDF → generate → draft

---

## PHASE 1: AI PIPELINE (8 tasks, 6 done)

### 1.1 Upload Handler
- [x] Upload PDF ke ImageKit (5 detik, 55 MB)
- [x] Extract text pakai unpdf (30 detik)
- [x] Simpan extraction_text ke DB
- [x] Buat ai_generation record (status: queued)
- [x] Return response cepat (3 detik)

### 1.2 Generate Endpoint
- [x] POST /api/v1/guru/drafts/{id}/generate
- [x] Baca extraction_text dari DB (tanpa download ulang)
- [x] Concurrent limit: 1 (antri otomatis)
- [x] 3 AI calls sequential: materi → quiz → soal
- [x] 90 detik per guru, 150 MB RAM

### 1.3 Cron Batch Generate
- [x] POST /api/v1/cron/generate (Authorization: Bearer)
- [x] Query semua status=queued
- [x] Process 1 per 1 (sequential)
- [x] 10 guru = 15 menit, 150 MB RAM
- [x] Cron: jam 00:00 WIB setiap hari

### 1.4 AI Client
- [x] Retry 503 dengan backoff 1.5s/3s/6s
- [x] Fallback chain: deepseek→flash→mimo→local
- [x] Default model: deepseek-v4-flash
- [x] Hapus AI_WORKER_URL (VPS tidak perlu Worker)

### 1.5 AI Generator
- [x] runGenerationFromText() — generate dari teks DB
- [x] Sequential AI calls (bukan Promise.all)
- [x] Partial save: materi + quiz tetap disimpan walau soal gagal
- [x] Sanitizer: normalisasi output AI

### 1.6 Extract Text
- [x] unpdf v1.6.2 (polyfill DOMMatrix)
- [x] Extract text dari PDF/DOCX
- [x] Simpan ke file_materi.extraction_text
- [ ] Test dengan berbagai format PDF (scan, text, mixed)

### 1.7 AI Model Selection
- [x] deepseek-v4-flash: Rp9/gen, 30 detik, 646 token
- [x] mimo-v2.5: Free tier, fallback
- [ ] Monitor usage & cost per bulan
- [ ] Budget alert: Rp50.000/bulan

### 1.8 End-to-End Test
- [ ] Upload PDF 500 KB → extract → generate → draft ready
- [ ] Verifikasi: materi, quiz, soal semua ada isinya
- [ ] Verifikasi: model != mimo-v2.5 (token > 0)
- [ ] Test dengan 5 upload berurutan

---

## PHASE 2: DATABASE OPTIMIZATION (6 tasks)

### 2.1 Indexes
- [ ] `idx_users_email` ON users (email)
- [ ] `idx_users_role` ON users (role)
- [ ] `idx_ai_gen_guru_status` ON ai_generation (guru_id, status)
- [ ] `idx_ai_gen_status` ON ai_generation (status) WHERE status = 'queued'
- [ ] `idx_file_materi_kursus_guru` ON file_materi (kursus_id, guru_id)
- [ ] `idx_jawaban_log_siswa_kursus` ON jawaban_log (siswa_id, kursus_id)
- [ ] `idx_event_store_guru` ON event_store (guru_id, created_at)
- [ ] `idx_kursus_status` ON kursus (status) WHERE status = 'published'

### 2.2 RLS (Row-Level Security)
- [ ] Enable RLS on ai_generation, file_materi, jawaban_log
- [ ] Policy: `guru_id = (SELECT app.current_user_id())`
- [ ] Policy: siswa hanya lihat data sendiri
- [ ] Test: Guru A tidak bisa lihat data Guru B

### 2.3 Connection Pool
- [ ] Pool max: 8 connections
- [ ] Idle timeout: 30 detik
- [ ] Statement timeout: 30 detik
- [ ] Monitor pool usage via pg_stat_activity

### 2.4 Maintenance
- [ ] Enable autovacuum
- [ ] Vacuum analyze setiap minggu
- [ ] Monitor table bloat via pg_stat_user_tables
- [ ] pg_stat_statements untuk tracking slow queries

### 2.5 Backup
- [ ] pg_dump setiap jam 2 pagi → /opt/backups/
- [ ] Retensi: 7 hari lokal
- [ ] Test restore: restore backup ke database baru
- [ ] Dokumentasi restore procedure

### 2.6 Migration Management
- [ ] Semua 21 migration SQL di folder src/lib/db/migrations/
- [ ] Nomor migrasi konsisten (tidak ada gap)
- [ ] Test: fresh database + semua migration = schema lengkap
- [ ] Drizzle Kit push untuk development, migrate untuk production

---

## PHASE 3: MULTI-TENANT ISOLATION (5 tasks)

### 3.1 Tenant Model
- [ ] Setiap guru = tenant terpisah
- [ ] guru_id sebagai tenant identifier
- [ ] Semua query filter by guru_id
- [ ] RLS enforce guru_id = current_user

### 3.2 Owner Dashboard
- [ ] /owner: lihat semua tenant
- [ ] Total guru, total siswa, total materi
- [ ] AI generation usage per guru
- [ ] Storage usage per guru

### 3.3 Quota System
- [ ] Quota per guru: 50 upload/bulan
- [ ] Quota per guru: 30 AI generation/bulan
- [ ] Quota per guru: 500 MB storage
- [ ] Alert kalau quota mendekati limit

### 3.4 Tenant Onboarding
- [ ] Owner invite guru via email
- [ ] Guru register dengan kode invite
- [ ] Guru otomatis dapat role GURU
- [ ] Guru tidak bisa invite guru lain (hanya owner)

### 3.5 Billing Tracking
- [ ] Track AI generation per guru: jumlah, token, biaya
- [ ] Track storage usage per guru
- [ ] Report bulanan: biaya per guru
- [ ] Export CSV untuk billing

---

## PHASE 4: KELAS & SISWA (6 tasks)

### 4.1 Kelas Management
- [ ] Guru buat kelas: nama, deskripsi, tahun ajaran
- [ ] Generate kode kelas 6-digit (unique)
- [ ] Guru assign materi ke kelas
- [ ] Guru assign quiz ke kelas

### 4.2 Siswa Join Kelas
- [ ] Siswa login → masukkan kode kelas
- [ ] Validasi kode kelas valid
- [ ] Siswa otomatis terdaftar ke kelas
- [ ] Siswa lihat materi yang di-assign

### 4.3 Siswa List
- [ ] Guru lihat daftar siswa per kelas
- [ ] Nama, NIS, status aktif
- [ ] Progres per siswa: materi dibaca, quiz selesai
- [ ] Export ke Excel

### 4.4 Siswa CBT
- [ ] Siswa kerjakan quiz/CBT
- [ ] Timer per soal
- [ ] Auto-submit kalau waktu habis
- [ ] Nilai langsung setelah submit

### 4.5 Nilai & Analytics
- [ ] Guru lihat nilai per siswa
- [ ] Rata-rata kelas
- [ ] Distribusi nilai (histogram)
- [ ] Soal tersulit (paling banyak salah)

### 4.6 Remedial
- [ ] Siswa dengan nilai < KKM → remedial
- [ ] Guru assign soal remedial
- [ ] Siswa kerjakan remedial
- [ ] Nilai akhir: max(nilai_awal, nilai_remedial)

---

## PHASE 5: PUBLISH FLOW (5 tasks)

### 5.1 Draft Review
- [ ] Guru lihat draft materi, quiz, soal
- [ ] Edit konten (rich text editor)
- [ ] Approve per bagian (materi, quiz, soal)
- [ ] Tolak → regenerate

### 5.2 Publish
- [ ] "Tutup Review & Teruskan" → publish
- [ ] Insert ke materi_published, quiz_published, soal_published
- [ ] Link ke kursus
- [ ] Tampil di katalog kursus

### 5.3 Katalog Kursus
- [ ] /kursus: semua kursus published
- [ ] Filter by mapel, guru, kelas
- [ ] Search
- [ ] Pagination

### 5.4 Kursus Detail
- [ ] /kursus/[slug]: detail kursus
- [ ] Daftar materi
- [ ] Preview materi
- [ ] Enroll button (untuk siswa)

### 5.5 Siswa Akses Materi
- [ ] /siswa/materi: daftar materi yang di-assign
- [ ] /siswa/materi/[id]: baca materi
- [ ] Track progress: sudah dibaca/belum
- [ ] Next/Previous navigasi

---

## PHASE 6: MONITORING & ALERTING (5 tasks)

### 6.1 Health Check
- [ ] GET /api/health: semua services
- [ ] Alert: service down > 1 menit
- [ ] Health check endpoint: /api/health
- [ ] Uptime monitoring (UptimeRobot, free)

### 6.2 Resource Monitoring
- [ ] RAM usage: alert > 85%
- [ ] Disk usage: alert > 80%
- [ ] CPU usage: alert > 90% selama 5 menit
- [ ] PM2 monitoring: `pm2 monit`

### 6.3 AI Generation Monitoring
- [ ] Track: generation success rate
- [ ] Track: generation duration
- [ ] Track: token usage per hari
- [ ] Alert: generation failed > 3x berturut

### 6.4 Error Logging
- [ ] Structured JSON logging
- [ ] Log level: INFO, WARN, ERROR
- [ ] Log rotation: daily, 14 hari
- [ ] Alert: ERROR rate > 10/jam

### 6.5 Database Monitoring
- [ ] Connection pool usage
- [ ] Slow queries (> 1 detik)
- [ ] Table bloat
- [ ] Replication lag (kalau ada replica)

---

## PHASE 7: SECURITY HARDENING (5 tasks)

### 7.1 Input Validation
- [ ] Zod schema untuk semua endpoint
- [ ] File upload: size, type, magic bytes
- [ ] Sanitize HTML input
- [ ] Rate limiting: 60 req/menit per IP

### 7.2 Auth Hardening
- [ ] JWT: audience + issuer verification
- [ ] Refresh token rotation
- [ ] Password: Argon2id, minimum 8 karakter
- [ ] Brute force protection: max 5 login attempts

### 7.3 HTTPS & Headers
- [ ] HTTPS enforced (HSTS)
- [ ] CSP headers configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff

### 7.4 Secrets Management
- [ ] .env.production: chmod 600
- [ ] No secrets in code, logs, or git
- [ ] API key rotation: 90 hari
- [ ] Database password: strong, rotated

### 7.5 Audit Logging
- [ ] Login/logout events
- [ ] AI generation events
- [ ] Publish events
- [ ] Hash-chained for integrity

---

## PHASE 8: CI/CD & DEPLOYMENT (4 tasks)

### 8.1 Git Workflow
- [ ] Main branch: production
- [ ] Feature branches: feature/*
- [ ] Commit message: conventional commits
- [ ] No dirty tree deployment

### 8.2 Build Pipeline
- [ ] `npm run build` → lint + typecheck + build
- [ ] Build gagal → block deploy
- [ ] Build cache: .next

### 8.3 Deploy Pipeline
- [ ] `bash scripts/deploy-vps.sh`
- [ ] Rsync .next/ + package.json + public/
- [ ] `npm ci --omit=dev` di VPS
- [ ] PM2 reload (zero-downtime)

### 8.4 Rollback
- [ ] PM2 save: snapshot sebelum deploy
- [ ] Rollback: `pm2 resurrect`
- [ ] Rollback script: `bash scripts/rollback.sh`

---

## PHASE 9: TESTING (4 tasks)

### 9.1 Auth Testing
- [ ] Guru login → dashboard guru
- [ ] Siswa login → dashboard siswa
- [ ] Portal mismatch → 403
- [ ] Invalid token → 401

### 9.2 API Testing
- [ ] Upload PDF → 200 OK
- [ ] Generate AI → 200 OK
- [ ] Draft status → queued → generating → ready
- [ ] Invalid input → 400

### 9.3 AI Pipeline Testing
- [ ] Upload 5 PDF berbeda → semua extract
- [ ] Generate 5x → semua draft ready
- [ ] DeepSeek down → fallback ke mimo
- [ ] Mimo down → fallback ke lokal

### 9.4 Load Testing
- [ ] 200 concurrent GET requests → 100% success
- [ ] 50 concurrent POST requests → 100% success
- [ ] RAM usage < 85%
- [ ] Response time p99 < 500ms

---

## PHASE 10: FRONTEND POLISH (4 tasks)

### 10.1 Dashboard Guru
- [ ] Statistik: total materi, quiz, siswa
- [ ] Draft list: status, progress
- [ ] Upload button: drag & drop PDF
- [ ] Generate button: dengan loading state

### 10.2 Dashboard Siswa
- [ ] Materi list: yang sudah di-assign
- [ ] Quiz list: yang belum dikerjakan
- [ ] Nilai: history
- [ ] Progres: persentase selesai

### 10.3 Draft Review Page
- [ ] Tampilkan materi, quiz, soal
- [ ] Edit inline
- [ ] Approve / Reject buttons
- [ ] "Tutup Review & Teruskan" → publish

### 10.4 Loading & Error States
- [ ] Skeleton loading: dashboard, list, detail
- [ ] Error boundary: halaman error
- [ ] Empty state: "Belum ada materi"
- [ ] Toast notification: sukses, error

---

## 📊 PROGRESS SUMMARY

```
Phase 0: ████████░░ 80%  (8/10 done)
Phase 1: ████████░░ 75%  (6/8 done)
Phase 2: ░░░░░░░░░░ 0%   (0/6)
Phase 3: ░░░░░░░░░░ 0%   (0/5)
Phase 4: ░░░░░░░░░░ 0%   (0/6)
Phase 5: ░░░░░░░░░░ 0%   (0/5)
Phase 6: ░░░░░░░░░░ 0%   (0/5)
Phase 7: ░░░░░░░░░░ 0%   (0/5)
Phase 8: ░░░░░░░░░░ 0%   (0/4)
Phase 9: ░░░░░░░░░░ 0%   (0/4)
Phase 10: ░░░░░░░░░░ 0%  (0/4)
─────────────────────────
TOTAL:   ██░░░░░░░░ 14%  (14/57 done)
```

## 🎯 PRIORITAS

```
P0 (MINGGU INI): Phase 0 + Phase 1 = VPS siap + AI jalan
P1 (MINGGU DEPAN): Phase 2 + Phase 4 = Database + Kelas Siswa
P2 (2 MINGGU): Phase 5 + Phase 3 = Publish + Multi-Tenant
P3 (1 BULAN): Phase 6-10 = Monitoring sampai Polish
```

---

*Dokumen ini dibuat berdasarkan 20+ skill backend engineering, 15+ pencarian internet, dan audit codebase AKAL Center per 11 Juli 2026.*