# AKAL Center — Deployment Guide (VPS)

> **Prinsip:** VPS kosong → `git clone` → `make up` → live.

## Prasyarat VPS

- Linux Ubuntu 24.04
- Minimal 2 vCPU, 4GB RAM, 60GB SSD
- IP publik statis
- Port 80 & 443 terbuka
- Domain: `akalcenter.my.id` di Cloudflare (proxied orange cloud)
- DNS record `origin.akalcenter.my.id` → VPS IP (DNS only, grey cloud)

## Setup Awal (1x saja)

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone & Konfigurasi

```bash
git clone https://github.com/wimxwim/ahmad-katsiri-agung.git /opt/akal-center
cd /opt/akal-center

cp .env.production.example .env.production
nano .env.production
```

**Yang WAJIB diisi:**
| Variabel | Keterangan |
|----------|------------|
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Service account Google Sheets |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Private key service account |
| `GOOGLE_SHEET_ID` | ID Google Sheet |
| `TELEGRAM_BOT_TOKEN` | Token Bot Telegram |
| `TELEGRAM_CHAT_ID` | Chat ID Telegram |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `ADMIN_API_KEY` | Generate: `openssl rand -hex 16` |
| `GURU_PASSWORD` | Password halaman guru |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App Client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App Client Secret |
| `KEYSTATIC_SECRET` | Generate: `openssl rand -hex 32` |
| `ENCRYPTION_SECRET` | Generate: `openssl rand -hex 32` |

### 3. Deploy

```bash
make up
```

Tunggu build (3-5 menit pertama), lalu cek:

```bash
make logs
make status
```

### 4. Test

```bash
# Cek health endpoint
curl http://localhost:3000/api/health

# Test dari luar (setelah DNS propagated)
curl https://origin.akalcenter.my.id/api/health
```

## Update Aplikasi

```bash
cd /opt/akal-center
git pull
make up
```

## Troubleshooting

### Build gagal "node: not found"
```bash
# Cek Docker terinstall
docker --version
```

### Aplikasi 502 Bad Gateway
```bash
# Cek log
make logs-app

# Cek status
make status
```

### Database tidak konek
```bash
# Cek PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U akal

# Reset database (HATI-HATI — hapus semua data)
make clean
make up
```

### Restart app saja
```bash
make restart
```

## Arsitektur

```
akalcenter.my.id (Cloudflare, proxied)
    │
    ▼
Cloudflare Worker (cache, rate-limit)
    │
    ▼ HTTPS
origin.akalcenter.my.id (DNS only)
    │
    ▼
VPS: CADDY :80/:443
    │
    ▼
app:3000 (Next.js standalone)
    ├── postgres:5432
    └── redis:6379
```

## File Penting

| File | Fungsi |
|------|--------|
| `docker-compose.prod.yml` | Orkestrasi semua service |
| `Dockerfile` | Build image Next.js |
| `infrastructure/Caddyfile` | Reverse proxy config |
| `scripts/prod-entrypoint.sh` | Migrasi DB + start app |
| `.env.production` | Environment variables (GITIGNORED) |
| `Makefile` | Shortcut commands |

## Backup

```bash
# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U akal akal_center > akal_backup_$(date +%Y%m%d).sql

# Restore
docker compose -f docker-compose.prod.yml exec -T postgres psql -U akal akal_center < akal_backup_20260101.sql
```
