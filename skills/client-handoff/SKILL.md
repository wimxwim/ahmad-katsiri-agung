---
name: client-handoff
description: Dokumentasi serah terima proyek ke klien non-teknis. Termasuk ringkasan fitur, cara akses, panduan edit konten, kontak support. Output berupa file PDF atau dokumen yang bisa dikirim via WA.
metadata:
  author: Agensi
  version: "2.0"
  category: Bisnis
---

# CLIENT HANDOFF — Serah Terima Proyek ke Klien

## Kapan Dipakai
- Setelah proyek selesai dan akan di-deploy ke production.
- Sebelum pelunasan (lunas 50% terakhir).

## Output
Dokumen `RINGKASAN_KLIEN.md` di folder proyek + PDF untuk dikirim ke klien.

## Template Ringkasan Klien

```
─── RINGKASAN WEBSITE ───

Nama Website : [Nama Proyek]
URL          : https://[domain]
Tanggal Launch : [tanggal]

─── FITUR ───
• [fitur 1] — [penjelasan singkat]
• [fitur 2]
• [fitur 3]
• [fitur 4]
• [fitur 5]

─── CARA EDIT KONTEN ───
[Jika pakai CMS: jelaskan cara login dan edit]
[Jika tidak: jelaskan cara minta update ke agensi]

─── DOMAIN ───
Domain: [domain]
Registrar: [nama registrar]
Biaya perpanjang: Rp [X]/tahun
Jatuh tempo: [tanggal]
Catatan: domain adalah tanggung jawab klien. Kami ingatkan H-30 sebelum expiry.

─── HAL YANG PERLU DILAKUKAN KLIEN ───
□ Perpanjang domain sebelum expiry
□ Backup konten secara berkala
□ Update konten jika ada perubahan

─── KONTAK SUPPORT ───
WA: [nomor agensi]
Email: [email agensi]
Respon dalam 1×24 jam.

─── TEKNIS (untuk admin) ───
Tech stack: [Next.js/Supabase/Cloudflare]
Hosting: Cloudflare (gratis, tanpa biaya bulanan)
Database: Supabase (gratis, 2GB)
```

## Material Tambahan
- Video tutorial singkat (Loom/recording) cara edit konten — kirim link YouTube
- Dokumen handoff: URL login, cara edit, hosting provider, domain registrar — di satu tempat
- Masa pemeliharaan: 1 minggu gratis setelah handoff
- Billing terpisah: hosting & domain atas nama klien (transfer kepemilikan)

## Cara Pakai
1. Panggil skill: `gunakan skills client-handoff`
2. Masukkan data proyek
3. File `RINGKASAN_KLIEN.md` akan dibuat di folder proyek
4. Kirim ke klien via WA setelah deploy
5. Minta pelunasan setelah klien konfirmasi terima
