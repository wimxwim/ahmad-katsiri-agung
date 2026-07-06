---
name: domain-management
description: Cek ketersediaan domain, rekomendasi registrar Indonesia, tracking masa berlaku, dan pengingat perpanjangan. Untuk membantu klien membeli dan mengelola domain.
metadata:
  author: Agensi
  version: "2.0"
  category: Layanan
---

# DOMAIN MANAGEMENT — Domain untuk Klien

## Cek Ketersediaan Domain
Gunakan API atau website:
- `whois [domain]` (command line)
- https://www.niagahoster.co.id/domain-murah
- https://www.rumahweb.com/domain/
- https://www.cloudflare.com/products/registrar/

## Rekomendasi Registrar Indonesia
| Registrar | .com | .id | .my.id | Catatan |
|-----------|------|-----|--------|---------|
| Niagahoster | ~Rp 150k/thn | ~Rp 200k/thn | — | Populer, support 24/7 |
| Rumahweb | ~Rp 150k/thn | ~Rp 180k/thn | — | Support baik |
| Cloudflare Registrar | ~$10/thn (harga modal) | — | — | Tanpa markup |
| DomaiNesia | ~Rp 130k/thn | ~Rp 175k/thn | — | Harga kompetitif |

### Cloudflare Registrar
- Harga modal (no markup) — .com ~$10/thn
- Support registrar lock, auto-renew, transfer
- Domain di Cloudflare langsung manage DNS di dashboard yang sama

### Domain .id / .my.id — PANDI
- Cek di PANDI registrar (pandi.id) untuk daftar registrar resmi
- **.my.id = untuk individu** (warga negara Indonesia, wajib KTP)
- **.id = untuk organisasi/perusahaan** (wajib NIB/akta)
- **⚠️ KRITIKAL: .my.id WAJIB verifikasi KTP** di PANDI — tanpa ini domain masuk **clientHold** (tidak bisa diakses) 1-30 hari setelah registrasi. Bukan proses registrar, tapi proses PANDI.

### Prosedur Registrasi .my.id (WAJIB BACA)
**Latar belakang:** Domain .my.id dikelola PANDI, bukan registrar. Meskipun klien bayar ke registrar (Rumahweb, Niagahoster, DomaiNesia), PANDI tetep wajib verifikasi identitas. Registrasi dianggap "pending" sampe KTP diverifikasi. Kalau gak diverifikasi, domain masuk **clientHold** — website mati total, gak bisa diakses.

**Langkah-langkah:**
1. **Cek ketersediaan** via whois atau registrar
2. **Registrasi di registrar** yang support .my.id (Rumahweb, Niagahoster, DomaiNesia)
3. **⚠️ SAAT CHECKOUT — upload KTP:**
   - Siapkan scan/foto KTP klien (jelas, 4 sudut terlihat, gak blur)
   - Beberapa registrar langsung integrasi verifikasi PANDI di halaman checkout
   - Nama di data registrasi HARUS SAMA persis dengan KTP (termasuk gelar, titik, koma)
   - NIK di KTP harus sesuai
4. **Tunggu verifikasi PANDI:**
   - Bisa real-time (langsung aktif), bisa sampe 1-2 hari kerja
   - Selama menunggu: status domain = `pending` / `clientHold`
   - **Domain TIDAK BISA dipake** sampe status aktif
5. **Kalau ditolak:**
   - Biasanya karena nama gak cocok (misal di registrar "Andi" tapi KTP "Andi Pratama")
   - Atau foto KTP gak jelas / terpotong
   - Registrasi ulang dengan data yang pas
6. **Setelah aktif:**
   - Cek whois, domain harus `serverHold` → `OK`
   - Lanjut ke **Checklist Post-Registrasi** di bawah

**Catatan privasi KTP:**
- KTP berisi data sensitif (NIK, alamat, foto, agama) — termasuk **data pribadi spesifik** (UU PDP Pasal 4)
- Jangan simpan foto KTP di file proyek / chat / cloud publik
- Minta klien upload langsung ke registrar
- Kalau diamanahi upload: hapus file setelah verifikasi selesai

**Registrar yang support .my.id (terverifikasi 2026):**
- Rumahweb ✅ (proses verifikasi PANDI internal)
- Niagahoster ✅
- DomaiNesia ✅
- Cloudflare Registrar ❌ (gak support .my.id)

## Checklist Post-Registrasi Domain
Setelah domain aktif, WAJIB verifikasi semua ini sebelum lanjut build/deploy:

```
☐ Domain sudah aktif (whois → status: OK / serverHold)
☐ Data whois benar (nama, email, kontak)
☐ Auto-renew diaktifkan di registrar
☐ Nameserver diganti ke Cloudflare (armf.ns.cloudflare.com / jade.ns.cloudflare.com)
☐ Propagasi DNS selesai (cek via whatsmydns.net)
☐ Domain ditambahkan di Cloudflare Pages / Vercel
☐ SSL aktif (gembok hijau di browser)
☐ Redirect www → non-www (atau sebaliknya)
☐ Domain tercatat di file DOMAIN.md
```

⚠️ **PENTING:** Checklist ini jalan SETIAP KALI domain baru dibeli, bukan cuma diingat-ingat. Kalau ada yang terlewat, website klien bisa mati tanpa diketahui.

## DNS 2026
- Cloudflare DNS UX baru (Mei 2026): resizable columns, advanced filters (AND/OR), row pinning, mobile-friendly
- Tips: set Nameserver ke Cloudflare untuk menikmati CDN + DDoS protection gratis

## Prosedur Setup Domain

### Jika domain baru dibeli:
1. Klien beli domain via registrar
2. Klien ganti NS ke Cloudflare:
   - `armf.ns.cloudflare.com`
   - `jade.ns.cloudflare.com`
3. Kami setup DNS record di Cloudflare Dashboard

### Jika domain sudah aktif:
1. Minta akses panel domain ke klien
2. Ganti NS ke Cloudflare
3. Tunggu propagasi (5 menit - 24 jam)

## File Tracking Domain (simpan di `~/agensi/proyek/DOMAIN.md`)

```
# Daftar Domain Klien

| Domain | Klien | Registrar | Expiry | Biaya | Status |
|--------|-------|-----------|--------|-------|--------|
| akalcenter.my.id | Ahmad Katsiri | Rumahweb | Jun 2027 | Rp 35k/thn | ✅ Active |
| [domain] | [klien] | [reg] | [tgl] | Rp | ✅/⏳/❌ |
```

## Template Pesan Pengingat (H-30)

Kirim ke klien via WA:
```
Halo [Nama],
Domain [domain] akan expired dalam 30 hari (tgl [tanggal]).
Silakan perpanjang via [registrar] agar website tidak mati.
Biaya perpanjang: Rp [jumlah]/tahun.

Kalau butuh bantuan perpanjang, bilang ya.
```
