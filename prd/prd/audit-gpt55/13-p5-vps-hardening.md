# AUDIT GPT 5.5 — Prioritas P5: VPS Hardening

> **Sumber:** GPT 5.5 main session
> **Status:** Read-only audit, tidak ada file yang diubah

---

1. Reverse proxy Caddy only, app internal.
2. Firewall 80/443 only, idealnya Cloudflare IP only.
3. Authenticated Origin Pulls atau Cloudflare Tunnel.
4. Docker log rotation.
5. DB password random 32+ chars.
6. Redis no public port.
7. Postgres no public port.
8. Backup harian encrypted.
9. Restore drill bulanan.
10. Monitoring RAM/disk/DB/app/Redis.
11. Alert Telegram untuk downtime.
12. Build di luar VPS kalau 4GB sering OOM.
13. Swap 2-4GB jika build di VPS.
14. Node memory limit dites, bukan hanya diset.
15. Jangan Puppeteer request langsung.

---

> *Dokumen ini adalah salinan verbatim dari hasil audit GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli GPT 5.5.*
