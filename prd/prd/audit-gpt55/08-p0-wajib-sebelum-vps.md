# AUDIT GPT 5.5 — Prioritas P0: Wajib Sebelum VPS Public

> **Sumber:** GPT 5.5 main session
> **Status:** Read-only audit, tidak ada file yang diubah

---

1. Tutup public guru registration.
2. Protect semua `/api/v1/*` dengan auth/role/ownership.
3. Ganti route kursus/enroll/nilai dari mock ke DB atau disable dari production.
4. Hapus hardcoded `akaldev` dari prod compose.
5. Jangan expose port 3000 ke host.
6. Set Worker ORIGIN_URL benar dan fail-closed.
7. Tambah Redis-backed rate limit atau minimal disable endpoint sensitif sampai siap.
8. Split health endpoint: public liveness sederhana, internal readiness DB.
9. Keystatic production allowlist wajib.
10. Tambah backup encrypted/offsite dan restore drill.

---

> *Dokumen ini adalah salinan verbatim dari hasil audit GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli GPT 5.5.*
