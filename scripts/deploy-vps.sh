#!/bin/bash
# ============================================================
# AKAL CENTER — Deploy to VPS
# Run from LOCAL machine: VPS_HOST=1.2.3.4 bash scripts/deploy-vps.sh
# ============================================================
set -e

VPS_HOST="${VPS_HOST:?Set VPS_HOST env var (VPS IP)}"
VPS_USER="${VPS_USER:-root}"
APP_DIR="/opt/akal-center"

echo "🚀 Deploying AKAL Center to VPS..."
echo "   Host: $VPS_USER@$VPS_HOST"
echo ""

# --- Build locally ---
echo "📦 Building..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build 2>&1 | tail -5
echo ""

# --- Copy .env.production (kalau belum ada di VPS) ---
echo "📤 Copying .env.production..."
if [ -f .env.production ]; then
  scp .env.production "$VPS_USER@$VPS_HOST:$APP_DIR/.env.production"
  ssh "$VPS_USER@$VPS_HOST" "chmod 600 $APP_DIR/.env.production"
  echo "   .env.production copied."
else
  echo "   ⚠️  .env.production not found locally. Skipping."
  echo "   Make sure .env.production exists on VPS at $APP_DIR/.env.production"
fi

# --- Copy build artifacts to VPS ---
echo "📤 Copying build artifacts..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next/cache' \
  --exclude 'content' \
  --exclude 'workers' \
  --exclude 'prd' \
  --exclude '.env.local' \
  --exclude '.env' \
  --exclude '.env.production' \
  .next/ \
  package.json \
  package-lock.json \
  next.config.ts \
  drizzle.config.ts \
  public/ \
  scripts/ \
  ecosystem.config.cjs \
  "$VPS_USER@$VPS_HOST:$APP_DIR/"

# --- Install dependencies on VPS ---
echo "📦 Installing dependencies..."
ssh "$VPS_USER@$VPS_HOST" "cd $APP_DIR && npm ci --omit=dev"

echo ""
echo "✅ Deploy complete!"
echo ""
echo "Next steps on VPS:"
echo "  ssh $VPS_USER@$VPS_HOST"
echo "  cd $APP_DIR"
echo "  pm2 start ecosystem.config.cjs"
echo "  pm2 save"
echo ""
echo "  curl http://localhost:3000/api/health"