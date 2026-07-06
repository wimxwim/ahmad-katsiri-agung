---
name: client-onboarding
description: Flow onboarding klien standar dari akad awal hingga kontrak & DP. Mencakup briefing, pengisian data, konfirmasi fitur, pembuatan kontrak sederhana, dan permintaan DP.
metadata:
  author: Agensi
  version: "2.0"
  category: Bisnis
---

# CLIENT ONBOARDING — Flow Onboarding Klien Standar

## Flow Lengkap

```
DISKUSI AWAL → PROPOSAL → ACC → KONTRAK → DP 50% → KERJA
```

## Langkah-langkah

### 1. Briefing Awal (via WA/tatap muka)
Tanyakan ke klien (gunakan checklist diskusi):
- Nama & kontak
- Nama proyek
- Tujuan website
- Target pengguna
- Budget ekspektasi
- Deadline (jika ada)
- Domain sudah punya? (cek ketersediaan)
- Konten (logo, teks, foto) — sudah siap?
- Referensi website lain yang disukai

### 2. Kirim Proposal
- Gunakan skill `proposal-rupiah`
- Kirim via WA
- Minta ACC

### 3. Konfirmasi & Kontrak
Saat klien ACC, kirim:
- Project brief: isi satu halaman Google Docs yang di-klien ACC sebelum coding
- WA group untuk komunikasi proyek — catat semua keputusan di group
```
Baik, [Nama]. Berikut ringkasan kesepakatan:

Proyek : [Nama Proyek]
Biaya  : Rp [X]
DP     : Rp [X] (50%)
Sisa   : Rp [X] (50%, sebelum deploy)
Durasi : [X] hari/minggu

Rekening:
Bank [Bank] — [No Rek] — a.n. [Nama Pemilik]

Dengan ini menyetujui:
1. Saya akan kirim bahan (logo, teks, foto) maksimal H+2 setelah DP
2. Revisi maksimal 2× setelah mockup dikirim
3. DP tidak dapat dikembalikan

Silakan balas "SETUJU" jika cocok.
```

### 4. Terima DP
Setelah klien transfer:
- Konfirmasi terima DP (DP minimal 50% sebelum mulai kerja)
- Buat folder proyek di `~/agensi/proyek/[nama-proyek]/`
- Init git repo
- Siapkan workspace

### 5. Minta Bahan
Kirim checklist bahan:
```
Bahan yang diperlukan:
✅ Logo (PNG/SVG dengan background transparan)
✅ Teks untuk setiap halaman (dokumen Word/Google Docs)
✅ Foto produk/kantor/tim (minimal 3, resolusi baik)
✅ Warna brand (jika ada)
✅ Kontak: WA, email, alamat, maps link, jam operasional
✅ Akun media sosial (IG, TikTok, YouTube — jika ada)
```

### 6. Mulai Pengerjaan
- Setelah bahan terkumpul → mulai desain
- Kirim mockup → ACC → develop → deploy
