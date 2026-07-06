# TRIAGE SKILLS — CODEBASE AUDIT

> **Project:** Enterprise Codebase Audit
> **Last Updated:** 3 Juli 2026

---

## Triase Skills: Kategori A, B, C

### Rules for Triaging Skills

1. **Kategori A (Wajib)**: Skills that are **directly relevant** to the tech stack and standards.
   - Example: `pr-review-expert` for Next.js projects, `soc2-compliance` for SaaS.
   - **Action**: Run these skills first.

2. **Kategori B (Cek Relevansi)**: Skills that **might be relevant** but require further inspection.
   - Example: `web-perf` for Core Web Vitals, `page-cro` for UI/UX.
   - **Action**: Run if time permits or if the project has specific needs.

3. **Kategori C (Skip)**: Skills that are **not relevant** to the tech stack.
   - Example: `aflpp` for Next.js projects, `c-review` for TypeScript.
   - **Action**: Skip entirely.

---

## Kategori A (Wajib)

| Skill | Tech Stack | Standards Covered | Why It's Relevant |
|-------|------------|-------------------|-------------------|
| `pr-review-expert` | Any | OWASP, CWE | Security review for code changes |
| `security-review` | Any | OWASP, CWE | General security best practices |
| `soc2-compliance` | SaaS | SOC 2 | SOC 2 compliance for SaaS |
| `gdpr-dsgvo-expert` | Any | GDPR, UU PDP | Privacy compliance (GDPR, UU PDP) |
| `cloud-security` | Cloudflare, AWS, GCP | SOC 2, CWE | Cloud infrastructure security |
| `hunt-auth-bypass` | Any | OWASP A01 | Auth bypass vulnerabilities |
| `hunt-idor` | Any | OWASP A01, CWE-639 | Insecure Direct Object Reference |
| `payment-security-review` | Midtrans, Stripe | PCI DSS | Payment gateway security |
| `semgrep` | Any | OWASP, CWE | Static analysis for security |

---

## Kategori B (Cek Relevansi)

| Skill | Tech Stack | Standards Covered | Why It Might Be Relevant |
|-------|------------|-------------------|--------------------------|
| `web-perf` | Next.js, React | Core Web Vitals | Performance optimization |
| `page-cro` | Next.js, React | WCAG 2.2 | UI/UX and accessibility |
| `observability-designer` | Any | SOC 2 CC6.2 | Logging and monitoring |
| `code-reviewer` | Any | OWASP, CWE | Code quality and security |

---

## Kategori C (Skip)

| Skill | Tech Stack | Why It's Not Relevant |
|-------|------------|-----------------------|
| `aflpp` | C/C++ | Fuzzing for C/C++ projects (not Next.js/TS) |
| `c-review` | C/C++ | Security review for C/C++ |
| `solana-vulnerability-scanner` | Solana | Solana smart contracts (not relevant) |
| `address-sanitizer` | C/C++ | Memory error detection for C/C++ |
| `karpathy-coder` | Python | Coding style for Python (not TS) |

---

## How to Triage Skills

1. **List all available skills**:
   ```bash
   bash skills/TOOLS.sh list
   ```

2. **Filter by tech stack**:
   ```bash
   bash skills/TOOLS.sh suggest "Next.js Supabase Midtrans"
   ```

3. **Categorize each skill**:
   - **Kategori A**: Directly relevant.
   - **Kategori B**: Might be relevant.
   - **Kategori C**: Not relevant.

4. **Record triage in `catatanskills.md`**:
   ```markdown
   - pr-review-expert → ✅ Kategori A (Security)
   - aflpp → ❌ Kategori C (C/C++ fuzzing, project ini Next.js/TS)
   ```

5. **Run skills in batches**:
   - Start with **Kategori A**.
   - Proceed to **Kategori B** if time permits.
   - Skip **Kategori C** entirely.

---

## Example Triage for Masjid Hub

```markdown
# CATATAN SKILLS — AUDIT CODEBASE `masjid-ataqwa`

> **Project:** Masjid Hub (Next.js + Supabase + Midtrans)

## Kategori A (Wajib)
- pr-review-expert → ✅ Dijalankan. Temuan: ID-001, ID-002, ID-003
- security-review → ✅ Dijalankan. Temuan: ID-005, ID-006, ID-007
- soc2-compliance → ✅ Dijalankan. Temuan: ID-008, ID-009
- gdpr-dsgvo-expert → ✅ Dijalankan. Temuan: ID-010, ID-011
- cloud-security → ✅ Dijalankan. Temuan: ID-012, ID-013, ID-014, ID-015
- hunt-auth-bypass → ✅ Dijalankan. Temuan: ID-019, ID-020
- hunt-idor → ✅ Dijalankan. Temuan: ID-021, ID-022, ID-023
- payment-security-review → ✅ Dijalankan. Temuan: ID-016, ID-017, ID-018

## Kategori B (Cek Relevansi)
- web-perf → ⏳ Belum dijalankan (Core Web Vitals)
- page-cro → ⏳ Belum dijalankan (UI/UX)

## Kategori C (Skip)
- aflpp → ❌ Skip (C/C++ fuzzing)
- c-review → ❌ Skip (C/C++ security review)
- solana-vulnerability-scanner → ❌ Skip (Solana smart contracts)

>> CHECKPOINT: skill terakhir selesai = hunt-idor | lanjut dari skill berikutnya
```