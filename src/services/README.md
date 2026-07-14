# AKAL Center — Shared Services Architecture

## 5 Shared Foundations

Every feature (plugin) uses these shared services. Build once, reuse everywhere.

| Service | Path | Responsibilities |
|---------|------|-----------------|
| **Auth** | `src/services/auth/` | JWT, session, Google OAuth, role guards, CSRF |
| **AI** | `src/services/ai/` | NaraRouter client, prompt builder, output sanitizer, text extractor |
| **Token** | `src/services/token/` | Balance management, top-up, deduction, refund, free tier |
| **Notification** | `src/services/notification/` | Telegram notif, email (future), in-app notification |
| **Storage** | `src/services/storage/` | ImageKit upload, file validation, magic bytes detection |

## Plugin Contract

Semua plugin wajib mengikuti kontrak:
- API: `/api/v1/{plugin}/{resource}`
- Auth: via `requireSession` / `requireGuru` / `requireSiswa`
- Error: `{ code: string, message: string, details?: unknown }`
- Rate limit: via `checkRateLimit` dari `src/lib/rate-limit.ts`

## Anti-Patterns (DILARANG)
- Plugin membuat auth sendiri
- Plugin akses database plugin lain langsung
- Plugin pakai UI style custom (harus design system)

## Current Plugins
- `materi` — Content management
- `quiz` — Quiz engine + CBT
- `kursus` — Course enrollment
- `token` — Token economy
- `payment` — Midtrans integration
- `progres` — Student progress tracking
- `pengumuman` — Announcements