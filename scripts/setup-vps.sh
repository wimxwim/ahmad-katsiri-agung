#!/bin/bash
# ============================================================
# AKAL CENTER — VPS Setup Script (Ubuntu 22.04/24.04)
# Neo Lite XS 1.1: 1 vCPU, 1 GB RAM, 60 GB SSD
# Arsitektur: Next.js only — DB (Supabase), Redis (Upstash), Storage (ImageKit), AI (NaraRouter)
# Run as root: bash setup-vps.sh
# ============================================================
set -e

echo "🚀 AKAL Center VPS Setup"
echo "   Target: Neo Lite XS 1.1 (1 vCPU, 1 GB RAM, 60 GB SSD)"
echo "   Services: DB=Supabase, Redis=Upstash, Storage=ImageKit, AI=NaraRouter"
echo "========================="

# --- System Update ---
echo "📦 Updating system..."
apt update -y && apt upgrade -y

# --- Install Essentials ---
echo "📦 Installing essentials..."
apt install -y curl wget git build-essential nginx ufw fail2ban python3

# --- Node.js 22 ---
echo "📦 Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# --- PM2 ---
echo "📦 Installing PM2..."
npm install -g pm2

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
chown -R "$SUDO_USER:$SUDO_USER" /opt/akal-center

# --- Swap (2 GB — WAJIB untuk VPS 1 GB) ---
echo "💾 Creating swap (2 GB)..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "   Swap created."
else
  echo "   Swap already exists, skipping."
fi

# --- Nginx proxy ---
echo "⚙️ Configuring Nginx..."
cat > /etc/nginx/sites-available/akalcenter <<NGINX
server {
    listen 80;
    server_name akalcenter.my.id www.akalcenter.my.id;

    client_max_body_size 20M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;
    gzip_comp_level 6;

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    location /public {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000";
    }

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

        limit_req zone=akal_limit burst=20 nodelay;
    }
}
NGINX

cat > /etc/nginx/conf.d/akal-rate-limit.conf <<RATELIMIT
limit_req_zone \$binary_remote_addr zone=akal_limit:10m rate=60r/m;
RATELIMIT

ln -sf /etc/nginx/sites-available/akalcenter /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# --- PM2 startup ---
echo "⚙️ Configuring PM2 auto-start..."
pm2 startup systemd -u "$SUDO_USER" --hp "/home/$SUDO_USER"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$SUDO_USER" --hp "/home/$SUDO_USER"

# --- SSL Certbot (Let's Encrypt) ---
echo "🔒 Installing Certbot..."
apt install -y certbot python3-certbot-nginx
echo ""
echo "⚠️  After DNS is pointing to this VPS, run:"
echo "   certbot --nginx -d akalcenter.my.id -d www.akalcenter.my.id"

# --- Cron: AI generate jam 00:00 WIB ---
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
echo "1. Copy .env.production to /opt/akal-center/.env.production"
echo "2. Run: bash /opt/akal-center/scripts/deploy-vps.sh"
echo "3. Point DNS A record akalcenter.my.id → VPS IP (gray cloud / DNS only)"
echo "4. SSL: certbot --nginx -d akalcenter.my.id -d www.akalcenter.my.id"
echo ""
echo "🔍 Verify: curl https://akalcenter.my.id/api/health"