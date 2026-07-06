# STANDARDS MAPPING — CODEBASE AUDIT

> **Project:** Enterprise Codebase Audit
> **Last Updated:** 3 Juli 2026

---

## Security Standards

### OWASP Top 10 (2021)

| ID   | Name                          | Description | CWE Mapping | Severity (CVSS-lite) |
|------|-------------------------------|-------------|-------------|----------------------|
| A01  | Broken Access Control         | Missing authorization checks, IDOR, privilege escalation | CWE-284, CWE-639 | Critical/High |
| A02  | Cryptographic Failures        | Missing encryption, weak algorithms, hardcoded secrets | CWE-311, CWE-327 | Critical/High |
| A03  | Injection                     | SQLi, XSS, command injection | CWE-79, CWE-89 | Critical/High |
| A04  | Insecure Design               | Missing security by design (e.g., no RLS) | CWE-1007 | High |
| A05  | Security Misconfiguration     | Hardcoded dev origins, missing security headers | CWE-16, CWE-1021 | High/Medium |
| A06  | Vulnerable and Outdated Components | Outdated dependencies, known vulnerabilities | CWE-1035 | Medium |
| A07  | Identification and Authentication Failures | Weak passwords, missing MFA, JWT issues | CWE-287, CWE-347 | High |
| A08  | Software and Data Integrity Failures | Insecure deserialization, CI/CD tampering | CWE-502 | High |
| A09  | Security Logging and Monitoring Failures | Missing logs, insufficient monitoring | CWE-778 | Medium |
| A10  | Server-Side Request Forgery   | SSRF vulnerabilities | CWE-918 | High |

---

### SOC 2 Trust Service Criteria

| Criteria | Domain | Key Controls | Audit Focus |
|----------|--------|--------------|-------------|
| CC6.1    | Logical Access | RLS, authorization checks, role-based access | Multi-tenancy, IDOR, auth bypass |
| CC6.2    | System Operations | Monitoring, logging, incident response | Logging, observability |
| CC6.3    | Change Management | Secure deployment, rollback procedures | CI/CD, IaC |
| CC7.1    | System Operations | Vulnerability management, patching | Dependency scanning, WAF |
| CC9      | Risk Mitigation | Vendor risk, third-party security | Payment gateways, cloud providers |

---

### CWE Top 25

| CWE-ID | Name | Description | Severity (CVSS-lite) |
|--------|------|-------------|----------------------|
| CWE-20 | Improper Input Validation | Missing input validation (e.g., webhook payloads) | High |
| CWE-79 | XSS | Cross-Site Scripting via CSP misconfig | High |
| CWE-89 | SQL Injection | SQLi via raw queries or ORM misuse | Critical |
| CWE-16 | Configuration | Hardcoded secrets, misconfigured CORS | High |
| CWE-284 | Broken Access Control | Missing authorization checks, IDOR | Critical |
| CWE-311 | Missing Encryption | Unencrypted PII (NIK, phone) | Critical |
| CWE-347 | JWT Issues | Missing JWT signature validation | High |
| CWE-639 | IDOR | Insecure Direct Object Reference | Critical |
| CWE-770 | Rate Limiting | Missing rate limiting for APIs/webhooks | Medium |
| CWE-778 | Logging | Missing logs for security events | Medium |

---

## Privacy Standards

### UU PDP (Indonesia)

| Pasal | Focus | Key Requirements | Audit Focus |
|-------|-------|------------------|-------------|
| 5     | Data Subject Rights | Access, rectification, erasure, objection | Endpoints for data subject rights |
| 12    | Retention | Data must be deleted after purpose is fulfilled | Retention policy, cron jobs |
| 16    | Encryption | PII must be encrypted at rest and in transit | NIK, phone, address encryption |
| 21    | Breach Notification | Notify authorities within 72 hours | Logging, monitoring |

---

### GDPR

| Article | Focus | Key Requirements | Audit Focus |
|---------|-------|------------------|-------------|
| 5       | Data Minimization | Only collect necessary data | Schema review, PII fields |
| 12      | Transparency | Clear privacy policy, user communication | Privacy policy, UI/UX |
| 15      | Access | Users can access their data | Data subject rights endpoints |
| 17      | Erasure | Users can request data deletion | Delete endpoints, cron jobs |
| 25      | Privacy by Design | Security by default | RLS, encryption, auth checks |
| 32      | Security | Encryption, access controls, testing | SOC 2, OWASP, CWE |

---

## Compliance Scorecard Template

| Standard | Score (0-100) | Findings | Remediation Status |
|----------|---------------|----------|--------------------|
| OWASP Top 10 | 30 | A01, A03, A05 | 5/10 fixed |
| SOC 2 CC6 | 20 | CC6.1, CC6.2 | 0/5 fixed |
| UU PDP | 40 | Pasal 5, Pasal 16 | 2/8 fixed |
| WCAG 2.2 AA | 100 | None | N/A |
| PCI DSS | 50 | Req. 6, Req. 10 | 1/4 fixed |