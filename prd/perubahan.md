# SESI 28 — Fix Login Architecture (6 Jul 2026)

## Problem
Login flow tidak menggunakan PostgreSQL — siswa login via `/api/masuk` (JWT tanpa DB), guru via `/api/guru/login` (Google Sheets). Bertentangan dengan PRD 06-model-data.md yang sudah menentukan struktur `users` table.

## Changes

### API
- `/api/sesi` — tambah `userId`, `email` di response
- `/api/v1/auth/login` — tambah `redirect` key di response (role-based)
- `/api/v1/auth/register` — tambah parameter opsional `kelas`, `noAbsen`,
  `role` (default SISWA); tambah `redirect` di response

### Frontend
- `FormMasuk.tsx` — rewrite total:
  - Pilihan awal: Murid / Guru
  - Murid: tab "Masuk" (email+password → `/api/v1/auth/login`) dan
    "Daftar" (nama+email+password+kelas+noAbsen → `/api/v1/auth/register`)
  - Guru: email+password → `/api/v1/auth/login`
  - Tidak ada lagi form nama+NIS (legacy `/api/masuk`)
- `/masuk-guru` — ganti dari POST `/api/guru/login` (Google Sheets +
  username) ke POST `/api/v1/auth/login` (DB + email)
- `Navbar.tsx` — dashboard link untuk siswa (`/dashboard-siswa`)

### Database
- `schema.ts` — tambah kolom `kelas` (varchar(10)) dan `noAbsen` (varchar(5))
  ke tabel `users`
- Migration `0002_add_kelas_noabsen.sql` — ALTER TABLE users ADD COLUMN
- `scripts/seed.ts` — rewrite pakai Drizzle ORM (seed admin + guru,
  password: admin123)

## Alur Login Baru
- **Murid login**: email + password → `/api/v1/auth/login` → `/dashboard-siswa`
- **Murid daftar**: nama + email + password + (kelas, noAbsen opsional)
  → `/api/v1/auth/register` → `/dashboard-siswa`
- **Guru login**: email + password → `/api/v1/auth/login` → `/dashboard-guru`
- Semua pake bcrypt `passwordHash` di PostgreSQL

## Blockers
- `DATABASE_URL` tidak diset di `.env.local` — semua endpoint DB error
- Belum ada seed guru di DB — guru tidak bisa login sampai seed dijalankan
- `proxy.ts` belum rename ke `middleware.ts` — auth gate tidak aktif
- `/masuk` masih duplikat dari `/login` — belum dihapus
