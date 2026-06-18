# 🚦 MULAI DI SINI — Agensi CMS (Handoff antar-session)

> **Untuk Claude/sesi baru:** BACA FILE INI DULU sebelum kerja. Lalu baca `RENCANA-AGENSI-CMS.md` untuk detail penuh.
> **Untuk pemilik:** ini ringkasan biar kamu/aku gak lupa alur walau ganti session.
> **Update terakhir:** 31 Mei 2026.

---

## 1. Ini project apa? (1 paragraf)
Membangun **satu CMS universal** (nama kerja: *Agensi CMS*) untuk melayani BANYAK project klien dari satu sistem ("1 lobang buat rame-rame"). Pendekatan: **1 fondasi stabil + banyak blueprint domain modular** (Company Profile, Pendidikan, E-commerce, Media) + multi-tenant. CMS ini juga **me-render website klien** (Site Renderer), bukan cuma API.

## 2. STATUS SAAT INI
- ✅ **Perencanaan SELESAI & disetujui.**
- ⛔ **BELUM ADA KODE.** Folder `proyek/agensi-cms/` belum dibuat.
- ➡️ **Langkah berikutnya = Sprint 1** (scaffold). Lihat §6.

## 3. Keputusan FINAL (terkunci — jangan diubah tanpa izin pemilik)
| Hal | Keputusan |
|-----|-----------|
| Fondasi | **Payload CMS 3** |
| Framework | **Next.js (App Router)** |
| Bahasa | **TypeScript** |
| Database | **PostgreSQL** (lokal saat dev) |
| Model frontend | **Site Renderer bawaan** (CMS me-render situs klien) |
| Multi-domain | **Multi-tenant** (1 CMS, banyak project) |
| Akses eksternal | **Headless REST + GraphQL** |
| Blueprint pertama | **Company Profile** |
| Lokalisasi | IDR, WIB, UI admin Bahasa Indonesia |

## 4. PRINSIP BIAYA (PENTING — jangan langgar)
- Pemilik **TIDAK MAU keluar kartu kredit**. Jangan sarankan layanan yang butuh kartu (mis. **Oracle Cloud** — DITOLAK).
- Develop di **localhost** (utama). Demo di **Vercel + Supabase** (gratis, tanpa kartu, sah karena non-komersial).
- **Produksi = klien yang beli hosting** (Hostinger/Dewaweb, paket VPS/Node — bukan shared PHP). Hosting bukan beban pemilik.
- Layanan free yang dipakai: GitHub, Resend (email), Sentry (error), Postgres FTS (search), Midtrans/Xendit (payment, tanpa biaya bulanan).

## 5. ATURAN KERJA (biar "gak rapuh/berkarat")
1. **Fondasi tidak boleh tahu soal domain.** Tiap domain = modul di `src/blueprints/<nama>/`.
2. Jangan menumpuk semua fitur jadi satu file raksasa.
3. Kerja **per Sprint**, tiap sprint hasilkan sesuatu yang nyata & bisa dilihat.
4. **JANGAN HALUSINASI.** Kalau ragu soal API/perintah Payload, verifikasi dulu (cek dokumen resmi). Jangan klaim sesuatu sudah jalan kalau belum dites.
5. Update file ini + `RENCANA-AGENSI-CMS.md` setiap ada perubahan keputusan/progres.

## 6. SPRINT 1 — langkah PERSIS (langkah berikutnya)
> Semua di localhost. Postgres 17 sudah terpasang di mesin ini.

```bash
# 1. Masuk folder project
cd /home/ngome/agensi/proyek

# 2. Scaffold Payload (interaktif). Pilih:
#    - nama: agensi-cms
#    - database: PostgreSQL
#    - template: "website"  <-- PENTING: sudah include Page Builder, SEO,
#      Redirects, Form Builder, Draft Preview, Media. Hemat banyak kerja WAJIB.
pnpm create payload-app@latest agensi-cms

# 3. Buat database lokal
createdb agensi_cms     # sesuaikan kredensial Postgres lokal bila perlu

# 4. Set koneksi di proyek/agensi-cms/.env
#    DATABASE_URI=postgres://<user>:<pass>@localhost:5432/agensi_cms
#    PAYLOAD_SECRET=<acak panjang>

# 5. Jalankan
cd /home/ngome/agensi/proyek/agensi-cms
pnpm dev
# buka http://localhost:3000/admin  -> buat user admin pertama
```
**Target hasil Sprint 1:** admin panel hidup di `localhost:3000/admin`, bisa login.

> Catatan: template **"website"** Payload sudah memberi banyak item WAJIB (Page Builder, SEO, Redirects, Form Builder, Media, Draft/Preview) secara gratis. Multi-tenant ditambah kemudian via `@payloadcms/plugin-multi-tenant` (Sprint 2).

## 7. URUTAN SPRINT (ringkas)
1. **Sprint 1** — Scaffold, admin hidup di localhost. ⬅️ SEKARANG
2. **Sprint 2** — Multi-tenant + RBAC + dua user pool.
3. **Sprint 3** — Page Builder + Site Renderer + blueprint Company Profile (situs pertama tampil).
4. **Sprint 4** — Storage eksternal, Form+email (Resend), SEO/sitemap, backup, migrations.
5. **Sprint 5** — Analytics + Ad Manager + cookie consent.
6. **Sprint 6** — Demo online (Vercel + Supabase, tanpa kartu).
7. **Sprint 7** — Serah produksi ke hosting klien.
8. **Sprint 8+** — Payment, Search, Webhook, API Keys, Sentry, blueprint lain, testing+CI/CD.

## 8. Environment (sudah diverifikasi 31 Mei 2026)
Node v24.15.0 · pnpm 10.33.4 · PostgreSQL 17.10 (lokal) · Docker 29.5.2 · git 2.43.0.
OS Linux. Folder kerja: `/home/ngome/agensi`. Project klien lain ada di `proyek/`.

## 9. File terkait
- `cms/00-MULAI-DI-SINI.md` — file ini (baca pertama).
- `cms/RENCANA-AGENSI-CMS.md` — rencana lengkap: fitur, sprint detail, plus-minus, daftar risiko (§8 "yang mungkin terlewat").
