#!/bin/sh
set -e

BACKUP_ROOT="/backups"
BACKUP_PASSPHRASE="${BACKUP_PASSPHRASE:-}"
export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-akal}"
export PGDATABASE="${PGDATABASE:-akal_center}"
export PGPASSWORD="${PGPASSWORD:?PGPASSWORD wajib diset}"
CONTENT_DIR="/app/content"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/akal-center-${TIMESTAMP}"

cleanup() {
  if [ -d "${BACKUP_DIR}" ] && [ ! -f "${BACKUP_DIR}/.complete" ]; then
    echo "🧹 Cleaning up incomplete backup: ${BACKUP_DIR}"
    rm -rf "${BACKUP_DIR}"
  fi
}
trap cleanup EXIT

log() {
  echo "[$(date +%H:%M:%S)] $1"
}

log "🔒 AKAL Center — Backup started"
log "📋 Target: ${PGHOST}:${PGPORT}/${PGDATABASE} as ${PGUSER}"

mkdir -p "${BACKUP_ROOT}"
mkdir -p "${BACKUP_DIR}"
log "📁 Backup directory: ${BACKUP_DIR}"

log "💾 Dumping PostgreSQL database..."
DUMP_FILE="${BACKUP_DIR}/database.dump"
pg_dump \
  --host="${PGHOST}" \
  --port="${PGPORT}" \
  --username="${PGUSER}" \
  --dbname="${PGDATABASE}" \
  --clean \
  --if-exists \
  --format=custom \
  --file="${DUMP_FILE}"
log "   ✓ ${DUMP_FILE} ($(du -h "${DUMP_FILE}" | cut -f1))"

if [ -d "${CONTENT_DIR}" ]; then
  log "📦 Archiving Keystatic content..."
  ARCHIVE_FILE="${BACKUP_DIR}/keystatic-content.tar.gz"
  tar -czf "${ARCHIVE_FILE}" \
    -C "$(dirname "${CONTENT_DIR}")" \
    "$(basename "${CONTENT_DIR}")"
  log "   ✓ ${ARCHIVE_FILE} ($(du -h "${ARCHIVE_FILE}" | cut -f1))"
else
  log "ℹ️  Keystatic content not found at ${CONTENT_DIR}, skipping"
fi

if [ -n "${BACKUP_PASSPHRASE}" ]; then
  log "🔐 Encrypting backup..."
  for f in "${BACKUP_DIR}"/*; do
    fname="$(basename "$f")"
    if [ "${fname}" != ".complete" ]; then
      openssl aes-256-cbc -pbkdf2 -iter 100000 -salt \
        -in "$f" \
        -out "${f}.enc" \
        -pass "pass:${BACKUP_PASSPHRASE}"
      rm "$f"
      log "   ✓ ${fname} → ${fname}.enc"
    fi
  done
else
  log "⚠️  BACKUP_PASSPHRASE not set — skipping encryption"
fi

touch "${BACKUP_DIR}/.complete"
trap - EXIT

log "🧹 Rotating old backups (keeping last 7)..."
BACKUP_COUNT=$(ls -1d "${BACKUP_ROOT}"/akal-center-* 2>/dev/null | wc -l)
if [ "${BACKUP_COUNT}" -gt 7 ]; then
  ls -1dt "${BACKUP_ROOT}"/akal-center-* | tail -n +8 | while read -r old; do
    log "   🗑️  Removing: $(basename "${old}")"
    rm -rf "${old}"
  done
fi

log "✅ Backup complete: ${BACKUP_DIR}"
