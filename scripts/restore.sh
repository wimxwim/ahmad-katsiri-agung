#!/bin/sh
set -e

BACKUP_ROOT="/backups"
BACKUP_PASSPHRASE="${BACKUP_PASSPHRASE:-}"
export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-akal}"
export PGDATABASE="${PGDATABASE:-akal_center}"
export PGPASSWORD="${PGPASSWORD:?PGPASSWORD wajib diset}"
MIGRATIONS_DIR="/app/migrations"
TEMP_DIR=""

cleanup() {
  if [ -n "${TEMP_DIR}" ] && [ -d "${TEMP_DIR}" ]; then
    rm -rf "${TEMP_DIR}"
  fi
}
trap cleanup EXIT

log() {
  echo "[$(date +%H:%M:%S)] $1"
}

log "🔓 AKAL Center — Restore"

echo ""
echo "Available backups:"
echo "=================="

BACKUPS=""
n=1
for d in $(ls -1dt "${BACKUP_ROOT}"/akal-center-* 2>/dev/null); do
  if [ -f "${d}/.complete" ]; then
    SIZE=$(du -sh "$d" 2>/dev/null | cut -f1)
    echo "  ${n}) $(basename "$d")  (${SIZE})"
    BACKUPS="${BACKUPS} ${d}"
    n=$((n + 1))
  fi
done

if [ -z "${BACKUPS}" ]; then
  echo "  ❌ No complete backups found in ${BACKUP_ROOT}"
  exit 1
fi

MAX=$((n - 1))
echo ""
printf "Select backup number [1-%d]: " "${MAX}"
read -r CHOICE

SELECTED=""
idx=1
for d in ${BACKUPS}; do
  if [ "${idx}" -eq "${CHOICE}" ] 2>/dev/null; then
    SELECTED="${d}"
    break
  fi
  idx=$((idx + 1))
done

if [ -z "${SELECTED}" ]; then
  log "❌ Invalid selection: ${CHOICE}"
  exit 1
fi

log "📂 Selected: $(basename "${SELECTED}")"

echo ""
echo "⚠️  This will DESTROY the current '${PGDATABASE}' database."
printf "Type YES to confirm: "
read -r CONFIRM

if [ "${CONFIRM}" != "YES" ]; then
  log "🚫 Restore cancelled"
  exit 0
fi

WAS_RUNNING=false
if docker compose ps app 2>/dev/null | grep -q "Up"; then
  log "⏸️  Stopping app service..."
  docker compose stop app 2>/dev/null || true
  WAS_RUNNING=true
fi

RESTORE_DIR="${SELECTED}"
if ls "${SELECTED}"/*.enc >/dev/null 2>&1; then
  if [ -z "${BACKUP_PASSPHRASE}" ]; then
    log "❌ Backup is encrypted but BACKUP_PASSPHRASE is not set"
    exit 1
  fi
  TEMP_DIR="${BACKUP_ROOT}/.restore-tmp-$$"
  mkdir -p "${TEMP_DIR}"
  log "🔓 Decrypting backup..."
  for f in "${SELECTED}"/*.enc; do
    fname="$(basename "$f" .enc)"
    openssl aes-256-cbc -pbkdf2 -iter 100000 -salt -d \
      -in "$f" \
      -out "${TEMP_DIR}/${fname}" \
      -pass "pass:${BACKUP_PASSPHRASE}"
    log "   ✓ $(basename "$f") → ${fname}"
  done
  RESTORE_DIR="${TEMP_DIR}"
fi

DUMP_FILE="${RESTORE_DIR}/database.dump"
if [ ! -f "${DUMP_FILE}" ]; then
  log "❌ No database.dump found in backup"
  exit 1
fi

log "🗑️  Dropping database ${PGDATABASE}..."
psql \
  --host="${PGHOST}" \
  --port="${PGPORT}" \
  --username="${PGUSER}" \
  --dbname="postgres" \
  -c "DROP DATABASE IF EXISTS \"${PGDATABASE}\";" \
  -q 2>/dev/null || true

log "🆕 Creating database ${PGDATABASE}..."
psql \
  --host="${PGHOST}" \
  --port="${PGPORT}" \
  --username="${PGUSER}" \
  --dbname="postgres" \
  -c "CREATE DATABASE \"${PGDATABASE}\";" \
  -q

log "📥 Restoring database from dump..."
pg_restore \
  --host="${PGHOST}" \
  --port="${PGPORT}" \
  --username="${PGUSER}" \
  --dbname="${PGDATABASE}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "${DUMP_FILE}"
log "   ✓ Database restored"

for a in "${RESTORE_DIR}"/keystatic-content.tar.gz; do
  if [ -f "$a" ]; then
    log "📦 Restoring Keystatic content..."
    tar -xzf "$a" -C /
    log "   ✓ Keystatic content restored"
  fi
done

log "📋 Running database migrations..."
if [ -d "${MIGRATIONS_DIR}" ]; then
  for f in "${MIGRATIONS_DIR}"/*.sql; do
    name="$(basename "$f")"
    log "   ▶ ${name}"
    psql \
      --host="${PGHOST}" \
      --port="${PGPORT}" \
      --username="${PGUSER}" \
      --dbname="${PGDATABASE}" \
      -f "$f" \
      -v ON_ERROR_STOP=1 \
      -q
  done
  log "   ✓ Migrations complete"
else
  log "   ℹ️  No migrations directory at ${MIGRATIONS_DIR}, skipping"
fi

if [ "${WAS_RUNNING}" = true ]; then
  log "▶️  Starting app service..."
  docker compose start app 2>/dev/null || true
fi

log "✅ Restore complete!"
