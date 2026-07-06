#!/bin/sh
set -e

echo "=== AKAL Center Entrypoint ==="

echo "⏳ Waiting for PostgreSQL (${PGHOST:-postgres}:${PGPORT:-5432})..."
until pg_isready -h "${PGHOST:-postgres}" -p "${PGPORT:-5432}" -U "${PGUSER:-akal}" -d "${PGDATABASE:-akal_center}" -t 3 2>/dev/null; do
  echo "   retrying..."
  sleep 2
done
echo "✓ PostgreSQL ready"

echo "📋 Running database migrations..."
export PGPASSWORD="${PGPASSWORD:-akaldev}"

psql -h "${PGHOST:-postgres}" -p "${PGPORT:-5432}" -U "${PGUSER:-akal}" -d "${PGDATABASE:-akal_center}" -c "
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  );
" -q

for f in /app/migrations/*.sql; do
  name=$(basename "$f")
  already=$(psql -h "${PGHOST:-postgres}" -p "${PGPORT:-5432}" -U "${PGUSER:-akal}" -d "${PGDATABASE:-akal_center}" -t -c "SELECT COUNT(*) FROM _migrations WHERE name = '$name';" | tr -d '[:space:]')
  if [ "$already" = "0" ]; then
    echo "   ▶ $name"
    psql -h "${PGHOST:-postgres}" -p "${PGPORT:-5432}" -U "${PGUSER:-akal}" -d "${PGDATABASE:-akal_center}" -f "$f" -v ON_ERROR_STOP=1 -q
    psql -h "${PGHOST:-postgres}" -p "${PGPORT:-5432}" -U "${PGUSER:-akal}" -d "${PGDATABASE:-akal_center}" -c "INSERT INTO _migrations (name) VALUES ('$name');" -q
  else
    echo "   ✓ $name (skipped)"
  fi
done

echo "✓ Migrations complete"
echo "🚀 Starting AKAL Center..."
exec node server.js
