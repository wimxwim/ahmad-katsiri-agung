# AUDIT GPT 5.5 — Temuan Kritis (Backend/Keamanan)

> **Sumber:** GPT 5.5 main session + backend security sub-agent (65 toolcalls)
> **Status:** Read-only audit, tidak ada file yang diubah

---

## 1. Public register bisa membuat akun guru

**File:** `src/app/api/v1/auth/register/route.ts:11-16, 58-69`

Endpoint register menerima `role: "SISWA" | "GURU"` dari body request. Artinya siapa pun bisa daftar sebagai guru. Ini harus ditutup sebelum VPS launch.

**Rekomendasi:**
- Public register hanya boleh membuat SISWA.
- Guru dibuat lewat invite token, approval owner, atau admin sekolah.
- Role tidak boleh berasal dari request publik.

---

## 2. API kursus, nilai, dan enroll belum dilindungi auth/role

**File:** `src/app/api/v1/kursus/route.ts`, `src/app/api/v1/kursus/[id]/nilai/route.ts`, `src/app/api/v1/enroll/route.ts`

Beberapa endpoint `/api/v1/*` belum pakai requireAuth/requireRole. Karena `src/proxy.ts` membebaskan semua `/api/`, keamanan harus di route-level. Saat ini belum cukup.

**Rekomendasi:**
- Semua `/api/v1/*` default protected kecuali login/register.
- Endpoint nilai hanya guru/admin/owner.
- Endpoint kursus write hanya guru pemilik atau admin.
- Semua query harus cek userId, role, sekolahId, dan ownership.

---

## 3. Dashboard/API v2 masih mock/in-memory

**File:** `src/app/api/v1/kursus/route.ts:3, 48-61`, `src/data/mock.ts`

POST `/api/v1/kursus` hanya push ke array `mockKursus`. Data hilang saat restart container. Ini tidak boleh launch sebagai fitur production.

**Rekomendasi:**
- Ganti semua route kursus/enroll/nilai dari mock ke Drizzle/PostgreSQL.
- Mock hanya boleh untuk demo/dev, bukan route production.
- Tampilkan badge "Data demo" di dashboard yang belum real.

---

## 4. Worker Cloudflare bisa proxy loop

**File:** `workers/akal-center/index.ts:2, 73-87`

Default ORIGIN adalah `https://akalcenter.my.id`. Padahal domain itu juga diroute ke Worker. Jika ORIGIN_URL tidak diset, Worker bisa fetch dirinya sendiri.

**Rekomendasi:**
- ORIGIN_URL wajib diset ke `https://origin.akalcenter.my.id`.
- Jangan fallback ke domain publik yang sama.
- Tambahkan guard jika ORIGIN host sama dengan request host, return config error.
- Pastikan `origin.akalcenter.my.id` tidak ikut route Worker.

---

## 5. docker-compose production masih hardcode password DB

**File:** `docker-compose.prod.yml:27-37, 56-59`, `scripts/prod-entrypoint.sh:14`

Ada `akaldev` di compose production dan fallback entrypoint. Ini tidak boleh dipakai untuk launch.

**Rekomendasi:**
- Hapus semua hardcoded `akaldev` dari prod compose.
- Gunakan `${POSTGRES_PASSWORD:?missing}`.
- Fail-fast kalau env kosong.
- Rotasi credential sebelum launch.

---

## 6. Port app 3000 diekspos ke host

**File:** `docker-compose.prod.yml:25-26`

`ports: "3000:3000"` memungkinkan origin app diakses langsung kalau firewall terbuka. Ini bypass Caddy/Cloudflare/Worker.

**Rekomendasi:**
- Hapus `ports: "3000:3000"`.
- Gunakan internal network saja.
- Caddy reverse proxy ke `app:3000`.
- Firewall VPS hanya buka 80/443, idealnya hanya dari Cloudflare IP atau pakai Authenticated Origin Pulls/Cloudflare Tunnel.

---

## 7. Rate limiter masih in-memory

**File:** `src/lib/rate-limit.ts:6`, `workers/akal-center/index.ts:10`

Redis sudah ada di compose, tapi rate limit belum pakai Redis. In-memory rate limit reset saat restart, tidak konsisten multi-instance, dan bisa dibypass jika header IP bisa dispoof.

**Rekomendasi:**
- Gunakan Redis atomic INCR + EXPIRE.
- Login limit berdasarkan IP + email/nama.
- Public form limit berdasarkan IP + route + fingerprint ringan.
- Tambahkan Cloudflare WAF/rate limit untuk `/api/masuk`, `/api/v1/auth/*`, `/api/kuis/selesai`.

---

## 8. Data anak dan UGC belum punya tata kelola cukup

**File:** `src/app/api/refleksi/route.ts`, `src/app/api/diskusi/route.ts`, `src/app/api/siswa/cek/route.ts`

Refleksi/diskusi publik bisa berisi data siswa. Verifikasi siswa pakai nama + tanggal lahir. Dalam UU PDP, data anak termasuk data pribadi spesifik.

**Rekomendasi:**
- Refleksi default privat ke guru.
- Diskusi pakai moderation pending/approved.
- Jangan tampilkan data anak publik.
- Jangan minta NIK.
- Tambah kebijakan privasi, syarat layanan, consent wali/orang tua untuk fitur siswa resmi.
- Risk score jangan ditampilkan sebagai label memalukan.

---

> *Dokumen ini adalah salinan verbatim dari hasil audit GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli GPT 5.5.*
