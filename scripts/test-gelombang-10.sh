#!/usr/bin/env bash
# ============================================================
# TEST GELOMBANG 10 — Hardening Minimum
# JALANKAN SAAT APP HIDUP (docker compose up + npm run dev)
# ============================================================
set -euo pipefail
BASE="${BASE:-http://localhost:3000}"
PASS=0
FAIL=0

green() { echo -e "\033[32m✅ PASS\033[0m $1"; }
red()   { echo -e "\033[31m❌ FAIL\033[0m $1"; }

# ─── Helper ───
assert_status() {
  local desc="$1" url="$2" expected="$3"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [ "$code" = "$expected" ]; then
    green "$desc (HTTP $code)"
    PASS=$((PASS+1))
  else
    red "$desc — expected $expected, got $code"
    FAIL=$((FAIL+1))
  fi
}

assert_body() {
  local desc="$1" url="$2" keyword="$3"
  if curl -s "$url" 2>/dev/null | grep -q "$keyword"; then
    green "$desc"
    PASS=$((PASS+1))
  else
    red "$desc — tidak mengandung '$keyword'"
    FAIL=$((FAIL+1))
  fi
}

echo ""
echo "═══════════════════════════════════════════════"
echo "  TEST GELOMBANG 10 — Hardening Minimum"
echo "  Base URL : $BASE"
echo "  $(date)"
echo "═══════════════════════════════════════════════"
echo ""

# ─── 1. HEALTH CHECK ───
echo "─── 1. Health Check ───"
assert_status  "Health endpoint"          "$BASE/api/health"  200
assert_body   "Health: services object"   "$BASE/api/health"  "postgres"
assert_body   "Health: responseTimeMs"    "$BASE/api/health"  "responseTimeMs"

assert_status  "Readyz endpoint"           "$BASE/api/readyz"  200
assert_body   "Readyz: database"          "$BASE/api/readyz"  "database"

# ─── 2. AUTH — Portal Intent ───
echo ""
echo "─── 2. Auth: Portal Intent ───"
echo "   (Tes manual — butuh akun test)"

echo "   [MANUAL] Login guru dari portal guru → harus sukses, redirect ke /guru"
echo "   [MANUAL] Login siswa dari portal guru → harus 403 INTENT_MISMATCH"
echo "   [MANUAL] Login guru dari portal siswa → harus 403 INTENT_MISMATCH"
echo "   [MANUAL] Login siswa dari portal siswa → harus sukses, redirect ke /siswa"
echo "   [MANUAL] Google login guru → sukses, redirect ke /guru"
echo "   [MANUAL] Google login siswa dari portal guru → skenario role-mismatch"

# ─── 3. UPLOAD ───
echo ""
echo "─── 3. Upload (butuh cookie guru) ───"
echo "   [MANUAL] Upload PDF valid → status 201, file muncul di daftar"
echo "   [MANUAL] Upload DOCX valid → status 201"
echo "   [MANUAL] Upload file .exe → harus 415"
echo "   [MANUAL] Upload file > 10MB → harus 413"
echo "   [MANUAL] Upload PDF dengan magic bytes palsu → harus 415"
echo "   [MANUAL] Upload tanpa session → harus 401"
echo "   [MANUAL] Upload tanpa role guru → harus 403"

# ─── 4. AI GENERATION ───
echo ""
echo "─── 4. AI Generation ───"
echo "   [MANUAL] Upload file → status 'queued' → berubah ke 'ready'"
echo "   [MANUAL] Draft muncul di /guru/drafts dengan status 'draft'"
echo "   [MANUAL] Approve materi → status berubah ke 'approved'"
echo "   [MANUAL] Close review → konten terpublish"
echo "   [MANUAL] Generate ulang → draft baru dengan ID baru"

# ─── 5. ROLE REDIRECT ───
echo ""
echo "─── 5. Role Redirect ───"
echo "   [MANUAL] Login sebagai OWNER → redirect ke /owner"
echo "   [MANUAL] Login sebagai ADMIN_SEKOLAH → redirect ke /admin-sekolah"
echo "   [MANUAL] Login sebagai ORANG_TUA → redirect ke /orang-tua"
echo "   [MANUAL] Akses /owner sebagai guru → redirect ke /guru"
echo "   [MANUAL] Akses /guru sebagai siswa → redirect ke /siswa"

# ─── 6. RATE LIMITING ───
echo ""
echo "─── 6. Rate Limiting ───"
echo "   [MANUAL] Kirim 6x POST /api/v1/auth/login dalam 15 detik → ke-6 kena 429"

# ─── 7. LEGACY REDIRECT ───
echo ""
echo "─── 7. Legacy Redirect ───"
assert_status  "/login → /masuk"           "$BASE/login"       307
assert_status  "/masuk-guru → /masuk"      "$BASE/masuk-guru"  307
assert_status  "/register → /daftar"       "$BASE/register"    307

echo ""
echo "═══════════════════════════════════════════════"
echo "  HASIL: $PASS PASS, $FAIL FAIL (otomatis)"
echo "  + 20+ skenario manual"
echo "═══════════════════════════════════════════════"
echo ""
echo "Jalankan dengan:"
echo "  docker compose up -d"
echo "  npm run dev"
echo "  bash scripts/test-gelombang-10.sh"
