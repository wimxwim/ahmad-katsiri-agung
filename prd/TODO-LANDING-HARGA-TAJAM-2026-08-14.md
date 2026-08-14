# TODO LANDING & HARGA — Perubahan Tajam (Tanpa Bocor Margin)

**Tanggal:** 14 Agu 2026 | **Domain:** akalcenter.my.id | **Aturan BESI:** Margin 11.5x RAHASIA — jangan pernah sebut nominal di publik. Di depan cuma "Gratis daftar, konsultasi via WA". Titik.

> Vulgar jujurnya: harga itu sensitif, margin itu dapur. Dapur jangan dipajang di etalase. Landing & /harga harus konsultatif, tajam, indah — bukan pricelist bocor.

---

## AUDIT MENYELURUH DARI NOL — 6 Halaman Publik

Audit dilakukan tanpa login, tanpa asumsi, dari NOL pada 13-14 Agu 2026. Menyisir 6 halaman publik inti + 2 pendukung. Hasilnya: 90% sudah tajam, 10% bocor dan bikin malu kalau dibiarkan.

### Halaman yang diaudit

| # | Route | Status | Catatan tajam |
|---|-------|--------|---------------|
| 1 | `/` (Landing) | OK, tapi bloat | Hero generik, CTA kebanyakan, py-24 kebesaran di mobile |
| 2 | `/fitur` | AMAN | Killer feature jelas, tanpa angka bocor |
| 3 | `/harga` | **BOCOR** | Satu-satunya sumber kebocoran — kartu Sekolah |
| 4 | `/tentang` | AMAN | Narasi yayasan rapi, tidak ada harga |
| 5 | `/quran` | AMAN | Fokus ibadah, tidak ada pricing |
| 6 | `/kursus` | AMAN | Katalog publik, tanpa nominal |

Pendukung: `/masuk` & `/daftar` — AMAN, sudah `portal=guru|siswa`, tidak ada harga.

### Hasil warna teks vs background — AMAN (15:1)

Audit warna paling vulgar tapi paling penting — teks hilang = brand mati.

- Token global `src/app/globals.css` @theme: `--color-on-surface: #141d1b` di `--color-surface: #f2fcf7` — kontras **15:1**, lolos WCAG AAA.
- Semua halaman publik pakai `text-on-surface` di `bg-surface` — **tidak ada** `text-white` di background putih atau sebaliknya.
- Section gelap `#052b19` sengaja pakai `text-white/70` + `text-white` — bukan bug, itu desain.
- Glass token tetap: `bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px]` — **JANGAN UBAH**.
- Warna locked: primary `#005231`, tertiary `#5a4200`, surface `#f2fcf7` — sentuh = dosa.
- Font locked: Bricolage Grotesque (heading), Inter (body) — sentuh = dosa.

> Kesimpulan warna: **AMAN TOTAL**. Tidak ada teks hilang. Tidak ada perubahan warna di todo ini.

### Satu-satunya BOCORAN — `/harga` kartu Sekolah

Ini biang keroknya. Vulgar tapi harus dibongkar:

- Kartu "Sekolah" hardcode `Rp499.000/bulan` + label `Mulai dari` + embel `diskon yayasan` — **BOCOR, terkesan pricelist, mengundang nego brutal & bocor margin**.
- Bertentangan dengan keputusan 13 Agu: "cukup bilang gratis daftar aja, harga via WA".
- Landing (`/`) sudah benar: tanpa nominal, cuma "Mulai gratis. Bayar hanya saat Anda siap. Harga via WA" — **pertahankan**.
- FAQ `/harga` sudah benar: "Bagaimana cara upgrade? Hubungi WA" — pertahankan.
- Section "Pembayaran Online Segera Hadir" — pertahankan, sudah pas.

### Temuan tambahan — yang bikin tidak tajam (P0 referensi)

Biar vulgar sekalian, ini temuan yang bikin produk kelihatan belum 2026:

| Temuan | Lokasi | Dampak |
|--------|--------|--------|
| **Navbar brand hidden `sm:inline` hilang di 375px** | `src/app/_components/Navbar.tsx` ~ brand span | Di iPhone SE / 375px, teks "AKAL Center" hilang, cuma logo. Kesan kosong, tidak premium. |
| **Sertifikat `orderBy` tanpa JOIN → 500** | `src/app/api/v1/sertifikat/route.ts` ~ `orderBy` | Query sertifikat pakai `orderBy` kolom relasi tanpa `JOIN` eksplisit — di Supabase Postgres bisa 500. User klik sertifikat = error. |
| **Remedial `/guru/kuis` 404** | `src/app/guru/analytics/page.tsx:947` href `/guru/kuis` | Link remedial ngarah ke route yang tidak ada — 404. Guru klik = malu. |
| **Bottom bar mepet bawah** | `src/app/_components/BottomNav.tsx` ~ `bottom-0` tanpa safe-area | Di mobile, bottom nav nempel mentok, ketutup gesture bar iOS. Tidak floating island 2026. |
| **Landing bloat `py-24`** | `src/app/_components/LandingClient.tsx` ~ section `py-24` | Padding vertikal kebesaran di mobile — kesan kosong, scroll capek, tidak tajam. Harusnya `py-12 sm:py-16 lg:py-24`. |

---

## PERUBAHAN TAJAM — Before vs Sesudah (Tanpa Bocor Margin)

Prinsip besi 2026: **jangan pernah sebut `11.5x`, `Rp85`, `2000`, atau nominal apapun di hero/harga**. Semua konsultatif via WA. Harga itu diskusi, bukan pajangan.

### LH-1 — `/harga` Hapus Rp, jadi konsultatif WA

| Before (bocor, pricelist) | Sesudah (tajam, konsultatif) |
|---|---|
| `Mulai dari` + `Rp499.000` + `/bulan` | **"Hubungi kami"** — tanpa angka, tanpa `/bulan` |
| "Harga untuk sekolah — diskon yayasan" | **"Harga disesuaikan kebutuhan sekolah — konsultasi gratis via WhatsApp"** |
| 2 kartu sejajar: Gratis (5 dokumen) vs Sekolah (499rb) | Tetap 2 kartu, tapi Sekolah tanpa angka — CTA **"Konsultasi via WA"** lebih menonjol, `rounded-[32px]` glass tetap |
| Kesan: pricelist kaku | Kesan: **konsultatif, premium, yayasan-friendly** |

**File:** `src/app/harga/page.tsx`
- Hapus blok `<p>Mulai dari<br/><span>Rp499.000</span>/bulan</p>` total.
- Ganti jadi `<p className="text-2xl font-bold">Hubungi kami</p>` + sub `"Konsultasi gratis via WhatsApp — harga disesuaikan sekolah"`.
- Hapus string `diskon yayasan` yang mengesankan ada pricelist tetap.
- CTA Sekolah: `href="https://wa.me/..."` dengan `cn("bg-primary text-white rounded-full", ...)` — mobile-first `px-3 sm:px-5 lg:px-8`.

### LH-2 — Landing hero tajam, manfaat guru, CTA 3→2

| Area | Before (generik, teknis) | Sesudah (vulgar tajam, manfaat) |
|---|---|---|
| **Hero H1** | "Platform siap pakai untuk guru" | **"Bikin materi, quiz, dan soal PAI dalam menit — bukan jam"** |
| **Hero sub** | "Bukan lagi website materi satu guru. Ini fondasi baru..." (panjang, abstrak) | **"Upload bahan ajar, AI bantu draft, guru tetap yang putuskan. Gratis daftar — tanpa kartu kredit."** |
| **Hero CTA** | 3 tombol: "Masuk →" + "Daftar Gratis" + "Lihat Fitur" (bingung, pecah fokus) | **2 tombol tajam:** "Daftar Gratis" (primary `#005231`) + "Lihat Cara Kerja" (secondary glass) |
| **Sub-teks CTA** | Tidak ada | Tambah halus di bawah CTA: "Gratis daftar — tanpa kartu kredit" (tanpa sebut angka) |
| **Badge** | "AKAL CENTER 2026" | Pertahankan — sudah pas |
| **Section harga di landing** | "Mulai gratis..." + 2 kartu tanpa angka (sudah benar) | **Pertahankan** — sudah konsultatif |
| **Animasi** | — | Jika pakai `motion/react`, `ease: [0.16, 1, 0.3, 1] as const` — **JANGAN UBAH** |

**File:** `src/app/_components/LandingClient.tsx`
- Ganti `h1` hero + `p` sub hero (2 string, tanpa nominal).
- Kurangi CTA hero 3 → 2 tombol, pakai `cn()` untuk merge class.
- Tambah sub-teks halus di bawah CTA.
- Potong `py-24` jadi `py-12 sm:py-16 lg:py-24` biar tidak bloat di mobile.

### LH-3 — Selaraskan angka tanpa bocor (5 dokumen vs FREE_TIER 15/5)

| Before (tidak sinkron) | Sesudah (tajam, tanpa angka di etalase) |
|---|---|
| `/harga` Gratis: "5 dokumen AI/bulan" hardcode | **Hapus angka eksplisit di depan.** Ganti jadi "Materi & quiz dasar — kuota harian untuk coba" (tanpa angka) |
| Konstanta live: `FREE_TIER_UPLOAD_LIMIT=15`, `DAILY_GENERATE_LIMIT=5` | Sinkron di belakang: UI tidak sebut `15/5`, cukup "kuota harian" — detail angka hanya di dashboard guru (private) |
| Alternatif jika mau transparan ringan | "5 generate/hari" — **pilih SATU**, konsisten di `/harga` & landing, jangan dua versi |
| `/fitur` & landing pipeline "5 langkah" | Pertahankan — itu langkah (01-05), bukan harga, tidak bocor |

**File:** `src/app/harga/page.tsx` (bisa gabung commit LH-1)
- Ganti copy kartu Gratis dari `"5 dokumen AI/bulan"` jadi copy tanpa angka.
- Sumber kebenaran: `src/lib/token-constants.ts` (`FREE_TIER_*`) — tapi jangan render nominal di publik.

### LH-4 — Verifikasi (tanpa bocor, tanpa pecah build)

| Cek | Perintah | Harapan |
|-----|----------|---------|
| Type | `npx tsc --noEmit` | 0 error |
| Build | `NODE_OPTIONS=--max-old-space-size=8192 npx next build` | 110/110 halaman, 0 error |
| Bocor Rp | `grep -R "Rp499\|Rp 499\|499.000" src/app/harga` | 0 hasil |
| Bocor margin | `grep -R "11.5x\|Rp85\|2000" src/app/_components/LandingClient.tsx src/app/harga` | 0 hasil |
| Secret | `git diff --cached \| grep -iE 'DATABASE_URL\|JWT_SECRET\|ENCRYPTION_SECRET'` | kosong |

---

## IDE BOS — GRATIS 2000 & MARGIN 1.050% (TETAP UNTUNG)

> Ide bos paling vulgar tajam 2026: kasih 2000 token gratis di awal — siapapun daftar jadi guru langsung bisa generate tanpa bayar dulu. Tetap profit 1.050% karena token di UI sudah up 11.5x dari biaya NaraRouter. Dapur tetap ketutup, etalase tetap konsultatif. Jangan pernah pajang angka dapur di hero/harga.

### Cara kerja 2000 token gratis — tanpa topup langsung generate

- **Daftar jadi guru -> otomatis dapat 2000 token (`INITIAL_TOKEN_BALANCE`)** via `POST /api/v1/auth/register` (email) + `GET /api/v1/auth/callback/google` (Google OAuth) — `insert token_balances` dalam transaksi DB, tanpa topup dulu bisa generate.
- **Sumber kebenaran:** `src/lib/token-constants.ts` (`INITIAL_TOKEN_BALANCE = 2000`, `MIN_GENERATE_CHARGE = 50`, `MAX_GENERATE_CHARGE = 500`, `MARGIN_MULTIPLIER = 11.5`) + `src/lib/token-service.ts` (`canGenerate`, `isUnlocked`, `requireUnlocked()`) + `src/app/api/v1/auth/register/route.ts` + `src/app/api/v1/auth/callback/google/route.ts`.
- **Syarat generate:** `balance >= 50` (`MIN_GENERATE_CHARGE`) **atau** `isUnlocked === true`, `FREE_GENERATE_MODE=true` bypass total — jadi 2000 langsung `canGenerate=true`. Fix F10-3: `canGenerate = isUnlocked || currentBalance >= MIN_GENERATE_CHARGE`.
- **Alur guru baru:** daftar -> 2000 token -> upload bahan ajar -> klik "Buat AI" -> `estimateGenerationCost()` pre-charge -> `after()` generate materi/quiz/soal -> `settleGenerationCost()` refund selisih — tanpa sentuh dompet.

### Formula token — sudah up 11.5x, 1 token = Rp1

> Rumus dapur (internal, jangan tampil di landing/harga): `chargedTokens = ceil(nararouterCost_Rp * 11.5)` clamp `[50, 500]`. 1 token = Rp1. Jadi di UI token badge sudah up 11.5x — user lihat Rp230/Rp500, bukan biaya mentah NaraRouter.

| Biaya NaraRouter real (Rp) | Hitung | Token ter-tagih (clamp 50-500) | User lihat di UI | Margin |
|---|---|---|---|---|
| 5.5 | ceil(5.5 * 11.5) = 64 | **64** | Rp64 | 1.050% |
| 20 | ceil(20 * 11.5) = 230 | **230** | Rp230 | 1.050% |
| 43.5 | ceil(43.5 * 11.5) = 501 -> cap | **500** | Rp500 (cap) | cap aktif |
| 60 | ceil(60 * 11.5) = 690 -> cap | **500** | Rp500 (cap) | cap aktif |

- **Clamp sakti:** `[MIN_GENERATE_CHARGE=50, MAX_GENERATE_CHARGE=500]` — dokumen pendek tidak gratisan rugi, dokumen super panjang tidak bikin kaget.
- **Gratis 2000 = ~13-31 generate** sebelum habis, komen kode `~20+ generate` — hitung: 2000/500=4 generate cap paling boros, 2000/64~31 generate hemat, 2000/150~13 generate rata-rata. Baru topup via Midtrans. Margin 1050% tetap nutup cost NaraRouter.

### Aturan BESI — UI tidak bocor margin

- Di landing & `/harga` **hanya**: "Biaya bervariasi sesuai panjang dokumen" + "Harga via WA" + "Gratis daftar — tanpa kartu kredit".
- **JANGAN pernah sebut** `11.5x`, `Rp85`, `2000 token`, `1050%`, `MARGIN_MULTIPLIER` di hero/harga publik — section ini internal, untuk dev & bos saja.
- Token badge di dashboard guru boleh tampil `Rp64`/`Rp230`/`Rp500` — itu sudah hasil *11.5x, bukan bocoran.
- Verifikasi grant: cek `token_balances` setelah register — `balance` harus `2000`, `canGenerate` true, `isUnlocked` false tetap bisa generate karena `balance >= 50`.

### Checklist ide bos — sebelum klaim "done"

- [ ] Register email baru -> cek DB `token_balances.balance = 2000` (var `INITIAL_TOKEN_BALANCE`), `canGenerate=true` tanpa topup.
- [ ] Login Google OAuth baru -> cek `token_balances.balance = 2000` juga, transaksi insert sukses.
- [ ] Generate 1x dengan saldo 2000 -> `chargedTokens` sesuai tabel di atas, clamp [50,500], settle refund jalan.
- [ ] UI landing & `/harga` tetap 0 bocor: `grep -R "11\.5x\|Rp85" src/app/harga src/app/_components/LandingClient.tsx` = 0.
- [ ] Copy publik tetap "Biaya bervariasi sesuai panjang dokumen" — tidak sebut 2000/11.5x/1050%.

---

## LAMPIRAN P0 TEMUAN LAIN (Referensi, Bukan Eksekusi Utama)

> Ini bukan LH-1..LH-4. Jangan kerjakan sekarang. Dicatat biar tidak hilang, eksekusi terpisah surgical. Tiap item 4-6 baris + file:line.

**A. Navbar brand hidden `sm:inline` hilang di 375px — 5 baris fix**
- File: `src/app/_components/Navbar.tsx` ~ brand `<span className="hidden sm:inline">AKAL Center</span>`.
- Bug: di 375px (iPhone SE) brand hilang total, cuma logo kotak.
- Fix: ganti `hidden sm:inline` jadi `inline` + `text-sm sm:text-base`, atau `hidden xs:inline` dengan breakpoint `xs:375px`, atau selalu tampil dengan `truncate`.
- Dampak: first impression premium hilang di device kecil — P0 visual.
- Eksekusi: surgical 1 hunk, 5 baris, tanpa ubah warna/font.

**B. Sertifikat `orderBy` tanpa JOIN → 500 — 3 bug surgical**
- File: `src/app/api/v1/sertifikat/route.ts` ~ `orderBy(desc(sertifikat.createdAt))` tanpa `JOIN` ke `kursus`/`user`.
- Bug: Drizzle `orderBy` kolom relasi tanpa `innerJoin` → Supabase Postgres error 500. User klik "Sertifikat saya" = blank.
- Fix: tambah `innerJoin` eksplisit atau `orderBy` hanya kolom tabel utama, tambah `limit` + `where` user.
- File terkait: `src/lib/db/schema.ts` ~ `sertifikat` table, `src/app/api/v1/siswa/sertifikat/route.ts`.
- Eksekusi: surgical 3 file, <20 baris, tambah test `vitest` untuk 500 case.

**C. Remedial `/guru/kuis` 404 — hybrid AI proposal**
- File: `src/app/guru/analytics/page.tsx:947` ~ `href="/guru/kuis"` (route tidak ada).
- Bug: guru klik "Remedial" → 404. Link mati di halaman analytics paling penting.
- Fix opsi 1: ganti href ke `/guru/analytics#remedial` + filter remedialList. Opsi 2: buat `src/app/guru/kuis/page.tsx` hybrid — list kuis + tombol "Buat remedial AI" pakai `runGenerationFromText`.
- Proposal tajam: hybrid — list + AI remedial draft, tanpa bocor margin, pakai `FREE_GENERATE_MODE` check.
- Eksekusi: 1 file edit + 1 file baru jika pilih opsi 2, butuh `after()` wrapper.

**D. Mobile 2026 — floating island + landing py fix**
- File: `src/app/_components/BottomNav.tsx` ~ `fixed bottom-0` + `src/app/_components/LandingClient.tsx` ~ `py-24`.
- Bug: bottom bar mepet `bottom-0` tanpa `pb-safe` / `mb-4`, ketutup gesture bar iOS. Landing `py-24` di mobile = scroll 2x lipat, kesan bloat.
- Fix bottom: `fixed bottom-4 left-3 right-3 sm:left-5 sm:right-5 lg:left-8 lg:right-8` + `rounded-[32px] bg-white/60 backdrop-blur-2xl border shadow-glass` + `pb-[env(safe-area-inset-bottom)]` — floating island 2026.
- Fix landing: `py-12 sm:py-16 lg:py-24` + `px-3 sm:px-5 lg:px-8` — mobile-first, tajam.
- Animasi jika ada: `motion/react` dengan `ease: [0.16, 1, 0.3, 1] as const`, pakai `cn()` untuk class merge.
- Eksekusi: 2 file, 4 hunk, <30 baris, visual check di 375px & 1440px.

---

## TODO EKSEKUSI — Checklist LH-1..LH-4

> Commit grouping tajam: LH-1+LH-3 bisa 1 commit (sama file), LH-2 commit terpisah (beda file), LH-4 verifikasi tanpa commit.

- [ ] **LH-1 — Harga konsultatif (tanpa Rp)** — `src/app/harga/page.tsx`
  - Hapus `Rp499.000`, `/bulan`, `Mulai dari`, `diskon yayasan` total.
  - Ganti kartu Sekolah jadi "Hubungi kami" + "Konsultasi gratis via WhatsApp — harga disesuaikan kebutuhan sekolah".
  - CTA: "Konsultasi via WA" (`wa.me`), style `cn("bg-primary text-white rounded-full px-6 py-3", ...)`.
  - Commit: `fix(harga): LH-1 hapus Rp499 jadi konsultatif WA tanpa nominal`

- [ ] **LH-2 — Landing hero tajam** — `src/app/_components/LandingClient.tsx`
  - H1: "Bikin materi, quiz, dan soal PAI dalam menit — bukan jam".
  - Sub: "Upload bahan ajar, AI bantu draft, guru tetap yang putuskan. Gratis daftar — tanpa kartu kredit."
  - CTA 3→2: "Daftar Gratis" + "Lihat Cara Kerja", sub-teks halus di bawah CTA.
  - Potong `py-24` → `py-12 sm:py-16 lg:py-24`, jaga `px-3 sm:px-5 lg:px-8`, `rounded-[32px]` glass.
  - Commit: `fix(landing): LH-2 hero tajam manfaat guru CTA 3->2 tanpa nominal`

- [ ] **LH-3 — Selaraskan angka tanpa bocor** — `src/app/harga/page.tsx` (gabung LH-1)
  - Ganti "5 dokumen AI/bulan" jadi "Materi & quiz dasar — kuota harian untuk coba" (tanpa angka).
  - Atau pilih "5 generate/hari" — **satu versi, konsisten**.
  - Sumber: `src/lib/token-constants.ts` (`FREE_TIER_UPLOAD_LIMIT`, `DAILY_GENERATE_LIMIT`) — jangan render di publik.
  - Commit: gabung LH-1 atau `fix(harga): LH-3 selaraskan FREE_TIER tanpa angka eksplisit`

- [ ] **LH-4 — Verifikasi sebelum push** — tanpa file, cek total
  - `npx tsc --noEmit` 0 error, `npx next build` 110/110, `grep Rp499` 0, `grep 11.5x|Rp85` 0, `git diff secret` kosong.
  - Visual check: `akalcenter.my.id`, `/harga`, `/fitur` — tidak ada teks hilang, tidak ada Rp bocor.
  - Commit push: `git push origin main` (branch `main` = production Vercel).

- [ ] **LH-5 — Verifikasi grant 2000 (ide bos)** — `src/lib/token-constants.ts` + `src/lib/token-service.ts`
  - Register email + Google OAuth baru -> `token_balances.balance` harus `INITIAL_TOKEN_BALANCE` (2000) tanpa topup, `canGenerate=true` karena `balance >= MIN_GENERATE_CHARGE` (50).
  - Generate 1x cek `chargedTokens = ceil(nararouterCost_Rp * 11.5)` clamp [50,500] — contoh 5.5 Rp -> 64, 20 Rp -> 230, 60 Rp -> 500 cap.
  - UI tetap tidak bocor: `grep -R "INITIAL_TOKEN_BALANCE\|11\.5" src/app/harga src/app/_components/LandingClient.tsx` harus 0 di publik, hanya di dashboard/private.
  - Commit: `fix(token): LH-5 verifikasi grant 2000 & margin 11.5x tetap untung` jika ada fix.

---

## VERIFIKASI SEBELUM PUSH — Bash Snippet

Jalankan ini sebelum `git push`. Harus hijau semua. Kalau ada merah, jangan push — bocor margin = bunuh bisnis.

```bash
# 1. Typecheck — 0 error
npx tsc --noEmit

# 2. Build — 110/110 halaman
NODE_OPTIONS=--max-old-space-size=8192 npx next build

# 3. Cek bocor Rp di harga (harus 0 setelah LH-1)
grep -R "Rp499\|Rp 499\|499.000" src/app/harga && echo "BOCOR!" || echo "AMAN — tidak ada Rp"

# 4. Cek bocor margin/nominal di landing & harga (harus 0)
grep -R "11\.5x\|Rp85\|2000" src/app/_components/LandingClient.tsx src/app/harga && echo "BOCOR!" || echo "AMAN — tidak ada margin nominal"

# 5. Cek secret bocor di staged diff (harus kosong)
git diff --cached | grep -iE 'DATABASE_URL|SUPABASE_SERVICE_ROLE|JWT_SECRET|ENCRYPTION_SECRET|GOOGLE_CLIENT_SECRET|IMAGEKIT_PRIVATE_KEY|RESEND_API_KEY|REDIS_URL|NARAROUTER_API_KEY|SMTP_PASSWORD' && echo "STOP — ada secret!" || echo "AMAN — tidak ada secret"

# 6. Cek grant 2000 (ide bos) — harus 2000 di token-constants & token_balances
#    grep -R "INITIAL_TOKEN_BALANCE" src/lib/token-constants.ts && echo "ADA 2000" || echo "HILANG!"
#    # manual: daftar akun baru -> cek DB token_balances.balance = 2000, canGenerate=true

# 7. Diff stat — harus 1-2 file untuk LH-1..LH-3
git diff --stat

# 8. Commit & push (branch main = production Vercel sin1)
git add src/app/harga/page.tsx src/app/_components/LandingClient.tsx
git commit -m "fix(copy): LH-1..LH-3 — harga konsultatif tanpa Rp, hero tajam, tanpa bocor margin"
git push origin main
```

> **Aturan besi terakhir:** Warna `#005231` `#5a4200` `#f2fcf7`, font Bricolage + Inter, token `rounded-[32px]` glass, `cn()` untuk class merge, `ease [0.16,1,0.3,1]` untuk motion — **JANGAN PERNAH UBAH**. Margin 11.5x tetap di dapur, di etalase cuma "Gratis daftar, konsultasi via WA". Vulgar, indah, tajam — 2026.

*Last updated: 14 Agu 2026 — Audit 6 halaman + ide bos 2000 token gratis & margin 1.050% (11.5x) tetap untung, tanpa bocor margin di publik. Domain akalcenter.my.id.*
