#!/bin/bash
# ============================================================
# AKAL CENTER — VPS Setup Script (Ubuntu 22.04/24.04)
# Neo Lite MS 4.4: 4 vCPU, 4 GB RAM, 60 GB SSD
# Run as root: bash setup-vps.sh
# ============================================================
set -e

echo "🚀 AKAL Center VPS Setup"
echo "========================="

# --- System Update ---
echo "📦 Updating system..."
apt update -y && apt upgrade -y

# --- Install Essentials ---
echo "📦 Installing essentials..."
apt install -y curl wget git build-essential nginx ufw fail2ban

# --- Node.js 22 ---
echo "📦 Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# --- PostgreSQL 16 ---
echo "📦 Installing PostgreSQL 16..."
apt install -y postgresql postgresql-contrib

# --- Redis ---
echo "📦 Installing Redis..."
apt install -y redis-server

# --- PM2 ---
echo "📦 Installing PM2..."
npm install -g pm2

# --- Configure PostgreSQL ---
echo "⚙️ Configuring PostgreSQL..."
sudo -u postgres psql <<SQL
CREATE USER akal WITH PASSWORD 'AKAL_DB_PASSWORD_CHANGE_ME';
CREATE DATABASE akalcenter OWNER akal;
ALTER USER akal CREATEDB;
\c akalcenter
GRANT ALL ON SCHEMA public TO akal;
SQL

# Optimize for 2GB RAM
cat >> /etc/postgresql/16/main/postgresql.conf <<CONF

# --- AKAL Center Optimizations (2GB RAM) ---
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
work_mem = 16MB
max_connections = 50
random_page_cost = 1.1
CONF

systemctl restart postgresql

# --- Configure Redis ---
echo "⚙️ Configuring Redis..."
cat > /etc/redis/redis.conf <<REDIS
port 6379
bind 127.0.0.1
maxmemory 150mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
appendonly yes
REDIS

systemctl restart redis-server

# --- Configure UFW ---
echo "🛡️ Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# --- Configure fail2ban ---
systemctl enable fail2ban
systemctl start fail2ban

# --- Create app directory ---
echo "📁 Creating app directory..."
mkdir -p /opt/akal-center
chown -R $SUDO_USER:$SUDO_USER /opt/akal-center

# --- Swap (2GB - WAJIB untuk VPS 2GB) ---
echo "💾 Creating swap (2GB)..."
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# --- Nginx proxy ---
echo "⚙️ Configuring Nginx..."
cat > /etc/nginx/sites-available/akalcenter <<NGINX
server {
    listen 80;
    server_name akalcenter.my.id www.akalcenter.my.id;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 10s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/akalcenter /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# --- PM2 startup ---
echo "⚙️ Configuring PM2 auto-start..."
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
env PATH=$PATH:/usr/bin pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

# --- SSL Certbot (Let's Encrypt) ---
echo "🔒 Installing Certbot..."
apt install -y certbot python3-certbot-nginx
echo ""
echo "⚠️  After DNS is pointing to this VPS, run:"
echo "   certbot --nginx -d akalcenter.my.id -d www.akalcenter.my.id"

# --- PostgreSQL Backup Script ---
echo "💾 Creating backup script..."
cat > /opt/backup-db.sh <<'BACKUP'
#!/bin/bash
BACKUP_DIR="/opt/backups"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/akalcenter_$DATE.sql.gz"
sudo -u postgres pg_dump akalcenter | gzip > "$FILE"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
echo "Backup: $FILE"
BACKUP

chmod +x /opt/backup-db.sh

# Cron: backup setiap jam 2 pagi
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-db.sh >> /var/log/akal-backup.log 2>&1") | crontab -

# Cron: AI generate jam 00:00 WIB
(crontab -l 2>/dev/null; echo "0 0 * * * source /opt/akal-center/.env.production && bash /opt/akal-center/scripts/cron-generate.sh >> /var/log/akal-cron.log 2>&1") | crontab -

# --- Logrotate ---
echo "📋 Configuring logrotate..."
cat > /etc/logrotate.d/akal-center <<LOGROTATE
/var/log/akal-*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
LOGROTATE

echo ""
echo "✅ SETUP COMPLETE!"
echo "========================="
echo "Next steps:"
echo "1. Set DB password: ALTER USER akal PASSWORD 'your-secure-password';"
echo "2. Copy .env.production to /opt/akal-center/.env.production"
echo "3. Run: bash scripts/deploy-vps.sh"
echo "4. Point DNS A record to this VPS IP (disable Cloudflare proxy)"
echo "5. SSL: certbot --nginx -d akalcenter.my.id -d www.akalcenter.my.id"
echo ""
echo "⚠️  CHANGE THE DATABASE PASSWORD NOW:"
echo "   sudo -u postgres psql -c \"ALTER USER akal PASSWORD 'YOUR_SECURE_PASSWORD';\""