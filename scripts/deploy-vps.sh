#!/bin/bash
# ============================================================
# AKAL CENTER — Deploy to VPS
# Run from local machine: bash scripts/deploy-vps.sh
# ============================================================
set -e

VPS_HOST="${VPS_HOST:-YOUR_VPS_IP}"
VPS_USER="${VPS_USER:-root}"
APP_DIR="/opt/akal-center"

echo "🚀 Deploying AKAL Center to VPS..."
echo "   Host: $VPS_USER@$VPS_HOST"
echo ""

# --- Build locally ---
echo "📦 Building..."
npm run build 2>&1 | tail -3

# --- Copy files to VPS ---
echo "📤 Copying files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next/cache' \
  --exclude 'content' \
  --exclude 'workers' \
  --exclude 'prd' \
  --exclude '.env.local' \
  --exclude '.env' \
  .next/ \
  package.json \
  package-lock.json \
  next.config.ts \
  public/ \
  "$VPS_USER@$VPS_HOST:$APP_DIR/"

# --- Install dependencies on VPS ---
echo "📦 Installing dependencies..."
ssh "$VPS_USER@$VPS_HOST" "cd $APP_DIR && npm ci --omit=dev"

# --- Run database migrations ---
echo "🗄️ Running migrations..."
ssh "$VPS_USER@$VPS_HOST" "cd $APP_DIR && npx drizzle-kit push --config=drizzle.config.ts"

# --- Restart app ---
echo "🔄 Restarting app..."
ssh "$VPS_USER@$VPS_HOST" "cd $APP_DIR && pm2 delete akal-center 2>/dev/null; pm2 start npm --name akal-center -- start -- --port 3000 && pm2 save"

echo ""
echo "✅ Deploy complete!"
echo "   Check: curl http://$VPS_HOST:3000/api/health"