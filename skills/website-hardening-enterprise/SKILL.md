# Enterprise-Grade Website Hardening (2026)

> Use when hardening websites to enterprise security standards (Google/Microsoft/Cloudflare grade). Covers CDN/WAF configuration, security headers, CSP, SSL/TLS, DAST scanning, and vulnerability management.

---

## ENTERPRISE HARDENING STACK 2026

```
1. CDN/WAF:          Cloudflare + OWASP CRS v4.27
2. Security Headers: Helmet.js 8.2 + SecurityHeaders.com A+ rating
3. CSP:              Google CSP Evaluator v1.1.8 (strict nonce-based)
4. SSL/TLS:          testssl.sh v3.2.3 + SSL Labs (A+)
5. DAST Scanner:     Nuclei v3.9 + OWASP ZAP 2.17
6. ASVS Standard:    5.0.0 (174 requirements at L3)
7. Container/IaC:    Trivy + Checkov
8. Vuln Management:  DefectDojo 2.58
9. SIEM:             Wazuh + Grafana
10. ModSecurity:     v3.0.15 + OWASP CRS v4.27
```

---

## SECURITY HEADERS (A+ Rating Target)

### Implementation (Next.js/Node.js with Helmet.js 8.2)

```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  xFrameOptions: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      geolocation: [],
      microphone: [],
      camera: [],
    },
  },
}));
```

### Minimum Headers Checklist

- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Content-Security-Policy` (strict nonce-based)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- [ ] `Cross-Origin-Embedder-Policy: require-corp`
- [ ] `Cross-Origin-Opener-Policy: same-origin`
- [ ] `Cross-Origin-Resource-Policy: same-origin`
- [ ] Remove `X-Powered-By`, `Server` version header

### Testing

```bash
# Quick test
curl -sI https://example.com | grep -iE 'strict-transport|content-security|x-frame|x-content|referrer|permissions'

# Enterprise scan
npx securityheaders -u https://example.com
```

**Scanners:**
- SecurityHeaders.com → Rating A+
- MDN Observatory (pindah dari observatory.mozilla.org) → developer.mozilla.org/en-US/observatory
- Google CSP Evaluator → csp-evaluator.withgoogle.com
- SSL Labs → ssllabs.com/ssltest

---

## CSP (Content Security Policy) — Strict Nonce-Based

### Google Recommended Strict CSP

```javascript
// Server-side nonce generation
const nonce = crypto.randomBytes(16).toString('base64');
res.locals.cspNonce = nonce;

// CSP header
const csp = [
  `base-uri 'self'`,
  `object-src 'none'`,
  `script-src 'strict-dynamic' 'nonce-${nonce}' 'unsafe-inline' https: http:`,
  `style-src 'self' 'nonce-${nonce}'`,
];
res.setHeader('Content-Security-Policy', csp.join('; '));
```

**Rules:**
- NO `unsafe-inline` in script-src/style-src
- NO wildcard `*` in script-src/object-src/base-uri
- `base-uri 'self'` or `base-uri 'none'`
- `object-src 'none'`
- `frame-ancestors 'self'`
- Report-uri/report-to configured
- Test in report-only mode first

---

## SSL/TLS HARDENING

### Minimum Configuration

- TLS 1.2 minimum, prefer TLS 1.3
- Strong ciphers (AEAD only: TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384)
- Certificate from trusted CA
- HSTS preload submission
- Certificate Transparency logging
- OCSP Stapling enabled

### Testing

```bash
# testssl.sh (repo: github.com/testssl/testssl.sh, v3.2.3)
./testssl.sh --grade https://example.com

# SSL Labs (online)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=example.com
```

---

## WAF CONFIGURATION (Cloudflare + OWASP CRS)

### Cloudflare Recommended Settings

```
1. SSL/TLS: Full (Strict)
2. Minimum TLS Version: 1.2
3. Always Use HTTPS: ON
4. HSTS: max-age=31536000, includeSubDomains, preload
5. WAF: Cloudflare Managed Rules (High sensitivity)
6. Bot Fight Mode: ON
7. Rate Limiting: 100 req/10s per IP (non-static)
8. Security Level: Medium (High under attack)
9. Browser Integrity Check: ON
10. HTTP/2, HTTP/3 (QUIC): ON
```

### OWASP CRS v4.27 (Released 1 June 2026)

```bash
# Deploy on ModSecurity 3.0.15
# Download CRS
git clone --depth 1 -b v4.27.0 https://github.com/coreruleset/coreruleset

# Configure paranoia level
# PL1: Low false positives (recommended start)
# PL2: Standard
# PL3: High security
# PL4: Extreme (high false positives)
SecAction "id:900000,phase:1,setvar:tx.executing_paranoia_level=1"
```

---

## OWASP STANDARDS (2026 UPDATES)

### OWASP Top 10:2025 (NOT 2021)

| Code | Category |
|------|----------|
| A01:2025 | Broken Access Control |
| A02:2025 | Security Misconfiguration |
| A03:2025 | Software Supply Chain Failures |
| A04:2025 | Cryptographic Failures |
| A05:2025 | Injection |
| A06:2025 | Insecure Design |
| A07:2025 | Authentication Failures |
| A08:2025 | Software/Data Integrity Failures |
| A09:2025 | Security Logging and Alerting Failures |
| A10:2025 | Mishandling of Exceptional Conditions (NEW) |

### OWASP ASVS v5.0.0 (Released May 2025)

- L1: Basic protection (all apps) — 44 requirements
- L2: Standard (sensitive data) — 128 requirements
- L3: Advanced (critical/high-value) — 174 requirements
- Tool: DefectDojo 2.58 for vuln management

---

## DAST SCANNING

### Nuclei v3.9 (Released 10 June 2026)

```bash
# Quick scan
nuclei -u https://example.com -severity critical,high -o scan.txt

# Full scan with all templates
nuclei -u https://example.com -t ~/nuclei-templates/ -o full-scan.txt

# API scan
nuclei -u https://api.example.com -tags api -o api-scan.txt
```

### OWASP ZAP 2.17

```bash
# Docker quick scan
docker run -t owasp/zap2docker-stable zap-full-scan.py -t https://example.com

# API scan with OpenAPI import
zap-api-scan.py -t https://example.com/openapi.json -f openapi
```

---

## CONTAINER & IaC SECURITY

### Trivy

```bash
# Scan container image
trivy image nginx:latest

# Scan filesystem
trivy fs /path/to/project

# Scan IaC (Terraform, K8s, Docker)
trivy config /path/to/terraform
```

### Checkov

```bash
# Scan Terraform
checkov -d /path/to/terraform

# Scan K8s manifests
checkov -f k8s-deployment.yaml

# Dockerfile scan
checkov -f Dockerfile
```

---

## VULNERABILITY MANAGEMENT

### DefectDojo 2.58

```bash
# Docker deployment
docker-compose -f docker-compose.yml up -d

# Import scan results (Nuclei, ZAP, Trivy, etc.)
python manage.py import_scan_results --scan-type "Nuclei Scan" --file nuclei-results.json
```

---

## SIEM & MONITORING

### Wazuh + Grafana Stack

```
Wazuh Agent → Wazuh Manager → Elasticsearch → Grafana/Kibana
```

- Wazuh: Open source SIEM/XDR
- Filebeat/Elastic Agent: Log shipping
- Elasticsearch: Log storage & indexing
- Grafana: Dashboard & alerting

---

## ENTERPRISE SECURITY CHECKLIST (2026)

### Phase 1 — Foundation (Week 1)

- [ ] SSL Full Strict + HSTS + TLS 1.2 min
- [ ] Security Headers A+ (SecurityHeaders.com)
- [ ] CSP strict nonce-based (Google CSP Evaluator pass)
- [ ] WAF Cloudflare Managed Rules (High)
- [ ] Bot Fight Mode ON
- [ ] Rate Limiting per IP

### Phase 2 — Hardening (Week 2)

- [ ] OWASP CRS v4.27 PL2
- [ ] Helmet.js 8.2 in code
- [ ] OWASP ASVS L2 assessment
- [ ] Trivy + Checkov in CI/CD
- [ ] Nuclei weekly automated scan
- [ ] DefectDojo for vuln tracking

### Phase 3 — Advanced (Week 3+)

- [ ] OWASP CRS PL3
- [ ] ASVS L3 assessment
- [ ] Wazuh SIEM
- [ ] Bug bounty program
- [ ] Security.txt at /.well-known/security.txt
- [ ] Incident response plan
- [ ] Penetration testing quarterly

---

## TOOL VERSION STATUS (June 2026)

| Tool | Version | Status |
|------|---------|--------|
| OWASP CRS | 4.27.0 | Released 1 June 2026 |
| Helmet.js | 8.2.0 | Active |
| OWASP ZAP | 2.17.0 | Active |
| Nuclei | 3.9.0 | Released 10 June 2026 |
| ModSecurity | 3.0.15 | Active |
| Google CSP Evaluator | 1.1.8 | Active |
| DefectDojo | 2.58.4 | Active |
| testssl.sh | 3.2.3 | Active (repo: testssl/testssl.sh) |
| observatory-cli | 0.7.1 | DEPRECATED since 2016 |

---

## QUICK VERIFICATION COMMANDS

```bash
# Check security headers
curl -sI https://example.com | grep -iE 'strict-transport|content-security|x-frame|x-content|referrer|permissions'

# Check SSL/TLS
openssl s_client -connect example.com:443 -tls1_3 2>/dev/null | head -10

# Check WAF headers
curl -sI https://example.com | grep -i 'cf-ray\|cf-cache\|server'

# Verify tools
which nuclei trivy testssl 2>&1
nuclei -version | head -1
trivy --version | head -1
```

---

> **REFERENCES:** OWASP (owasp.org), Cloudflare (developers.cloudflare.com/waf/), SecurityHeaders.com, Google CSP Evaluator, SSL Labs, Mozilla Observatory (MDN), testssl.sh (github.com/testssl/testssl.sh)
