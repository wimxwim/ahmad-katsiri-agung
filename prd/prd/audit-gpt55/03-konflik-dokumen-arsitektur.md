# AUDIT GPT 5.5 — Konflik Dokumen & Arsitektur

> **Sumber:** GPT 5.5 main session + PRD strategy sub-agent (36 toolcalls)
> **Status:** Read-only audit, tidak ada file yang diubah

---

## 1. Prisma vs Drizzle

PRD 06/07 masih Prisma/Neon/Event Sourcing. Kode nyata sudah Drizzle/PostgreSQL.

**Keputusan yang benar sekarang:**
- Drizzle + PostgreSQL VPS.
- PRD lama perlu ditandai outdated agar AI agent tidak menginstal Prisma lagi.

---

## 2. Neon vs PostgreSQL VPS

PRD campur antara Neon sebagai data utama dan Postgres lokal VPS.

**Keputusan:**
- Production: PostgreSQL di VPS.
- Neon hanya staging/dev opsional.

---

## 3. Vercel Hobby vs VPS

README/AGENTS masih menyebut Vercel Hobby, tetapi target sekarang VPS. Untuk situs klien komersial, Vercel Hobby bukan pilihan production ideal.

**Keputusan:**
- V1 legacy/live boleh Vercel.
- V2 production harus VPS/Cloudflare.
- Vercel hanya staging/fallback non-komersial.

---

## 4. Event Sourcing terlalu cepat

PRD lama mendorong EventStore/hash-chain untuk semua jawaban. PRD 08 sudah benar: tunda.

**Keputusan:**
- Fase 1 cukup jawaban_log append-only + audit sederhana.
- Hash-chain hanya untuk sertifikat, transaksi, perubahan nilai manual, dan event kritikal.

---

## 5. Hexagonal architecture terlalu berat

Untuk solo developer dan MVP, struktur Next.js App Router + `lib/db` + `lib/analytics` lebih realistis.

**Keputusan:**
- Jangan buat layer repository/class berlebihan dulu.
- Pisahkan pure function analitik agar bisa dites.

---

> *Dokumen ini adalah salinan verbatim dari hasil audit GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli GPT 5.5.*
