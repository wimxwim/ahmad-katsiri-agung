# 🗓️ Tugas Lanjutan — AKAL Center

> Dibuat: 25 Juni 2026
> 2 item tersisa setelah deploy sesi ini.

---

## 1. 🔄 Purge Cache Cloudflare

**Kenapa perlu:** Hero image fix sudah di-deploy ke Vercel, tapi Cloudflare masih nyimpen cache lama. Perlu di-purge biar perubahan langsung kelihatan.

**Langkah-langkah:**

1. Buka Chrome → buka `https://dash.cloudflare.com`
2. Login akun **Backendgr.02@gmail.com** (kalo belum login)
3. Di halaman utama, klik domain **akalcenter.my.id** (dari daftar Websites)
4. Di sidebar kiri, klik **Speed** → **Optimization** (atau langsung **Caching**)
5. Klik tab **Purge Cache**
6. Pilih **Purge Everything**
7. Klik tombol **Purge Everything** (konfirmasi)
8. Selesai — cache seluruh domain dibersihkan

**Apa yang ke-purge:**
- Hero image (`/images/beranda/hero-illustration.webp`) — biar user lihat yang baru
- Logo PAI (`/logo.webp`)
- Semua gambar game, avatar, PDF
- File static Next.js

**Estimasi:** 2 menit

---

## 2. 🔍 Google Search Console — Daftarin Domain

**Kenapa perlu:** `site:akalcenter.my.id` nol hasil. Padahal konten udah 2 minggu. Penyebab:
- Domain baru (11 Juni 2026) — Google belum tau situs ini ada
- Belum pernah daftar Google Search Console
- Sitemap belum dikirim ke Google
- Canonical tags baru dipasang (barusan)
- robots.txt udah bener, sitemap udah 27 URL

**Ada 2 cara verifikasi domain. Pilih salah satu:**

### Cara A (Mudah) — Via Google Analytics

Cara ini paling cepat karena G-FKHV466K10 udah terpasang di website.

1. Buka `https://search.google.com/search-console/welcome`
2. Login pake akun Google yang punya akses ke **Google Analytics G-FKHV466K10**
   - Kalau akun itu punya Bang Agung (katsiriagung99@gmail.com), minta dia login
   - Kalau akun itu punya kamu (wimxgooo@gmail.com), pakai itu
3. Di halaman "Enter your site URL":
   - Pilih **Domain** (prefix), bukan URL prefix
   - Ketik: `akalcenter.my.id`
   - Klik **Continue**
4. Pilih metode verifikasi:
   - Pilih **Google Analytics**
   - Login pake akun Google yang sama dengan pemilik GA4 property G-FKHV466K10
   - Kalau GA4 property terdaftar di akun itu → langsung terverifikasi otomatis

### Cara B (Alternatif) — Via DNS TXT Record

Kalau Cara A gagal (misal akun GA beda):

1. Buka `https://search.google.com/search-console/welcome`
2. Pilih **Domain**, ketik `akalcenter.my.id`, klik Continue
3. Pilih metode **TXT Record**
4. Copy TXT value yang dikasih Google (misal: `google-site-verification=abc123...`)
5. Buka `https://dash.cloudflare.com` → pilih akalcenter.my.id
6. Sidebar kiri → **DNS** → **Records**
7. Klik **Add Record**:
   - Type: `TXT`
   - Name: `@` (kosong)
   - Value: paste dari Google tadi
   - Proxy status: **DNS only** (grey cloud, matiin proxy)
8. Klik **Save**
9. Tunggu 5-10 menit propagasi
10. Kembali ke Google Search Console, klik **Verify**

### Setelah Verifikasi Berhasil

Langkah-langkah setelah domain terverifikasi:

1. **Kirim Sitemap:**
   - Di sidebar kiri → **Sitemaps**
   - Ketik: `sitemap.xml`
   - Klik **Submit**
   - Tunggu Google crawl (bisa 1-3 hari)

2. **Minta Indexing (cepat):**
   - Di Search Console → **URL Inspection**
   - Masukkin: `https://akalcenter.my.id`
   - Klik **Request Indexing**
   - Ulangi untuk:
     - `https://akalcenter.my.id/materi`
     - `https://akalcenter.my.id/evaluasi`
     - `https://akalcenter.my.id/materi/amanah-dan-jujur`

3. **Cek Coverage:**
   - Sidebar → **Index** → **Pages**
   - Lihat berapa halaman yang ter-index
   - Perbaiki error kalo ada

4. **Pantau seminggu:**
   - `site:akalcenter.my.id` di Google — harus mulai muncul
   - Dashboard Search Console — lihat impresi & klik
   - Butuh waktu 2-4 minggu untuk hasil optimal

### Catatan Penting

| Hal | Status |
|-----|--------|
| Sitemap siap | ✅ 27 URL, udah di robots.txt |
| Canonical tags | ✅ Semua halaman punya |
| robots.txt | ✅ Disallow udah benar |
| metadata | ✅ title, description, OG tag |
| Google Analytics | ✅ G-FKHV466K10 terpasang |
| **Domain usia** | **~14 hari** — wajar belum muncul |

> **⚠️ Google butuh waktu:** Domain baru biasanya butuh 2-4 minggu untuk mulai muncul di hasil pencarian, apalagi untuk situs sekolah yang gak punya backlink. Yang penting fondasi teknis udah bener (canonical, sitemap, robots). Sisanya tinggal nunggu.
