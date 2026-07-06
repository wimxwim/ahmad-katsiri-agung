---
name: hermes-update-guide
description: Panduan untuk memperbarui Hermes Agent di lingkungan yang dikelola secara eksternal (PEP 668). Mencakup solusi menggunakan `pipx`, virtual environment, dan alternatif lainnya.
trigger:
  - "update hermes"
  - "upgrade hermes"
  - "hermes update"
  - "bagaimana cara memperbarui hermes"
  - "PEP 668 hermes"
  - "pip install hermes-agent gagal"
  - "externally managed environment"
author: Hermes Agent
version: 1.0.0
---

# Hermes Update Guide

## Deskripsi
Skill ini memberikan panduan untuk memperbarui **Hermes Agent** di lingkungan yang dikelola secara eksternal (PEP 668). Ini mencakup solusi untuk mengatasi kendala seperti:
- Direktori instalasi bukan repositori Git.
- Lingkungan Python yang dikelola oleh sistem (misalnya Ubuntu/Debian dengan PEP 668).


## Langkah-Langkah Memperbarui Hermes Agent

### 1. Gunakan `pipx` (Direkomendasikan)
Jika `pipx` sudah terinstal, jalankan:
```bash
pipx upgrade hermes-agent
```

Jika `pipx` belum terinstal:
```bash
sudo apt update && sudo apt install pipx
pipx ensurepath
pipx install hermes-agent
```


### 2. Gunakan Virtual Environment
1. Buat virtual environment:
   ```bash
   python3 -m venv ~/.hermes-venv
   ```
2. Aktifkan virtual environment:
   ```bash
   source ~/.hermes-venv/bin/activate
   ```
3. Perbarui Hermes Agent:
   ```bash
   pip install --upgrade hermes-agent
   ```
4. Jalankan Hermes Agent dari virtual environment:
   ```bash
   ~/.hermes-venv/bin/hermes run
   ```


### 3. Gunakan `--break-system-packages` (Tidak Direkomendasikan)
Jika kamu yakin ingin mengabaikan peringatan sistem, jalankan:
```bash
pip install --upgrade hermes-agent --break-system-packages
```
⚠️ **Peringatan**: Metode ini dapat merusak dependensi sistem Python.


## Pitfalls
- **Direktori `~/.hermes` bukan repositori Git**: Jika Hermes Agent diinstal melalui `pip` atau binary, gunakan `pipx` atau virtual environment untuk memperbarui.
- **Lingkungan Python yang dikelola secara eksternal (PEP 668)**: Gunakan `pipx` atau virtual environment untuk menghindari konflik dengan dependensi sistem.
- **Jangan gunakan `--break-system-packages` kecuali benar-benar diperlukan**: Metode ini dapat merusak dependensi sistem.


## Referensi
- [Contoh Kasus: Pembaruan Hermes Agent di Lingkungan PEP 668](references/pep668-update-example.md)
- [Dokumentasi PEP 668](https://peps.python.org/pep-0668/)