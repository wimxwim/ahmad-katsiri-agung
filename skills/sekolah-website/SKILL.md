---
name: sekolah-website
description: Template website sekolah/madrasah — profil, fasilitas, prestasi, PPDB, kontak. Cocok untuk SD/MI, SMP/MTs, SMA/MA/SMK.
metadata:
  author: Agensi
  version: "2.0"
  category: Template
---

# SEKOLAH WEBSITE — Website Sekolah/Madrasah

## Struktur Halaman

```
Beranda (/)       → Hero, sambutan kepala sekolah, berita terbaru
Profil (/profil)  → Sejarah, visi-misi, struktur organisasi, tenaga pendidik
Fasilitas (/fas)  → Lab, perpus, lapangan, mushola (foto)
Prestasi (/pres)  → Akademik & non-akademik
PPDB (/ppdb)      → Info pendaftaran, jadwal, biaya, formulir (Google Forms embed)
Berita (/berita)  → Kegiatan, pengumuman, artikel
Kontak (/kontak)  → Alamat, maps, WA, email, IG/TikTok
```

## Fitur Khusus Sekolah
| Fitur | Keterangan |
|-------|------------|
| PPDB online | Embed Google Form / form builder gratis — sudah cukup 2026 |
| Kalender akademik | Google Calendar embed |
| Pengumuman | Halaman dinamis (bisa di-cache static) |
| E-learning | Link ke Google Classroom / AKAL Center |
| Galeri siswa | Cloudflare Images atau R2 untuk hosting foto, jangan WordPress media library |

## Integrasi dengan AKAL Center
Jika sekolah butuh konten pembelajaran PAI:
- Integrasi langsung ke akalcenter.my.id
- Embed materi/bab ke halaman sekolah
- Atau deploy AKAL Center instance terpisah untuk sekolah tersebut

## Data yang Perlu Diminta
```
□ Nama sekolah & NPSN
□ Akreditasi (A/B/C)
□ Logo sekolah
□ Foto: gedung, fasilitas, kegiatan (min 10)
□ Visi-misi
□ Struktur organisasi (bisa PDF)
□ Data guru & staf (nama, foto, mapel)
□ Info PPDB: jadwal, syarat, biaya, link form
□ Prestasi: tahun, juara, bidang
□ Kontak: WA, email, alamat, maps, IG, YouTube
□ Kalender akademik (PDF)
```

## Extra: Halaman Pengumuman Kelulusan
```tsx
// Halaman password-protected
"use client";
export default function Pengumuman() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <form onSubmit={...}><input ... /></form>;
  }
  return <DataKelulusan />;
}
```

## Catatan 2026
- PPDB online: form Google / form builder gratis sudah cukup
- Kalender akademik: embed Google Calendar saja
- Galeri siswa: Cloudflare Images atau R2 untuk hosting foto, jangan WordPress media library

## Estimasi
- 5-7 halaman: 5-7 hari
- Dengan PPDB + pengumuman: 7-10 hari
- Harga acuan: Rp 1-2jt (Tipe A+)
