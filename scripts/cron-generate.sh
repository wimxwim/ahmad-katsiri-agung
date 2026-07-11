#!/bin/bash
# ============================================================
# AKAL Center — Cron: Generate AI malam (jam 00:00 WIB)
# ============================================================
# Pastikan CRON_SECRET di .env.production sudah disetel
# Jalankan manual: bash /opt/akal-center/scripts/cron-generate.sh
# ============================================================

SITE_URL="${SITE_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-akal-cron-secret}"

echo "[$(date)] Starting batch AI generation..."
RESPONSE=$(curl -s -X POST "$SITE_URL/api/v1/cron/generate" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -m 1800)

echo "[$(date)] Response: $RESPONSE"

PROCESSED=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('processed',0))" 2>/dev/null || echo "?")
echo "[$(date)] Done. Processed: $PROCESSED generations."