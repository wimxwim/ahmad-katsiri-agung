---
name: backup-automation
description: Strategi backup otomatis database Supabase dan file storage untuk website klien. Mencakup cron job, Supabase CLI dump, dan penyimpanan ke Cloudflare R2 atau GitHub.
metadata:
  author: Agensi
  version: "2.0"
  category: Layanan
---

# BACKUP AUTOMATION — Backup Database & File

## Prinsip Dasar: 3-2-1 Rule
- 3 salinan data
- 2 media berbeda (HDD, cloud, dll)
- 1 salinan offsite (beda lokasi fisik)

## Backup Database Supabase

### Metode 1: Supabase CLI (recommended)
```bash
# Dump semua tabel + data
npx supabase db dump --db-url "$DATABASE_URL" > backup_$(date +%Y%m%d).sql

# Dump schema only
npx supabase db dump --schema-only --db-url "$DATABASE_URL" > schema.sql
```

### Metode 2: pg_dump langsung
```bash
pg_dump --dbname="$DATABASE_URL" --format=custom > backup_$(date +%Y%m%d).dump
```

### Metode 3: GitHub Actions (otomatis mingguan)
```yaml
# .github/workflows/backup.yml
name: Database Backup
on:
  schedule:
    - cron: "0 2 * * 0" # Setiap Minggu jam 2 pagi
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          pg_dump --dbname="${{ secrets.DATABASE_URL }}" \
            --format=custom \
            --file=backup_$(date +%Y%m%d).dump
      - uses: actions/upload-artifact@v4
        with:
          name: db-backup-$(date +%Y%m%d)
          path: backup_*.dump
```

## Backup Storage (File Uploads)

### Supabase Storage → Cloudflare R2 (gratis)
```bash
# Install rclone
# Config: S3-compatible (R2)
rclone sync supabase-storage: r2:backup-bucket/ --progress
```

### Alternatif: Download manual via Dashboard
1. Buka Supabase Dashboard → Storage
2. Pilih bucket → Download semua file

## Backup via R2 (Destinasi Murah)
- Cloudflare R2: free 10GB, zero egress fee, S3-compatible
- Cocok untuk backup database dump dan file storage
- Bisa di-sync dari GitHub Actions via rclone atau AWS CLI (S3-compatible endpoint)

## Git Backup (Redundancy Source Code)
- Push ke GitHub + GitLab (mirror) untuk redundancy
- Pastikan .gitignore tidak meng-commit file .env atau secret
- Backup otomatis via GitHub Actions tiap minggu

## Rotation Policy
| Jenis | Frekuensi | Retensi | Lokasi |
|-------|-----------|---------|--------|
| DB full | Mingguan | 1 bulan | GitHub Artifacts |
| DB schema | Per migrasi | Selamanya | Git tracked |
| File storage | Bulanan | 3 bulan | Cloudflare R2 |

## Restore Prosedur
```bash
# Restore database dari dump
psql --dburl="$DATABASE_URL" < backup_20260601.sql

# Atau via Supabase CLI
npx supabase db restore --db-url "$DATABASE_URL" backup_20260601.sql
```

## Catatan 2026
- Supabase backup: database via CLI (`supabase db dump`), storage via R2 sync
- Jangan andalkan backup Supabase Dashboard saja — selalu punya salinan offsite

## Cara Pakai
1. Panggil: `gunakan skills backup-automation`
2. Tentukan proyek mana yang perlu backup
3. Setup cron / GitHub Actions
4. Uji restore sekali untuk verifikasi
