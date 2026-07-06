---
name: scanweb
description: "Website comprehensive scanner — auto-discover semua halaman, CMS detection, REST API, security headers, design system, taxonomies, assets. Satu perintah: 'scan website https://contoh.com' → otomatis scan semua aspek & simpan ke ~/agensi/contohweb/{domain}/SCAN-LENGKAP.md. Trigger: 'scan website', 'scan situs', 'scan domain', 'full scan', 'scan web', 'analisis website', 'inspect website', 'website audit', 'audit situs', 'cek website komprehensif', 'scan lengkap'. Panggil skill ini SETIAP KALI user menyebut URL dan ingin dianalisis secara menyeluruh. Cocok untuk WordPress dan non-WordPress. Output: file laporan markdown setara corporate-grade dengan 25+ section."
allowed-tools: [webfetch, bash, grep, glob, read, task]
metadata:
  author: Agensi / OpenCode
  version: "1.0.0"
  scope: website analysis
  updated: "2026-06-26"
  based_on: "sgp-indonesia.org real scan (28 sections, 1000+ lines)"
---

# 🌐 SCANWEB — Website Comprehensive Scanner v1.0

> Skill ini melakukan scan komprehensif terhadap sebuah website — dari struktur halaman, teknologi, keamanan, design system, konten, hingga asset — dan menyimpan hasilnya dalam format markdown corporate-grade di `~/agensi/contohweb/{domain}/SCAN-LENGKAP.md`.

---

## ⚡ TRIGGER PENGERJAAN (pahami urutan ini)

| Langkah | Waktu | Output |
|---------|-------|--------|
| **0. Parsing & Init** | 10 detik | Folder target dibuat |
| **1. Sitemap Discovery** | 20 detik | Semua halaman ditemukan |
| **2. Recon** | 20 detik | Headers, server, redirect chain, SSL, WAF |
| **3. CMS Fingerprint** | 15 detik | CMS terdeteksi + versi |
| **4. WordPress Scan** (jika WP) | 2-5 menit | REST API, plugins, users, taxonomies, posts |
| **5. Page Scan** | 1-3 menit per halaman | Struktur HTML tiap halaman |
| **6. Design System** | 30 detik | Warna, font, CSS tokens, responsive |
| **7. Security Scan** | 30 detik | Headers, exposed files, forms |
| **8. Assets** | 30 detik | JS, CSS, media, upload folder structure |
| **9. Compilation** | 1 menit | SCAN-LENGKAP.md final |

### Parallel Execution
Gunakan `task` (subagent) untuk menjalankan langkah independen SECARA PARALEL:
- Sitemap, Recon, CMS Fingerprint → parallel
- Tiap halaman di Page Scan → parallel
- Design System, Security, Assets → parallel setelah Page Scan

---

## 🖐️ FASE 0 — PARSING & INIT

Dari perintah user, parse URL dan buat folder:

```bash
# Ekstrak domain dari URL
URL="https://contoh.com"
DOMAIN=$(echo "$URL" | sed -E 's|https?://||; s|/.*||')
FOLDER="/home/ngome/agensi/contohweb/${DOMAIN}"

# Buat folder
mkdir -p "$FOLDER"
```

**Catatan:**
- Handle `http://` dan `https://` — prefer HTTPS
- Handle trailing slash
- Handle path prefix (mis. `https://contoh.com/blog/`)
- Handle www vs non-www (cek keduanya)
- Simpan `DOMAIN` dan `URL_BASE` untuk digunakan di seluruh fase

---

## 🟢 FASE 1 — SITEMAP DISCOVERY (parallel task)

Tujuan: Temukan semua halaman website.

### 1a. Standard sitemaps (coba semua)
```
{sitemap_urls}
├── /sitemap.xml
├── /sitemap_index.xml
├── /wp-sitemap.xml               (WordPress 6+)
├── /sitemap-index.xml
├── /sitemaps/sitemap.xml
├── /sitemap/sitemap-index.xml
├── /sitemap/sitemap.xml
├── /robots.txt                   (parse Sitemap: directive)
├── /page-sitemap.xml             (Yoast SEO)
├── /post-sitemap.xml
├── /category-sitemap.xml
├── /post_tag-sitemap.xml
├── /rss
├── /feed/
├── /en/sitemap_index.xml         (Polylang prefix)
└── /sitemap.xml?id=1
```

Gunakan `webfetch` untuk coba setiap URL sitemap. Parsing XML untuk extract semua `<loc>` entries.

### 1b. Jika sitemap tidak ditemukan
Gunakan BFS crawling:
1. Fetch homepage
2. Extract semua `<a href>` links (internal only — same domain)
3. Ikuti setiap link sampai depth 3
4. Dedup semua URL
5. Kategorikan: page, post, archive, media

### 1c. Navigation menu scraping
Fetch homepage dan ekstrak semua menu item dari HTML:
- Cari `<nav>` element
- Cari semua `<a>` dalam struktur menu
- Catat teks link + URL

**Output Fase 1:**
```
FILE: sitemap.txt     — semua URL yang ditemukan
FILE: menu.json       — struktur navigasi
PAGES: [jumlah halaman ditemukan]
```

---

## 🟢 FASE 2 — RECON (parallel dengan Fase 1)

Gunakan `bash` dengan `curl` untuk analisis HTTP:

### 2a. Response Headers
```bash
# Headers lengkap (follow redirect)
curl -sI -L -m 15 "$URL" | head -50

# Headers spesifik
curl -sI -m 10 "$URL" | grep -i -E "content-security|x-frame|x-content|x-permitted|strict-transport|referrer|cache-control|server|powered-by|set-cookie|access-control|permissions|cross-origin|cf-ray|cf-cache" 2>/dev/null
```

Headers yang HARUS diperiksa:
| Header | Kategori | Severity jika missing |
|--------|----------|----------------------|
| Content-Security-Policy | Security | 🔴 High |
| Strict-Transport-Security | Security | 🟡 Medium |
| X-Frame-Options | Security | 🟡 Medium |
| X-Content-Type-Options | Security | 🟡 Medium |
| Referrer-Policy | Security | 🟢 Low |
| Permissions-Policy | Privacy | 🟢 Low |
| Set-Cookie | Security | Periksa HttpOnly/Secure/SameSite |
| server | Fingerprint | Catat versi |
| X-Powered-By | Fingerprint | Catat versi |
| cf-ray / cf-cache | CDN | Cloudflare detection |

### 2b. Redirect Chain
```bash
curl -sI -L -m 10 "$URL" 2>/dev/null | grep -E "^HTTP/|^location:|^Location:" 
```
Catat: http→https, www→non-www, domain→/en/ (Polylang), dll.

### 2c. SSL/TLS Info
```bash
echo | openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -dates -issuer -subject 2>/dev/null
```
Catat: issuer, valid from/to, subject.

### 2d. Server & CDN Detection
- Cloudflare: cf-ray, cf-cache-status headers
- nginx: `server: nginx`
- Apache: `server: Apache`
- Catat juga IP asli (jika terlihat)

**Output Fase 2:**
```
FILE: headers.txt      — full response headers
FILE: redirect.txt     — redirect chain
FILE: ssl.txt          — SSL certificate info
```

---

## 🟢 FASE 3 — CMS FINGERPRINT (parallel dengan Fase 1-2)

Dari homepage HTML, deteksi CMS dengan signal berikut:

### Signal CMS Detection

| CMS | Signal | Cara Cek |
|-----|--------|----------|
| **WordPress** | `<meta name="generator" content="WordPress ...">` | HTML meta |
| | `/wp-content/` di CSS/JS path | HTML link/script src |
| | `/wp-json/` REST API response | `webfetch $URL/wp-json/` |
| | `Link: <...wp-json...>` header | `curl -sI $URL` |
| | `/wp-admin/` returns 200/302 | `curl -sI $URL/wp-admin/` |
| | `/xmlrpc.php` exists | `curl -sI $URL/xmlrpc.php` |
| | `wp-emoji-release` in HTML | HTML scan |
| | `/wp-includes/` in paths | HTML scan |
| **Joomla** | `<meta name="generator" content="Joomla!">` | HTML meta |
| | `/components/` , `/modules/` in paths | HTML scan |
| **Drupal** | `<meta name="Generator" content="Drupal">` | HTML meta |
| | `/sites/default/` in paths | HTML scan |
| **Shopify** | `/cdn/shop/` in paths | HTML scan |
| | `myshopify.com` | DNS |
| **Wix** | `wix.com` in HTML | HTML scan |
| **Static HTML** | No CMS signals detected | HTML scan |

### WordPress Version Detection (jika WP)
1. Cek `<meta name="generator" content="WordPress X.X.X">`
2. Cek `/wp-json/` response untuk versi API
3. Cek `/wp-includes/version.js`
4. Cek `readme.html` (sering diblock)

### Plugin Detection (jika WP)
1. Cek `/wp-json/wp/v2/types` — lihat post types
2. Cek HTML class names untuk theme/page builder signals:
   - `elementor-*` → Elementor
   - `et-*` , `xstore` → XStore theme
   - `wpcf7` → Contact Form 7
   - `woocommerce` → WooCommerce
   - `wp-rocket` → WP Rocket
   - `vc_*` → WPBakery
   - `fl-builder-*` → Beaver Builder
   - Avada, Enfold, Divi → theme-specific
3. Cek `/wp-content/themes/{theme-name}/style.css` — theme name + version
4. Cek `/wp-content/plugins/` — plugin name (403 = exists)

### Yoast SEO Detection
Cek HTML untuk `<!-- This site is optimized with the Yoast SEO plugin vX.X -->`
Atau `yoast_head_json` di REST API response.

**Output Fase 3:**
```
CMS_DETECTED: WordPress/Joomla/Drupal/Static
THEME: nama + versi (jika WP)
PLUGINS: daftar plugin terdeteksi
PAGE_BUILDER: Elementor/WPBakery/dll
SEO_PLUGIN: Yoast/RankMath/dll
CACHE_PLUGIN: WP Rocket/W3 Total Cache/dll
```

---

## 🔵 FASE 4 — WORDPRESS SCAN (conditional — hanya jika WP detected)

Jalankan hanya jika Fase 3 mendeteksi WordPress. Nilai `URL_BASE = https://domain`.

### 4a. REST API Endpoint Scan
Gunakan `webfetch` untuk setiap endpoint:

```
Endpoint                          | Tujuan
──────────────────────────────────┼─────────────────────────
/wp-json/                        | Root API — cek namespace & auth
/wp-json/wp/v2/                  | Cek semua routes
/wp-json/wp/v2/posts?per_page=1  | Posts (cek jumlah total via header)
/wp-json/wp/v2/pages?per_page=1  | Pages
/wp-json/wp/v2/media?per_page=1  | Media library
/wp-json/wp/v2/types             | Post types
/wp-json/wp/v2/statuses          | Post statuses (hanya publish?)
/wp-json/wp/v2/taxonomies        | All taxonomies
/wp-json/wp/v2/categories        | Categories + post count
/wp-json/wp/v2/tags              | Tags + post count
/wp-json/wp/v2/users             | Users (cek 200/403/404)
/wp-json/wp/v2/comments          | Comments
/wp-json/wp/v2/settings          | Site settings (cek 401)
/wp-json/wp/v2/menus             | Navigation menus (cek 401)
/wp-json/wp/v2/themes            | Themes (cek 401)
/wp-json/wp/v2/plugins           | Plugins  (cek 401)
/wp-json/wp/v2/block-types       | Blocks
/wp-json/wp/v2/global-styles     | Global styles
/elementor/v1/globals            | Elementor globals (cek 401)
```

**Untuk setiap endpoint, catat:**
- Status code (200 = OK, 401 = protected, 403 = forbidden, 404 = not found)
- Jika 200: catat struktur response (jumlah items, fields)
- Jika 401/403: ✅ good (protected)

### 4b. Category & Taxonomy Detail
Dari `/wp/v2/categories`, ambil:
```
nama kategori         count          slug
────────────────────────────────────────────
...                   ...            ...
```

Dari `/wp/v2/tags`, ambil tags dengan count > 0.
Dari `/wp/v2/taxonomies`, catat semua taxonomy + REST base + for post type.

### 4c. Post Type Detail
Dari `/wp/v2/types`, catat:
```
post_type        slug           public    count_estimate
─────────────────────────────────────────────────────────
post             posts          ✅        ~[total via header]
page             pages          ✅        ~
attachment       media          ✅        ~
product          ...            ✅/❌     WooCommerce
etheme_portfolio ...            ✅/❌     Portfolio
...
```

### 4d. Exposed File Check
Gunakan `curl -sI -m 5` untuk check file berikut:
```
Path                      | Kode jika exist
──────────────────────────┼────────────────
/robots.txt               | 200 (baik) / 404 (blocked)
/readme.html              | 200 ❌ (bocor info WP versi)
/wp-admin/                | 302 (redirect ke login)
/wp-login.php             | 200 (halaman login)
/xmlrpc.php               | 200/405 (aktif)
/wp-config.php            | 403 (proteksi baik)
/wp-config.php~           | 200 ❌ (backup bocor)
/.env                     | 200 ❌ (env bocor)
/.git/config              | 200 ❌ (git bocor)
/debug.log                | 200 ❌ (debug log)
/wp-content/debug.log     | 200 ❌
/error.log                | 200 ❌
/install.php              | 200 ❌
/phpinfo.php              | 200 ❌
```

### 4e. User Enumeration
Coba metode berikut:
```
/wp-json/wp/v2/users          → 200? → users bocor
/?author=1                    → 302? → author archive
/?author=2                    → 302? → user enumeration
/wp-json/wp/v2/posts?author=1 → data post → author ID diketahui
```

### 4f. Author Info
Dari response Yoast SEO di REST API, ekstrak Schema.org Organization:
```
name: "SGP Indonesia"
logo: {url, width, height}
```

Cek juga author-sitemap.xml untuk daftar author.

---

## 🟡 FASE 5 — PAGE SCAN (setiap halaman dari Fase 1)

Untuk SETIAP halaman yang ditemukan di Fase 1, lakukan:

### 5a. Fetch Page
Gunakan `webfetch` dengan format `text` untuk setiap URL.

### 5b. Ekstrak Elemen Wajib
Dari HTML, ekstrak:

| Elemen | Regex/CSS Selector |
|--------|-------------------|
| Page Title | `<title>(.*)</title>` |
| Meta Description | `<meta name="description" content="(.*)">` |
| Generator | `<meta name="generator" content="(.*)">` |
| og:title | `<meta property="og:title" content="(.*)">` |
| og:image | `<meta property="og:image" content="(.*)">` |
| H1 | `<h1[^>]*>(.*)</h1>` |
| Canonical | `<link rel="canonical" href="(.*)">` |
| hreflang | `<link rel="alternate" hreflang="(.*)" href="(.*)">` |
| Schema JSON-LD | `<script type="application/ld\+json">(.*)</script>` |
| Breadcrumb | Elemen breadcrumb / JSON-LD BreadcrumbList |
| Language | `<html lang="(.*)">` |
| Menu items | `<nav` ... `</nav>` → semua `<a>` |
| Social links | URL mengandung facebook/twitter/instagram/linkedin/youtube |
| Contact info | phone, email, address patterns |
| Form | `<form` ... `</form>` |
| Footer | `<footer` ... `</footer>` |

### 5c. Page Type Classification
| Type | Signal |
|------|--------|
| Homepage | URL = domain root |
| About | URL mengandung `about` / `tentang` / `profile` |
| Contact | URL mengandung `contact` / `kontak` |
| Article/Post | URL mengandung year/month/day atau `/post` / `/article` / `/berita` |
| Archive | URL mengandung `/category/` / `/kategori/` / `/tag/` / `/author/` |
| Product | URL mengandung `/product/` / `/shop/` / `/produk/` |
| Gallery | URL mengandung `gallery` / `galeri` |
| FAQ | URL mengandung `faq` / `faqs` |
| Search | URL mengandung `?s=` / `/search/` |

### 5d. Content Sections
Untuk setiap halaman, catat:
- Jumlah section/div utama
- Judul masing-masing section
- Tipe konten (text, image, video, slider, table, form, map, card grid)
- CTA buttons (teks + link)

### 5e. 404 Page Test
Gunakan URL random: `$URL_BASE/asdfgh-ujiscan-tidak-ada/`

**Output Fase 5:**
```
FILE: pages/{slug}.txt     — text content tiap halaman
FILE: pages-summary.json   — metadata tiap halaman
PAGES_SCANNED: jumlah halaman
404_BEHAVIOR: custom / default template
```

---

## 🟡 FASE 6 — DESIGN SYSTEM

### 6a. Color Palette Extraction
Dari CSS yang ditemukan, ekstrak warna dominan:

```bash
# Ekstrak warna dari CSS file
curl -s "$CSS_URL" | grep -oP '#[0-9a-fA-F]{6}' | sort -u | head -20
curl -s "$CSS_URL" | grep -oP 'rgba?\([^)]+\)' | sort -u | head -10
```

Catat:
- Primary, secondary, accent colors
- Text colors (dark/light)
- Background colors
- Status colors (success, warning, error)

### 6b. Typography
Dari HTML `<link>` atau CSS `@import` / `@font-face`:
- Font names (Google Fonts, Typekit, custom)
- Font fallback stack
- Sizes yang sering dipakai
- Line-height patterns

### 6c. CSS Architecture
Catat file CSS utama:
```
File                          | Ukuran | Fungsi
──────────────────────────────┼────────┼──────────────
style.css                     | ?      | Theme utama
bootstrap.min.css             | ?      | Grid system
elementor/frontend.min.css    | ?      | Elementor
...
```

Deteksi CSS framework: Bootstrap, Tailwind, Foundation, Bulma, Materialize.

### 6d. Component Visual Tokens
Dari CSS yang diparse, catat:
- `border-radius` values (button, card, input)
- `box-shadow` patterns
- `transition` durations
- `container` max-width
- `@media` breakpoints

### 6e. Responsive Breakpoints
Dari CSS @media queries dan HTML meta viewport:
```
Mobile:  max-width Xpx
Tablet:  max-width Ypx
Desktop: > Ypx
```

**Output Fase 6:**
```
FILE: colors.txt         — daftar warna
FILE: typography.txt     — font stack
FILE: css-files.txt      — CSS file list
FILE: design-tokens.md   — tokens terstruktur
```

---

## 🟠 FASE 7 — SECURITY SCAN

Jalankan setelah Fase 2 & 4 selesai:

### 7a. Security Headers Checklist (dari Fase 2)
```
CSP:         ✅/❌
HSTS:        ✅/❌   (max-age?)
XFO:         ✅/❌   (DENY/SAMEORIGIN)
XCTO:        ✅/❌   (nosniff)
RP:          ✅/❌   (strict-origin-when-cross-origin)
PP:          ✅/❌
```

### 7b. Form Security
Untuk setiap form yang ditemukan:
- Action URL (HTTPS?)
- Input fields (password, email, file, hidden)
- reCAPTCHA terpasang?
- CSRF token terlihat?
- Method POST/GET

### 7c. Sensitive Info in HTML
Grep HTML untuk:
- `wp-config` — path disclosure
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` — credential leak
- `define( 'DB_` — WP config leak
- `apikey`, `api_key`, `secret` — hardcoded secrets
- `-----BEGIN` — private keys
- `password`, `passwd` — exposed passwords
- Internal IP (`192.168.`, `10.`)

### 7d. Form & Authentication
Deteksi halaman login: `/wp-admin`, `/wp-login`, `/login`, `/signin`, `/masuk`
Deteksi register: `/register`, `/signup`, `/daftar`

**Output Fase 7:**
```
SECURITY_HEADERS: status per header
FORMS_FOUND: jumlah + detail
LOGIN_PAGE: URL jika ada
SENSITIVE_LEAK: ada/tidak
```

---

## 🟠 FASE 8 — ASSET & PERFORMANCE

### 8a. JavaScript Files
Dari HTML, ekstrak semua `<script src="">`:
```
File                              | Ukuran (jika diketahui)
──────────────────────────────────┼───────────────────────────
jquery.min.js                     | ~87 KB
theme/scripts.min.js              | ~? (bundled)
elementor/frontend.min.js         | ~?
...
```

Deteksi JS framework: React, Vue, Angular, jQuery, Alpine, htmx

### 8b. Media Library Structure
Coba akses folder upload:
```
/wp-content/uploads/
/wp-content/uploads/2026/
/wp-content/uploads/2025/
...
```

Jika folder listing tidak enabled, coba single file dari REST API media endpoint.
Catat struktur folder per tahun + jenis file dominan.

### 8c. Page Load Estimate
Estimasi berdasarkan file yang ditemukan:
```
HTML:  ~50-120 KB
CSS:   ~200-400 KB (combined)
JS:    ~300-500 KB (combined)
Images:~300-800 KB (lazy loaded)
Fonts: ~100-200 KB
Total: ~1-2 MB per page
```

**Output Fase 8:**
```
FILE: js-files.txt       — daftar JS
FILE: media-structure.txt — struktur upload
PERFORMANCE_ESTIMATE: total KB per page
```

---

## 🔴 FASE 9 — COMPILATION

Setelah semua fase selesai, tulis file `$FOLDER/SCAN-LENGKAP.md`.

### Template Wajib (gunakan dari diskusi intelligence framework)

```
# 📋 SCAN LENGKAP: {domain}
**Tanggal:** {current date}
**Tools:** WebFetch, WP REST API, cURL, Sitemap XML, {tools used}
**Total halaman di-scan:** {N} pages
**Status scan:** ✅ Complete / ⚠️ Partial

---

## 1. IDENTITAS SITUS
(domain, tagline, tech stack, hosting/CDN, server, SSL, bahasa, SEO plugin, cache, logo)

## 2. TEKNOLOGI & PLUGIN TERDETEKSI
(CMS, theme, page builder, WooCommerce, form builder, cache, security plugins, social media, analytics, reCAPTCHA)

## 3. RESPONSE HEADERS & KEAMANAN HTTP
(redirect chain, setiap header periksa ✅/❌, security assessment per aspek)

## 4. DESIGN SYSTEM & CSS TOKENS
### 4.1 Warna
### 4.2 Tipografi
### 4.3 Komponen Visual (radius, shadow, transition, container)
### 4.4 Responsive Breakpoints

## 5. STRUKTUR HALAMAN
(tabel semua halaman: #, nama, slug, menu status, live status)

## 6. HALAMAN BERANDA (Detail Struktur)
### 6.1 Header
### 6.2 Main Content (setiap section: nama, konten, layout)
### 6.3 Footer

## 7. CALL FOR PROPOSAL / RFP / GRANT (jika ada)
## 8. PUBLIKASI / ARTIKEL / BLOG
## 9. TENTANG KAMI
## 10. GALERI (Photo, Video, Instagram)
## 11. KONTAK
## 12. PANDUAN / GUIDELINES / DOWNLOAD
## 13. FAQs
## 14. NEWSLETTER (jika ada)
## 15. SINGLE POST / ARTICLE LAYOUT
## 16. PRODUK / SHOP (jika WooCommerce)
## 17. TAXONOMIES & KATEGORI KONTEN
## 18. NAVIGASI DETAIL
## 19. ASSET & PERFORMANCE
## 20. SITEMAP INDEX
## 21. ARSITEKTUR INFORMASI — SITE MAP
## 22. WORDPRESS CUSTOM POST TYPES & TAXONOMIES (jika WP)
## 23. SECURITY ASSESSMENT
## 24. HUJAN OBSERVASI & TEMUAN (Critical, High, Info)
## 25. RINGKASAN EKSEKUTIF

### Observasi Types
- 🔴 Critical — harus segera diperbaiki (no security headers, data leak, dummy content)
- 🟡 High — perlu perhatian (broken links, empty sections, unused features)
- 🟢 Info — catatan penting (design decisions, tech choices, discovered patterns)

---

## 25. RINGKASAN EKSEKUTIF

### Status: ✅ PRODUCTION / ⚠️ MAINTENANCE / ❌ BROKEN

| Aspek | Penilaian |
|-------|-----------|
| **Fungsional** | ✅/⚠️/❌ |
| **Design** | ✅/⚠️/❌ |
| **SEO** | ✅/⚠️/❌ |
| **Performance** | ✅/⚠️/❌ |
| **Keamanan** | ✅/⚠️/❌ |
| **Konten** | ✅/⚠️/❌ |
| **Maintenance** | ✅/⚠️/❌ |

### Catatan Penting
{3-5 key findings yang paling penting}

---

*SCAN LENGKAP — {domain} ({current date})*
*Tools: {tools}*
*Total sections: {total}*
```

### Penting untuk Kompilasi
1. **Konsisten:** Gunakan format tabel yang sama di semua section
2. **Detail:** Tiap section minimal 5-10 baris observasi
3. **Evidence:** Sertakan URL, path file, CSS class, HTML structure
4. **Kategorisasi Temuan:** Setiap observasi harus punya severity label
5. **Ringkasan Eksekutif:** Di akhir — layak/tidak untuk dijadikan referensi

---

## 🚫 LARANGAN KERAS

1. **JANGAN skip fase** — urutan wajib diikuti
2. **JANGAN asumsi** — semua klaim harus dari hasil scan, bukan tebakan
3. **JANGAN scan semua page sequential** — gunakan parallel `task` subagents
4. **JANGAN terlalu banyak pertanyaan ke user** — kerjakan semaunya, hanya tanya jika benar-benar stuck
5. **JANGAN buat file di luar `contohweb/{domain}/`** — semua hasil scan di folder itu
6. **JANGAN hapus folder sebelumnya** — buat folder baru, jangan overwrite
7. **JANGAN gunakan external tools** — hanya pakai webfetch, bash (curl), task subagents
8. **JANGAN skip WordPress REST API** jika CMS terdeteksi WordPress — ini sumber data terbanyak
9. **JANGAN tulis fix atau rekomendasi kode** — skill ini hanya untuk dokumentasi dan observasi
10. **JANGAN lupa 404 test** — selalu tes halaman yang tidak ada

---

## 📍 METADATA OUTPUT

Folder hasil: `~/agensi/contohweb/{domain}/`
File utama: `SCAN-LENGKAP.md`
File pendukung (optional):
```
sitemap.txt              — semua URL ditemukan
menu.json                — struktur navigasi (JSON)
headers.txt              — HTTP headers
redirect.txt             — redirect chain
ssl.txt                  — SSL cert info
design-tokens.md         — extracted design tokens
pages/                   — raw text per halaman
pages-summary.json       — metadata per halaman
```
