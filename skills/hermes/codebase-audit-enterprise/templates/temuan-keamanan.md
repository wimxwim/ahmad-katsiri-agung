# TEMUAN KEAMANAN — AUDIT CODEBASE

> **Project:** [Project Name]
> **Tanggal:** [DD MMM YYYY]
> **Auditor:** Hermes AI

---

## Daftar Temuan

### [ID-XXX] Temuan Title
- **Severity**: Critical/High/Medium/Low
- **Klasifikasi standar**: CWE-XXX (Name) + OWASP AXX:YYYY (Name)
- **Lokasi**: `/path/to/file:line`
- **Skill sumber**: [skill-name]
- **Apa yang terjadi**: Deskripsi singkat tentang temuan.
- **Bukti**:
  ```[language]
  // Code snippet yang menunjukkan temuan
  ```
- **Dampak bisnis**:
  - Dampak keamanan (kebocoran data, unauthorized access).
  - Dampak bisnis (reputasi, denda, kehilangan pengguna).
  - Pelanggaran standar (SOC 2, UU PDP, OWASP).
- **Rekomendasi perbaikan**:
  - Langkah-langkah konkret untuk memperbaiki temuan.
  - Contoh kode perbaikan.
- **Effort estimate**: Kecil/Sedang/Besar
- **Status**: Belum dikerjakan/Dikerjakan/Selesai

---

## Contoh Temuan

### [ID-001] Hardcoded Allowed Dev Origin in Next.js Config
- **Severity**: High
- **Klasifikasi standar**: CWE-16 (Configuration) + OWASP A05:2021 (Security Misconfiguration)
- **Lokasi**: `/home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/next.config.ts:26-28`
- **Skill sumber**: pr-review-expert
- **Apa yang terjadi**: Hardcoded `allowedDevOrigins` di Next.js config. Jika lupa dihapus, origin ini akan diizinkan di production.
- **Bukti**:
  ```javascript
  allowedDevOrigins: ["192.168.1.41"],
  ```
- **Dampak bisnis**:
  - Risiko serangan dari jaringan lokal.
  - Pelanggaran **SOC 2 CC6.1** (Logical Access Controls).
  - Risiko kebocoran data.
- **Rekomendasi perbaikan**: Hapus baris ini sebelum deploy.
- **Effort estimate**: Kecil
- **Status**: Belum dikerjakan