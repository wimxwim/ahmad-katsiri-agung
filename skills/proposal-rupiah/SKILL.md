---
name: proposal-rupiah
description: Generate proposal proyek + RAB (Rencana Anggaran Biaya) dalam Bahasa Indonesia untuk klien. Mencakup latar belakang, ruang lingkup, fitur, timeline, biaya (DP/lunas), dan kontak. Output langsung siap kirim via WA/email.
metadata:
  author: Agensi
  version: "2.0"
  category: Bisnis
---

# PROPOSAL RUPIAH — Proposal Proyek Bahasa Indonesia + RAB

## Kapan Dipakai
- Saat akan mengirim penawaran ke klien baru setelah diskusi awal.
- Saat klien minta "dibuatkan proposal" atau "kirimkan penawaran via WA/email".

## Output
Satu dokumen proposal siap kirim dengan format:
```
Assalamu'alaikum [Nama],

Terima kasih atas diskusinya. Berikut proposal untuk [Nama Proyek]:

─── LATAR BELAKANG ───
[1-2 kalimat tentang kebutuhan klien]

─── RUANG LINGKUP ───
Tipe: [A/B/C/D]
Fitur utama:
• [fitur 1]
• [fitur 2]
• [fitur 3]
• [fitur 4]
• [fitur 5]

─── TECH STACK ───
Website modern: Next.js + database + Cloudflare
Mobile-first, cepat, anti-bocor data

─── TIMELINE ───
Estimasi pengerjaan: [X] hari/minggu
Tahapan:
1. Persiapan & desain (X hari)
2. Pengembangan (X hari)
3. Uji coba & revisi (X hari)
4. Deploy & serah terima (X hari)

─── BIAYA ───
Domain: Rp [X]/tahun (dibayar langsung ke registrar)
Jasa pembuatan: Rp [X]
  → DP 50%: Rp [X] (sebelum mulai)
  → Lunas 50%: Rp [X] (sebelum deploy)
Biaya bulanan: Rp 0 (GRATIS selamanya)

─── SYARAT ───
1. Klien menyediakan konten (logo, teks, foto)
2. Revisi maksimal 2×
3. DP tidak dapat dikembalikan setelah pengerjaan dimulai
4. Domain murni tanggung jawab klien (kami bantu setup)

─── CARA MULAI ───
1. Acc proposal via balas WA
2. Transfer DP ke [rekening]
3. Kirim bahan (logo, teks, foto)
4. Kami kerjakan

Wassalam,
[Nama Agensi]
```

## Cara Pakai
1. Kumpulkan data dari checklist diskusi (3.14 di RINGKASAN_WORKSPACE.md)
2. Panggil skill ini: `gunakan skills proposal-rupiah`
3. Beri parameter: nama klien, nama proyek, tipe, fitur utama, estimasi, harga
4. Output siap copy-paste ke WA/email

## Template Harga (acuan internal)
| Tipe | Rentang Harga | Keterangan |
|------|--------------|------------|
| A (Landing Page 1-3 hal) | Rp [500k-1.5jt] | 1-7 hari |
| B (Toko/Katalog) | Rp [1.5jt-3jt] | 3-10 hari |
| C (Aplikasi Sederhana) | Rp [3jt-7jt] | 2-4 minggu |
| D (Sistem Kompleks) | Rp [7jt-15jt+] | 1-3 bulan |

## Metode Pembayaran dalam Proposal
- **QRIS** — scan via GoPay, OVO, Dana, ShopeePay, LinkAja, mobile banking
- **Transfer Bank** — BCA/Mandiri/BNI/BRI
- **BI FAST** — instan (murah/gratis, max Rp 250jt per transaksi)
- **Virtual Account** — mandiri bayar via ATM/m-banking

Untuk nominal di atas Rp50jt, pertimbangkan biaya PPh 23.
