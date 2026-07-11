# 🚀 AKAL CENTER — VPS Deployment Prompt
> Copy seluruh isi ini ke terminal baru. Agent akan eksekusi semua.

---

## IDENTITAS PROJECT

```
Project:  AKAL Center — Platform Guru-Siswa + AI Document Generator
Domain:   https://akalcenter.my.id
Repo:     https://github.com/wimxwim/ahmad-katsiri-agung
Branch:   main
User:     root (sudo ready)
VPS:      Neo Lite XS 1.1 — 1 vCPU, 1 GB RAM, 60 GB SSD, West Java
```

## ARSITEKTUR

```
VPS 1 GB → Next.js (PM2, port 3000)
├── DB:       Supabase (external, PostgreSQL)
├── Storage:  ImageKit (external, PDF files)
├── Cache:    Upstash Redis (external)
└── AI:       NaraRouter (external, deepseek-v4-flash)
```

## TUGAS

Jalankan SEMUA phase 0 dan phase 1 dari TODO-MASTER.md. Urutan:

### 1. Clone repo
```bash
git clone https://github.com/wimxwim/ahmad-katsiri-agung.git /opt/akal-center
cd /opt/akal-center
```

### 2. Setup VPS (sekali jalan)
```bash
bash scripts/setup-vps.sh
```
Ini akan install: Node 22, PostgreSQL 16, Redis 7, Nginx, PM2, Certbot, swap 2GB, backup cron, logrotate.

### 3. Konfigurasi PostgreSQL
```sql
sudo -u postgres psql
ALTER USER akal PASSWORD 'PASSWORD_AMAN_KAMU';
```
Lalu update `/opt/akal-center/.env.production`:
```
DATABASE_URL=postgresql://akal:PASSWORD_AMAN_KAMU@localhost:5432/akalcenter
```

### 4. Isi .env.production
Copy dari `.env.production.example`, isi semua:
- DATABASE_URL (Supabase)
- AI_API_KEY (NaraRouter)
- IMAGEKIT_PRIVATE_KEY
- UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
- JWT_SECRET (64 char random)
- ENCRYPTION_SECRET (64 char random)
- CRON_SECRET (32 char random)
- RESEND_API_KEY
- NEXT_PUBLIC_SITE_URL=https://akalcenter.my.id

### 5. Deploy aplikasi
```bash
cd /opt/akal-center
bash scripts/deploy-vps.sh
```

### 6. DNS & SSL
```bash
# Point DNS A record akalcenter.my.id ke VPS IP (gray cloud di Cloudflare)
certbot --nginx -d akalcenter.my.id -d www.akalcenter.my.id
```

### 7. Test
```bash
curl https://akalcenter.my.id/api/health
curl -X POST https://akalcenter.my.id/api/readyz
```

### 8. Konfigurasi PM2 (sudah di ecosystem.config.cjs)
```
instances: 1
exec_mode: fork
max_memory_restart: 500M
```

### 9. Cron AI generate
Sudah terpasang di setup. Cron: `0 0 * * *` (jam 00:00 WIB).

### 10. Verifikasi akhir
- [ ] /api/health → semua services connected
- [ ] /api/readyz POST → AI response ok
- [ ] Upload PDF → extract text → generate → draft ready
- [ ] Login guru → dashboard guru
- [ ] Login siswa → dashboard siswa

---

## FILE PENTING

| File | Fungsi |
|------|--------|
| `/opt/akal-center/.env.production` | Environment variables |
| `/opt/akal-center/ecosystem.config.cjs` | PM2 config |
| `/opt/akal-center/scripts/setup-vps.sh` | Setup script |
| `/opt/akal-center/scripts/deploy-vps.sh` | Deploy script |
| `/opt/akal-center/scripts/cron-generate.sh` | Cron AI generate |
| `/opt/backup-db.sh` | Database backup |
| `/etc/nginx/sites-available/akalcenter` | Nginx config |
| `/etc/postgresql/16/main/postgresql.conf` | PostgreSQL config |

## DEBUG

```bash
# Cek PM2 status
pm2 status
pm2 logs akal-center

# Cek PostgreSQL
sudo -u postgres psql -c "SELECT count(*) FROM users;"

# Cek Redis
redis-cli ping

# Cek Nginx
nginx -t
systemctl status nginx

# Cek disk
df -h

# Cek RAM
free -h

# Restart app
pm2 restart akal-center

# Deploy ulang
cd /opt/akal-center && git pull && bash scripts/deploy-vps.sh
```

---

**Eksekusi sekarang. Laporkan setiap step selesai.**