#!/bin/bash
# ============================================================
# input-materi.sh — Input materi AKAL Center
# INTERAKTIF | Drop Zone | Batch | Pilih Guru | Kelas 7/8/9
# ============================================================
#   ./scripts/input-materi.sh              → Menu interaktif
#   ./scripts/input-materi.sh file.pdf     → Langsung (pakai guru terakhir)
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/.env.local"
DROPZONE="$HOME/Materi-Akal"
SESI_FILE="$HOME/.input-materi-guru"

# ── Warna ──
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'
B='\033[0;34m'; C='\033[0;36m'; N='\033[0m'

log()   { echo -e "${G}[✓]${N} $1"; }
warn()  { echo -e "${Y}[!]${N} $1"; }
err()   { echo -e "${R}[✗]${N} $1"; }
info()  { echo -e "${C}[i]${N} $1"; }
header() { echo -e "\n${B}╔══════════════════════════════════════════════╗${N}"
           echo -e "${B}║    AKAL Center — Input Materi             ║${N}"
           echo -e "${B}╚══════════════════════════════════════════════╝${N}\n"; }

# ── Validasi ──
valid_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    err "File .env.local tidak ditemukan di $PROJECT_DIR"
    echo "  Buat file .env.local dengan DATABASE_URL dan AI_API_KEY"
    return 1
  fi
  return 0
}

# ── Ambil daftar guru dari DB via TS script ──
ambildaftarguru() {
  cd "$PROJECT_DIR"
  npx tsx scripts/input-materi.ts --list-guru 2>/dev/null
}

# ── Pilih guru ──
pilih_guru() {
  clear
  header
  info "Mengambil daftar guru dari database..."
  echo ""

  local json
  json=$(ambildaftarguru) || {
    err "Gagal ambil daftar guru. Cek koneksi database."
    echo ""
    info "Alternatif: input langsung --guru-id atau --guru-email"
    read -rp "  Masukkan ID guru: " manual_id </dev/tty
    if [[ -n "$manual_id" ]]; then
      GURU_ID="$manual_id"
      GURU_NAMA="Manual"
      simpan_sesi
    fi
    return
  }

  # Parse JSON. Format: [{"id":"...","nama":"...","email":"..."},...]
  local ids=() names=() emails=()
  while IFS= read -r line; do
    ids+=("$line")
  done < <(echo "$json" | grep -oP '"id":"[^"]*"' | cut -d'"' -f4)

  while IFS= read -r line; do
    names+=("$line")
  done < <(echo "$json" | grep -oP '"nama":"[^"]*"' | cut -d'"' -f4)

  while IFS= read -r line; do
    emails+=("$line")
  done < <(echo "$json" | grep -oP '"email":"[^"]*"' | cut -d'"' -f4)

  local count=${#ids[@]}

  if [[ $count -eq 0 ]]; then
    err "Tidak ada guru di database"
    read -rp "  Masukkan ID guru manual: " manual_id </dev/tty
    if [[ -n "$manual_id" ]]; then
      GURU_ID="$manual_id"
      GURU_NAMA="Manual"
      simpan_sesi
    fi
    return
  fi

  echo ""
  echo "  ═══════════════════════════════════════"
  echo "  👤 PILIH GURU — ${count} guru ditemukan"
  echo "  ═══════════════════════════════════════"
  echo ""
  echo "  Atas nama siapakah materi ini akan di-upload?"
  echo ""
  for i in "${!ids[@]}"; do
    printf "  ${G}%2d${N}) ${B}%-25s${N} ${C}%s${N}\n" $((i+1)) "${names[$i]}" "${emails[$i]}"
  done
  echo ""
  read -rp "  ➜ Ketik nomor [1-$count] lalu Enter: " pilih </dev/tty

  if [[ "$pilih" -ge 1 && "$pilih" -le "$count" ]]; then
    local idx=$((pilih-1))
    GURU_ID="${ids[$idx]}"
    GURU_NAMA="${names[$idx]}"
    GURU_EMAIL="${emails[$idx]}"
    simpan_sesi
    log "Guru: ${GURU_NAMA} (${GURU_EMAIL})"
  else
    err "Pilihan tidak valid"
    pilih_guru
  fi
}

# ── Simpan sesi guru ──
simpan_sesi() {
  echo "GURU_ID=$GURU_ID" > "$SESI_FILE"
  echo "GURU_NAMA=$GURU_NAMA" >> "$SESI_FILE"
  echo "GURU_EMAIL=$GURU_EMAIL" >> "$SESI_FILE"
}

# ── Muat sesi guru ──
muat_sesi() {
  if [[ -f "$SESI_FILE" ]]; then
    source "$SESI_FILE"
    return 0
  fi
  return 1
}

# ── Proses 1 file ──
proses_file() {
  local file="$1"
  local kelas="${2:-}"

  if [[ ! -f "$file" ]]; then err "File tidak ditemukan: $file"; return 1; fi
  ext="${file##*.}"
  if [[ "$ext" != "pdf" && "$ext" != "docx" && "$ext" != "doc" ]]; then
    err "Format harus PDF/DOCX: $(basename "$file")"; return 1
  fi

  local nama; nama=$(basename "$file")
  echo ""
  info "Memproses: $nama [${GURU_NAMA} | Kelas ${kelas:-?}]"

  cd "$PROJECT_DIR"
  local out
  out=$(npx tsx scripts/input-materi.ts "$file" --guru-id "$GURU_ID" ${kelas:+--kelas "$kelas"} 2>&1) || {
    echo "$out" | while IFS= read -r line; do echo "  $line"; done
    return 1
  }
  echo "$out" | while IFS= read -r line; do echo "  $line"; done
  return 0
}

# ── Pilih kelas ──
# Argumen $1 = nama file (untuk konteks), opsional
pilih_kelas() {
  local file_context="${1:-}"
  echo ""
  echo "  ═══════════════════════════════════════"
  if [[ -n "$file_context" ]]; then
    echo "  🎯 FILE: $file_context"
    echo "  ═══════════════════════════════════════"
  fi
  echo ""
  echo "  Materi ini untuk kelas berapa?"
  echo ""
  echo "    ${G}1${N}) Kelas 7  👈 Semester 1 & 2"
  echo "    ${G}2${N}) Kelas 8  👈 Semester 1 & 2"
  echo "    ${G}3${N}) Kelas 9  👈 Semester 1 & 2"
  echo "    ${Y}4${N}) Skip     👈 Tidak dikaitkan ke kelas tertentu"
  echo ""
  read -rp "  ➜ Ketik nomor [1-4] lalu Enter: " pil </dev/tty
  echo ""
  case "$pil" in
    1) echo "7" ;;
    2) echo "8" ;;
    3) echo "9" ;;
    *) echo "" ;;
  esac
}

# ── Hitung file drop zone ──
hitung_dropzone() {
  local d="$DROPZONE"
  mkdir -p "$d" "$d/selesai" "$d/gagal" 2>/dev/null
  local n=0
  while IFS= read -r -d '' f; do n=$((n+1)); done < <(find "$d" -maxdepth 1 \( -iname "*.pdf" -o -iname "*.docx" -o -iname "*.doc" \) -print0 2>/dev/null)
  echo "$n"
}

# ── Mode Drop Zone ──
mode_dropzone() {
  local dz="$DROPZONE"
  mkdir -p "$dz" "$dz/selesai" "$dz/gagal"

  echo ""
  echo "  ═══════════════════════════════════════"
  echo "  📦 DROP ZONE — Proses Banyak File"
  echo "  ═══════════════════════════════════════"
  echo ""
  info "Cara kerja:"
  info "  1. Taruh semua PDF/DOCX di folder: ${C}${dz}${N}"
  info "  2. Nanti pilih kelas (7/8/9)"
  info "  3. Semua file akan diproses 1 per 1"
  info ""
  info "  ✅ Berhasil → ${dz}/selesai/"
  info "  ❌ Gagal    → ${dz}/gagal/"

  local files=()
  while IFS= read -r -d '' f; do files+=("$f"); done < <(find "$dz" -maxdepth 1 \( -iname "*.pdf" -o -iname "*.docx" -o -iname "*.doc" \) -print0 | sort -z)

  if [[ ${#files[@]} -eq 0 ]]; then
    echo ""
    warn "Tidak ada file PDF/DOCX di folder Drop Zone."
    info "Taruh dulu file-nya di: ${C}${dz}${N}"
    read -rp "  Enter untuk kembali..." x </dev/tty
    return
  fi

  echo ""
  echo "  📋 Daftar ${#files[@]} file yang akan diproses:"
  echo ""
  for i in "${!files[@]}"; do
    local f="${files[$i]}"; local n; n=$(basename "$f"); local u; u=$(du -h "$f" | cut -f1)
    printf "  %2d. ${C}%s${N} (${u})\n" $((i+1)) "$n"
  done

  local kelas; kelas=$(pilih_kelas)
  echo ""
  echo "  ─────────────────────────────────────"
  echo "  📋 Ringkasan:"
  echo "     Guru : ${GURU_NAMA}"
  echo "     File : ${#files[@]} file"
  echo "     Kelas: ${kelas:-Tidak ditentukan}"
  echo "  ─────────────────────────────────────"
  echo ""
  warn "Mulai proses ${#files[@]} file untuk ${GURU_NAMA}?"
  read -rp "  ➜ Lanjut? (y/N): " confirm </dev/tty
  [[ "$confirm" != "y" && "$confirm" != "Y" ]] && { info "Dibatalkan"; return; }

  local ok=0 fail=0
  for f in "${files[@]}"; do
    local nama; nama=$(basename "$f")
    echo ""
    echo "  ── [$((ok+fail+1))/${#files[@]}] Memproses: $nama ──"
    if proses_file "$f" "$kelas"; then
      mv "$f" "$dz/selesai/"; log "✅ ${nama}"; ((ok++))
    else
      mv "$f" "$dz/gagal/"; warn "❌ ${nama}"; ((fail++))
    fi
  done

  echo ""
  echo "  ═══════════════════════════════════════"
  log "Drop Zone selesai!"
  echo "     ✅ Berhasil: $ok file"
  echo "     ❌ Gagal   : $fail file"
  info "     📁 Sukses  → ${dz}/selesai/"
  info "     📁 Gagal   → ${dz}/gagal/"
  echo "  ═══════════════════════════════════════"
  read -rp "  Enter untuk kembali..." x </dev/tty
}

# ── Mode drag 1 file ──
mode_drop() {
  echo ""
  echo "  ═══════════════════════════════════════"
  echo "  📄 INPUT 1 FILE"
  echo "  ═══════════════════════════════════════"
  echo ""
  info "Cara: drag & drop file PDF/DOCX dari File Manager ke sini"
  info "      lalu tekan Enter"
  info ""
  info "${Y}(Ketik 'q' untuk batal)${N}"
  read -rp "  ➜ Path file: " filepath </dev/tty
  filepath="${filepath#\"}"; filepath="${filepath%\"}"; filepath="${filepath#\'}"; filepath="${filepath%\'}"; filepath="${filepath% }"
  [[ "$filepath" == "q" ]] && return
  [[ ! -f "$filepath" ]] && { err "File tidak ditemukan: $filepath"; read -rp "  Enter..." x </dev/tty; return; }

  # Tampilkan info file
  local ukuran; ukuran=$(du -h "$filepath" | cut -f1)
  echo ""
  echo "  ─────────────────────────────────────"
  echo "  📄 Nama : $(basename "$filepath")"
  echo "  📦 Ukuran: $ukuran"
  echo "  ─────────────────────────────────────"

  local kelas; kelas=$(pilih_kelas "$(basename "$filepath")")
  read -rp "  Judul materi (Enter = otomatis dari file): " judul </dev/tty
  proses_file "$filepath" "$kelas" || true
  read -rp "  Enter untuk kembali..." x </dev/tty
}

# ── Mode batch folder ──
mode_batch() {
  echo ""
  echo "  ═══════════════════════════════════════"
  echo "  📁 INPUT FOLDER — Proses Semua File di Folder"
  echo "  ═══════════════════════════════════════"
  echo ""
  info "Cara: drag & drop FOLDER dari File Manager ke sini"
  info "      (bukan file-nya satu-satu, tapi folder-nya)"
  info ""
  info "${Y}(Ketik 'q' untuk batal)${N}"
  read -rp "  ➜ Path folder: " folder </dev/tty
  folder="${folder#\"}"; folder="${folder%\"}"
  [[ "$folder" == "q" ]] && return
  [[ ! -d "$folder" ]] && { err "Folder tidak ditemukan: $folder"; read -rp "  Enter..." x </dev/tty; return; }

  local files=()
  while IFS= read -r -d '' f; do files+=("$f"); done < <(find "$folder" -maxdepth 1 \( -iname "*.pdf" -o -iname "*.docx" -o -iname "*.doc" \) -print0 | sort -z)
  [[ ${#files[@]} -eq 0 ]] && { err "Tidak ada file PDF/DOCX di folder itu"; read -rp "  Enter..." x </dev/tty; return; }

  echo ""
  echo "  📋 Daftar ${#files[@]} file ditemukan:"
  echo ""
  for f in "${files[@]}"; do
    local s; s=$(du -h "$f" | cut -f1)
    echo "  • $(basename "$f") (${s})"
  done

  local kelas; kelas=$(pilih_kelas)
  echo ""
  echo "  ─────────────────────────────────────"
  echo "  📋 Ringkasan:"
  echo "     Guru : ${GURU_NAMA}"
  echo "     File : ${#files[@]} file"
  echo "     Kelas: ${kelas:-Tidak ditentukan}"
  echo "  ─────────────────────────────────────"
  echo ""
  warn "Mulai proses ${#files[@]} file untuk ${GURU_NAMA}?"
  read -rp "  ➜ Lanjut? (y/N): " confirm </dev/tty
  [[ "$confirm" != "y" && "$confirm" != "Y" ]] && { info "Dibatalkan"; return; }

  local ok=0 fail=0
  for f in "${files[@]}"; do
    local n; n=$(basename "$f")
    echo ""
    echo "  ── [$((ok+fail+1))/${#files[@]}] $n ──"
    if proses_file "$f" "$kelas"; then ((ok++)); else ((fail++)); fi
  done

  echo ""
  echo "  ═══════════════════════════════════════"
  log "Batch selesai!"
  echo "     ✅ Berhasil: $ok file"
  echo "     ❌ Gagal   : $fail file"
  echo "  ═══════════════════════════════════════"
  read -rp "  Enter untuk kembali..." x </dev/tty
}

# ── Ganti guru ──
mode_ganti_guru() {
  rm -f "$SESI_FILE"
  GURU_ID=""; GURU_NAMA=""; GURU_EMAIL=""
  pilih_guru
}

# ── Menu utama ──
menu() {
  while true; do
    clear
    header

    if ! muat_sesi || [[ -z "${GURU_ID:-}" ]]; then
      pilih_guru
    fi

    local dz_count; dz_count=$(hitung_dropzone)

    echo "  👤 Guru aktif: ${G}${GURU_NAMA}${N} (${C}${GURU_EMAIL}${N})"
    echo ""
    echo "  ═══════════════════════════════════════"
    echo "  📋 PILIHAN INPUT"
    echo "  ═══════════════════════════════════════"
    echo ""
    echo "  ${G}1${N}) 📦 Drop Zone (batch)"
    echo "     Proses semua file PDF/DOCX dari folder:"
    echo "     ${C}${DROPZONE}${N}"
    if [[ $dz_count -gt 0 ]]; then
    echo "     ${Y}▶ $dz_count file tertunda!${N}"
    fi
    echo ""
    echo "  ${G}2${N}) 📁 Folder (drag folder)"
    echo "     Pilih folder sendiri → proses semua file di dalamnya"
    echo ""
    echo "  ${G}3${N}) 📄 1 file (drag file)"
    echo "     Pilih 1 file PDF/DOCX → langsung proses"
    echo ""
    echo "  ${G}4${N}) 🔄 Ganti guru"
    echo ""
    echo "  ${G}5${N}) 📊 Info"
    echo ""
    echo "  ${R}0${N}) Keluar"
    echo ""
    read -rp "  ➜ Pilih nomor [0-5] lalu Enter: " pilihan </dev/tty

    case "$pilihan" in
      1) mode_dropzone ;;
      2) mode_batch ;;
      3) mode_drop ;;
      4) mode_ganti_guru ;;
      5)
        echo ""
        echo "  ═══════════════════════════════════════"
        echo "  📊 INFO"
        echo "  ═══════════════════════════════════════"
        echo "  Guru     : $GURU_NAMA"
        echo "  Email    : $GURU_EMAIL"
        echo "  ID Guru  : $GURU_ID"
        echo "  Project  : $PROJECT_DIR"
        echo "  Drop Zone: $DROPZONE"
        echo "  File     : $dz_count tertunda"
        echo "  ═══════════════════════════════════════"
        read -rp "  Enter untuk kembali..." x ;;
      0) echo ""; exit 0 ;;
    esac
  done
}

# ── Main ─────────────────────────────────────────────────
if [[ $# -ge 1 ]]; then
  if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    header
    echo "  ./scripts/input-materi.sh        → Menu interaktif"
    echo "  ./scripts/input-materi.sh file   → Langsung (guru terakhir)"
    echo "  File sesi: ${C}${SESI_FILE}${N}"
    exit 0
  fi

  valid_env || exit 1
  muat_sesi || { echo "Jalankan dulu tanpa argumen untuk pilih guru."; exit 1; }

  local batch_kelas=""
  read -rp "Kelas [7/8/9, Enter=skip]: " batch_kelas </dev/tty
  case "$batch_kelas" in 7|8|9) ;; *) batch_kelas="";; esac

  local ok=0 fail=0
  for arg in "$@"; do
    [[ "$arg" == --* ]] && continue
    echo ""; echo "═══════════════════════════"
    if [[ -d "$arg" ]]; then
      while IFS= read -r -d '' f; do
        if proses_file "$f" "$batch_kelas"; then ((ok++)); else ((fail++)); fi
      done < <(find "$arg" -maxdepth 1 \( -iname "*.pdf" -o -iname "*.docx" -o -iname "*.doc" \) -print0 | sort -z)
    else
      if proses_file "$arg" "$batch_kelas"; then ((ok++)); else ((fail++)); fi
    fi
    echo "═══════════════════════════"
  done

  log "Selesai: ✅ $ok berhasil, ❌ $fail gagal"
  exit $((fail > 0 ? 1 : 0))
fi

menu
