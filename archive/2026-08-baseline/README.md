# Archive 2026-08 Baseline — AKAL Center

**Tanggal:** 2026-08-15
**Isi:** Copy 57 file migrasi `0000`–`0056` dari `src/lib/db/migrations/`
**Tujuan:** Baseline arsip STABIL (F1) — jangan hapus, jangan edit.

## Aturan

- **JANGAN hapus** file apapun di `src/lib/db/migrations/` (0000–0059).
- **JANGAN edit** `src/lib/db/migrations/meta/_journal.json` manual kecuali append entry `idx: 59` untuk `0059_stabil_restore`.
- Folder ini adalah **copy** (`cp`, bukan `mv`). Original tetap di `src/lib/db/migrations/`.
- File yang DIARSIPKAN: `0000`–`0056` (57 files). `0057_sync_snapshot` dan `0058_add_missing_ai_generation_columns` TIDAK diarsipkan (tetap hanya di migrations).

## Prod Apply

Semua migrasi termasuk `0059_stabil_restore.sql` bersifat **idempoten** (`IF NOT EXISTS`):

1. Buka **Supabase SQL Editor** (Singapore).
2. Paste isi `0059_stabil_restore.sql` dan Run. Aman di-rerun berkali-kali.
3. Untuk migrasi lama (0000–0058) yang belum ter-apply: jalankan satu per satu via SQL Editor juga — semua sudah `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`.

## Verifikasi

```bash
ls src/lib/db/migrations/*.sql | wc -l          # harus 60 (0000-0056 + 0057 + 0058 + 0059)
ls archive/2026-08-baseline/*.sql | wc -l        # harus 57 (0000-0056)
npx tsc --noEmit                                  # harus 0 error
```

## Journal

`meta/_journal.json` memiliki 59 entries (idx 0–58). Entry `idx: 59` untuk `0059_stabil_restore` ditambahkan via append manual (bukan regenerate).

```json
{"idx":59,"version":"7","when":1755225600000,"tag":"0059_stabil_restore","breakpoints":true}
```

## Isi 0059_stabil_restore.sql

- `tutor_chat` table + index + RLS (dari 0055)
- 3 index kritis 0033 (`siswa_kursus`, `remedial_recommendation`)
- Partial uniques fix 0034 (`kelas_nama_guru_unique_partial`, `quiz_attempt_siswa_quiz_done_unique`)
- 5 analytics indexes (`quiz_attempt`, `jawaban_log`, `student_ability`, `siswa_kursus`)
- `ai_daily_costs` materialized view (dari 0016)
- Safety net kolom 0058 (`ai_generation`, `file_materi`)
