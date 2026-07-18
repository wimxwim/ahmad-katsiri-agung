# Changelog 18 Juli 2026 — 5 Fix Production

## Generate AI 35 Soal + 15 Quiz — DARI GAGAL JADI BISA

| # | Commit | Masalah | Fix |
|---|--------|---------|-----|
| 1 | ad1b7bbf0 | Generate 500 — token_transactions kurang 3 kolom | Migration 0037 |
| 2 | a611532e8 | Soal 0/35 — runGenerationFromText masih Promise.all | Sequential await |
| 3 | a611532e8 | Soal 0/35 — maxTokens 1750 terlalu kecil | soalCount*150 (5250) |

## Top-up + Telegram Notif — DARI FIRE-AND-FORGET JADI RELIABLE

| # | Commit | Masalah | Fix |
|---|--------|---------|-----|
| 4 | 946d62a5e | Top-up 500 — error handling ga lengkap | Catch SubscriptionLockedError |
| 5 | 2c1d39859 | Telegram notif kadang ga masuk | after() bungkus notif |

## Hasil Test Production

- Generate AI: 35 soal + 15 quiz + materi → ready
- Top-up: Rp5.000, Rp7.000, Rp10.000 → semua masuk
- Telegram: @AKAL_Centre_bot — notif TOP-UP BARU masuk
- Upload PDF: diterima + ekstraksi
- Balance: Rp973.341

## Pelajaran

1. Drizzle schema != database — migration harus di-run manual ke Supabase
2. maxTokens AI — 35 soal butuh ~5250 token, bukan 1750
3. Vercel serverless — fungsi mati setelah response. Pakai after() untuk background task
4. runGenerationFromText — fix sebelumnya cuma di runGeneration