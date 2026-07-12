#!/usr/bin/env bash
# ======================================================================
# ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
# ┃   ADMIN AKAL CENTER — Ultimate Edition v2026.07                 ┃
# ┃   Platform Guru-Siswa + AI Document Generator                   ┃
# ┃   by Ahmad Katsiri Agung, S.Pd.                                 ┃
# ┃   https://akalcenter.my.id                                      ┃
# ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
#
# 40 Fitur — Dashboard, Database, AI, Payment, DevOps, Security
# Supabase CLI integrated — REST API + psql direct queries
# ======================================================================
set -uo pipefail

# ─── Deteksi Terminal ──────────────────────────────────────────────
if [ -t 1 ] && [ "${TERM:-}" != "dumb" ]; then export TERM=xterm-256color; fi

# ─── Warna & Gaya ──────────────────────────────────────────────────
BOLD="\033[1m"; ITALIC="\033[3m"; REV="\033[7m"; RESET="\033[0m"
H="\033[38;5;39m"; G="\033[38;5;46m"; Y="\033[38;5;226m"; R="\033[38;5;196m"
C="\033[38;5;51m"; M="\033[38;5;201m"; W="\033[38;5;255m"; O="\033[38;5;214m"
P="\033[38;5;135m"; S="\033[38;5;245m"; N="\033[0m"

info()  { echo -e "${H}${BOLD}✦${N} ${H}$*${N}"; }
ok()    { echo -e "${G}${BOLD}✔${N} ${G}$*${N}"; }
warn()  { echo -e "${Y}${BOLD}⚠${N} ${Y}$*${N}"; }
err()   { echo -e "${R}${BOLD}✘${N} ${R}$*${N}"; }
print_box() {
  local text="$1" color="${2:-$H}"
  local width=$(( ${#text} + 4 ))
  local line; line=$(printf '%0.s━' $(seq 1 "$width"))
  echo -e "${color}${BOLD}┏${line}┓${N}"
  echo -e "${color}${BOLD}┃ ${text} ┃${N}"
  echo -e "${color}${BOLD}┗${line}┛${N}"
}
print_header() {
  clear
  echo -e "${W}${BOLD}"
  echo "   ╔══════════════════════════════════════════════════════════╗"
  echo "   ║   ${G}✦✦✦  ADMIN AKAL CENTER  ✦✦✦${W}                       ║"
  echo "   ║   ${C}◈  Ultimate Admin Panel — 40 Fitur Premium    ◈${W}    ║"
  echo "   ║   ${S}Platform: ${G}${BOLD}akalcenter.my.id${W}                     ║"
  echo "   ║   ${S}${ITALIC}Guru-Siswa | AI Generator | CBT | Analytics${W}      ║"
  echo "   ╚══════════════════════════════════════════════════════════╝"
  echo -e "${N}"
}
pause() { echo ""; read -r -p "$(echo -e "${S}Tekan Enter untuk kembali ke menu...${N}")" _; }

# ─── Cek Dependensi ─────────────────────────────────────────────────
for CMD in curl jq; do
  if ! command -v "$CMD" >/dev/null 2>&1; then
    err "'$CMD' tidak terpasang. Install: sudo apt install $CMD"
    exit 1
  fi
done
HAS_SUPABASE=false; SUPABASE_VER=""
if command -v supabase >/dev/null 2>&1; then
  HAS_SUPABASE=true
  SUPABASE_VER=$(supabase --version 2>/dev/null | head -1)
fi

# ─── Baca .env ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.local"
[ ! -f "$ENV_FILE" ] && ENV_FILE="$PROJECT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then err ".env / .env.local tidak ditemukan di $PROJECT_DIR"; exit 1; fi
set -a; source "$ENV_FILE"; set +a

# ─── API Config ─────────────────────────────────────────────────────
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL%/}"
REST_URL="${SUPABASE_URL}/rest/v1"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
AUTH_HEAD=(-H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json")
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-$(echo "$SUPABASE_URL" | sed -E 's|https?://([^.]+)\.supabase\..*|\1|')}"

# ─── Supabase CLI Root ──────────────────────────────────────────────
SUPABASE_ROOT=""
_find_supabase_root() {
  local dir="$PROJECT_DIR"
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/supabase/.temp/project-ref" ]; then SUPABASE_ROOT="$dir"; return 0; fi
    dir="$(dirname "$dir")"
  done
  return 1
}
_find_supabase_root

require_supabase() {
  if [ "$HAS_SUPABASE" = false ]; then err "Supabase CLI tidak terpasang! Install: brew install supabase/tap/supabase"; return 1; fi
  if [ -z "$SUPABASE_ROOT" ]; then err "Supabase project tidak linked! Jalankan: supabase login && supabase link"; return 1; fi
  return 0
}

# ─── psql Helper ─────────────────────────────────────────────────────
HAS_PSQL=false
if command -v psql >/dev/null 2>&1 && command -v pg_isready >/dev/null 2>&1; then
  HAS_PSQL=true
fi

psql_query() {
  if [ "$HAS_PSQL" = false ]; then err "psql tidak terpasang."; return 1; fi
  if [ -z "${DATABASE_URL:-}" ]; then err "DATABASE_URL tidak dikonfigurasi."; return 1; fi
  local query="$1" format="${2:-table}"

  # Parse DATABASE_URL: postgresql://user:password@host:port/dbname?params
  local uri="${DATABASE_URL#*://}"
  local user="${uri%%:*}"
  local rest="${uri#*:}"
  local pass_enc="${rest%%@*}"             # still URL-encoded
  # URL-decode password: %40→@, %23→#, %24→$, etc.
  local pass_dec; pass_dec=$(printf '%b' "${pass_enc//%/\\x}" 2>/dev/null)
  rest="${rest#*@}"
  local host="${rest%%:*}"
  rest="${rest#*:}"
  local port="${rest%%/*}"
  local db="${rest#*/}"; db="${db%%\?*}"

  local psql_args=(-h "$host" -p "$port" -U "$user" -d "$db")
  [ "$format" = "csv" ] && psql_args+=(--csv)
  PGSSLMODE=require PGPASSWORD="$pass_dec" psql "${psql_args[@]}" -c "$query" 2>/dev/null || echo "ERROR: koneksi database gagal"
}

supabase_query() {
  if [ "$HAS_SUPABASE" = false ] || [ -z "$SUPABASE_ROOT" ]; then
    warn "Supabase CLI tidak tersedia, fallback ke API..."
    return 1
  fi
  (cd "$SUPABASE_ROOT" && supabase db query "$1" --linked -o "${2:-table}" --yes 2>&1)
}

# ─── Format Rupiah ──────────────────────────────────────────────────
format_rp() {
  local num="${1:-0}"
  num=$(printf "%.0f" "$num" 2>/dev/null || echo "0")
  echo "$num" | sed ':a;s/\B[0-9]\{3\}\>/,&/;ta' | tr ',' '.'
}

# ─── API Call Helper ────────────────────────────────────────────────
HTTP_STATUS=""; API_BODY=""
api_call() {
  local method="$1" url="$2" data="${3:-}"
  local resp rc
  if [ -n "$data" ]; then
    resp=$(curl -sS -w $'\n%{http_code}' -X "$method" "${AUTH_HEAD[@]}" -H "Prefer: return=representation" -d "$data" "$url" 2>/dev/null)
  else
    resp=$(curl -sS -w $'\n%{http_code}' -X "$method" "${AUTH_HEAD[@]}" "$url" 2>/dev/null)
  fi
  rc=$?
  if [ $rc -ne 0 ]; then HTTP_STATUS="000"; API_BODY="{\"error\":\"koneksi gagal\"}"; return 1; fi
  HTTP_STATUS=$(printf '%s' "$resp" | tail -n1)
  API_BODY=$(printf '%s' "$resp" | sed '$d')
  [ -z "$API_BODY" ] && API_BODY="{}"
  [[ "$HTTP_STATUS" =~ ^2 ]]
}

# ====================================================================
# 1. DASHBOARD STATISTIK — Overview platform
# ====================================================================
dashboard() {
  print_header; print_box "  📊  DASHBOARD STATISTIK AKAL CENTER  " "$C"

  api_call GET "${REST_URL}/users?select=id,role"
  local TOTAL_ALL; TOTAL_ALL=$(echo "$API_BODY" | jq 'length // 0')
  local TOTAL_GURU; TOTAL_GURU=$(echo "$API_BODY" | jq '[.[] | select(.role=="GURU" or .role=="ASISTEN_GURU")] | length')
  local TOTAL_SISWA; TOTAL_SISWA=$(echo "$API_BODY" | jq '[.[] | select(.role=="SISWA")] | length')
  local TOTAL_OWNER; TOTAL_OWNER=$(echo "$API_BODY" | jq '[.[] | select(.role=="OWNER")] | length')

  api_call GET "${REST_URL}/kursus?select=id,is_public,harga"
  local TOTAL_KURSUS; TOTAL_KURSUS=$(echo "$API_BODY" | jq 'length // 0')
  local KURSUS_PUB; KURSUS_PUB=$(echo "$API_BODY" | jq '[.[] | select(.is_public==true)] | length')
  local KURSUS_DRAFT; KURSUS_DRAFT=$(echo "$API_BODY" | jq '[.[] | select(.is_public==false)] | length')

  api_call GET "${REST_URL}/sekolah?select=id"
  local TOTAL_SEKOLAH; TOTAL_SEKOLAH=$(echo "$API_BODY" | jq 'length // 0')

  api_call GET "${REST_URL}/transaksi?select=id,status&status=eq.CONFIRMED"
  local TOTAL_PENDAPATAN; TOTAL_PENDAPATAN=$(echo "$API_BODY" | jq 'length // 0')

  echo ""
  echo -e "${C}${REV}  PENGGUNA ${N}"
  echo -e "  👨‍🏫 Guru/Asisten  : ${G}${BOLD}$TOTAL_GURU${N}"
  echo -e "  👨‍🎓 Siswa        : ${G}${BOLD}$TOTAL_SISWA${N}"
  echo -e "  👑 Owner         : ${G}${BOLD}$TOTAL_OWNER${N}"
  echo -e "  👥 Total User    : ${H}${BOLD}$TOTAL_ALL${N}"
  echo ""
  echo -e "${C}${REV}  KONTEN ${N}"
  echo -e "  🏫 Sekolah         : ${H}${BOLD}$TOTAL_SEKOLAH${N}"
  echo -e "  📚 Total Kursus    : ${H}${BOLD}$TOTAL_KURSUS${N}"
  echo -e "  ✅ Published       : ${G}${BOLD}$KURSUS_PUB${N}"
  echo -e "  📝 Draft           : ${Y}${BOLD}$KURSUS_DRAFT${N}"
  echo -e "  💰 Transaksi Sukses: ${G}$TOTAL_PENDAPATAN${N}"

  # AI Cost via psql
  if [ "$HAS_PSQL" = true ]; then
    local AI_COST; AI_COST=$(psql_query "SELECT COALESCE(SUM(cost_idr_cents)/100,0)::bigint as ai_cost_month FROM ai_requests WHERE created_at >= date_trunc('month', now());" "csv" 2>/dev/null | tail -1)
    [ -z "$AI_COST" ] && AI_COST="0"
    local AI_REQ; AI_REQ=$(psql_query "SELECT count(*) FROM ai_requests WHERE created_at >= date_trunc('month', now());" "csv" 2>/dev/null | tail -1)
    [ -z "$AI_REQ" ] && AI_REQ="0"
    echo ""
    echo -e "${C}${REV}  AI USAGE BULAN INI ${N}"
    echo -e "  🤖 Request AI     : ${M}${BOLD}$AI_REQ${N}"
    echo -e "  💰 Biaya AI       : ${Y}${BOLD}Rp $(format_rp "$AI_COST")${N}"
  fi

  # Storage estimation
  echo ""
  echo -e "${C}${REV}  SISTEM ${N}"
  echo -e "  🖥  Supabase Ref   : ${S}$SUPABASE_PROJECT_REF${N}"
  echo -e "  🔧 Supabase CLI   : ${S}$([ "$HAS_SUPABASE" = true ] && echo "✅ $SUPABASE_VER" || echo "❌ Tidak terpasang")${N}"
  echo -e "  🗄  PostgreSQL CLI : ${S}$([ "$HAS_PSQL" = true ] && echo "✅" || echo "❌")${N}"

  pause
}

# ====================================================================
# 2. MANAJEMEN GURU — Lihat + Statistik Per Guru
# ====================================================================
manajemen_guru() {
  print_header; print_box "  👨‍🏫  MANAJEMEN GURU  " "$C"
  api_call GET "${REST_URL}/users?select=id,nama,email,sekolah_id,created_at&role=in.(GURU,ASISTEN_GURU)&order=created_at.desc&limit=50"
  local COUNT; COUNT=$(echo "$API_BODY" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then warn "Belum ada guru."; pause; return; fi

  printf "${S}%-3s %-24s %-30s %-10s %-12s${N}\n" "#" "NAMA" "EMAIL" "KURSUS" "TERDAFTAR"
  for i in $(seq 0 $((COUNT - 1))); do
    local NO=$((i+1))
    local NM; NM=$(echo "$API_BODY" | jq -r ".[$i].nama")
    local EM; EM=$(echo "$API_BODY" | jq -r ".[$i].email")
    local DT; DT=$(echo "$API_BODY" | jq -r ".[$i].created_at[:10]")
    local GID; GID=$(echo "$API_BODY" | jq -r ".[$i].id")

    api_call GET "${REST_URL}/kursus?select=id&guru_id=eq.${GID}"
    local K_COUNT; K_COUNT=$(echo "$API_BODY" | jq 'length // 0')

    printf "${G}%-3s${N} %-24s %-30s ${H}%-10s${N} %-12s\n" "$NO" "$NM" "$EM" "$K_COUNT" "$DT"
  done
  echo -e "\n${S}Total: $COUNT guru${N}"
  echo ""
  printf "Lihat detail guru (nomor) atau 0 untuk kembali: "
  read -r CHOICE
  if [ "$CHOICE" != "0" ] && [ -n "$CHOICE" ] && [ "$CHOICE" -le "$COUNT" ] 2>/dev/null; then
    local IDX=$((CHOICE-1))
    local GID; GID=$(echo "$API_BODY" | jq -r ".[$IDX].id")
    local NM; NM=$(echo "$API_BODY" | jq -r ".[$IDX].nama")
    print_box "  👤 Detail: $NM  " "$H"

    api_call GET "${REST_URL}/users?select=id,role,nama,email,kota,kecamatan,created_at,updated_at&id=eq.${GID}"
    echo "$API_BODY" | jq -r '.[0] | to_entries[] | "  \(.key): \(.value // "-")"'

    echo ""
    api_call GET "${REST_URL}/kursus?select=judul,is_public,created_at&guru_id=eq.${GID}"
    local KC; KC=$(echo "$API_BODY" | jq 'length')
    echo -e "${C}Kursus ($KC):${N}"
    echo "$API_BODY" | jq -r '.[] | "  \(.judul) [\(if .is_public then "PUBLIK" else "DRAFT" end)] \(.created_at[:10])"'
    echo ""
    api_call GET "${REST_URL}/ai_generation?select=id&guru_id=eq.${GID}"
    local AI; AI=$(echo "$API_BODY" | jq 'length // 0')
    echo -e "${M}AI Generations: $AI${N}"
  fi
  pause
}

# ====================================================================
# 3. MANAJEMEN SISWA — Lihat + Detail
# ====================================================================
manajemen_siswa() {
  print_header; print_box "  👨‍🎓  MANAJEMEN SISWA  " "$C"
  api_call GET "${REST_URL}/users?select=id,nama,email,kelas,created_at&role=eq.SISWA&order=created_at.desc&limit=50"
  local COUNT; COUNT=$(echo "$API_BODY" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then warn "Belum ada siswa."; pause; return; fi

  printf "${S}%-3s %-24s %-30s %-6s %-8s %-12s${N}\n" "#" "NAMA" "EMAIL" "KELAS" "KURSUS" "DAFTAR"
  for i in $(seq 0 $((COUNT - 1))); do
    local NO=$((i+1))
    local NM; NM=$(echo "$API_BODY" | jq -r ".[$i].nama")
    local EM; EM=$(echo "$API_BODY" | jq -r ".[$i].email")
    local KL; KL=$(echo "$API_BODY" | jq -r ".[$i].kelas // \"-\"")
    local DT; DT=$(echo "$API_BODY" | jq -r ".[$i].created_at[:10]")
    local SID; SID=$(echo "$API_BODY" | jq -r ".[$i].id")

    api_call GET "${REST_URL}/siswa_kursus?select=id&siswa_id=eq.${SID}"
    local E_COUNT; E_COUNT=$(echo "$API_BODY" | jq 'length // 0')

    printf "${G}%-3s${N} %-24s %-30s ${H}%-6s${N} ${Y}%-8s${N} %-12s\n" "$NO" "$NM" "$EM" "$KL" "$E_COUNT" "$DT"
  done
  echo -e "\n${S}Total: $COUNT siswa${N}"
  pause
}

# ====================================================================
# 4. MANAJEMEN KURSUS — Lihat, Filter, Publish, Arsip
# ====================================================================
manajemen_kursus() {
  print_header; print_box "  📚  MANAJEMEN KURSUS  " "$C"
  echo -e "  ${S}1)${N} Semua kursus"
  echo -e "  ${S}2)${N} Hanya PUBLIK"
  echo -e "  ${S}3)${N} Hanya DRAFT"
  echo -e "  ${S}4)${N} Cari kursus"
  echo -e "  ${S}0)${N} Kembali"
  read -r -p "$(echo -e "${H}Pilih filter:${N} ")" FILTER

  local QUERY="${REST_URL}/kursus?select=id,judul,slug,is_public,harga,created_at,guru_id"
  case "$FILTER" in
    1) QUERY="${QUERY}&order=created_at.desc&limit=50" ;;
    2) QUERY="${QUERY}&is_public=eq.true&order=created_at.desc&limit=50" ;;
    3) QUERY="${QUERY}&is_public=eq.false&order=created_at.desc&limit=50" ;;
    4) read -r -p "Cari judul: "; QUERY="${QUERY}&judul=like.*${REPLY}*&order=created_at.desc&limit=20" ;;
    0) return ;;
    *) warn "Pilihan tidak valid."; pause; return ;;
  esac

  if ! api_call GET "$QUERY"; then
    local ERR_MSG; ERR_MSG=$(echo "$API_BODY" | jq -r '.message // "Unknown"')
    err "API error (${HTTP_STATUS}): ${ERR_MSG}"; pause; return
  fi
  if ! echo "$API_BODY" | jq -e '. | type == "array"' >/dev/null 2>&1; then
    err "Respons API bukan array (mungkin tabel belum ada)"; pause; return
  fi
  local COUNT; COUNT=$(echo "$API_BODY" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then warn "Tidak ada kursus."; pause; return; fi

  printf "${S}%-3s %-45s %-10s %-10s %-12s${N}\n" "#" "JUDUL" "STATUS" "HARGA" "DIBUAT"
  for i in $(seq 0 $((COUNT - 1))); do
    local NO=$((i+1))
    local JD; JD=$(echo "$API_BODY" | jq -r ".[$i].judul")
    local ST_RAW; ST_RAW=$(echo "$API_BODY" | jq -r ".[$i].is_public")
    local ST; [ "$ST_RAW" = "true" ] && ST="PUBLIK" || ST="DRAFT"
    local HR; HR=$(echo "$API_BODY" | jq -r ".[$i].harga")
    local DT; DT=$(echo "$API_BODY" | jq -r ".[$i].created_at[:10]")
    local COLOR="$G"; [ "$ST" != "PUBLIK" ] && COLOR="$Y"
    printf "${G}%-3s${N} %-45s ${COLOR}%-10s${N} Rp %-7s %-12s\n" "$NO" "${JD:0:44}" "$ST" "$(format_rp "$HR")" "$DT"
  done

  echo ""
  read -r -p "$(echo -e "${H}Detail kursus (nomor) / ubah status (n:publish/d:draft) / 0 kembali:${N} ")" CMD
  if [[ "$CMD" =~ ^([0-9]+):(publish|draft)$ ]]; then
    local IDX=$((BASH_REMATCH[1]-1))
    local ACTION="${BASH_REMATCH[2]}"
    local CID; CID=$(echo "$API_BODY" | jq -r ".[$IDX].id")
    local NEW_FLAG=false; [ "$ACTION" = "publish" ] && NEW_FLAG=true
    api_call PATCH "${REST_URL}/kursus?id=eq.${CID}" "{\"is_public\":${NEW_FLAG}}"
    ok "Status kursus diubah ke $([ "$NEW_FLAG" = true ] && echo "PUBLIK" || echo "DRAFT")"
    pause
  elif [ "$CMD" != "0" ] && [ -n "$CMD" ] && [ "$CMD" -le "$COUNT" ] 2>/dev/null; then
    local IDX=$((CMD-1))
    local CID; CID=$(echo "$API_BODY" | jq -r ".[$IDX].id")
    local JD; JD=$(echo "$API_BODY" | jq -r ".[$IDX].judul")
    print_box "  📖 Detail: ${JD:0:50}  " "$H"
    api_call GET "${REST_URL}/kursus?select=*,guru:nama,sekolah:nama&id=eq.${CID}"
    echo "$API_BODY" | jq -r '.[0] | to_entries[] | "  \(.key): \(.value // "-")"'
    echo ""
    api_call GET "${REST_URL}/skill?select=id,nama,bloom_level,urutan&kursus_id=eq.${CID}&order=urutan"
    local SC; SC=$(echo "$API_BODY" | jq 'length')
    echo -e "${C}Skill ($SC):${N}"
    echo "$API_BODY" | jq -r '.[] | "  \(.urutan). \(.nama) [Bloom Lv\(.bloom_level)]"'
    pause
  fi
}

# ====================================================================
# 5. AI COST TRACKING — Detail biaya per user/model
# ====================================================================
ai_cost_tracking() {
  print_header; print_box "  🤖  AI COST TRACKING  " "$M"

  if [ "$HAS_PSQL" = false ]; then err "psql diperlukan."; pause; return; fi

  echo -e "${C}${REV}  RINGKASAN BIAYA AI ${N}"
  psql_query "
    SELECT
      date_trunc('day', created_at)::date as day,
      model,
      provider,
      count(*) as requests,
      sum(cost_idr_cents)/100 as cost_rp,
      sum(total_tokens) as total_tokens
    FROM ai_requests
    WHERE created_at >= date_trunc('month', now())
    GROUP BY 1,2,3
    ORDER BY day DESC;
  " "table"

  echo ""
  echo -e "${C}${REV}  TOP 10 USER AI ${N}"
  psql_query "
    SELECT u.nama, u.email, count(*) as reqs, sum(ar.cost_idr_cents)/100 as cost_rp
    FROM ai_requests ar
    JOIN users u ON u.id = ar.user_id
    WHERE ar.created_at >= date_trunc('month', now())
    GROUP BY u.nama, u.email
    ORDER BY cost_rp DESC
    LIMIT 10;
  " "table"

  echo ""
  echo -e "${C}${REV}  DAILY COST — 7 HARI TERAKHIR ${N}"
  psql_query "
    SELECT
      date_trunc('day', created_at)::date as day,
      sum(cost_idr_cents)/100 as cost_rp,
      count(*) as requests,
      sum(total_tokens) as tokens
    FROM ai_requests
    WHERE created_at >= now() - interval '7 days'
    GROUP BY 1 ORDER BY 1;
  " "table"

  echo ""
  local TOTAL; TOTAL=$(psql_query "SELECT COALESCE(SUM(cost_idr_cents)/100,0)::bigint FROM ai_requests WHERE created_at >= date_trunc('month', now());" "csv" 2>/dev/null | tail -1)
  echo -e "  ${Y}Total Biaya AI Bulan Ini: Rp $(format_rp "$TOTAL")${N}"
  pause
}

# ====================================================================
# 6. QUOTA MANAGEMENT — Lihat & Update quota
# ====================================================================
kuota() {
  print_header; print_box "  📐  QUOTA MANAGEMENT  " "$O"
  api_call GET "${REST_URL}/quotas?select=id,role,resource_type,limit_value,window_seconds,description,is_active&order=role,resource_type"
  local COUNT; COUNT=$(echo "$API_BODY" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then
    warn "Belum ada quota terdefinisi."
    echo ""
    read -r -p "Buat quota default? (y/n): " ANS
    if [ "$ANS" = "y" ]; then
      local DEFAULTS=(
        '{"role":"GURU","resource_type":"ai_generate","limit_value":50,"window_seconds":86400,"description":"Generate AI per hari"}'
        '{"role":"GURU","resource_type":"upload_file","limit_value":100,"window_seconds":86400,"description":"Upload file per hari"}'
        '{"role":"SISWA","resource_type":"quiz_attempt","limit_value":20,"window_seconds":86400,"description":"Quiz attempt per hari"}'
        '{"role":"SISWA","resource_type":"cbt_session","limit_value":5,"window_seconds":86400,"description":"CBT session per hari"}'
      )
      for q in "${DEFAULTS[@]}"; do
        api_call POST "${REST_URL}/quotas" "$q"
        ok "Quota dibuat"
      done
    fi
    pause; return
  fi
  echo -e "${S}ROLE           RESOURCE           LIMIT   WINDOW   STATUS${N}"
  echo "$API_BODY" | jq -r '.[] | "  \(.role) | \(.resource_type) | \(.limit_value) | \(.window_seconds)s | \(.is_active)"'
  echo ""
  read -r -p "Ubah limit quota (resource:nilai) atau 0: " ANS
  if [[ "$ANS" =~ ^(.+):([0-9]+)$ ]]; then
    local RES="${BASH_REMATCH[1]}" VAL="${BASH_REMATCH[2]}"
    api_call PATCH "${REST_URL}/quotas?resource_type=eq.${RES}" "{\"limit_value\":$VAL}"
    ok "Quota $RES = $VAL"
  fi
  pause
}

# ====================================================================
# 7. VERIFIKASI PEMBAYARAN
# ====================================================================
verifikasi_bayar() {
  print_header; print_box "  💳  VERIFIKASI PEMBAYARAN  " "$G"
  api_call GET "${REST_URL}/payments?select=id,user_id,amount,status,payment_type,proof_image_url,notes,created_at&order=created_at.desc&limit=20"
  local COUNT; COUNT=$(echo "$API_BODY" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then
    warn "Belum ada pembayaran."; pause; return
  fi

  local PENDING; PENDING=$(echo "$API_BODY" | jq '[.[] | select(.status=="pending")] | length')
  local CONFIRMED; CONFIRMED=$(echo "$API_BODY" | jq '[.[] | select(.status=="confirmed")] | length')
  local REJECTED; REJECTED=$(echo "$API_BODY" | jq '[.[] | select(.status=="rejected")] | length')

  echo -e "  ${Y}Pending: $PENDING${N}  ${G}Confirmed: $CONFIRMED${N}  ${R}Rejected: $REJECTED${N}"
  echo ""
  printf "${S}%-3s %-10s %-12s %-10s %-30s %-12s${N}\n" "#" "STATUS" "JUMLAH" "METODE" "CATATAN" "TANGGAL"
  for i in $(seq 0 $((COUNT - 1))); do
    local NO=$((i+1))
    local ST; ST=$(echo "$API_BODY" | jq -r ".[$i].status")
    local AM; AM=$(echo "$API_BODY" | jq -r ".[$i].amount")
    local PT; PT=$(echo "$API_BODY" | jq -r ".[$i].payment_type")
    local NT; NT=$(echo "$API_BODY" | jq -r ".[$i].notes // \"\"")
    local DT; DT=$(echo "$API_BODY" | jq -r ".[$i].created_at[:10]")
    local COLOR="$Y"; [ "$ST" = "confirmed" ] && COLOR="$G"; [ "$ST" = "rejected" ] && COLOR="$R"
    printf "${S}%-3s${N} ${COLOR}%-10s${N} Rp %-9s %-10s %-30s %-12s\n" "$NO" "$ST" "$(format_rp "$AM")" "$PT" "${NT:0:29}" "$DT"
  done

  echo ""
  read -r -p "Verifikasi pembayaran (nomor) atau 0: " CHOICE
  if [ "$CHOICE" != "0" ] && [ -n "$CHOICE" ] && [ "$CHOICE" -le "$COUNT" ] 2>/dev/null; then
    local IDX=$((CHOICE-1))
    local PID; PID=$(echo "$API_BODY" | jq -r ".[$IDX].id")
    local AMT; AMT=$(echo "$API_BODY" | jq -r ".[$IDX].amount")
    local ST; ST=$(echo "$API_BODY" | jq -r ".[$IDX].status")
    echo -e "  Jumlah: ${Y}Rp $(format_rp "$AMT")${N}"
    echo -e "  Status saat ini: ${S}$ST${N}"
    read -r -p "  Ketik KONFIRM / TOLAK / SKIP: " ACT
    if [ "$ACT" = "KONFIRM" ]; then
      api_call PATCH "${REST_URL}/payments?id=eq.${PID}" '{"status":"confirmed","verified_at":"now()"}'
      ok "Pembayaran dikonfirmasi!"
    elif [ "$ACT" = "TOLAK" ]; then
      api_call PATCH "${REST_URL}/payments?id=eq.${PID}" '{"status":"rejected"}'
      ok "Pembayaran ditolak."
    fi
  fi
  pause
}

# ====================================================================
# 8. ONBOARDING STATUS — Tracking progress guru
# ====================================================================
onboarding_status() {
  print_header; print_box "  🚀  ONBOARDING STATUS  " "$P"
  if [ "$HAS_PSQL" = false ]; then err "psql diperlukan."; pause; return; fi

  psql_query "
    SELECT
      u.nama,
      u.email,
      op.current_step,
      op.email_verified,
      op.profile_completed,
      op.tour_completed,
      op.first_course_created,
      op.first_material_uploaded,
      op.first_ai_generated,
      op.first_course_published,
      op.completed_at
    FROM onboarding_progress op
    JOIN users u ON u.id = op.user_id
    WHERE op.completed_at IS NULL
    ORDER BY op.updated_at DESC
    LIMIT 20;
  " "table"

  echo ""
  local TOTAL; TOTAL=$(psql_query "SELECT count(*) FROM onboarding_progress WHERE completed_at IS NULL;" "csv" 2>/dev/null | tail -1)
  echo -e "  ${Y}Guru dalam onboarding: $TOTAL${N}"
  pause
}

# ====================================================================
# 9. LIHAT TABEL DATABASE
# ====================================================================
db_tables() {
  print_header; print_box "  📋  TABEL DATABASE  " "$C"
  if [ "$HAS_PSQL" = false ]; then err "psql diperlukan."; pause; return; fi

  psql_query "
    SELECT
      tablename as table_name,
      pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size,
      (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name=t.tablename) as columns
    FROM pg_tables t
    WHERE schemaname='public'
    ORDER BY pg_total_relation_size('public.'||tablename) DESC;
  " "table"
  pause
}

# ====================================================================
# 10. JALANKAN SQL LANGSUNG
# ====================================================================
db_query() {
  print_header; print_box "  🔷  RUN SQL QUERY  " "$C"
  if [ "$HAS_PSQL" = false ]; then err "psql tidak terpasang, coba via Supabase CLI."; fi

  if [ "$HAS_SUPABASE" = true ] && [ -n "$SUPABASE_ROOT" ]; then
    echo -e "${S}Mode: Supabase CLI (psql fallback jika gagal)${N}"
  else
    echo -e "${S}Mode: psql langsung${N}"
  fi
  echo -e "${S}Contoh: SELECT count(*) FROM users;${N}"
  echo -e "${S}Contoh: SELECT nama, email FROM users LIMIT 5;${N}"
  echo -e "${S}Ketik EXIT untuk keluar${N}"
  echo ""

  while true; do
    read -r -p "SQL> " QUERY
    [ "$QUERY" = "EXIT" ] && break
    [ -z "$QUERY" ] && continue
    if [ "$HAS_SUPABASE" = true ] && [ -n "$SUPABASE_ROOT" ]; then
      supabase_query "$QUERY" "table"
    elif [ "$HAS_PSQL" = true ]; then
      psql_query "$QUERY" "table"
    else
      err "Tidak ada engine query tersedia."
      break
    fi
    echo ""
  done
  pause
}

# ====================================================================
# 11. SCHEMA DIFF
# ====================================================================
schema_diff() {
  print_header; print_box "  🔀  SCHEMA DIFF (LOCAL vs REMOTE)  " "$M"
  require_supabase || { pause; return; }
  (cd "$SUPABASE_ROOT" && supabase db diff --linked -s public 2>&1)
  pause
}

# ====================================================================
# 12. STATUS MIGRASI
# ====================================================================
status_migrasi() {
  print_header; print_box "  📊  STATUS MIGRASI  " "$Y"
  require_supabase || { pause; return; }
  (cd "$SUPABASE_ROOT" && supabase migration list --linked 2>&1)
  pause
}

# ====================================================================
# 13. PUSH MIGRASI KE PRODUCTION
# ====================================================================
push_migrasi() {
  print_header; print_box "  🚀  PUSH MIGRASI KE REMOTE  " "$G"
  require_supabase || { pause; return; }
  warn "Migrasi akan diterapkan ke database PRODUCTION!"
  echo -e "  ${R}Ini operasi irreversible!${N}"
  read -r -p "Ketik GAS untuk lanjut: " CONFIRM
  if [ "$CONFIRM" != "GAS" ]; then info "Dibatalkan."; pause; return; fi

  info "[1/3] Mengecek diff..."
  (cd "$SUPABASE_ROOT" && supabase db diff --linked -s public 2>&1 | head -30)

  info "[2/3] Menerapkan migrasi..."
  (cd "$SUPABASE_ROOT" && supabase db push --linked --yes 2>&1)

  info "[3/3] Verifikasi..."
  (cd "$SUPABASE_ROOT" && supabase migration list --linked 2>&1 | tail -5)
  ok "Migrasi selesai!"
  pause
}

# ====================================================================
# 14. BACKUP DATABASE — Full + Encrypted
# ====================================================================
backup_db() {
  print_header; print_box "  💾  BACKUP DATABASE  " "$C"
  require_supabase || { pause; return; }

  local BACKUP_DIR="$PROJECT_DIR/backups"
  mkdir -p "$BACKUP_DIR"
  local DT; DT=$(date +%Y%m%d_%H%M%S)
  local FILE="$BACKUP_DIR/akal_${DT}.sql"

  info "Memulai backup database..."
  (cd "$SUPABASE_ROOT" && supabase db dump --linked -s public -f "$FILE" --yes 2>&1)

  if [ -f "$FILE" ]; then
    local SIZE; SIZE=$(du -h "$FILE" | cut -f1)
    ok "Backup: $FILE ($SIZE)"

    # Encrypt if BACKUP_PASSPHRASE is set
    if [ -n "${BACKUP_PASSPHRASE:-}" ]; then
      info "Mengenkripsi backup..."
      openssl aes-256-cbc -pbkdf2 -iter 100000 -salt \
        -in "$FILE" -out "${FILE}.enc" \
        -pass "pass:${BACKUP_PASSPHRASE}" && \
        rm "$FILE" && \
        ok "Backup terenkripsi: ${FILE}.enc"
    fi

    # Rotate: keep last 7
    local COUNT; COUNT=$(ls -1 "$BACKUP_DIR"/*.sql* 2>/dev/null | wc -l)
    if [ "$COUNT" -gt 7 ]; then
      ls -1t "$BACKUP_DIR"/*.sql* | tail -n +8 | xargs rm -f
      ok "Old backups rotated (keep 7)"
    fi
  else
    err "Backup gagal!"
  fi
  pause
}

# ====================================================================
# 15. RESTORE DATABASE
# ====================================================================
restore_db() {
  print_header; print_box "  ♻️  RESTORE DATABASE  " "$R"
  require_supabase || { pause; return; }

  local BACKUP_DIR="$PROJECT_DIR/backups"
  echo -e "${Y}Backup tersedia:${N}"
  ls -1 "$BACKUP_DIR"/*.sql* 2>/dev/null | nl
  if [ -z "$(ls -1 "$BACKUP_DIR"/*.sql* 2>/dev/null)" ]; then
    warn "Tidak ada backup."; pause; return
  fi

  read -r -p "Pilih nomor backup: " CHOICE
  local FILE; FILE=$(ls -1 "$BACKUP_DIR"/*.sql* 2>/dev/null | sed -n "${CHOICE}p")
  if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then err "File tidak valid."; pause; return; fi

  # Decrypt if needed
  if [[ "$FILE" == *.enc ]]; then
    if [ -z "${BACKUP_PASSPHRASE:-}" ]; then
      err "BACKUP_PASSPHRASE diperlukan untuk decrypt."
      pause; return
    fi
    local TMP; TMP="${FILE%.enc}"
    openssl aes-256-cbc -pbkdf2 -iter 100000 -salt -d \
      -in "$FILE" -out "$TMP" \
      -pass "pass:${BACKUP_PASSPHRASE}" || { err "Decrypt gagal."; pause; return; }
    FILE="$TMP"
    ok "Backup didekripsi."
  fi

  warn "Ini akan MENIMPA database PRODUCTION!"
  read -r -p "Ketik RESTORE untuk konfirmasi: " CONFIRM
  if [ "$CONFIRM" != "RESTORE" ]; then info "Dibatalkan."; rm -f "$TMP"; pause; return; fi

  (cd "$SUPABASE_ROOT" && supabase db query -f "$FILE" --linked --yes 2>&1)
  ok "Restore selesai!"
  [[ "$FILE" == /tmp/* ]] && rm -f "$FILE"
  pause
}

# ====================================================================
# 16. DB LINT
# ====================================================================
db_lint() {
  print_header; print_box "  🔍  DB LINT  " "$Y"
  require_supabase || { pause; return; }
  (cd "$SUPABASE_ROOT" && supabase db lint --linked --level info --yes 2>&1)
  pause
}

# ====================================================================
# 17. SECURITY ADVISOR — Supabase built-in
# ====================================================================
security_advisor() {
  print_header; print_box "  🔒  SECURITY ADVISOR  " "$R"
  require_supabase || { pause; return; }
  (cd "$SUPABASE_ROOT" && supabase db advisors --linked --type security --level info --yes 2>&1)
  pause
}

# ====================================================================
# 18. PERFORMANCE ADVISOR
# ====================================================================
performance_advisor() {
  print_header; print_box "  ⚡  PERFORMANCE ADVISOR  " "$O"
  require_supabase || { pause; return; }
  (cd "$SUPABASE_ROOT" && supabase db advisors --linked --type performance --level warn --yes 2>&1)
  pause
}

# ====================================================================
# 19. INFO SYSTEM — Environment + Versi + Status
# ====================================================================
info_system() {
  print_header; print_box "  ℹ️  INFO SYSTEM  " "$H"
  echo -e "${C}Proyek:${N}        AKAL Center"
  echo -e "${C}Domain:${N}        https://akalcenter.my.id"
  echo -e "${C}Direktori:${N}     $PROJECT_DIR"
  echo -e "${C}Node:${N}         $(node -v 2>/dev/null || echo 'N/A')"
  echo -e "${C}NPM:${N}          $(npm -v 2>/dev/null || echo 'N/A')"
  echo -e "${C}Supabase URL:${N}  $SUPABASE_URL"
  echo -e "${C}Project Ref:${N}   $SUPABASE_PROJECT_REF"
  echo -e "${C}Supabase CLI:${N}  $([ "$HAS_SUPABASE" = true ] && echo "✅ $SUPABASE_VER" || echo "❌")"
  echo -e "${C}Linked Dir:${N}    $([ -n "$SUPABASE_ROOT" ] && echo "✅ $SUPABASE_ROOT" || echo "❌")"
  echo -e "${C}psql:${N}         $([ "$HAS_PSQL" = true ] && echo "✅ $(psql --version 2>/dev/null)" || echo "❌")"

  echo ""
  echo -e "${C}${REV}  DATABASE STATS ${N}"
  if [ "$HAS_PSQL" = true ]; then
    psql_query "
      SELECT
        (SELECT count(*) FROM users) as users,
        (SELECT count(*) FROM kursus) as kursus,
        (SELECT count(*) FROM skill) as skills,
        (SELECT count(*) FROM soal) as soals,
        (SELECT count(*) FROM ai_generation) as ai_generations,
        (SELECT count(*) FROM transaksi) as transaksi,
        (SELECT count(*) FROM payments) as payments
    " "table"
  fi

  echo ""
  echo -e "${C}${REV}  TABEL TERBESAR ${N}"
  if [ "$HAS_PSQL" = true ]; then
    psql_query "
      SELECT tablename,
        pg_size_pretty(pg_total_relation_size('public.'||tablename)) as total_size,
        pg_size_pretty(pg_table_size('public.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size('public.'||tablename)) as index_size
      FROM pg_tables WHERE schemaname='public'
      ORDER BY pg_total_relation_size('public.'||tablename) DESC LIMIT 15;
    " "table"
  fi
  pause
}

# ====================================================================
# 20. EXPORT DATA — CSV/JSON dari tabel penting
# ====================================================================
export_data() {
  print_header; print_box "  📤  EXPORT DATA  " "$C"
  echo -e "  ${S}1)${N} Export Users ke CSV (guru + siswa)"
  echo -e "  ${S}2)${N} Export Kursus ke CSV"
  echo -e "  ${S}3)${N} Export Transaksi ke CSV"
  echo -e "  ${S}4)${N} Export AI Generations ke JSON"
  echo -e "  ${S}5)${N} Export all-in-one (database dump)"
  echo -e "  ${S}0)${N} Kembali"
  read -r -p "$(echo -e "${H}Pilih:${N} ")" CHOICE

  local EXPORT_DIR="$PROJECT_DIR/exports"
  mkdir -p "$EXPORT_DIR"
  local DT; DT=$(date +%Y%m%d_%H%M%S)

  case "$CHOICE" in
    1)
      api_call GET "${REST_URL}/users?select=id,role,nama,email,kelas,sekolah_id,created_at&order=created_at.desc"
      echo "$API_BODY" | jq -r '["id","role","nama","email","kelas","created_at"], (.[] | [.id,.role,.nama,.email,.kelas // "",.created_at[:10]]) | @csv' > "$EXPORT_DIR/users_${DT}.csv"
      ok "Users: $EXPORT_DIR/users_${DT}.csv"
      ;;
    2)
      api_call GET "${REST_URL}/kursus?select=id,judul,slug,is_public,harga,created_at&order=created_at.desc"
      echo "$API_BODY" | jq -r '["id","judul","slug","status","harga","created_at"], (.[] | [.id,.judul,.slug,(if .is_public then "PUBLIK" else "DRAFT" end),.harga,.created_at[:10]]) | @csv' > "$EXPORT_DIR/kursus_${DT}.csv"
      ok "Kursus: $EXPORT_DIR/kursus_${DT}.csv"
      ;;
    3)
      api_call GET "${REST_URL}/transaksi?select=*,siswa:nama,kursus:judul&order=created_at.desc"
      echo "$API_BODY" | jq -r '["id","siswa","kursus","jumlah","metode","status","created_at"], (.[] | [.id,.siswa_nama,.kursus_judul,.jumlah,.metodePembayaran // "",.status,.created_at[:10]]) | @csv' > "$EXPORT_DIR/transaksi_${DT}.csv"
      ok "Transaksi: $EXPORT_DIR/transaksi_${DT}.csv"
      ;;
    4)
      api_call GET "${REST_URL}/ai_generation?select=id,guru_id,source_file_name,status,materi_status,quiz_status,soal_status,token_input,token_output,model_name,created_at&order=created_at.desc"
      echo "$API_BODY" | jq '.' > "$EXPORT_DIR/ai_generations_${DT}.json"
      ok "AI Generations: $EXPORT_DIR/ai_generations_${DT}.json"
      ;;
    5)
      require_supabase || { pause; return; }
      (cd "$SUPABASE_ROOT" && supabase db dump --linked -s public -f "$EXPORT_DIR/full_${DT}.sql" --yes 2>&1)
      ok "Full dump: $EXPORT_DIR/full_${DT}.sql"
      ;;
    0) return ;;
  esac
  pause
}

# ====================================================================
# 21. FEATURE FLAGS — Toggle fitur
# ====================================================================
feature_flags() {
  print_header; print_box "  🚩  FEATURE FLAGS  " "$C"
  api_call GET "${REST_URL}/feature_flag?select=id,name,enabled,created_at"
  local COUNT; COUNT=$(echo "$API_BODY" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then
    warn "Belum ada feature flag."
    echo ""
    read -r -p "Buat flag baru (nama): " FNAME
    [ -z "$FNAME" ] && { pause; return; }
    api_call POST "${REST_URL}/feature_flag" "{\"name\":\"$FNAME\",\"enabled\":false}"
    ok "Flag '$FNAME' dibuat."
    pause; return
  fi

  printf "${S}%-3s %-40s %-10s${N}\n" "#" "NAMA" "ENABLED"
  for i in $(seq 0 $((COUNT - 1))); do
    local NO=$((i+1))
    local NM; NM=$(echo "$API_BODY" | jq -r ".[$i].name")
    local EN; EN=$(echo "$API_BODY" | jq -r ".[$i].enabled")
    local COLOR="$R"; [ "$EN" = "true" ] && COLOR="$G"
    printf "${G}%-3s${N} %-40s ${COLOR}%-10s${N}\n" "$NO" "$NM" "$EN"
  done

  echo ""
  read -r -p "Toggle flag (nomor) / buat baru (n:nama) / 0: " CMD
  if [[ "$CMD" =~ ^([0-9]+)$ ]]; then
    local IDX=$((CMD-1))
    local FID; FID=$(echo "$API_BODY" | jq -r ".[$IDX].id")
    local CUR; CUR=$(echo "$API_BODY" | jq -r ".[$IDX].enabled")
    local NEW_VAL=false; [ "$CUR" = "false" ] && NEW_VAL=true
    api_call PATCH "${REST_URL}/feature_flag?id=eq.${FID}" "{\"enabled\":$NEW_VAL}"
    ok "Flag toggled: $NEW_VAL"
  elif [[ "$CMD" =~ ^n:(.+)$ ]]; then
    api_call POST "${REST_URL}/feature_flag" "{\"name\":\"${BASH_REMATCH[1]}\",\"enabled\":false}"
    ok "Flag '${BASH_REMATCH[1]}' dibuat."
  fi
  pause
}

# ====================================================================
# 22. PUSH & DEPLOY KE VERCEL
# ====================================================================
push_deploy() {
  print_header; print_box "  🚀  PUSH & DEPLOY KE VERCEL  " "$M"
  warn "Ini akan: git add → commit → push → vercel deploy --prod"
  read -r -p "Ketik GAS untuk lanjut: " CONFIRM
  if [ "$CONFIRM" != "GAS" ]; then info "Dibatalkan."; pause; return; fi

  echo -e "\n${C}[1/3] Git add + commit + push...${N}"
  read -r -p "Commit message: " MSG
  [ -z "$MSG" ] && MSG="Update via Admin CLI $(date +%Y-%m-%d)"
  git add . && git commit -m "$MSG" && git push origin main
  local GIT_RC=$?
  [ $GIT_RC -ne 0 ] && warn "Git push mungkin gagal, lanjut deploy..."

  echo -e "\n${C}[2/3] Deploy ke Vercel...${N}"
  npx vercel --prod --yes 2>&1 | tail -5
  local VC_RC=$?

  echo -e "\n${C}[3/3] Verifikasi health endpoint...${N}"
  sleep 5
  local HEALTH; HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "https://akalcenter.my.id/api/health" 2>/dev/null || echo "timeout")
  [ "$HEALTH" = "200" ] && ok "Health: 200 ✅" || warn "Health: $HEALTH"

  if [ $VC_RC -eq 0 ]; then
    ok "Deploy selesai! https://akalcenter.my.id"
  else
    err "Deploy gagal, cek log."
  fi
  pause
}

# ====================================================================
# 23. BERSIHKAN CACHE LOKAL
# ====================================================================
bersihkan_cache() {
  print_header; print_box "  🧹  BERSIHKAN CACHE  " "$O"
  local FREED=0

  if [ -d "$PROJECT_DIR/.next/cache" ]; then
    local SZ; SZ=$(du -sh "$PROJECT_DIR/.next/cache" 2>/dev/null | cut -f1)
    rm -rf "$PROJECT_DIR/.next/cache" 2>/dev/null
    ok "Cache Next.js: ~$SZ dibebaskan"
  else
    info "Cache Next.js sudah bersih"
  fi

  rm -rf /tmp/vercel-* /tmp/.ts-npx-* 2>/dev/null
  ok "Temporary files dibersihkan"
  pause
}

# ====================================================================
# 24. RESET DATABASE — Hapus semua data (dev only)
# ====================================================================
reset_db_dev() {
  print_header; print_box "  🔄  RESET DATABASE (DEV)  " "$R"
  require_supabase || { pause; return; }

  echo -e "  ${R}${BOLD}╔══════════════════════════════════════════════════════╗${N}"
  echo -e "  ${R}${BOLD}║  PERINGATAN: Semua DATA akan HILANG!               ║${N}"
  echo -e "  ${R}${BOLD}║  Hanya untuk development — bukan production!       ║${N}"
  echo -e "  ${R}${BOLD}╚══════════════════════════════════════════════════════╝${N}"
  echo ""
  read -r -p "Ketik RESET-DEV untuk konfirmasi: " CONFIRM
  if [ "$CONFIRM" != "RESET-DEV" ]; then info "Dibatalkan."; pause; return; fi

  info "Merestart database..."
  (cd "$SUPABASE_ROOT" && supabase db reset --linked --yes 2>&1)
  ok "Database direset!"
  pause
}

# ====================================================================
# 25. ANALYTICS — Statistik usage
# ====================================================================
analytics() {
  print_header; print_box "  📈  ANALYTICS  " "$C"
  if [ "$HAS_PSQL" = false ]; then err "psql diperlukan."; pause; return; fi

  echo -e "${C}${REV}  REGISTRASI 30 HARI ${N}"
  psql_query "
    SELECT date_trunc('day', created_at)::date as day,
      count(*) as new_users,
      count(*) FILTER (WHERE role='SISWA') as siswa,
      count(*) FILTER (WHERE role='GURU') as guru
    FROM users
    WHERE created_at >= now() - interval '30 days'
    GROUP BY 1 ORDER BY 1;
  " "table"

  echo ""
  echo -e "${C}${REV}  ENROLLMENT SISWA per KURSUS ${N}"
  psql_query "
    SELECT k.judul, count(sk.siswa_id) as enrolled
    FROM kursus k
    LEFT JOIN siswa_kursus sk ON sk.kursus_id = k.id
    GROUP BY k.judul ORDER BY enrolled DESC LIMIT 10;
  " "table"

  echo ""
  echo -e "${C}${REV}  QUIZ ATTEMPT PER HARI (7 hari) ${N}"
  psql_query "
    SELECT date_trunc('day', waktu_mulai)::date as day,
      count(*) as attempts, avg(nilai) as avg_score
    FROM quiz_attempt
    WHERE waktu_mulai >= now() - interval '7 days'
    GROUP BY 1 ORDER BY 1;
  " "table"

  echo ""
  echo -e "${C}${REV}  TOTAL RINGKASAN ${N}"
  psql_query "
    SELECT 'Total Users' as metric, count(*)::text FROM users
    UNION ALL SELECT '  └ Guru', count(*)::text FROM users WHERE role IN ('GURU','ASISTEN_GURU')
    UNION ALL SELECT '  └ Siswa', count(*)::text FROM users WHERE role='SISWA'
    UNION ALL SELECT 'Total Kursus', count(*)::text FROM kursus
    UNION ALL SELECT '  └ Published', count(*)::text FROM kursus WHERE status_publikasi='PUBLIK'
    UNION ALL SELECT 'Total Skill', count(*)::text FROM skill
    UNION ALL SELECT 'Total Soal', count(*)::text FROM soal
    UNION ALL SELECT 'Total Quiz Attempts', count(*)::text FROM quiz_attempt
    UNION ALL SELECT 'Total AI Generations', count(*)::text FROM ai_generation
    UNION ALL SELECT 'Total Payments', count(*)::text FROM payments
    UNION ALL SELECT 'Total Transaksi', count(*)::text FROM transaksi;
  " "table"
  pause
}

# ====================================================================
# 26. CHECK KONEKSI — Uji semua service
# ====================================================================
check_koneksi() {
  print_header; print_box "  🌐  CHECK KONEKSI  " "$C"
  echo -e "${C}Testing semua endpoint...${N}\n"

  # Supabase REST
  echo -ne "  ${H}Supabase REST API...${N} "
  api_call HEAD "${REST_URL}/users?select=id&limit=1"
  [ "$HTTP_STATUS" = "200" ] && ok "OK (${HTTP_STATUS})" || err "${HTTP_STATUS}"

  # Database langsung
  echo -ne "  ${H}PostgreSQL (Supabase)...${N} "
  if [ "$HAS_PSQL" = true ]; then
    psql_query "SELECT 1 as ping;" "csv" >/dev/null 2>&1 && ok "OK" || err "Gagal"
  else
    warn "psql tidak tersedia"
  fi

  # Vercel health
  echo -ne "  ${H}Vercel Health...${N} "
  local HEALTH; HEALTH=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://akalcenter.my.id/api/health" 2>/dev/null || echo "timeout")
  [ "$HEALTH" = "200" ] && ok "OK (${HEALTH})" || err "${HEALTH}"

  # ImageKit
  echo -ne "  ${H}ImageKit...${N} "
  local IK; IK=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://ik.imagekit.io/v6wbihytb" 2>/dev/null || echo "timeout")
  [ "$IK" = "200" ] || [ "$IK" = "204" ] && ok "OK (${IK})" || warn "${IK}"

  # Redis — bukan HTTP protocol, tidak bisa dites via curl
  echo -ne "  ${H}Redis (Upstash)...${N} "
  if [ -n "${REDIS_URL:-}" ]; then
    ok "env terkonfigurasi"
  else
    warn "tidak dikonfigurasi"
  fi

  # Resend — test API key validity via HTTPS header (standard practice)
  echo -ne "  ${H}Resend Email...${N} "
  if [ -n "${RESEND_API_KEY:-}" ]; then
    local RS; RS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
      "https://api.resend.com/emails" \
      -H "Authorization: Bearer ${RESEND_API_KEY}" 2>/dev/null || echo "timeout")
    [ "$RS" = "422" ] || [ "$RS" = "200" ] && ok "OK (${RS})" || warn "${RS} (key ada)"
  else
    warn "tidak dikonfigurasi"
  fi

  echo ""
  ok "Check koneksi selesai."
  pause
}

# ====================================================================
# 27. BANTUAN — Panduan lengkap
# ====================================================================
bantuan() {
  print_header; print_box "  📖  BANTUAN & PANDUAN  " "$Y"
  cat <<EOF
${S}══════════════════════════════════════════════════════════════════════${N}
${G}${BOLD}ADMIN AKAL CENTER — Ultimate Edition v2026.07${N}

${C}${BOLD}📊 DASHBOARD & MONITORING${N}
  1. Dashboard Statistik        8. Onboarding Status
 25. Analytics Usage            26. Check Koneksi

${C}${BOLD}👥 DATA MANAGEMENT${N}
  2. Manajemen Guru             3. Manajemen Siswa
  4. Manajemen Kursus          20. Export Data (CSV/JSON)
  6. Quota Management           7. Verifikasi Pembayaran

${C}${BOLD}🤖 AI & FITUR${N}
  5. AI Cost Tracking           21. Feature Flags
 28. Input Materi (PDF/DOCX → AI → Guru)

${C}${BOLD}🗄️ DATABASE (Supabase CLI + psql)${N}
  9. Lihat Tabel               10. Run SQL Query
 11. Schema Diff               12. Status Migrasi
 13. Push Migrasi              14. Backup Database
 15. Restore Database          16. DB Lint
 24. Reset Database (DEV only)

${C}${BOLD}🔒 DEVSECOPS${N}
 17. Security Advisor          18. Performance Advisor
 19. Info System               22. Push & Deploy
 23. Bersihkan Cache           27. Bantuan

${S}══════════════════════════════════════════════════════════════════════${N}

${Y}PERSIAPAN AWAL:${N}
  1. ${S}Cek koneksi: Pilih menu 26${N}
  2. ${S}Lihat dashboard: Pilih menu 1${N}
  3. ${S}Backup database: Pilih menu 14${N}

${Y}DEPLOY FLOW:${N}
  Backup → Git commit → Menu 22 (Push & Deploy)

${Y}ENVIRONMENT:${N}
  ${S}.env.local${N} di root project — edit untuk ubah koneksi
  Backup passphrase: ${S}BACKUP_PASSPHRASE${N} (opsional, untuk enkripsi)

${S}══════════════════════════════════════════════════════════════════════${N}
EOF
  pause
}

# ====================================================================
# 28. INPUT MATERI — Upload PDF/DOCX + AI generate ke akun guru
# ====================================================================
input_materi() {
  print_header; print_box "  📥  INPUT MATERI  " "$G"
  local INPUT_SCRIPT="$PROJECT_DIR/scripts/input-materi.sh"
  if [ ! -f "$INPUT_SCRIPT" ]; then
    err "Script input-materi.sh tidak ditemukan di $INPUT_SCRIPT"
    pause; return
  fi
  bash "$INPUT_SCRIPT"
}

# ====================================================================
# MENU UTAMA
# ====================================================================
while true; do
  print_header
  echo -e "${C}${BOLD}── DASHBOARD ──────────────────────────────────────────────────${N}"
  echo -e "  ${G}1${N}) Dashboard Statistik   ${G}25${N}) Analytics Usage"
  echo -e "  ${G}26${N}) Check Koneksi         ${G}8${N})  Onboarding Status"
  echo ""
  echo -e "${C}${BOLD}── DATA MANAGEMENT ─────────────────────────────────────────────${N}"
  echo -e "  ${G}2${N}) Manajemen Guru        ${G}3${N})  Manajemen Siswa"
  echo -e "  ${G}4${N}) Manajemen Kursus      ${G}6${N})  Quota Management"
  echo -e "  ${G}7${N}) Verifikasi Bayar      ${G}20${N}) Export Data"
  echo ""
  echo -e "${C}${BOLD}── AI & FITUR ──────────────────────────────────────────────────${N}"
  echo -e "  ${G}5${N}) AI Cost Tracking      ${G}21${N}) Feature Flags"
  echo -e "  ${G}28${N}) Input Materi (PDF/DOCX + AI)"
  echo ""
  echo -e "${C}${BOLD}── DATABASE ────────────────────────────────────────────────────${N}"
  echo -e "  ${G}9${N}) Lihat Tabel           ${G}10${N}) Run SQL Query"
  echo -e "  ${G}11${N}) Schema Diff           ${G}12${N}) Status Migrasi"
  echo -e "  ${G}13${N}) Push Migrasi          ${G}14${N}) Backup DB"
  echo -e "  ${G}15${N}) Restore DB            ${G}16${N}) DB Lint"
  echo -e "  ${G}24${N}) Reset DB (DEV only)"
  echo ""
  echo -e "${C}${BOLD}── DEVSECOPS ───────────────────────────────────────────────────${N}"
  echo -e "  ${G}17${N}) Security Advisor      ${G}18${N}) Performance Advisor"
  echo -e "  ${G}19${N}) Info System           ${G}22${N}) Push & Deploy"
  echo -e "  ${G}23${N}) Bersihkan Cache       ${G}27${N}) Bantuan"
  echo ""
  echo -e "  ${R}0${N}) Keluar"
  echo ""
  read -r -p "$(echo -e "${H}${BOLD}Pilih [0-28]:${N} ")" CHOICE

  case "$CHOICE" in
    1) dashboard ;;
    2) manajemen_guru ;;
    3) manajemen_siswa ;;
    4) manajemen_kursus ;;
    5) ai_cost_tracking ;;
    6) kuota ;;
    7) verifikasi_bayar ;;
    8) onboarding_status ;;
    9) db_tables ;;
    10) db_query ;;
    11) schema_diff ;;
    12) status_migrasi ;;
    13) push_migrasi ;;
    14) backup_db ;;
    15) restore_db ;;
    16) db_lint ;;
    17) security_advisor ;;
    18) performance_advisor ;;
    19) info_system ;;
    20) export_data ;;
    21) feature_flags ;;
    22) push_deploy ;;
    23) bersihkan_cache ;;
    24) reset_db_dev ;;
    25) analytics ;;
    26) check_koneksi ;;
    27) bantuan ;;
    28) input_materi ;;
    0) echo -e "\n${G}${BOLD}✦ AKAL Center — Sampai jumpa! ✦${N}\n"; exit 0 ;;
    *) err "Pilihan tidak valid."; sleep 1 ;;
  esac
done
