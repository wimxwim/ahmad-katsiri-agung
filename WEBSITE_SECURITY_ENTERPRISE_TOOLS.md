# Enterprise-Grade Website Security Hardening Tools & Frameworks

Referensi komprehensif tools dan framework keamanan website setara standar
perusahaan internasional (Google, Microsoft, Stripe, Cloudflare, dll).

Dibuat: 12 Juni 2026

---

## Daftar Isi

1. [Security Headers Analyzers](#1-security-headers-analyzers)
2. [CSP (Content Security Policy) Evaluators](#2-csp-content-security-policy-evaluators)
3. [WAF Rules & Managed Rulesets](#3-waf-rules--managed-rulesets)
4. [OWASP Top 10 Protection](#4-owasp-top-10-protection)
5. [OWASP ASVS (Application Security Verification Standard)](#5-owasp-asvs)
6. [SSL/TLS Testing & Certificate Tools](#6-ssltls-testing--certificate-tools)
7. [Mozilla Observatory](#7-mozilla-observatory)
8. [Cloudflare Security Optimization](#8-cloudflare-security-optimization)
9. [Enterprise Security Checklists](#9-enterprise-security-checklists)
10. [Additional Enterprise-Grade Tools](#10-additional-enterprise-grade-tools)

---

## 1. Security Headers Analyzers

### 1.1 SecurityHeaders.com
- **URL:** https://securityheaders.com
- **Type:** Online scanner / API
- **Fitur:**
  - Menganalisis HTTP response headers situs
  - Memberi rating A+, A, B, C, D, F
  - Mendeteksi: Strict-Transport-Security, X-Content-Type-Options,
    X-Frame-Options, Content-Security-Policy, Referrer-Policy,
    Permissions-Policy, X-XSS-Protection (deprecated)
- **Use case:** Quick audit & continuous monitoring via API
- **Enterprise use:** API key untuk scan otomatis di CI/CD pipeline

### 1.2 Mozilla Observatory
- **URL:** https://observatory.mozilla.org
- **Type:** Online scanner + API + CLI
- **Fitur:**
  - Scan HTTP headers, TLS config, CSP, Subresource Integrity, Cookies
  - Scoring system (0-135)
  - CLI tool: `npm install -g observatory-cli`
- **Enterprise use:** Integrasi CI/CD; bisa di-run sebagai bagian dari
  pipeline deployment

### 1.3 recx-security-headers (GitHub)
- **URL:** https://github.com/recx/recx-security-headers
- **Type:** CLI tool (Node.js)
- **Fitur:**
  - CLI untuk test security headers
  - Bisa diintegrasikan ke bash scripts / pipeline
- **Use case:** Automated header checking dalam deployment

### 1.4 Snyk Headers
- **URL:** https://snyk.io/security-headers
- **Type:** Online scanner
- **Fitur:**
  - Scan dan rekomendasi security headers
  - Terintegrasi dengan ecosystem Snyk
- **Enterprise use:** Bagian dari Snyk platform untuk AppSec

### 1.5 Probely Security Headers Check
- **URL:** https://probely.com
- **Type:** DAST scanner (termasuk header analysis)
- **Fitur:**
  - DAST scanning termasuk security headers
  - CI/CD integration
  - OWASP Top 10 coverage

---

## 2. CSP (Content Security Policy) Evaluators

### 2.1 CSP Evaluator (csp-evaluator.withgoogle.com)
- **URL:** https://csp-evaluator.withgoogle.com
- **Type:** Online tool (by Google)
- **Fitur:**
  - Evaluate CSP policies for misconfigurations
  - Deteksi unsafe-inline, wildcard, weak directives
  - Berikan severity rating untuk setiap issue
- **Enterprise use:** Wajib di-run sebelum deploy CSP ke production

### 2.2 CSP Scanner
- **URL:** https://github.com/yahoo/cspscanner (Yahoo)
- **Type:** CLI tool
- **Fitur:**
  - Static analysis untuk CSP headers
  - Deteksi bypass pattern
  - Automated scanning

### 2.3 CSP Guard (Browser Extension)
- **URL:** Chrome Web Store / Firefox Add-ons
- **Type:** Browser extension
- **Fitur:**
  - Report-only mode testing
  - Violation report viewer
  - Policy generation wizard

### 2.4 report-uri.com / report-uri.io
- **URL:** https://report-uri.com
- **Type:** SaaS (CSP Reporting service)
- **Fitur:**
  - CSP violation report collector
  - Real-time monitoring
  - Policy generation & recommendations
- **Enterprise use:** Production CSP monitoring with real reports

### 2.5 URIports
- **URL:** https://uriports.com
- **Type:** SaaS (alternative to Report URI)
- **Fitur:**
  - CSP, Expect-CT, HPKP reporting
  - Dashboard analytics
  - Team collaboration

### 2.6 Google's CSP Mitigator (CSP Mitigator)
- **URL:** https://github.com/google/csp-mitigator
- **Type:** Library + Extension
- **Fitur:**
  - Tool untuk transisi ke strict CSP
  - Bantu migrate dari allowlist-based ke nonce-based CSP

---

## 3. WAF Rules & Managed Rulesets

### 3.1 Cloudflare WAF Managed Rules
- **Type:** Cloudflare Managed
- **Fitur:**
  - Cloudflare Managed Ruleset (OWASP, Cloudflare Specials)
  - Rate Limiting rules
  - Bot Management (Machine Learning)
  - Custom rule engine
- **Enterprise plan:**
  - OWASP Core Ruleset (CRS) integration
  - Custom WAF rules with field-level filtering
  - WAF attack score analytics
  - Managed IP reputation lists
- **Recommended rule categories:**
  - Cloudflare Managed: OWASP Top 10, SQLi, XSS, LFI, RCE, RFI
  - Cloudflare Specials: berbagai CVE-specific rules
  - Rate Limiting: berdasarkan IP, ASN, country, path

### 3.2 AWS WAF
- **Type:** AWS Managed
- **Fitur:**
  - AWS Managed Rules (OWASP Top 10, SQLi, XSS)
  - Bot Control
  - IP reputation lists (AWS Shield + third-party)
  - Rate-based rules
- **Integrasi:** CloudFront, ALB, API Gateway

### 3.3 Azure Web Application Firewall
- **Type:** Azure Managed
- **Fitur:**
  - OWASP Core Rule Set (CRS 3.2)
  - Bot Manager
  - Custom rules + rate limiting
  - Geo-filtering
- **Integrasi:** Azure Front Door, Application Gateway, CDN

### 3.4 Google Cloud Armor
- **Type:** GCP Managed
- **Fitur:**
  - OWASP CRS rules
  - Pre-configured WAF rules
  - Adaptive protection (ML-based threat detection)
  - Rate limiting, geo-based access control
- **Integrasi:** Cloud Load Balancing, Cloud CDN

### 3.5 ModSecurity + CRS (Open Source)
- **URL:** https://github.com/coreruleset/coreruleset
- **Type:** Open Source WAF engine + OWASP CRS
- **Fitur:**
  - OWASP Core Rule Set (CRS) v3.3.x
  - Protection from SQLi, XSS, LFI, RCE, PHP Injection
  - Paranoia level configuration (1-4)
  - Dapat di-deploy di Apache, Nginx, reverse proxy
- **Enterprise use:** Self-managed WAF di depan aplikasi

### 3.6 Signal Sciences (by Fastly)
- **URL:** https://www.fastly.com/products/security
- **Type:** SaaS WAF + RASP (Next-Gen WAF)
- **Fitur:**
  - Positive + negative security model
  - RASP (Runtime Application Self-Protection)
  - Automated threat detection
  - API security
- **Enterprise use:** Modern architecture, microservices-friendly

### 3.7 Imunify360
- **URL:** https://www.imunify360.com
- **Type:** Server-level security suite
- **Fitur:**
  - WAF + IDS/IPS + Antivirus
  - OWASP Top 10 protection
  - Patch management for CMS (WordPress, Joomla, etc.)
- **Enterprise use:** Hosting provider environment

---

## 4. OWASP Top 10 Protection

### 4.1 OWASP Top 10 - Official Resources
- **URL:** https://owasp.org/www-project-top-ten/
- **Version:** 2021 (latest stable)
- **Kategori:**
  1. Broken Access Control
  2. Cryptographic Failures
  3. Injection (SQL, NoSQL, OS, LDAP)
  4. Insecure Design
  5. Security Misconfiguration
  6. Vulnerable and Outdated Components
  7. Identification and Authentication Failures
  8. Software and Data Integrity Failures
  9. Security Logging and Monitoring Failures
  10. Server-Side Request Forgery (SSRF)

### 4.2 Tools untuk OWASP Top 10 Coverage

**DAST (Dynamic Analysis):**
- **OWASP ZAP** (https://www.zaproxy.org) - Free, full-featured
- **Burp Suite Professional** (https://portswigger.net/burp) - Enterprise
- **Acunetix** - Premium DAST + OWASP coverage
- **Netsparker** (Invicti) - DAST with auto-verification
- **Probely** - DAST as a Service

**SAST (Static Analysis):**
- **SonarQube** (https://www.sonarsource.com) dengan Security Hotspots
- **Checkmarx** - CxSAST enterprise
- **Fortify** (Micro Focus) - Enterprise SAST
- **Semgrep** (https://semgrep.dev) - Open source + enterprise
- **ESLint-plugin-security** - For Node.js/JS projects

**SCA (Software Composition Analysis):**
- **Snyk** (https://snyk.io) - Developer-first
- **GitHub Dependabot** - Built-in GitHub
- **OWASP Dependency-Check** (free)
- **Trivy** (https://github.com/aquasecurity/trivy) - Free, fast
- **WhiteSource/Mend** - Enterprise SCA

**Container Security:**
- **Docker Scout** - Image scanning
- **Clair** (Quay) - Open source container vuln scanner
- **Trivy** - Container + filesystem scanning
- **Anchore** - Enterprise container security

---

## 5. OWASP ASVS (Application Security Verification Standard)

### 5.1 OWASP ASVS
- **URL:** https://owasp.org/www-project-application-security-verification-standard/
- **Version:** 4.0.3 (latest)
- **Levels:**
  - **L1:** Basic protection (semua aplikasi) - 44 requirements
  - **L2:** Standard (aplikasi yang handle sensitive data) - 128 requirements
  - **L3:** Advanced (aplikasi critical / high-value) - 174 requirements

### 5.2 Tools untuk ASVS Assessment

- **ASVS Checklist (Excel/CSV):** Download langsung dari OWASP
- **ASVS Automated Testing:**
  - OWASP ZAP dengan ASVS rules
  - Postman collections dengan ASVS-based tests
  - Gauntlt (BDD-style security testing framework)
- **ASVS-L4 (Automated):**
  - Menggunakan OWASP ZAP API + custom scripts
  - Integrasi dengan Jira untuk issue tracking

### 5.3 Enterprise ASVS Implementation
- **DefectDojo** (https://www.defectdojo.org) - Open source
  vulnerability management. Import ASVS assessment results
- **ThreadFix** - Vulnerability aggregation + management
- **Jira + Xray** - Test management for ASVS verification

---

## 6. SSL/TLS Testing & Certificate Tools

### 6.1 SSL Labs (Qualys)
- **URL:** https://www.ssllabs.com/ssltest/
- **Type:** Online scanner
- **Fitur:**
  - Rating A+ to F
  - Check certificate chain, cipher strength, TLS version
  - Protocol support (TLS 1.0 - 1.3)
  - BEAST, POODLE, Heartbleed, etc. vulnerability scan
- **Enterprise use:** SSL Labs API untuk automated scanning

### 6.2 testssl.sh
- **URL:** https://github.com/drwetter/testssl.sh
- **Type:** CLI tool (bash)
- **Fitur:**
  - Command-line SSL/TLS testing
  - 350+ tests
  - Color-coded output (red/yellow/green)
  - Dapat diintegrasikan ke monitoring scripts
- **Enterprise use:** Automated SSL audit di pipeline

### 6.3 Certbot / Let's Encrypt
- **URL:** https://certbot.eff.org
- **Type:** ACME client
- **Fitur:**
  - Automated SSL certificate provisioning
  - Auto-renewal
  - Integrasi dengan Nginx, Apache, HAProxy
- **Enterprise use:** Auto SSL management

### 6.4 Certificate Transparency Tools
- **crt.sh** (https://crt.sh) - Certificate search
- **Google Certificate Transparency** - CT log monitoring

---

## 7. Mozilla Observatory

### 7.1 Mozilla Observatory
- **URL:** https://observatory.mozilla.org
- **Type:** Online scanner + CLI
- **Scoring:** 0-135 points, dengan grade A+ to F
- **Test categories:**
  1. HTTP Headers (30 points max)
  2. TLS Configuration (30 points max)
  3. CSP (30 points max)
  4. Subresource Integrity (10 points max)
  5. Cookies (20 points max)
  6. Cross-Origin Resource Sharing (15 points max)

### 7.2 Observatory CLI
- **Install:** `npm install -g observatory-cli`
- **Use:** `observatory --zero --format pretty example.com`
- **Integrasi CI/CD:**
  ```bash
  # Contoh integrasi GitHub Actions
  observatory --zero example.com --format json | jq .score
  ```

### 7.3 Automated Monitoring
- Gunakan `observatory-cli` dengan cron/jenkins
- Kirim score ke Datadog / Prometheus sebagai metric
- Alert jika score turun di bawah threshold

---

## 8. Cloudflare Security Optimization

### 8.1 Cloudflare WAF (Web Application Firewall)
- **Managed Rulesets:**
  - Cloudflare Managed - OWASP Top 10 coverage
  - Cloudflare OWASP CRS - Core Rule Set
  - Cloudflare Specials - CVE-based rules
  - Cloudflare DDoS - L3/L7 DDoS protection
- **Custom Rules:**
  - Field-based filtering (URI, headers, body, IP, ASN)
  - Rate limiting rules
  - Expression-based rules (Wirefilter syntax)

### 8.2 Security Headers (Cloudflare)
- **Automatic HTTPS Rewrites:** Force HTTPS
- **SSL/TLS Configuration:**
  - Flexible / Full / Full (Strict) modes
  - Minimum TLS version (recommend: 1.2)
  - Always Use HTTPS (on by default)
- **HTTP Strict Transport Security (HSTS):**
  - Enable via Cloudflare Dashboard > SSL/TLS > Edge Certificates
  - max-age=31536000; includeSubDomains; preload

### 8.3 Bot Management
- **Bot Fight Mode:** Block or challenge bots
- **Super Bot Fight Mode:** Enterprise feature
  - ML-based bot detection
  - Verified bots allowlist (Google, Bing, etc.)
  - Definite automated / likely automated scoring
- **Rate Limiting:**
  - Per-IP, per-user (session), per-path
  - Custom thresholds based on traffic patterns

### 8.4 DDoS Protection
- **L3/L4 DDoS:** Infrastructure-level protection
- **L7 DDoS:** Application-level
  - Adaptive DDoS protection (ML-based)
  - Managed DDoS rulesets
  - Advanced DDoS analytics

### 8.5 Page Rules / Custom Caching
- **Security-focused Page Rules:**
  - Disable cache for sensitive paths (/admin, /api/*)
  - Always use HTTPS
  - Browser Integrity Check
  - Security Level (Essentially Off / Low / Medium / High / I'm Under Attack)

### 8.6 Zero Trust & API Shield
- **API Shield:** Endpoint-level security for APIs
- **Cloudflare Access:** Zero Trust authentication
- **Cloudflare Gateway:** DNS filtering + threat blocking
- **Mutual TLS (mTLS):** Untuk API authentication

### 8.7 Recommended Cloudflare Security Configuration

```
# Minimum Security Configuration
1. SSL/TLS: Full (Strict)
2. Minimum TLS Version: 1.2
3. Always Use HTTPS: ON
4. HSTS: Enable (max-age=31536000, includeSubDomains, preload)
5. WAF: Cloudflare Managed Rules (set to High)
6. Bot Fight Mode: ON (or Super Bot Fight Mode for Enterprise)
7. Rate Limiting: 100 req/10s per IP for non-static resources
8. Security Level: Medium (High under attack)
9. Browser Integrity Check: ON
10. Automatic HTTPS Rewrites: ON
11. Opportunistic Encryption: ON
12. HTTP/2, HTTP/3 (QUIC): ON
13. Early Hints: ON
14. Remove X-Powered-By: ON
```

---

## 9. Enterprise Security Checklists

### 9.1 Google-Style Web Security Checklist

**HTTP Security Headers:**
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` (or SAMEORIGIN)
- [ ] `Content-Security-Policy` (strict nonce-based)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- [ ] `Cross-Origin-Embedder-Policy: require-corp`
- [ ] `Cross-Origin-Opener-Policy: same-origin`
- [ ] `Cross-Origin-Resource-Policy: same-origin`
- [ ] Remove `X-Powered-By`, `Server` version header

**TLS/SSL:**
- [ ] TLS 1.2 minimum, prefer TLS 1.3
- [ ] Strong ciphers (AEAD ciphers only)
- [ ] Certificate from trusted CA (not self-signed)
- [ ] HSTS preload submission
- [ ] Certificate Transparency logging enabled
- [ ] OCSP Stapling enabled

**CSP Production Standard:**
- [ ] Nonce-based or hash-based strict CSP
- [ ] No `unsafe-inline` in script-src / style-src
- [ ] No wildcard `*` in script-src / object-src / base-uri
- [ ] `base-uri 'self'` atau `base-uri 'none'`
- [ ] `object-src 'none'`
- [ ] `frame-ancestors 'self'`
- [ ] Report-uri / report-to configured
- [ ] Use report-only mode first before enforcement

### 9.2 Stripe-Style Security Checklist

**Authentication & Session:**
- [ ] Multi-Factor Authentication (MFA) untuk admin
- [ ] Secure, HTTPOnly, SameSite cookies
- [ ] Session timeout (inactivity + absolute)
- [ ] CSRF tokens on all state-changing endpoints
- [ ] Rate limiting on login/registration endpoints
- [ ] Account lockout after N failed attempts
- [ ] Password complexity (min 12 chars, NIST guidelines)

**API Security:**
- [ ] API keys with least privilege
- [ ] Rate limiting per API key
- [ ] Authentication required (JWT / OAuth 2.0)
- [ ] Input validation on all endpoints
- [ ] Output escaping to prevent XSS
- [ ] API versioning
- [ ] Pagination (prevent data scraping)
- [ ] Audit logging for all API calls

**Data Protection:**
- [ ] Encryption at rest (AES-256)
- [ ] Encryption in transit (TLS 1.2+)
- [ ] PII/PCI data tokenization
- [ ] Data retention policies
- [ ] Access controls (RBAC/ABAC)
- [ ] Database encryption (TDE)
- [ ] Secrets management (HashiCorp Vault, AWS Secrets Manager)

**Monitoring & Response:**
- [ ] Security event logging (SIEM integration)
- [ ] Real-time alerting on anomalies
- [ ] Incident response plan documented
- [ ] Penetration testing (quarterly at minimum)
- [ ] Bug bounty program
- [ ] Security.txt file at /.well-known/security.txt

### 9.3 Microsoft Enterprise Security Baseline

- [ ] Azure Security Benchmark alignment
- [ ] Microsoft Defender for Cloud
- [ ] Azure AD Conditional Access policies
- [ ] Identity Protection (risky sign-in detection)
- [ ] Privileged Identity Management (PIM)
- [ ] Just-In-Time (JIT) VM access
- [ ] Network segmentation (VNET, NSG)
- [ ] Data classification + DLP policies
- [ ] Microsoft 365 Defender integration

---

## 10. Additional Enterprise-Grade Tools

### 10.1 Vulnerability Scanning & Management

| Tool | Type | Pricing | Key Feature |
|------|------|---------|-------------|
| **Tenable.io** | Vulnerability Management | Enterprise | Asset discovery + vuln scanning |
| **Qualys** | Cloud Security | Enterprise | Comprehensive scanning suite |
| **Rapid7 InsightVM** | Vuln Management | Enterprise | Real-time risk scoring |
| **DefectDojo** | Vuln Management | Open Source | Import dari banyak tools |
| **Nuclei** (ProjectDiscovery) | Fast scanning | Free/Enterprise | Template-based scanning |
| **OpenVAS / Greenbone** | Vuln Scanner | Free | Comprehensive scanning |

### 10.2 Secrets Scanning & Management

| Tool | Description |
|------|-------------|
| **GitLeaks** | Secrets scanning in git repos |
| **TruffleHog** | Secrets scanning with entropy detection |
| **HashiCorp Vault** | Enterprise secrets management |
| **AWS Secrets Manager** | Cloud-native secrets store |
| **Azure Key Vault** | Cloud-native secrets store |
| **Google Secret Manager** | Cloud-native secrets store |
| **git-secrets** (AWS Labs) | Prevent committing secrets |

### 10.3 Security Monitoring & SIEM

| Tool | Type | Description |
|------|------|-------------|
| **Splunk** | SIEM | Enterprise log analysis + security analytics |
| **ELK Stack (Elastic Security)** | SIEM | Open source + paid tier |
| **Datadog Security** | Cloud SIEM | Cloud-native monitoring + security |
| **Wazuh** | SIEM/XDR | Open source security monitoring |
| **Sentry** | Error Tracking + Security | Application monitoring |
| **Grafana + Loki** | Monitoring | Log aggregation + alerting |

### 10.4 Security Headers Libraries (Implementation)

| Library | Language | Description |
|---------|----------|-------------|
| **Helmet.js** | Node.js | Express/Next.js security headers middleware |
| **secure-headers** (Python) | Python | Headers middleware for Python frameworks |
| **security-headers** (Go) | Go | Headers middleware for Go |
| **rack-secure-headers** | Ruby | For Rails apps |
| **SecureHeaders** (Ruby gem) | Ruby | Ruby on Rails security headers |
| **django-csp** | Python | CSP middleware for Django |
| **Nginx secure headers** | Config | `add_header` directives |

### 10.5 Security.txt Standard
- **RFC 9116:** Standardized security contact info
- **Location:** `/.well-known/security.txt`
- **Required fields:** `Contact:` (email/URL), `Expires:` (date)
- **Tools:**
  - https://securitytxt.org (generator)
  - https://github.com/securitytxt (validator)

### 10.6 Penetration Testing Frameworks

| Tool | Description |
|------|-------------|
| **Metasploit** | Exploitation framework |
| **OWASP ZAP** | DAST + automated scanner |
| **Burp Suite Professional** | Web app security testing |
| **Caido** | Modern Burp alternative |
| **FFUF** | Fuzzing tool |
| **Wfuzz** | Web fuzzer |
| **SQLmap** | SQL injection automation |
| **Nikto** | Web server scanner |

---

## Quick Reference: Enterprise-Grade Security Stack

```
+---------+    +----------+    +---------+    +----------+
| CDN/WAF |--->| Web App  |--->|  API    |--->| Database |
| Cloudf. |    | Next.js  |    | REST    |    | Postgres |
+---------+    +----------+    +---------+    +----------+
     |              |              |               |
  Security       Helmet.js     Rate Limit     Encryption
  Headers        CSP nonce     Auth JWT       at Rest
  WAF Rules      Input Val.   Input Val.     Access Ctrl
  DDoS Shield    SRI Hashes   Audit Log       Audit Log
  Bot Mgmt       X-Frame-Opt  Rate Limiting  

Monitoring & Observability Layer
  - Sentry (error + security)
  - Datadog / Grafana (metrics + logs)
  - Wazuh / ELK (SIEM)
  - DefectDojo (vuln management)
```

---

## Sumber Referensi

- https://owasp.org/www-project-top-ten/
- https://owasp.org/www-project-application-security-verification-standard/
- https://observatory.mozilla.org
- https://securityheaders.com
- https://csp-evaluator.withgoogle.com
- https://www.ssllabs.com/ssltest/
- https://developers.cloudflare.com/waf/
- https://cheatsheetseries.owasp.org
- https://infosec.mozilla.org/guidelines/web_security
- https://stripe.com/docs/security
- https://developers.google.com/web/fundamentals/security
- https://docs.microsoft.com/en-us/security/

---

*Dokumen ini adalah referensi teknis. Untuk implementasi, lakukan
penyesuaian berdasarkan arsitektur, threat model, dan compliance
requirements spesifik organisasi.*
=== VERIFIED FINDINGS ===
