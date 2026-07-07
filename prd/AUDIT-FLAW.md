# 🔍 AUDIT KECACATAN RANCANGAN — AKAL Center
**Tanggal:** 6 Juli 2026  
**Lingkup:** Full Stack (Live Code + PRD V2)  
**Peran:** Security + Architecture + Code Reviewer  

---

## 🔴 CRITICAL — HARUS DIPERBAIKI

### C-1: Origin Check Bisa Dilewati (OAuth Bypass)
**Lokasi:** `src/app/api/kuis/selesai/route.ts:19-23`, `rekap/route.ts:14-18`
```ts
const originOk = allowedOrigins.some((o) => origin.startsWith(o));
```
✅ `akalcenter.my.id` → aman  
❌ `akalcenter.my.id.evil.com` → lolos!  
❌ `akalcenter.my.id?token=steal` → lolos!

`startsWith()` adalah pola terkenal berbahaya untuk origin check. Fix: parse URL dulu, baru cocokkan hostname+port exact.

### C-2: V1 API Tanpa Auth Sama Sekali
**Lokasi:** `src/app/api/v1/kursus/route.ts`, `v1/enroll/route.ts`, `v1/auth/register/route.ts`

Siapa pun bisa create kursus, enroll siswa, register — tanpa JWT, tanpa session, tanpa API key. Endpoint publik terpampang di production.

### C-3: Rate Limiter Gagal Total di Serverless
**Lokasi:** `src/lib/rate-limit.ts:6`
```ts
const store = new Map<string, RateLimitEntry>();
```
Di Vercel (serverless), setiap function instance punya Map sendiri. Rate limit hanya mencegah 1 instance — attacker cukup kirim 11 request → kena 10 instance berbeda → 110 request lolos. Saat Map penuh (line 32): `if (store.size < MAX_STORE_SIZE)` → **rate limiting mati total**, silent.

### C-4: CSP Nonce Tidak Berfungsi
**Lokasi:** `next.config.ts:5`
```ts
"script-src 'self' 'unsafe-inline' https://www.youtube.com ..."
```
Ada `'unsafe-inline'` = CSP nonce tidak berguna. Semua inline script diizinkan. CSP jadi pajangan.

### C-5: Password Guru Satu untuk Semua
**Lokasi:** `.env.example:24`, `masuk/route.ts:60`
```ts
const guruPassword = process.env.GURU_PASSWORD;
```
Satu password untuk SEMUA guru. Tidak ada per-guru password, tidak ada register, tidak ada role check. Shared credential.

### C-6: Tabel EventStore Tidak Ada di Database
PRD bilang: ada tabel `event_store` dengan hash-chain anti-tamper.  
Kenyataan: `src/lib/db/schema.ts` — **tidak ada**. Fondasi arsitektur V2 hilang.

### C-7: Vercel Hobby untuk Situs Komersial (NF-01)
ToS Vercel Hobby melarang penggunaan komersial. Site sudah live dengan klien. Risiko: akun bisa di-suspend tanpa notifikasi.

---

## 🟡 HIGH — PERLU PERHATIAN SEGERA

### H-1: Mock Data di Production
**Lokasi:** `src/app/api/v1/kursus/route.ts:59`
```ts
mockKursus.push(newKursus);
```
Data disimpan di array in-memory. Restart server = semua data hilang. Ini bukan database.

### H-2: Timing Attack + No Lockout
**Lokasi:** `masuk/route.ts:71`
```ts
if (password.length !== guruPassword.length || password !== guruPassword) {
```
Tidak ada constant-time comparison, tidak ada account lockout, tidak ada audit trail login. Brute force mungkin.

### H-3: JWT Tetap Valid Setelah Logout
Logout hanya hapus cookie. Token JWT tetap valid 8 jam. Tidak ada blacklist/revocation mechanism.

### H-4: Worker Analitik Tidak Ada
PRD Fase 5: Worker BullMQ + Redis queue + BKT/Elo/Risk Score.  
Kenyataan: Tidak ada worker process. Tidak ada Redis queue. Tidak ada BullMQ di package.json. Fungsi matematika ada tapi tidak tersambung ke mana pun.

### H-5: Rate Limiter Silent Bypass saat Penuh
Saat store ≥ 10.000 entries, semua request baru tidak di-rate limit. Silent pass.

### H-6: IV Enkripsi Bisa Static
PRD bilang random IV, tapi kode AES-256-GCM belum ditulis. Risiko: implementasi bisa lupa random IV.

---

## 🟠 MEDIUM — CATATAN PENTING

| # | Masalah | Lokasi |
|---|---------|--------|
| M-1 | Drizzle vs Prisma inconsistency — PRD pakai Prisma, kode pakai Drizzle | Semua PRD vs `schema.ts` |
| M-2 | No `event_store` migration — Migrasi 0000 cuma 19 tabel | `migrations/0000_*.sql` |
| M-3 | SameSite Lax — Harusnya `strict` | `masuk/route.ts:42` |
| M-4 | No Content-Type validation — Endpoint POST tidak cek Content-Type | Semua API routes |
| M-5 | No request body size limit — Kecuali kuis-selesai (50KB) | Beberapa API |
| M-6 | MV refresh 15 menit — Dashboard guru bisa stale 15 menit | `prd/06-model-data.md:380` |
| M-7 | HSTS preload tidak efektif — Domain belum di-submit ke preload list | `next.config.ts:41` |
| M-8 | bcrypt bukan argon2id | `package.json:19` |
| M-9 | ENCRYPTION_SECRET placeholder 0000... — Kalau tidak diganti = 0 | `.env.example:53` |
| M-10 | Google Drive rate limit tidak dibahas — 1000 siswa akses folder sama | PRD |

---

## 🟢 INFO — OBSERVASI

| # | Observasi |
|---|-----------|
| I-1 | Kualitas kode tinggi — Zod, sanitasi XSS, rate limit (meski imperfect), JWT |
| I-2 | Defense-in-depth: Worker + Next.js + Zod + sanitize, 3 layer |
| I-3 | Dokumentasi PRD sangat lengkap — 7 dokumen, analitik pakai rumus ilmiah |
| I-4 | Memory budget 81% — VPS 4GB, 81% utilized. 1 spike = OOM |
| I-5 | Single point of failure — 1 VPS, 1 database, 1 Redis |

---

## 📊 SKOR

| Dimensi | Skor |
|---------|------|
| Keamanan | 4/10 |
| Arsitektur | 5/10 |
| Kode | 7/10 |
| PRD/Dokumentasi | 9/10 |
| Production Readiness | 3/10 |

---

## 🎯 PRIORITAS FIX (JANGAN DIKERJAKAN)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| P1 | Fix origin check: ganti startsWith → exact match + URL parse | 15m | 🔴 |
| P2 | Auth gate semua V1 API endpoints | 1h | 🔴 |
| P3 | Ganti rate limiter ke Redis-based | 2-4h | 🔴 |
| P4 | CSP: hapus `'unsafe-inline'`, true nonce via middleware | 2h | 🟡 |
| P5 | Migrasi dari Vercel Hobby ke Cloudflare Pages / VPS | 1d | 🟡 |
| P6 | Implementasi EventStore table + migration | 1-2h | 🟡 |
| P7 | Account lockout + audit trail login | 2h | 🟡 |
| P8 | Redis-based rate limiter (ganti in-memory) | 3h | 🟠 |
| P9 | JWT blacklist/revocation | 2h | 🟠 |
| P10 | Content-Type validation + body size limits | 1h | 🟠 |
