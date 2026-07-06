---
name: project-estimator
description: Estimasi waktu & biaya proyek berdasarkan fitur yang diminta klien. Membantu menentukan tipe proyek (A/B/C/D) dan menghitung effort secara kasar sebelum membuat proposal.
metadata:
  author: Agensi
  version: "2.0"
  category: Bisnis
---

# PROJECT ESTIMATOR — Estimasi Waktu & Biaya

## Matriks Estimasi

### Tipe A — Website (Landing Page / Company Profile)
| Fitur | Effort |
|-------|--------|
| 1 halaman (hero, about, contact) | 1-2 hari |
| 3-5 halaman (home, about, services, contact) | 3-5 hari |
| + CMS (bisa edit konten sendiri) | +1 hari |
| + Blog sederhana | +1-2 hari |
| + Form kontak (WA notifikasi) | +0.5 hari |
| **Total estimasi** | **1-7 hari** |

### Tipe B — Toko / Katalog
| Fitur | Effort |
|-------|--------|
| Landing page + katalog produk (10-50 item) | 3-5 hari |
| + Kategori & filter | +1 hari |
| + Keranjang belanja | +2 hari |
| + Checkout (manual transfer) | +1 hari |
| + Midtrans payment gateway | +2 hari |
| + Admin panel (kelola produk, order) | +2 hari |
| **Total estimasi** | **3-10 hari** |

### Tipe C — Aplikasi Sederhana
| Fitur | Effort |
|-------|--------|
| Auth (login/register) | 1-2 hari |
| Database design & RLS | 1-2 hari |
| CRUD utama (3-5 tabel) | 3-5 hari |
| Dashboard/feed | 2-3 hari |
| Notifikasi | 1-2 hari |
| **Total estimasi** | **2-4 minggu** |

### Tipe D — Sistem Kompleks
| Fitur | Effort |
|-------|--------|
| Multi-tenant | 2-3 hari |
| Auth + roles + permissions | 2-3 hari |
| 10+ tabel dengan relasi | 5-7 hari |
| Real-time (WebSocket/DO) | 3-5 hari |
| File upload + storage | 1-2 hari |
| Payment integration | 2-3 hari |
| PWA offline | 2-3 hari |
| Admin dashboard | 3-5 hari |
| **Total estimasi** | **1-3 bulan** |

## Harga Minimum 2026
- Company Profile: Rp5-8jt
- Toko: Rp8-15jt
- Aplikasi: Rp15-50jt

## Biaya Bulanan
- Domain: ~Rp200rb/thn
- Hosting: gratis (Cloudflare Pages)
- SSL: gratis

## Cara Pakai
1. Tanya fitur yang diminta klien
2. Cocokkan ke matriks di atas
3. Hitung total effort
4. Konversi ke biaya (gunakan acuan harga di proposal-rupiah)
5. Masukkan ke proposal

## Contoh Perhitungan
```
Klien minta: landing page 3 halaman + blog + form WA
→ Tipe A
→ 3-5 hari (halaman) + 1-2 hari (blog) + 0.5 hari (form WA)
→ Estimasi: 5-7 hari
→ Harga acuan: Rp 1-1.5jt

Klien minta: toko online + Midtrans + admin panel
→ Tipe B
→ Landing 3-5 hari + filter 1 hari + keranjang 2 hari + Midtrans 2 hari + admin 2 hari
→ Estimasi: 10-14 hari
→ Harga acuan: Rp 2-3jt
```
