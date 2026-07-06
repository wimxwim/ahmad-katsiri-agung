---
name: github-repo-browser-act
description: Manage GitHub repositories (create, delete) using browser-act chrome-direct on the user's running Chrome browser. Use when the user requests GitHub repo operations via browser automation.
---

# GitHub Repo Manager — browser-act

> Skill untuk mengelola repository GitHub (membuat, menghapus) menggunakan
> browser-act dalam mode **chrome-direct** (mengontrol Chrome yang sudah
> berjalan di desktop user).

---

## Prasyarat

Sebelum menggunakan perintah di skill ini, **WAJIB** load skill browser-act core:

```bash
browser-act get-skills core --skill-version 2.0.0
```

**Browser ID:** `direct_local_98029589927821382` — koneksi langsung ke Chrome
yang sedang berjalan di desktop user (chrome-kontrol).

**Session naming convention:** `gh-<aksi>-<inisial>` (contoh: `gh-create-x`, `gh-delete-x`).

---

## 1. Membuat Repository Baru

### Langkah 1 — Buka Halaman New Repo

```bash
browser-act --session gh-create-1 browser open direct_local_98029589927821382 "https://github.com/new"
```

Tunggu hingga halaman selesai load:

```bash
browser-act --session gh-create-1 wait stable
```

### Langkah 2 — Isi Nama Repository

Cek elemen yang tersedia untuk menemukan index input:

```bash
browser-act --session gh-create-1 state
```

Cari input field "Repository name" dari output state, lalu isi:

```bash
browser-act --session gh-create-1 input <INDEX_NAMA> "nama-repo"
```

Ganti `<INDEX_NAMA>` dengan index yang sesuai dari output `state`.

### Langkah 3 — Isi Deskripsi (Opsional)

```bash
browser-act --session gh-create-1 input <INDEX_DESKRIPSI> "Deskripsi repo"
```

### Langkah 4 — Pilih Visibility

Jika perlu repo **Private**, cari radio button "Private" dari output `state`
lalu klik:

```bash
browser-act --session gh-create-1 click <INDEX_PRIVATE>
```

### Langkah 5 — Klik Tombol Create

```bash
browser-act --session gh-create-1 click <INDEX_CREATE>
```

### Langkah 6 — Verifikasi

```bash
browser-act --session gh-create-1 get title
```

Pastikan title berubah menjadi halaman repo yang baru dibuat (bukan `/new`).

### Langkah 7 — Tutup Session

```bash
browser-act session close gh-create-1
```

---

## 2. Menghapus Repository

> **PENTING:** Flow ini melibatkan **sudo mode** (Confirm access) yang
> mengirim kode verifikasi 8-digit ke email user.

### Langkah 1 — Buka Halaman Settings Repo

```bash
browser-act --session gh-delete-1 browser open direct_local_98029589927821382 "https://github.com/<OWNER>/<REPO>/settings"
```

Tunggu load:

```bash
browser-act --session gh-delete-1 wait stable
```

### Langkah 2 — Scroll ke Danger Zone

```bash
browser-act --session gh-delete-1 scroll down --amount 800
```

Cek apakah "Danger Zone" sudah terlihat:

```bash
browser-act --session gh-delete-1 state
```

Jika belum, scroll lagi:

```bash
browser-act --session gh-delete-1 scroll down --amount 400
```

### Langkah 3 — Klik "Delete this repository"

Cari tombol "Delete this repository" dari output `state`, lalu klik:

```bash
browser-act --session gh-delete-1 click <INDEX_DELETE_BUTTON>
```

### Langkah 4 — Konfirmasi Modal Pertama

Akan muncul modal konfirmasi. Cari input "To verify, type..." lalu isi
dengan nama repo:

```bash
browser-act --session gh-delete-1 input <INDEX_KONFIRMASI> "<NAMA_REPO>"
```

Lalu klik tombol "I have read and understand..." atau "Delete this repository":

```bash
browser-act --session gh-delete-1 click <INDEX_KONFIRMASI_DELETE>
```

### Langkah 5 — Sudo Mode: Confirm Access

GitHub akan meminta **Confirm access** (sudo mode). Ada dua opsi:

**Opsi A — Verify via email (recommended):**

Cari link/tombol "Verify via email" dari output `state`, lalu klik:

```bash
browser-act --session gh-delete-1 click <INDEX_VERIFY_EMAIL>
```

Tunggu email masuk. **Minta user memberikan kode 8-digit** dari email.
Setelah user memberikan kode:

```bash
browser-act --session gh-delete-1 input <INDEX_KODE> "12345678"
browser-act --session gh-delete-1 click <INDEX_VERIFY_BUTTON>
```

**Opsi B — Gunakan password langsung** (jika opsi A tidak muncul):

```bash
browser-act --session gh-delete-1 input <INDEX_PASSWORD> "<PASSWORD_USER>"
browser-act --session gh-delete-1 click <INDEX_CONFIRM>
```

### Langkah 6 — Verifikasi

Cek title untuk memastikan sudah tidak berada di halaman repo:

```bash
browser-act --session gh-delete-1 get title
```

### Langkah 7 — Tutup Session

```bash
browser-act session close gh-delete-1
```

---

## Ringkasan Perintah browser-act

| Perintah | Fungsi |
|----------|--------|
| `browser-act --session <name> browser open direct_local_98029589927821382 <url>` | Buka URL di Chrome yang sedang berjalan |
| `browser-act --session <name> state` | Lihat elemen yang tersedia di halaman |
| `browser-act --session <name> input <index> "text"` | Isi text field |
| `browser-act --session <name> click <index>` | Klik tombol/link |
| `browser-act --session <name> scroll down --amount <px>` | Scroll halaman ke bawah |
| `browser-act --session <name> get title` | Cek judul halaman saat ini |
| `browser-act --session <name> wait stable` | Tunggu hingga halaman selesai load |
| `browser-act session close <name>` | Tutup sesi browser-act |

---

## Catatan Penting

1. **Index elemen** berubah setiap kali halaman dirender. Selalu jalankan
   `state` untuk mendapatkan index terkini sebelum `input` atau `click`.
2. **Sudo mode** (Confirm access) adalah gatekeeper GitHub untuk aksi
   sensitif (delete repo, change email, dll). Kode 8-digit dikirim via
   email — minta user membuka email dan memberikan kode.
3. Jika `state` tidak menampilkan elemen yang dicari, coba `scroll down`
   dulu atau tunggu lebih lama dengan `wait stable`.
4. Git sensitif dengan typo di nama repo. Pastikan nama repo yang diketik
   sudah benar sebelum menekan Create.
