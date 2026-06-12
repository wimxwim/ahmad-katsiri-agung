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
| **Halaman** | Beranda, Materi (14 bab), Detail Materi, Portal Pendidik, Game, Tentang, Peserta Didik |
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
- [x] Coding selesai (v2 — 24 halaman statis, 14 bab materi)
- [ ] Review bersama klien
- [x] Deploy ke domain production → ✅ Live di akalcenter.my.id

---

## Catatan & Log Update

| Tanggal | Update |
|---------|--------|
| 2026-06-09 | Sesi 1-6: Full build platform. Lihat AGENTS.md untuk kronologi detail. |
| 2026-06-09 | Sesi 7: Mengganti logo Vercel (segitiga putih) dengan logo PAI (SVG, PNG, ICO, Open Graph preview) serta mengintegrasikan logo ke Navbar, Footer, dan Hero. |
| 2026-06-09 | Sesi 8: Tambah tombol & file PPT slide deck (9 file), Naskah Soal (8 file), Vercel Analytics, tombol Kirim Saran via WA di detail materi, dan game Jujur dan Amanah. Update RINGKASAN_KLIEN.md dengan panduan penambahan game, materi, dan video. |
| 2026-06-11 | Sesi 9: Rebrand "Aggung Learning" → "AKAL Center", perangkat ajar PROTA/PROSEM/ATP download + tab kelas 7/8/9, dual Telegram notif |
| 2026-06-11 | Sesi 10: Cloudflare Workers CDN reverse proxy + cache static assets |
| 2026-06-11 | Sesi 11: Performa (9 fix), domain akalcenter.my.id, Cloudflare security (6), Vercel 403 block, metadata fix |
| 2026-06-11 | Sesi 12: 5 bab baru (total 14 bab), game link update, tim verifikator, foto Bang Agung (resize 400×400), LCP optimasi WebP |
| 2026-06-11 | Sesi 13: Cache-busting foto Bang Agung (?v=2) — fix foto lama muncul di HP |
| 2026-06-11 | Sesi 14: Update playbook agensi — 39 error terklasifikasi + arsitektur Vercel/Cloudflare/Domain |
| 2026-06-12 | Sesi 15: Security Audit & Fix — JWT auth, rate limiting, sanitasi XSS, CSP/HSTS, Zod validation, lenis removal |

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

## Panduan Menambahkan Game Baru

> Klien (Ahmad Katsiri Agung, S.Pd.) dapat mengirimkan link game Canva kapan saja.
> Ikuti langkah ini untuk menambahkannya ke website.

### 1. Tambah ke Halaman Game
Buka file `src/app/game/page.tsx`, cari array `GAMES`, lalu tambah objek baru:
```typescript
{
  title: "Nama Game",
  desc: "Deskripsi singkat game.",
  url: "https://namagame.my.canva.site/",
  badge: "EKSTERNAL",
},
```
- Simpan di urutan yang diinginkan (paling baru biasanya ditaruh paling atas)
- URL adalah link Canva yang dikirim klien

### 2. Siapkan Gambar Cover (WAJIB — format WebP)
Setiap game WAJIB punya gambar cover ukuran 16:9 (1600×900 px) di folder `public/images/games/`:
- Nama file: `game-{slug}.webp` (huruf kecil, spasi jadi `-`)
- Contoh: `game-adab-dalam-islam.webp`, `game-melestarikan-alam.webp`
- Source file PNG ditaruh di tempat yang sama (sebagai master)

Cara konversi PNG → WebP (pake ImageMagick):
```bash
convert "public/images/games/game-nama-game.png" -quality 80 "public/images/games/game-nama-game.webp"
```
> ⚠️ **PENTING:** Pastikan SEMUA game punya file `.webp`. Kalau ada game yang cuma punya `.png`, gambar di website akan broken (karena kode di `page.tsx` sudah pakai `.webp`).

### 3. (Opsional) Tautkan ke Materi Terkait
Kalau game berhubungan dengan salah satu dari 14 bab materi:
1. Buka `src/data/materi.ts`
2. Cari entry bab yang sesuai (misal `"amanah-dan-jujur"`)
3. Tambah field `gameUrl: "https://namagame.my.canva.site/",`
   (letakkan setelah `soalUrl` atau `videoUrl`)
4. Otomatis card "Game Terkait" akan muncul di sidebar halaman detail materi

### 4. Deploy
```bash
npm run build
git add -A
git commit -m "feat: tambah game [nama game]"
git push origin main
npx vercel --prod --yes
```

---

## Panduan Menambahkan Materi / Bab Baru

> Saat ini ada 14 bab (Kelas 7: 4 bab, Kelas 8: 5 bab, Kelas 9: 5 bab).
> Jika klien ingin menambah bab baru, ikuti langkah ini.

### 1. Siapkan File PDF
Letakkan di `public/pdf/` dengan format nama:
- `public/pdf/{slug-bab}.pdf` — Modul Ajar
- `public/pdf/{slug-bab}-ppt.pdf` — Slide PPT (opsional)
- `public/pdf/{slug-bab}-soal.pdf` — Naskah Soal (opsional)

Contoh: `public/pdf/adab-dalam-islam.pdf`, `adab-dalam-islam-ppt.pdf`, dll.

### 2. Buka `src/data/materi.ts`
a. Tidak perlu ubah interface (sudah siap)
b. Tambah entry baru di `ALL_MATERI`. Format:
```typescript
"slug-bab": {
  slug: "slug-bab",
  title: "Judul Bab",
  kelas: 7, // atau 8, 9
  bab: 4,   // urutan dalam kelas
  babLabel: "AKIDAH", // atau "AKHLAK"
  ringkasan: "Satu kalimat ringkasan.",
  subTopik: 5,  // jumlah sub-topik
  waktuBaca: "5 MIN BACA",
  icon: "\uD83D\uDCD6", // emoji unicode
  videoUrl: "https://www.youtube.com/embed/VIDEO_ID", // opsional
  soalUrl: "/pdf/slug-bab-soal.pdf", // opsional
  gameUrl: "https://...", // opsional
  pendahuluan: "Kalimat pembuka bab.",
  konten: [
    { judul: "Sub Topik 1", isi: "Isi paragraf..." },
    { judul: "Sub Topik 2", isi: "Isi paragraf..." },
  ],
  dalil: { // opsional
    surah: "QS. Nama [ayat]: nomor",
    arab: "teks arab...",
    arti: "Terjemahan...",
  },
  dimensi: [ // opsional — 3-4 dimensi
    { nomor: 1, judul: "Judul Dimensi", deskripsi: "Deskripsi..." },
  ],
  poinPenting: [
    "Poin penting 1",
    "Poin penting 2",
  ],
  // navigasi berurutan dalam satu kelas
  prevSlug: "slug-bab-sebelumnya",
  prevTitle: "Judul Bab Sebelumnya",
  nextSlug: "slug-bab-setelahnya",
  nextTitle: "Judul Bab Setelahnya",
}
```

### 3. Halaman Baru Otomatis Tergenerate
- Next.js akan membuat halaman `/materi/{slug-bab}` secara otomatis saat build
- Tidak perlu buat file halaman baru

### 4. (Opsional) Update Navbar Jika Perlu
Jika ada kelas baru (misal Kelas 10), buka `src/components/layout/Navbar.tsx` dan tambah filter kelas baru.

### 5. Deploy
```bash
npm run build
git add -A
git commit -m "feat: tambah bab [judul bab]"
git push origin main
npx vercel --prod --yes
```

---

## Panduan Menambahkan Video YouTube

1. Buka `src/data/materi.ts`
2. Cari entry bab (misal `"adab-dalam-islam"`)
3. Tambah/sunting field: `videoUrl: "https://www.youtube.com/embed/VIDEO_ID"`
   - VIDEO_ID: dari link YouTube (`watch?v=` atau `youtu.be/`)
   - Contoh: `https://www.youtube.com/embed/QHZGZ5m7kV0`
4. Letakkan setelah field `icon`
5. Deploy seperti biasa

---

## Perintah Deploy Cepat

```bash
npm run build                    # 1. Tes build
git add -A                       # 2. Stage semua perubahan
git commit -m "pesan perubahan"  # 3. Commit
git push origin main             # 4. Push ke GitHub
npx vercel --prod --yes          # 5. Deploy ke Vercel
```

> ⚠️ Pastikan `git config --global user.name` adalah `wimxwim`
> ⚠️ Jangan hapus file `vercel.json`

---

## Catatan & Log Update (Riwayat Pengerjaan)

```
Lanjutkan project Aggung Learning. Baca file AGENTS.md dan RINGKASAN_KLIEN.md
di folder ini. Semua detail ada di AGENTS.md.
```
