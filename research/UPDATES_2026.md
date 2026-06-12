# Enterprise Hardening Tools — 2026 Update Verification Report

**Date:** 12 June 2026
**Method:** Direct HTTP/API verification to each tool/service

---

## 1. OWASP Top 10: NOW 2025 (NOT 2021)

The existing file references OWASP Top 10 2021. The current version is OWASP Top 10:2025.
Source: https://owasp.org/Top10/2025/

**2025 Categories:**
- A01:2025 — Broken Access Control (same as 2021)
- A02:2025 — Security Misconfiguration (moved up from A05)
- A03:2025 — Software Supply Chain Failures (expanded from A06)
- A04:2025 — Cryptographic Failures (same as 2021)
- A05:2025 — Injection (same as 2021)
- A06:2025 — Insecure Design (same as 2021)
- A07:2025 — Authentication Failures (same as 2021)
- A08:2025 — Software/Data Integrity Failures (same as 2021)
- A09:2025 — Security Logging and Alerting Failures (same as 2021)
- A10:2025 — Mishandling of Exceptional Conditions (NEW, replaces SSRF)

---

## 2. OWASP ASVS: NOW 5.0.0 (NOT 4.0.3)

ASVS 5.0.0 released 30 May 2025 (tagged v5.0.0_release).
The file lists 4.0.3 as latest - must be updated to 5.0.0.
GitHub: https://github.com/OWASP/ASVS/releases/tag/v5.0.0_release

---

## 3. Mozilla Observatory - MOVED TO MDN

Old URL: https://observatory.mozilla.org redirects now
New URL: https://developer.mozilla.org/en-US/observatory
Title: HTTP Header Security Test - HTTP Observatory | MDN
Status: Active, moved into MDN Web Docs as SPA.

CLI Tool (observatory-cli): DEPRECATED - Last npm publish: 2016 (v0.7.1).
Uses deprecated request npm package. Do NOT rely on this CLI.
Alternatives: web interface, SecurityHeaders.com API, or curl + API.

---

## 4. testssl.sh - REPO MOVED

Old repo: github.com/drwetter/testssl.sh (redirects)
New repo: github.com/testssl/testssl.sh
Latest version: v3.2.3 (12 Feb 2026)
Status: Actively maintained.

---

## 5. Tool Version Status (June 2026)

Tool                   | Version Listed | Version Verified       | Status
Helmet.js              | (not specified)| 8.2.0 (npm)            | Active
OWASP ZAP              | (not specified)| 2.17.0 (Dec 2025)      | Active
OWASP CRS              | v3.3.x         | 4.27.0 (June 2026)     | VERY ACTIVE
Nuclei                 | (not listed)   | 3.9.0 (10 June 2026)   | VERY ACTIVE
ModSecurity            | (not specified)| 3.0.15 (Apr 2026)      | Active
Google CSP Evaluator   | (not specified)| 1.1.8 (May 2026)       | Active
DefectDojo             | (not specified)| 2.58.4 (May 2026)      | Active
testssl.sh             | (not specified)| 3.2.3 (Feb 2026)       | Active (repo moved)
Qualys SSL Labs        | online         | Online service active  | Active (CLI aged)
SecurityHeaders.com    | online         | Online (CF protected)  | Active
observatory-cli (npm)  | npm -g         | 0.7.1 (2016)           | DEPRECATED

---

## 6. Recommended Enterprise Hardening Stack (2026)

1. CDN/WAF:         Cloudflare Enterprise / AWS WAF / Google Cloud Armor
2. WAF Rules:       OWASP CRS v4.27+ on ModSecurity v3.0+
3. CSP:             Google CSP Evaluator v1.1.8 + strict nonce-based
4. Security Headers: SecurityHeaders.com scan + Helmet.js 8.x
5. SSL/TLS:         SSL Labs (online) + testssl.sh v3.2.3
6. DAST Scanning:   OWASP ZAP 2.17+ / Nuclei 3.9+
7. ASVS Standard:   Use v5.0.0 (174 requirements at L3)
8. Vuln Management: DefectDojo 2.58+ / Nuclei
9. Container/IaC:   Trivy + Checkov
10. SIEM:           Wazuh + Grafana

UPDATE: OWASP Top 10:2025 (not 2021), ASVS: 5.0.0 (up from 4.0.3),
Mozilla Observatory: now at MDN, testssl.sh: moved to testssl/testssl.sh

