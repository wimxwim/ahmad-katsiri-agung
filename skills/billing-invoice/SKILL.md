---
name: billing-invoice
description: Generate invoice untuk DP dan pelunasan klien dalam Bahasa Indonesia. Format siap kirim WA/email. Mencakup sistem DP 50% + Lunas 50% + tracking status pembayaran.
metadata:
  author: Agensi
  version: "2.0"
  category: Bisnis
---

# BILLING INVOICE — Invoice DP/Lunas untuk Klien

## Sistem Pembayaran Agensi
- **Termin: 50% DP + 25% progres + 25% pelunasan**
- Tidak ada biaya bulanan/langganan

## Template Invoice DP

```
INVOICE — DP 50%
No: INV/[tahun]/[nomor urut]
Tanggal: [tanggal]

Kepada Yth.
[Nama Klien]
[WhatsApp/Telp]

Proyek: [Nama Proyek]

Rincian:
Jasa pembuatan website      Rp [Total]
DP 50%                      Rp [Jumlah DP]
──────────────────────────────────────
Terbilang: [jumlah] rupiah

Cara Bayar:
Transfer ke:
Bank [Bank]
No Rek: [No Rek]
a.n. [Nama Pemilik]
QRIS: [scan QR] — pembayaran instant tanpa transfer antar bank

Konfirmasi pembayaran:
Kirim bukti transfer ke WA [nomor]

Pajak:
PPh 23 (jika > Rp50jt) — potong 2% dari total invoice

Status: MENUNGGU PEMBAYARAN
```

## Template Invoice Pelunasan

```
INVOICE — PELUNASAN
No: INV/[tahun]/[nomor urut]
Tanggal: [tanggal]

Kepada Yth.
[Nama Klien]

Proyek: [Nama Proyek]

Rincian:
Sisa pembayaran (50%)       Rp [Jumlah Sisa]
──────────────────────────────────────
Terbilang: [jumlah] rupiah

Catatan: Pembayaran ini dilakukan SEBELUM website di-launch.
Setelah pelunasan, website akan online di [domain].

Cara Bayar:
Transfer ke:
Bank [Bank]
No Rek: [No Rek]
a.n. [Nama Pemilik]

Status: ⏳ MENUNGGU PEMBAYARAN
```

## Tracking Pembayaran (Internal)

| No | Klien | Proyek | DP | Sisa | Total | Status |
|----|-------|--------|----|------|-------|--------|
| | | | Rp | Rp | Rp | ✅/⏳/❌ |

## Cara Pakai
1. Panggil: `gunakan skills billing-invoice`
2. Beri parameter: nama klien, proyek, total biaya, status (DP/pelunasan)
3. Output siap copy-paste
4. Update status tracking di file `~/agensi/proyek/KEUANGAN.md` (buat jika belum ada)
