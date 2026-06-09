# Ringkasan Klien — Ahmad Katsiri Aggung

> File ini dibaca AI untuk memahami konteks project sebelum eksekusi.
> Update bagian STATUS PROJECT setiap ada progress.
> Untuk detail teknis SUPER LENGKAP, baca AGENTS.md di folder yang sama.

---

## Data Klien

| Info | Detail |
|------|--------|
| **Nama klien** | Ahmad Katsiri Aggung |
| **Profesi** | Pendidik PAI — Pembuat konten edukasi |
| **Jenis project** | Platform Pembelajaran PAI / Akidah Akhlak SMP/MTs |
| **Nomor WhatsApp** | +6285158795502 |
| **Instagram** | @ahmadkatsiria |
| **TikTok** | @sir.ahmd |
| **YouTube** | Ahmad Katsiri Agung |
| **Warna / tema** | Hijau premium (#005231) + Gold/Emas — Aero-Emerald Future |
| **Halaman** | Beranda, Materi (9 bab), Detail Materi, Portal Pendidik, Game, Tentang, Peserta Didik |
| **Tanggal mulai** | 9 Juni 2026 |

> ⚠️ **Catatan khusus dari klien:**
> 1. Tidak perlu halaman login
> 2. Tema: "Model Pembelajaran Berbasis Deep Learning pada Materi Akidah Akhlak tingkat SMP/MTS"
> 3. Kurikulum: Kurikulum Merdeka (BUKAN "Kurikulum Terpadu 2026")
> 4. Deep Learning 3 pilar: Mindful → Meaningful → Joyful Learning

---

## Status Project

- [x] Detail bisnis diterima dari klien
- [ ] Harga deal & kontrak ditandatangani
- [ ] Mockup desain dibuat
- [ ] Mockup disetujui klien
- [x] Coding selesai (v1 — 18 halaman statis)
- [ ] Review bersama klien
- [ ] Deploy ke domain production → ✅ Live di Vercel (.vercel.app)

---

## Catatan & Log Update

| Tanggal | Update |
|---------|--------|
| 2026-06-09 | Sesi 1-6: Full build platform. Lihat AGENTS.md untuk kronologi detail. |
| 2026-06-09 | Sesi 7: Mengganti logo Vercel (segitiga putih) dengan logo PAI (SVG, PNG, ICO, Open Graph preview) serta mengintegrasikan logo ke Navbar, Footer, dan Hero. |

---

## Panduan Pengubahan Logo & Favicon (Masa Depan)

Jika Anda ingin memperbarui logo/favicon website di kemudian hari, siapkan file logo baru format SVG (misal namanya `LOGO_BARU.svg` di folder Downloads), lalu jalankan perintah-perintah berikut di terminal proyek:

### 1. Salin dan Konversi Logo Baru
```bash
# Salin file SVG baru ke folder aset
cp "/home/ngome/Downloads/LOGO_BARU.svg" src/app/icon.svg
cp "/home/ngome/Downloads/LOGO_BARU.svg" public/logo.svg

# Buat favicon.ico (32x32px) untuk browser lama
convert -background none "/home/ngome/Downloads/LOGO_BARU.svg" -resize 32x32 src/app/favicon.ico

# Buat ikon PNG utama (512x512px) untuk web & Android
convert -background none "/home/ngome/Downloads/LOGO_BARU.svg" -resize 512x512 src/app/icon.png

# Buat ikon Apple Touch (180x180px) untuk iOS/Safari
convert -background none "/home/ngome/Downloads/LOGO_BARU.svg" -resize 180x180 src/app/apple-icon.png

# Buat banner pratinjau WhatsApp (1200x630px dengan background soft-green #f2fcf7)
convert -size 1200x630 xc:"#f2fcf7" /tmp/bg.png
convert -background none -resize 400x400 "/home/ngome/Downloads/LOGO_BARU.svg" /tmp/logo_resized.png
composite -gravity center /tmp/logo_resized.png /tmp/bg.png src/app/opengraph-image.png
rm /tmp/bg.png /tmp/logo_resized.png
```

### 2. Deploy Perubahan ke Internet
Setelah file ikon dibuat, jalankan perintah ini untuk menyimpan ke repositori Git dan meluncurkannya ke Vercel production:
```bash
# 1. Tes build lokal untuk memastikan tidak ada error
npm run build

# 2. Simpan perubahan ke Git
git add -A
git commit -m "feat: perbarui logo dan favicon website"
git push origin main

# 3. Deploy langsung ke Vercel production
npx vercel --prod --yes
```

---

## Trigger Prompt — Tempel Ini ke AI

```
Lanjutkan project Aggung Learning. Baca file AGENTS.md dan RINGKASAN_KLIEN.md
di folder ini. Semua detail ada di AGENTS.md.
```
