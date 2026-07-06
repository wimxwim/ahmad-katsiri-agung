---
name: "codebase-audit-enterprise"
description: "Use when auditing a codebase for enterprise-grade security, privacy, and compliance. Covers SOC 2, GDPR, UU PDP, OWASP Top 10, WCAG 2.2, and PCI DSS. Generates structured findings, compliance scorecards, and remediation plans. Use for projects handling PII, financial data, or multi-tenant SaaS."
---

# Codebase Audit for Enterprise Applications

Comprehensive codebase audit skill for enterprise-grade security, privacy, and compliance. Covers SOC 2, GDPR, UU PDP, OWASP Top 10, WCAG 2.2, and PCI DSS. Generates structured findings, compliance scorecards, and remediation plans.

## Table of Contents

- [Overview](#overview)
- [Standards Covered](#standards-covered)
- [Audit Workflow](#audit-workflow)
- [Triaging Skills](#triaging-skills)
- [Documenting Findings](#documenting-findings)
- [Generating Reports](#generating-reports)
- [Remediation Planning](#remediation-planning)
- [Templates & References](#templates--references)
- [Pitfalls](#pitfalls)
- [Tools](#tools)

---

## Overview

### What This Skill Does

This skill provides a **step-by-step methodology** for auditing a codebase against enterprise security and privacy standards. It covers:

- **Security**: OWASP Top 10, SOC 2, CWE, CVSS-lite.
- **Privacy**: GDPR, UU PDP, data minimization, encryption.
- **Compliance**: PCI DSS, WCAG 2.2, Core Web Vitals.
- **Multi-tenancy**: Row Level Security (RLS), authorization checks, IDOR prevention.

### When to Use

- **Pre-deployment audit**: Before launching a SaaS, fintech, or healthtech application.
- **Compliance audit**: For SOC 2, GDPR, UU PDP, or PCI DSS readiness.
- **Security audit**: To identify vulnerabilities before a penetration test.
- **Privacy audit**: To ensure compliance with data protection laws.

### Outputs

- **Structured findings**: `temuan-keamanan.md`, `temuan-privasi.md`, etc.
- **Compliance scorecard**: `rencana-upgrade.md` with severity, effort, and priority.
- **Remediation plan**: Step-by-step fixes for each finding.
- **Audit trail**: `catatanskills.md` for tracking progress.

---

## Standards Covered

### Security Standards

| Standard | Focus | Key Requirements |
|----------|-------|------------------|
| **OWASP Top 10 (2021)** | Web application security | A01: Broken Access Control, A03: Injection, A05: Security Misconfiguration |
| **SOC 2** | Service organization controls | CC6.1: Logical Access, CC7.1: System Operations, CC9: Risk Mitigation |
| **CWE Top 25** | Common weaknesses | CWE-20: Improper Input Validation, CWE-79: XSS, CWE-89: SQL Injection |
| **CVSS-lite** | Severity scoring | Critical (9.0-10.0), High (7.0-8.9), Medium (4.0-6.9), Low (0.1-3.9) |

### Privacy Standards

| Standard | Focus | Key Requirements |
|----------|-------|------------------|
| **GDPR** | EU data protection | Art. 5: Data minimization, Art. 12: Transparency, Art. 17: Right to erasure |
| **UU PDP (Indonesia)** | Indonesian data protection | Pasal 5: Data subject rights, Pasal 12: Retention, Pasal 16: Encryption |
| **PCI DSS** | Payment security | Req. 6: Secure development, Req. 10: Logging, Req. 11: Testing |

### Accessibility & Performance

| Standard | Focus | Key Requirements |
|----------|-------|------------------|
| **WCAG 2.2 AA** | Web accessibility | 4.5:1 color contrast, 24x24px touch targets, keyboard navigation |
| **Core Web Vitals** | Web performance | LCP < 2.5s, INP < 200ms, CLS < 0.1 |

---

## Audit Workflow

### Phase 1: Preparation

1. **Identify tech stack**:
   - Framework (Next.js, Laravel, Django).
   - Database (PostgreSQL, MySQL).
   - Payment gateway (Midtrans, Stripe).
   - Hosting (Cloudflare, AWS, Vercel).

2. **Gather documentation**:
   - `package.json`, `next.config.js`, `schema.prisma`.
   - `.env.example`, `.gitignore`.
   - `AGENTS.md`, `VISI_MASJID_HUB.md`.

3. **Set up audit files**:
   ```bash
   mkdir -p audit/
touch audit/{catatanskills.md,temuan-keamanan.md,temuan-privasi.md,rencana-upgrade.md}
   ```

### Phase 2: Triaging Skills

1. **List all available skills**:
   ```bash
   bash skills/TOOLS.sh list
   ```

2. **Categorize skills into 3 groups**:
   - **Kategori A (Wajib)**: Skills relevant to the tech stack (e.g., `pr-review-expert`, `soc2-compliance`).
   - **Kategori B (Cek Relevansi)**: Skills that might be relevant (e.g., `gdpr-dsgvo-expert`).
   - **Kategori C (Skip)**: Skills not relevant (e.g., `aflpp` for Next.js projects).

3. **Record triage in `catatanskills.md`**:
   ```markdown
   - pr-review-expert → ✅ Kategori A (Security)
   - aflpp → ❌ Kategori C (C/C++ fuzzing, project ini Next.js/TS)
   ```

### Phase 3: Running Skills

1. **Run skills in batches (10-15 per batch)**:
   - Start with **Kategori A** (security, privacy, compliance).
   - Proceed to **Kategori B** if time permits.
   - Skip **Kategori C** entirely.

2. **Document findings in real-time**:
   - Append to `temuan-keamanan.md` or `temuan-privasi.md`.
   - Never overwrite existing content.

3. **Checkpoint progress**:
   - Update `catatanskills.md` with the last completed skill.
   - Example:
     ```markdown
     >> CHECKPOINT: skill terakhir selesai = soc2-compliance | lanjut dari skill berikutnya
     ```

### Phase 4: Generating Reports

1. **Populate `rencana-upgrade.md`**:
   - **Executive summary**: Overall quality score (Poor/Fair/Good/Excellent).
   - **Matriks temuan**: Table of findings by category and severity.
   - **Top 5 prioritas kritis**: Critical and High findings.
   - **Compliance scorecard**: OWASP, WCAG, UU PDP, SOC 2.

2. **Generate remediation plan**:
   - List all findings with severity, effort, and rekomendasi.
   - Example:
     ```markdown
     | ID   | Temuan                                      | Severity | Effort  | Rekomendasi |
     |------|--------------------------------------------|----------|---------|--------------|
     | 001  | Hardcoded allowedDevOrigins                 | High     | Kecil   | Hapus baris sebelum deploy |
     ```

---

## Triaging Skills

### Kategori A (Wajib)

Skills that are **directly relevant** to the tech stack and standards:

| Skill | Why It's Relevant |
|------|-------------------|
| `pr-review-expert` | Security review for code changes |
| `security-review` | General security best practices |
| `soc2-compliance` | SOC 2 compliance for SaaS |
| `gdpr-dsgvo-expert` | GDPR and UU PDP compliance |
| `cloud-security` | Cloud infrastructure security |
| `hunt-auth-bypass` | Auth bypass vulnerabilities |
| `hunt-idor` | Insecure Direct Object Reference |
| `payment-security-review` | Payment gateway security (Midtrans) |

### Kategori B (Cek Relevansi)

Skills that **might be relevant** but require further inspection:

| Skill | Why It Might Be Relevant |
|------|--------------------------|
| `web-perf` | Core Web Vitals compliance |
| `page-cro` | UI/UX and accessibility |
| `semgrep` | Static analysis for security |

### Kategori C (Skip)

Skills that are **not relevant** to the tech stack:

| Skill | Why It's Not Relevant |
|------|-----------------------|
| `aflpp` | C/C++ fuzzing (project is Next.js/TS) |
| `c-review` | C/C++ security review |
| `solana-vulnerability-scanner` | Solana smart contracts |

---

## Documenting Findings

### Rules for Documenting Findings

1. **Append-only**: Never delete or overwrite existing content.
2. **Concrete evidence**: Include file path, line number, and code snippet.
3. **Severity**: Use CVSS-lite (Critical/High/Medium/Low).
4. **Standards mapping**: Map to OWASP, CWE, SOC 2, UU PDP, etc.
5. **Rekomendasi**: Provide actionable fixes.

### Example Finding

```markdown
### [ID-001] Hardcoded Allowed Dev Origin in Next.js Config
- **Severity**: High
- **Klasifikasi standar**: CWE-16 (Configuration)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/next.config.ts` (baris 26-28)
- **Bukti**:
  ```javascript
  allowedDevOrigins: ["192.168.1.41"],
  ```
- **Dampak bisnis**: Jika lupa dihapus, origin `192.168.1.41` akan diizinkan di production.
- **Rekomendasi perbaikan**: Hapus baris ini sebelum deploy.
- **Effort estimate**: Kecil (<1 hari)
- **Status**: Belum dikerjakan
```

---

## Generating Reports

### `rencana-upgrade.md` Structure

```markdown
# RENCANA UPGRADE — AUDIT CODEBASE `project-name`

> **Project:** Project Name
> **Tanggal:** DD MMM YYYY
> **Auditor:** Hermes AI

---

# EXECUTIVE SUMMARY

**Tanggal audit:** DD MMM YYYY
**Total temuan:** N (Critical: X, High: Y, Medium: Z)
**Overall Quality Score:** Poor/Fair/Good/Excellent

## Ringkasan Eksekutif

Audit ini menemukan **N temuan** yang perlu diperbaiki sebelum deploy.

## Matriks Temuan

| Kategori               | Jumlah Temuan | Critical | High | Medium | Info |
|-----------------------|---------------|----------|------|--------|------|
| Keamanan              | 15            | 4        | 8     | 3      | 0    |
| Privasi Data          | 8             | 2        | 4     | 2      | 0    |

## Top 5 Prioritas Kritis

| ID   | Temuan                                      | Severity | Effort  | Lokasi |
|------|--------------------------------------------|----------|---------|--------|
| 001  | Hardcoded allowedDevOrigins                 | Critical | Kecil   | next.config.ts |

## Compliance Scorecard

| Standar               | Skor (0-100) | Keterangan |
|-----------------------|--------------|------------|
| OWASP Top 10         | 30           | Banyak celah Broken Access Control |
| UU PDP               | 40           | Data sensitif tidak dienkripsi |

## Daftar Temuan Lengkap

### Critical (X Temuan)
1. [ID-001] Hardcoded allowedDevOrigins (CWE-16)
```

---

## Remediation Planning

### Prioritization Rules

1. **Critical**: Fix immediately (blocker for deploy).
2. **High**: Fix within 1-2 sprints.
3. **Medium**: Fix within 1 month.
4. **Low**: Fix as time permits.

### Example Remediation Plan

| ID   | Temuan                                      | Severity | Effort  | Owner       | Target Date | Status |
|------|--------------------------------------------|----------|---------|-------------|-------------|--------|
| 001  | Hardcoded allowedDevOrigins                 | Critical | Kecil   | Backend     | 2026-07-05  | Open   |

---

## Templates & References

### Templates

- [`templates/temuan-keamanan.md`](templates/temuan-keamanan.md): Template for security findings.
- [`templates/rencana-upgrade.md`](templates/rencana-upgrade.md): Template for remediation plan.

### References

- [`references/standards.md`](references/standards.md): Mapping of OWASP, CWE, SOC 2, UU PDP.
- [`references/triage-skills.md`](references/triage-skills.md): Guide for triaging skills.
- [`references/example-findings.md`](references/example-findings.md): Example findings for common vulnerabilities.

---

## Pitfalls

1. **Overwriting findings**: Always append to files, never overwrite.
2. **Skipping ownership checks**: Always verify `requireRole` or `requireAuth` in action files.
3. **Ignoring multi-tenancy**: Always check RLS and `mosque_id` scoping.
4. **Hardcoding secrets**: Never hardcode API keys or credentials.
5. **Missing input validation**: Always use Zod for input validation.

---

## Tools

### `triage_skills.sh`

```bash
#!/bin/bash
# Usage: bash triage_skills.sh "Next.js Supabase Midtrans"

query="$1"
bash skills/TOOLS.sh suggest "$query" | awk '{print $1}' | while read skill; do
  echo "- $skill → "
  read -p "Kategori (A/B/C): " category
  echo "  $skill → $category" >> audit/catatanskills.md
  echo ""
done
```

### `generate_report.py`

```python
#!/usr/bin/env python3
import json
import os

# Generate rencana-upgrade.md from findings JSON
with open("audit/findings.json") as f:
    findings = json.load(f)

with open("audit/rencana-upgrade.md", "w") as f:
    f.write("# RENCANA UPGRADE\n\n")
    f.write(f"Total temuan: {len(findings)}\n")
    for finding in findings:
        f.write(f"- [{finding['id']}] {finding['title']} ({finding['severity']})\n")
```