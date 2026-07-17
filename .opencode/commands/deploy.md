---
description: Build, commit, push, dan deploy ke Vercel production — satu perintah
agent: build
subtask: true
---

Jalankan workflow deploy AKAL Center secara berurutan. HENTIKAN jika ada error di langkah manapun.

## Langkah 1: Build
```bash
npx next build
```
- Jika GAGAL: baca error, perbaiki, ulangi build. JANGAN lanjut sebelum zero errors.

## Langkah 2: Commit
```bash
git add -A && git commit -m "$ARGUMENTS"
```
- Jika tidak ada argumen, gunakan commit message deskriptif berdasarkan perubahan.
- PASTIKAN tidak ada credential (API key, token, secret) di staged files:
```bash
git diff --cached | grep -iE 'DATABASE_URL|SUPABASE_SERVICE_ROLE|JWT_SECRET|ENCRYPTION_SECRET|GOOGLE_CLIENT_SECRET|IMAGEKIT_PRIVATE_KEY|RESEND_API_KEY|REDIS_URL|NARAROUTER_API_KEY|SMTP_PASSWORD|token'
```
- Jika grep menemukan credential: HENTIKAN, hapus dari staging, laporkan ke user.

## Langkah 3: Push
```bash
git push origin main
```

## Langkah 4: Deploy Vercel
```bash
npx vercel --prod --yes
```

## Langkah 5: Deploy Worker (jika ada perubahan)
Cek apakah `workers/akal-centre/` berubah:
```bash
git diff --name-only HEAD~1 | grep 'workers/akal-centre/'
```
- Jika ADA perubahan: `cd workers/akal-centre && npx wrangler deploy`
- Jika TIDAK: skip

## Langkah 6: Konfirmasi
Setelah semua langkah sukses, laporkan:
- Commit hash
- Vercel deployment URL
- Worker deployment status (jika ada)