# SUB-AGENT 2: Audit Backend/Security/VPS
**Toolcalls:** 65 · **Durasi:** 11m 46s · **Model:** GPT 5.5
**Prompt:** Lakukan audit read-only terhadap backend/security/VPS proyek /home/ngome/agensi/proyek/akal-center. Fokus src/app/api, src/lib, db schema/migrations, Dockerfile, docker-compose.prod.yml, Caddy/infrastructure jika ada, Worker, auth, session, rate limit, validation, secrets, deployment readiness. Cari critical gaps untuk launch ke VPS tahun 2026. Jangan edit file. Return temuan berbasis file path/line jika bisa, severity, dan rekomendasi konkret. Thoroughness: very thorough.

---

## Ringkasan Eksekutif
Status untuk launch VPS 2026: belum siap production untuk fitur akun/guru/dashboard/API. Situs publik konten mungkin jalan, tetapi backend/security untuk VPS masih punya beberapa gap kritis.
Temuan paling berbahaya:
1. Pendaftaran guru terbuka untuk publik, langsung memberi role GURU.
2. API dashboard/kursus/nilai tidak memakai auth/role guard dan masih pakai data mock/in-memory.
3. Worker origin default mengarah ke domain publik yang sama, berisiko proxy loop kalau ORIGIN_URL tidak benar-benar diset sebagai Worker var.
4. docker-compose.prod.yml masih hardcode credential database akaldev dan override .env.production.
5. Rate limit masih in-memory, Redis sudah ada tapi tidak dipakai, mudah bypass pada VPS/multi-process/restart.
6. App container mengekspos port 3000:3000, sehingga origin bisa diakses langsung dan bypass Caddy/Worker jika firewall tidak ketat.
7. Multi-tenant DB schema sudah ada (sekolah_id) tetapi authorization/tenant isolation belum diterapkan di API.

---

## Severity Legend
- Critical: harus dibereskan sebelum launch VPS.
- High: risiko serius, sebaiknya masuk pre-launch hardening.
- Medium: penting untuk stabilitas/maintainability production.
- Low: perbaikan kualitas/defense-in-depth.

---

## Critical Findings

**1. Public self-registration bisa membuat akun GURU**
Severity: Critical
Kategori: Authorization / Privilege Escalation
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/register/route.ts:11-16
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/register/route.ts:58-69
- /home/ngome/agensi/proyek/akal-center/src/app/register-guru/page.tsx:20-33
Bukti:
const RegisterSchema = z.object({
  nama: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  role: z.enum(["SISWA", "GURU"] as const),
});
Lalu role dari request langsung dimasukkan ke DB:
const { nama, email, password, role } = parsed.data;
...
.values({ nama, email, passwordHash, role })
Halaman /register-guru mengirim:
role: "GURU" as const
Dampak:
Siapa pun bisa daftar sebagai guru dan mendapatkan session role guru. Karena banyak endpoint/dashboard belum punya role guard kuat, ini menjadi privilege escalation langsung.
Rekomendasi konkret:
- Untuk public register, hanya izinkan role SISWA.
- Hapus role dari request body public.
- Buat endpoint invite/approval khusus guru, hanya callable oleh OWNER / ADMIN_SEKOLAH.
- Jika butuh onboarding guru cepat: gunakan invite token sekali pakai dengan expiry dan bind ke email.
- Tambahkan unique + audit trail untuk role change.
Prioritas: wajib sebelum VPS launch.

**2. API kursus/nilai/enroll tidak memakai auth/role guard**
Severity: Critical
Kategori: Broken Access Control
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/kursus/route.ts:14-66
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/kursus/[id]/route.ts:5-29
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/kursus/[id]/nilai/route.ts:5-31
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/enroll/route.ts:11-39
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/enroll/status/route.ts:10-40
- Guard tersedia tapi tidak dipakai: /home/ngome/agensi/proyek/akal-center/src/lib/middleware/guard.ts:21-37
Bukti:
Endpoint API langsung memproses request tanpa requireAuth() / requireRole().
Contoh /api/v1/kursus:
export async function GET(request: NextRequest) {
  ...
  return NextResponse.json({ data: mockKursus });
}

export async function POST(request: NextRequest) {
  ...
  mockKursus.push(newKursus);
  return NextResponse.json({ data: newKursus }, { status: 201 });
}
Contoh /api/v1/kursus/[id]/nilai:
const nilaiKursus = mockNilai.filter((n) => n.kursusId === id);
...
return NextResponse.json({ data: enriched, quizzes: quizLabels, total: enriched.length });
Dampak:
- Data nilai siswa bisa diakses publik via API.
- Pembuatan kursus bisa dilakukan publik.
- Enroll status bisa dipalsukan/diakses tanpa session.
- Role guru/admin tidak benar-benar menjadi batas keamanan.
Rekomendasi konkret:
- Terapkan requireAuth() untuk semua endpoint /api/v1/* kecuali login/register.
- Terapkan requireRole(["guru", "owner", "admin_sekolah"]) untuk:
- create/update/delete kursus
- melihat nilai
- dashboard guru
- Terapkan ownership/tenant check:
- guru hanya bisa akses kursus miliknya
- admin_sekolah hanya data sekolahnya
- siswa hanya data dirinya
- Endpoint publik hanya GET untuk konten yang memang public dan tidak mengandung PII/nilai.
Prioritas: wajib sebelum VPS launch.

**3. Dashboard/API masih memakai mock data dan in-memory mutation, bukan PostgreSQL**
Severity: Critical untuk launch produk VPS
Kategori: Data Integrity / Production Readiness
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/kursus/route.ts:3,21,48-61
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/kursus/[id]/route.ts:2,20
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/kursus/[id]/nilai/route.ts:2,20-26
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/enroll/status/route.ts:3,28-35
- /home/ngome/agensi/proyek/akal-center/src/data/mock.ts
Bukti:
import { mockKursus } from "@/data/mock";
...
mockKursus.push(newKursus);
Dampak:
- Data hilang saat process restart/container redeploy.
- Multiple replicas/container akan punya state berbeda.
- API tidak sesuai schema DB yang sudah dibuat.
- Bisa memberi ilusi fitur "berhasil" padahal tidak persistent.
- Launch VPS akan gagal untuk fitur dashboard/kursus/nilai yang nyata.
Rekomendasi konkret:
- Ganti semua endpoint dashboard /api/v1/kursus*, enroll, nilai dari mock ke Drizzle/PostgreSQL.
- Tambahkan transaction untuk operasi enroll/quiz/log nilai.
- Jadikan mock hanya untuk Storybook/dev/demo dan jangan dipakai di route production.
- Tambahkan test smoke untuk memastikan data POST persist setelah restart.
Prioritas: wajib sebelum fitur guru/dashboard diluncurkan.

**4. Cloudflare Worker default origin berpotensi loop ke domain yang sama**
Severity: Critical
Kategori: Deployment / Availability
File:
- /home/ngome/agensi/proyek/akal-center/workers/akal-center/index.ts:2
- /home/ngome/agensi/proyek/akal-center/workers/akal-center/index.ts:73-87
- /home/ngome/agensi/proyek/akal-center/workers/akal-center/wrangler.jsonc:1-16
- /home/ngome/agensi/proyek/akal-center/.env.production.example:54-55
Bukti:
const ORIGIN = process.env.ORIGIN_URL || 'https://akalcenter.my.id';
Worker route:
"routes": [
  { "pattern": "akalcenter.my.id/*", ... },
  { "pattern": "www.akalcenter.my.id/*", ... }
]
Jika ORIGIN_URL tidak tersedia di Worker runtime, default origin adalah https://akalcenter.my.id, yaitu domain yang juga diroute ke Worker. Ini bisa menyebabkan Worker fetch dirinya sendiri, loop, timeout, atau 502/504.
wrangler.jsonc tidak mendefinisikan vars.ORIGIN_URL. .env.production.example tidak otomatis menjadi environment variable Cloudflare Worker.
Dampak:
- Website bisa down total setelah route Worker aktif.
- Debugging membingungkan karena origin terlihat "valid" tapi sebenarnya ke Worker sendiri.
Rekomendasi konkret:
- Set Worker var di wrangler.jsonc atau via wrangler secret/vars:
- ORIGIN_URL = "https://origin.akalcenter.my.id"
- Jangan gunakan default domain publik sebagai fallback. Fallback sebaiknya hard fail.
- Tambahkan guard:
- jika ORIGIN host sama dengan request host, return 500 config error.
- Pastikan DNS origin.akalcenter.my.id mengarah ke Caddy/VPS dan tidak diproxy oleh Worker route yang sama.
Prioritas: wajib sebelum switch traffic Cloudflare.

**5. Production Docker Compose masih hardcode credential database lemah dan override env file**
Severity: Critical
Kategori: Secrets / Infrastructure
File:
- /home/ngome/agensi/proyek/akal-center/docker-compose.prod.yml:27-37
- /home/ngome/agensi/proyek/akal-center/docker-compose.prod.yml:56-59
- /home/ngome/agensi/proyek/akal-center/.env.production.example:7-14
- /home/ngome/agensi/proyek/akal-center/scripts/prod-entrypoint.sh:14
Bukti:
env_file:
  - .env.production
environment:
  - DATABASE_URL=postgresql://akal:akaldev@postgres:5432/akal_center
  - PGPASSWORD=akaldev
Postgres:
POSTGRES_PASSWORD: akaldev
Entrypoint fallback:
export PGPASSWORD="${PGPASSWORD:-akaldev}"
Dampak:
- Password production predictable dan terdokumentasi di repo.
- Nilai .env.production bisa dioverride oleh hardcoded environment.
- Jika VPS bocor sedikit saja, credential DB mudah ditebak.
- Tidak memenuhi baseline production 2026.
Rekomendasi konkret:
- Hapus hardcoded akaldev dari docker-compose.prod.yml.
- Pakai ${POSTGRES_PASSWORD:?missing} dan ${DATABASE_URL:?missing}.
- .env.production.example jangan berisi credential nyata/predictable; gunakan placeholder.
- Entrypoint jangan fallback ke akaldev; fail-fast jika PGPASSWORD kosong.
- Generate password production:
- minimal 32 random chars
- simpan di password manager
- Rotasi credential sebelum launch.
Prioritas: wajib sebelum VPS launch.

**6. App port diekspos publik ke host, bisa bypass Caddy/Worker/rate-limit origin protection**
Severity: Critical / High tergantung firewall VPS
Kategori: Network Exposure
File:
- /home/ngome/agensi/proyek/akal-center/docker-compose.prod.yml:25-26
- /home/ngome/agensi/proyek/akal-center/infrastructure/Caddyfile:1-2
Bukti:
ports:
  - "3000:3000"
Caddy reverse proxy:
origin.akalcenter.my.id {
  reverse_proxy app:3000
}
Dampak:
Jika VPS firewall membuka port 3000, attacker bisa akses Next.js app langsung, melewati Caddy headers, Cloudflare Worker, dan domain/origin assumptions. Ini juga memperparah spoofing x-forwarded-for / direct-origin abuse.
Rekomendasi konkret:
- Untuk production, jangan publish app port ke host.
- Ganti ke internal-only:
- hapus ports: "3000:3000"
- gunakan expose: ["3000"] jika perlu dokumentasi internal.
- Firewall VPS:
- allow 80/443 only
- block 3000/5432/6379 dari publik
- Jika origin hanya boleh dari Cloudflare, aktifkan allowlist IP Cloudflare di firewall atau Caddy remote_ip.
Prioritas: wajib sebelum VPS exposed ke internet.

**7. Rate limiter in-memory, Redis ada tapi tidak dipakai**
Severity: Critical untuk abuse-sensitive launch / High umum
Kategori: Abuse Protection / Reliability
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/rate-limit.ts:6-7
- /home/ngome/agensi/proyek/akal-center/docker-compose.prod.yml:71-84
- /home/ngome/agensi/proyek/akal-center/.env.production.example:16-17
- Worker in-memory juga: /home/ngome/agensi/proyek/akal-center/workers/akal-center/index.ts:10-24
Bukti:
const store = new Map<string, RateLimitEntry>();
Redis service tersedia:
redis:
  image: redis:7-alpine
Tetapi tidak ada pemakaian Redis di src/lib/rate-limit.ts.
Dampak:
- Rate limit reset setiap restart/deploy.
- Tidak konsisten jika app scale ke >1 process/container.
- Store bisa penuh dan ketika store.size >= MAX_STORE_SIZE, key baru tetap allowed.
- Worker isolate memory juga tidak global/stable.
- Brute force login bisa dibagi per restart/per origin/per spoofed IP.
Rekomendasi konkret:
- Implement Redis-based fixed window/sliding window menggunakan REDIS_URL.
- Gunakan atomic INCR + EXPIRE.
- Untuk login, rate limit kombinasi:
- IP
- email/username normalized
- route
- Jika Cloudflare dipakai, tambah WAF/rate limiting di edge untuk /api/*.
- Jika tidak ingin library baru, bisa pakai Redis REST/Node client yang eksplisit disetujui; saat ini belum ada dependency Redis client.
Prioritas: wajib untuk VPS public.

**8. IP rate-limit mempercayai header forwarding yang bisa dispoof jika origin direct-access**
Severity: High, menjadi Critical bila port 3000 publik
Kategori: Abuse Protection
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/rate-limit.ts:47-52
- /home/ngome/agensi/proyek/akal-center/src/app/api/assets/[...path]/route.ts:43-46
- /home/ngome/agensi/proyek/akal-center/docker-compose.prod.yml:25-26
Bukti:
const cfIp = request.headers.get("cf-connecting-ip");
if (cfIp) return cfIp;
const xForwardedFor = request.headers.get("x-forwarded-for");
if (xForwardedFor) return xForwardedFor.split(",")[0]?.trim();
Dampak:
Jika attacker bisa hit origin langsung, mereka bisa set cf-connecting-ip atau x-forwarded-for sendiri dan bypass per-IP rate limit.
Rekomendasi konkret:
- Jangan expose port app publik.
- Di Caddy, overwrite forwarding headers, jangan pass user-provided spoofed values.
- Di app, hanya percaya cf-connecting-ip bila request datang dari trusted proxy/network.
- Untuk VPS single proxy, gunakan x-real-ip yang diset Caddy dan drop spoofed incoming headers.
Prioritas: bersamaan dengan network hardening.

**9. Auth middleware/proxy membebaskan semua /api/*, sehingga keamanan wajib route-level; banyak route belum aman**
Severity: Critical as architecture gap
Kategori: Access Control Architecture
File:
- /home/ngome/agensi/proyek/akal-center/src/proxy.ts:9-18
- /home/ngome/agensi/proyek/akal-center/src/proxy.ts:23-25
Bukti:
const publicPaths = [
  "/keystatic",
  "/login",
  "/masuk",
  "/masuk-guru",
  "/api/",
  ...
];
Semua /api/ langsung NextResponse.next().
Dampak:
Middleware tidak menjadi safety net. Satu endpoint lupa requireAuth() langsung public. Saat ini sudah terjadi di banyak /api/v1/*.
Rekomendasi konkret:
- Jangan whitelist seluruh /api/.
- Pisahkan:
- public API list eksplisit: /api/sesi, /api/doa GET/POST jika memang publik, /api/csp-report, auth endpoints.
- protected API default.
- Atau keep proxy public untuk API, tapi wajib lint/test policy:
- semua route API protected by default kecuali annotated public.
- Terapkan requireAuth di route-level tetap diperlukan untuk role/tenant.
Prioritas: wajib sebelum backend dianggap production.

---

## High Findings

**10. Login guru legacy memakai password plaintext dari Google Sheet**
Severity: High
Kategori: Credential Handling
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/guru/login/route.ts:42-57
- /home/ngome/agensi/proyek/akal-center/src/app/api/guru/login/route.ts:64-73
Bukti:
rows = await readRows("AkunGuru!A:C");
...
row[1]?.trim() === password
Dampak:
- Password guru disimpan plaintext di Google Sheets.
- Siapa pun dengan akses sheet/service account bisa melihat password.
- Tidak ada per-user lockout, password rotation, audit, hash.
Rekomendasi konkret:
- Deprecate /api/guru/login.
- Gunakan DB users.passwordHash + bcrypt seperti /api/v1/auth/login.
- Jika tetap via Sheets sementara:
- simpan bcrypt hash, bukan plaintext
- compare dengan verifyPassword
- jangan kirim error detail "tab belum ada" ke client production.
- Consolidate semua login guru ke satu sistem.

**11. Login guru shared password memakai string compare non-constant-time dan role tidak bind ke identity**
Severity: High
Kategori: Authentication
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/masuk/route.ts:74-97
- /home/ngome/agensi/proyek/akal-center/src/lib/auth-actions.ts:50-64
Bukti:
if (password.length !== guruPassword.length || password !== guruPassword)
Session guru hanya:
const token = await signSession({
  role: "guru",
  nama: cleanNama,
});
Dampak:
- Semua guru berbagi satu password.
- Tidak ada userId, email, sekolahId.
- Guru bisa mengaku nama apa pun selama tahu shared password.
- Authorization downstream tidak bisa membatasi data per guru.
Rekomendasi konkret:
- Hapus shared GURU_PASSWORD untuk production.
- Gunakan user DB per guru.
- Session guru wajib berisi userId, role, email, sekolahId.
- Jika shared password masih diperlukan sebagai emergency admin, lindungi route dengan VPN/basic auth/IP allowlist dan jangan dipakai dashboard utama.

**12. JWT session tidak punya issuer/audience/tokenVersion dan tidak bisa direvoke**
Severity: High
Kategori: Session Security
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/auth.ts:32-47
- /home/ngome/agensi/proyek/akal-center/src/lib/session.ts:5-14
Bukti:
return new SignJWT(payload as unknown as JWTPayload)
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("8h")
  .sign(getSecret());
Verify:
const { payload } = await jwtVerify(token, getSecret());
return payload as SesiPayload;
Dampak:
- Token valid sampai expiry walaupun user dihapus/role berubah/password reset.
- Tidak ada issuer / audience validation untuk mencegah token reuse antar context.
- Quiz token dan session token memakai secret yang sama, tanpa typ/audience separation.
- Role trust sepenuhnya dari JWT claims.
Rekomendasi konkret:
- Tambahkan issuer, audience, dan typ.
- session: aud = "akal-web-session"
- quiz: aud = "akal-quiz-submit"
- Verify dengan jwtVerify(token, secret, { issuer, audience }).
- Tambahkan jti dan/atau tokenVersion di DB untuk revoke.
- Pada privileged route, re-load user dari DB dan cek deletedAt, role current, sekolahId.
- Pakai secret berbeda untuk quiz token dan session token.

**13. Cookie session belum memakai prefix __Host- dan SameSite masih lax**
Severity: High / Medium
Kategori: Session Hardening
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/session.ts:16
- Cookie set di:
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/login/route.ts:85-91
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/register/route.ts:72-78
- /home/ngome/agensi/proyek/akal-center/src/app/api/masuk/route.ts:54-60,100-106
- /home/ngome/agensi/proyek/akal-center/src/lib/auth-actions.ts:30-36,67-73
Bukti:
export const SESSION_COOKIE_NAME = "akal_sesi";
Cookie:
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "lax",
path: "/",
maxAge: SESSION_DURATION_SECONDS,
Dampak:
Cukup baik, tetapi untuk production 2026 masih bisa diperkuat. __Host- mencegah cookie domain/subdomain injection. SameSite=Strict lebih aman jika tidak ada OAuth flow yang membutuhkan Lax untuk session utama.
Rekomendasi konkret:
- Ganti nama cookie menjadi __Host-akal_sesi.
- Pastikan:
- secure: true di production
- path: "/"
- tidak set domain
- Pertimbangkan sameSite: "strict" untuk session app non-OAuth.
- Untuk OAuth Keystatic, gunakan cookie terpisah sesuai kebutuhan OAuth.

**14. Origin check manual hardcoded dan tidak cukup sebagai security boundary**
Severity: High
Kategori: CSRF / Deployment Drift
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/kuis/selesai/route.ts:18-24
- /home/ngome/agensi/proyek/akal-center/src/app/api/kuis/rekap/route.ts:14-19
Bukti:
const allowedOrigins = ["https://akalcenter.my.id", "https://ahmad-katsiri-agung.vercel.app", "http://localhost:3000"];
const originOk = allowedOrigins.some((o) => origin.startsWith(o));
Masalah:
- startsWith raw string check rentan salah match untuk URL crafted seperti https://akalcenter.my.id.evil... jika header origin/referer berbentuk demikian.
- Origin/referer tidak selalu ada.
- Domain hardcoded bisa drift saat VPS origin/custom domain berubah.
- Origin check bukan pengganti auth/CSRF token.
Rekomendasi konkret:
- Parse new URL(originHeader).origin dan compare exact.
- Pindahkan allowlist ke env ALLOWED_ORIGINS.
- Jangan andalkan origin untuk endpoint data sensitif; tetap require session/role.
- Tambahkan CSRF token untuk endpoint cookie-auth mutating yang bukan public.

**15. Public APIs membaca/menulis Google Sheets tanpa moderation/auth**
Severity: High
Kategori: Data Exposure / Abuse / Privacy
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/doa/route.ts:10-31,38-80
- /home/ngome/agensi/proyek/akal-center/src/app/api/refleksi/route.ts:10-41,51-100
- /home/ngome/agensi/proyek/akal-center/src/app/api/diskusi/route.ts:10-35,42-88
- /home/ngome/agensi/proyek/akal-center/src/app/api/diskusi/[slug]/route.ts:13-60,67-124
Dampak:
- Siapa pun bisa spam content ke Google Sheet dan Telegram.
- GET menampilkan semua doa/refleksi/diskusi tanpa moderation flag.
- Refleksi bisa mengandung data anak/siswa dan dibuka publik.
- Google Sheets sebagai datastore public write rentan quota exhaustion.
Rekomendasi konkret:
- Untuk konten publik: tambahkan moderation status (pending/approved/rejected) dan GET hanya approved.
- Refleksi sebaiknya private per siswa/guru, bukan public GET global.
- Tambahkan CAPTCHA/Turnstile untuk public POST.
- Tambahkan rate limit Redis + per-field abuse detection.
- Jangan kirim PII detail anak ke Telegram tanpa kebutuhan dan consent.

**16. Student verification memakai nama + tanggal lahir dan mengembalikan quiz token**
Severity: High
Kategori: Privacy / Authentication Weakness
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/siswa/cek/route.ts:31-57
- /home/ngome/agensi/proyek/akal-center/src/lib/auth.ts:15-30
Bukti:
rowNama?.toLowerCase().trim() === cleanNama.toLowerCase().trim() &&
rowTtl?.toLowerCase().trim() === cleanTanggalLahir.toLowerCase().trim()
Lalu return:
return NextResponse.json({
  found: true,
  nama: matchedNama,
  kelas: matchedKelas,
  token,
});
Dampak:
- Nama + tanggal lahir sering mudah ditebak/diketahui.
- Endpoint bisa dipakai enumerasi siswa walau rate-limited.
- Token quiz hanya bind nama/kelas, bukan ID siswa unik.
- Data anak termasuk kategori sensitif secara privacy.
Rekomendasi konkret:
- Gunakan identifier lebih kuat: NIS/password sementara/invite code.
- Jangan return detail lebih dari perlu.
- Tambahkan attempt counter per nama+tanggalLahir, bukan hanya IP.
- Token quiz harus bind studentId, quizId, jti, aud.
- Simpan event verifikasi ke audit log.

**17. Health endpoint public mengekspos status DB dan memicu query DB**
Severity: High / Medium
Kategori: Information Disclosure / Availability
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/health/route.ts:16-24
Bukti:
return NextResponse.json({
  status: "ok",
  uptime: ...,
  database: dbOk ? "connected" : "disconnected",
  timestamp: ...
});
Dampak:
- Attacker bisa monitor kapan DB down/up.
- Public endpoint melakukan DB query setiap hit; bisa dipakai untuk low-cost DB pressure.
- Compose healthcheck juga memakai endpoint ini.
Rekomendasi konkret:
- Pisahkan:
- /api/healthz public lightweight tanpa DB detail.
- /api/readyz internal only dengan DB check.
- Rate limit atau restrict ready endpoint by network.
- Untuk public return hanya { status: "ok" }.

**18. Caddy belum membatasi akses origin hanya dari Cloudflare/expected network**
Severity: High
Kategori: Origin Protection
File:
- /home/ngome/agensi/proyek/akal-center/infrastructure/Caddyfile:1-20
Bukti:
Caddy hanya reverse proxy dan set beberapa header; tidak ada Cloudflare IP allowlist, basic auth, atau client restrictions.
Dampak:
Jika origin.akalcenter.my.id diketahui dan DNS publik, attacker bisa hit origin langsung, melewati Worker-level protections.
Rekomendasi konkret:
- Jika domain utama lewat Worker, protect origin:
- firewall allow Cloudflare IP ranges only, atau
- Caddy remote_ip allowlist, atau
- mTLS/Cloudflare Authenticated Origin Pulls.
- Jangan expose origin.* ke publik tanpa kontrol.
- Pastikan app port internal only.

---

## Medium Findings

**19. DB schema belum menegakkan tenant isolation secara kuat**
Severity: Medium sekarang, High saat multi-sekolah aktif
Kategori: Multi-tenancy / Data Isolation
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:35-70
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:72-95
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:112-128
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:171-193
Observasi:
- users.sekolahId nullable.
- kursus.sekolahId nullable.
- siswa_kursus tidak punya sekolahId.
- jawaban_log tidak punya sekolahId/tenant column.
- Belum ada application-level queries dengan tenant check karena API masih mock.
- Tidak ada PostgreSQL RLS.
Dampak:
Saat multi-sekolah/tenant aktif, bug query sederhana bisa membaca data lintas sekolah.
Rekomendasi konkret:
- Putuskan model tenancy:
- setiap user/kursus/enrollment/log harus punya sekolah_id.
- Buat sekolah_id non-null untuk role selain owner/global.
- Tambahkan composite indexes tenant-aware.
- Semua query wajib filter by session.sekolahId.
- Pertimbangkan PostgreSQL RLS untuk defense-in-depth jika multi-tenant serius.

**20. Migration runner custom tidak atomic dan memakai pencatatan manual _migrations**
Severity: Medium
Kategori: Deployment Reliability
File:
- /home/ngome/agensi/proyek/akal-center/scripts/prod-entrypoint.sh:16-33
Bukti:
Script membuat _migrations, menjalankan file SQL, lalu insert migration name.
Dampak:
- Jika SQL setengah jalan sukses lalu gagal, status bisa inconsistent.
- Tidak pakai advisory lock; jika dua app container start bersamaan, migration race.
- Tidak ada transaction wrapper per migration.
- Nama migration dimasukkan ke SQL string, walau nama file trusted dari image.
Rekomendasi konkret:
- Jalankan migration sebagai one-shot job sebelum app start, bukan setiap app container.
- Gunakan Drizzle migration tooling resmi atau tambah:
- advisory lock
- transaction per migration jika SQL kompatibel
- fail-fast dan recovery procedure.
- Jangan scale app replicas sampai migration strategy aman.

**21. PostgreSQL pool max 20 per process bisa terlalu besar untuk VPS kecil**
Severity: Medium
Kategori: Resource Management
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/db/index.ts:12-17
Bukti:
new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})
Dampak:
Pada VPS kecil atau multi-replica, 20 koneksi per process bisa cepat menghabiskan max_connections PostgreSQL.
Rekomendasi konkret:
- Jadikan PGPOOL_MAX env.
- Default VPS kecil: 5-10.
- Monitor active connections.
- Jika scale, pakai PgBouncer.

**22. DATABASE_URL tidak divalidasi saat runtime app start**
Severity: Medium
Kategori: Config Safety
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/db/index.ts:12-17
- /home/ngome/agensi/proyek/akal-center/drizzle.config.ts:3-5
Observasi:
drizzle.config.ts validasi DATABASE_URL, tetapi runtime src/lib/db/index.ts langsung membuat pool dengan process.env.DATABASE_URL.
Dampak:
Misconfig bisa muncul sebagai error runtime saat endpoint pertama memanggil DB, bukan saat boot.
Rekomendasi konkret:
- Tambahkan config validation terpusat untuk required env.
- Fail-fast saat server boot untuk production:
- DATABASE_URL
- JWT_SECRET
- KEYSTATIC_SECRET jika CMS aktif
- Google/Telegram jika fitur aktif.
- Jangan rely pada endpoint health sebagai satu-satunya deteksi.

**23. Password policy terlalu lemah untuk production**
Severity: Medium
Kategori: Authentication
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/register/route.ts:11-16
Bukti:
password: z.string().min(6).max(128)
Dampak:
Password 6 karakter terlalu lemah untuk akun guru/admin.
Rekomendasi konkret:
- Minimal 12 karakter untuk guru/admin.
- Minimal 8-10 untuk siswa jika UX perlu ringan.
- Cek password leaked/common list jika memungkinkan.
- Tambahkan rate limit per email dan progressive delay.

**24. Email tidak dinormalisasi sebelum unique check/login**
Severity: Medium
Kategori: Auth Consistency
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/login/route.ts:43-49
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/register/route.ts:43-62
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:55
Bukti:
Email dari parsed data langsung dipakai tanpa .trim().toLowerCase().
Dampak:
Bisa terjadi duplicate-like account berdasarkan casing/spacing, tergantung Postgres unique yang case-sensitive.
Rekomendasi konkret:
- Normalize email sebelum insert/login.
- Pertimbangkan citext extension atau unique index lower(email).
- Simpan emailNormalized.

**25. deletedAt ada di schema user tapi login tidak mengecek soft-deleted user**
Severity: Medium
Kategori: Auth Logic
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:67
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/login/route.ts:45-72
Dampak:
User soft-deleted tetap bisa login jika password valid.
Rekomendasi konkret:
- Tambahkan condition deletedAt is null.
- Untuk semua privileged route, cek user current status dari DB.

**26. student_ability.siswa_id unique global membuat satu siswa hanya bisa punya satu ability untuk semua kursus**
Severity: Medium
Kategori: Data Model Correctness
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:195-209
- /home/ngome/agensi/proyek/akal-center/src/lib/db/migrations/0000_aromatic_purifiers.sql:148-155
Bukti:
siswaId: uuid("siswa_id")
  .notNull()
  .references(() => users.id)
  .unique(),
kursusId: uuid("kursus_id").notNull()
Dampak:
Jika siswa ikut lebih dari satu kursus, tidak bisa punya theta per kursus. Ini akan memblokir analytics.
Rekomendasi konkret:
- Ganti unique global menjadi unique composite (siswa_id, kursus_id).
- Tambahkan index (kursus_id, siswa_id).

**27. users.email wajib unique, tetapi siswa muda/anak mungkin tidak punya email sendiri**
Severity: Medium
Kategori: Product/Data Model
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:55
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/register/route.ts:11-16
Dampak:
Untuk SMP/MTs, banyak siswa mungkin tidak punya email pribadi. Bisa memaksa penggunaan email orang tua/duplikat dan bentrok.
Rekomendasi konkret:
- Tentukan identifier siswa:
- NIS/NISN + sekolah_id
- atau username generated
- email optional untuk siswa.
- Unique email tetap untuk guru/admin/orang tua.

**28. file_materi menyimpan linkAkses bebas tanpa kontrol akses**
Severity: Medium
Kategori: Storage / Access Control
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/db/schema.ts:321-334
Dampak:
Jika nanti dipakai untuk materi berbayar/private, link publik bisa bocor dan tidak ada signed URL/expiry.
Rekomendasi konkret:
- Simpan object key, bukan public URL langsung.
- Untuk private file, serve via API dengan auth check + signed URL short-lived.
- Pisahkan public asset vs private material.

**29. Public asset route memperbolehkan SVG dari CMS/GitHub raw**
Severity: Medium
Kategori: XSS / Content Security
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/assets/[...path]/route.ts:5-17
- /home/ngome/agensi/proyek/akal-center/src/app/api/assets/[...path]/route.ts:92-99
- /home/ngome/agensi/proyek/akal-center/src/app/api/assets/[...path]/route.ts:121-128
Bukti:
".svg",
...
"Content-Type": "image/svg+xml",
Dampak:
SVG dapat membawa script/active content tergantung konteks render/browser. CSP membantu, tetapi SVG upload dari CMS tetap riskier dibanding image raster.
Rekomendasi konkret:
- Jangan izinkan SVG upload untuk user/CMS non-technical kecuali disanitasi.
- Atau serve SVG as attachment:
- Content-Disposition: attachment
- Untuk image inline, prefer PNG/WebP/JPEG.
- Jika tetap SVG, sanitasi saat upload/build.

**30. Asset route path traversal mitigasi belum menggunakan normalized base containment check**
Severity: Medium
Kategori: File Access
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/assets/[...path]/route.ts:58-85
Bukti:
Sudah ada check .., null byte, extension whitelist. Ini baik. Namun final path tidak diverifikasi dengan path.resolve dan base containment.
Dampak:
Risiko rendah karena .. diblok dan extension whitelist ada, tetapi best practice production adalah containment check.
Rekomendasi konkret:
- Resolve base dir dan target:
- const resolved = path.resolve(base, entrySlug, filename)
- verify resolved.startsWith(base + path.sep)
- Batasi filename chars lebih ketat.
- Tambah max file size streaming, jangan readFileSync.

**31. readFileSync pada asset route bisa block event loop**
Severity: Medium
Kategori: Performance / DoS
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/assets/[...path]/route.ts:88-99
Bukti:
const content = fs.readFileSync(collectionPath);
Dampak:
File besar atau request paralel bisa block Node event loop.
Rekomendasi konkret:
- Gunakan stream response atau static serving via Caddy/Next public for deployed assets.
- Tambahkan max file size.
- Offload asset serving ke Caddy/static/CDN bila di VPS.

**32. Keystatic env mismatch: layout cek NEXT_PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID, example pakai KEYSTATIC_GITHUB_CLIENT_ID**
Severity: Medium / High jika CMS production dibutuhkan
Kategori: Config Drift
File:
- /home/ngome/agensi/proyek/akal-center/src/app/keystatic/layout.tsx:37-50
- /home/ngome/agensi/proyek/akal-center/.env.production.example:40-45
Bukti:
Layout:
const clientId = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID;
Example:
KEYSTATIC_GITHUB_CLIENT_ID=""
KEYSTATIC_GITHUB_CLIENT_SECRET=""
KEYSTATIC_SECRET=""
Dampak:
CMS bisa 404 di production walau env example diisi sesuai instruksi, karena nama env tidak cocok.
Rekomendasi konkret:
- Samakan nama env dengan dokumentasi Keystatic yang benar.
- Update .env.production.example.
- Tambahkan startup/config check jika CMS aktif.
- Pastikan KEYSTATIC_ALLOWED_USERS wajib di production.

**33. Keystatic allowlist bersifat optional**
Severity: Medium
Kategori: CMS Access Control
File:
- /home/ngome/agensi/proyek/akal-center/src/app/keystatic/layout.tsx:5-8
- /home/ngome/agensi/proyek/akal-center/src/app/keystatic/layout.tsx:55-79
Bukti:
if (ALLOWED_USERS.length > 0) {
  const access = await verifyGithubUser();
  ...
}
Dampak:
Jika allowlist kosong, akses bergantung pada Keystatic/GitHub app config saja. Untuk situs klien, sebaiknya allowlist wajib agar akun GitHub yang tidak diinginkan tidak bisa masuk lewat app authorization/config mistake.
Rekomendasi konkret:
- Di production, require KEYSTATIC_ALLOWED_USERS non-empty.
- Fail closed jika kosong.
- Tambahkan minimal user wimxwim/akun klien yang disetujui.

**34. /session route meneruskan semua request headers ke redirect response**
Severity: Medium
Kategori: Header Handling
File:
- /home/ngome/agensi/proyek/akal-center/src/app/session/route.ts:8-11
- /home/ngome/agensi/proyek/akal-center/src/app/session/route.ts:19-22
Bukti:
return NextResponse.redirect(new URL(destination, url.origin), {
  status: 307,
  headers: request.headers,
});
Dampak:
Menyalin request headers ke response tidak lazim dan bisa menyebabkan header leakage/invalid response headers. Redirect tidak perlu membawa semua request headers.
Rekomendasi konkret:
- Jangan pass headers: request.headers.
- Set header response minimal saja jika diperlukan.

**35. Worker rate limiting fail-open saat store penuh**
Severity: Medium
Kategori: Abuse Protection
File:
- /home/ngome/agensi/proyek/akal-center/workers/akal-center/index.ts:13-24
Bukti:
if (rateStore.size > MAX_STORE_SIZE) return true;
Dampak:
Attacker bisa membuat banyak key/path/IP variation sampai store penuh, lalu limiter allow semua.
Rekomendasi konkret:
- Saat store penuh, cleanup dulu.
- Jika tetap penuh, fail closed untuk API POST atau evict oldest.
- Gunakan Cloudflare Durable Object/KV/Ratelimit API jika butuh edge global consistency.

**36. Worker tidak menambahkan X-Frame-Options atau CSP fallback**
Severity: Medium
Kategori: Security Headers
File:
- /home/ngome/agensi/proyek/akal-center/workers/akal-center/index.ts:36-41
- Next config sudah ada: /home/ngome/agensi/proyek/akal-center/next.config.ts:32-46
Observasi:
Worker hanya menambah HSTS, XCTO, Referrer-Policy bila origin belum punya. Next origin menambah CSP/XFO. Jika origin error/502 dari Worker, error response tidak punya full security headers.
Rekomendasi konkret:
- Tambahkan X-Frame-Options: DENY di Worker fallback.
- Pastikan error responses Worker juga diberi security headers.
- Pertimbangkan Permissions-Policy.

**37. Caddy security headers belum selengkap Next/Worker**
Severity: Medium
Kategori: Security Headers
File:
- /home/ngome/agensi/proyek/akal-center/infrastructure/Caddyfile:4-7
Bukti:
Caddy hanya:
header Strict-Transport-Security ...
header X-Content-Type-Options "nosniff"
header X-Frame-Options "DENY"
Rekomendasi konkret:
- Tambahkan:
- Referrer-Policy "strict-origin-when-cross-origin"
- Permissions-Policy "camera=(), microphone=(), geolocation=()"
- Pastikan CSP dari Next tidak dihapus.
- Untuk origin-only domain, pertimbangkan noindex header jika tidak ingin diindex.

**38. CSP masih memakai unsafe-inline**
Severity: Medium
Kategori: XSS Defense
File:
- /home/ngome/agensi/proyek/akal-center/next.config.ts:3-15
Bukti:
"script-src 'self' 'unsafe-inline' ..."
"style-src 'self' 'unsafe-inline' ..."
Dampak:
CSP masih membantu membatasi domain, tetapi unsafe-inline melemahkan proteksi XSS.
Rekomendasi konkret:
- Untuk Next app, idealnya migrasi bertahap ke nonce-based CSP.
- Minimal:
- audit kebutuhan inline script
- jangan tambah inline user-generated HTML
- pastikan semua user content di-render escaped.

**39. Sanitizer regex bukan HTML sanitizer lengkap**
Severity: Medium
Kategori: XSS Defense
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/sanitize.ts:1-34
Observasi:
sanitizeText cukup untuk text plain sederhana, tetapi regex sanitizer bukan HTML sanitizer aman bila nanti konten di-render sebagai HTML.
Dampak:
Jika output selalu sebagai React text node, aman relatif. Jika nanti dipakai dengan Markdown/HTML/rich text, risk meningkat.
Rekomendasi konkret:
- Dokumentasikan fungsi ini hanya untuk plain text.
- Jangan pakai untuk sanitize HTML.
- Untuk CMS rich content, render dengan safe renderer dan schema ketat.

**40. Telegram Markdown escaping belum lengkap untuk Markdown mode**
Severity: Medium / Low
Kategori: Notification Robustness
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/telegram.ts:9-16
Bukti:
Escape hanya _, *, backtick, [, (.
Dampak:
User input tertentu bisa merusak formatting Telegram Markdown atau menyebabkan send failure.
Rekomendasi konkret:
- Gunakan parse_mode: MarkdownV2 dengan escaping lengkap, atau
- Hindari parse_mode untuk user-generated content, atau
- Kirim plain text.

---

## Low / Informational Findings

**41. Dockerfile sudah menjalankan app sebagai non-root**
Severity: Positive
File:
- /home/ngome/agensi/proyek/akal-center/Dockerfile:20
- /home/ngome/agensi/proyek/akal-center/Dockerfile:37
Bukti:
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
...
USER nextjs
Catatan:
Ini bagus untuk production. Pertahankan.

**42. Security headers di Next config cukup baik sebagai baseline**
Severity: Positive
File:
- /home/ngome/agensi/proyek/akal-center/next.config.ts:32-46
Headers tersedia:
- CSP
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- HSTS
Catatan:
Masih ada unsafe-inline, tetapi baseline sudah jauh lebih baik daripada default.

**43. Cookie auth sudah HttpOnly dan secure di production**
Severity: Positive dengan catatan
File:
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/login/route.ts:85-91
- /home/ngome/agensi/proyek/akal-center/src/app/api/v1/auth/register/route.ts:72-78
- /home/ngome/agensi/proyek/akal-center/src/app/api/masuk/route.ts:54-60,100-106
Bukti:
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "lax",
Catatan:
Perlu upgrade ke __Host- prefix dan pertimbangkan sameSite: "strict".

**44. Password hashing untuk DB user memakai bcrypt salt rounds 12**
Severity: Positive
File:
- /home/ngome/agensi/proyek/akal-center/src/lib/auth-password.ts:3-13
Bukti:
const SALT_ROUNDS = 12;
Catatan:
Ini baik. Problem utamanya bukan hashing DB user, tetapi public role registration dan login guru legacy/shared password.

**45. Build Docker memakai standalone output Next.js**
Severity: Positive
File:
- /home/ngome/agensi/proyek/akal-center/next.config.ts:18
- /home/ngome/agensi/proyek/akal-center/Dockerfile:22-24
Catatan:
Cocok untuk VPS container deployment.

---

## Deployment Readiness Checklist untuk VPS 2026

### Wajib sebelum launch publik
1. Tutup public guru registration.
- /api/v1/auth/register hanya siswa.
- Guru via invite/admin approval.
2. Protect semua /api/v1/*.
- requireAuth
- requireRole
- tenant/ownership checks.
3. Migrasikan dashboard APIs dari mock ke PostgreSQL.
- kursus
- enroll
- nilai
- siswa
4. Perbaiki production secrets.
- hapus akaldev dari prod compose.
- gunakan env required substitution.
- rotate DB password.
5. Perbaiki network exposure.
- hapus ports: "3000:3000" app.
- firewall only 80/443.
- origin protection Cloudflare/Caddy.
6. Perbaiki Worker origin.
- set ORIGIN_URL=https://origin.akalcenter.my.id sebagai Worker var.
- fail closed jika env tidak ada.
- guard against self-loop.
7. Redis-backed rate limit.
- Redis sudah ada, gunakan untuk limiter.
- limit login by IP + username/email.
8. Matikan/deprecate login guru plaintext Google Sheets.
- pakai DB bcrypt user.
9. Health endpoint split.
- public liveness no DB detail.
- internal readiness with DB.
10. Keystatic production config.
- samakan env var.
- KEYSTATIC_ALLOWED_USERS wajib.
- jangan allow local mode production.

### Sebaiknya sebelum launch
1. JWT hardening:
- issuer/audience
- token type separation
- tokenVersion/revocation.
2. Cookie hardening:
- __Host-akal_sesi
- SameSite Strict jika feasible.
3. Tenant model:
- sekolah_id non-null untuk relevant data.
- DB/index/query tenant-aware.
4. Backup/restore:
- PostgreSQL volume backup harian.
- restore drill.
- Google Sheets export/backup jika masih dipakai.
5. Observability:
- structured logs
- error tracking
- request ID
- alert health DB/app.
6. Migration safety:
- one-shot migration job
- advisory lock
- no app multi-replica until migration safe.

---

## Recommended Fix Order

**Phase 0: Stop-the-bleed security**
1. Disable public guru registration.
2. Disable or protect /api/v1/kursus*, /api/v1/enroll*, /api/v1/kursus/*/nilai.
3. Remove hardcoded prod DB password from compose.
4. Remove public app port exposure.
5. Set Worker ORIGIN_URL correctly.

**Phase 1: Auth and data correctness**
1. Consolidate login to DB user auth.
2. Add route-level requireAuth/requireRole.
3. Add userId, sekolahId to session.
4. Replace mock APIs with DB queries.
5. Add tenant ownership checks.

**Phase 2: Production hardening**
1. Redis rate limiter.
2. JWT issuer/audience/revocation.
3. Health endpoint split.
4. Keystatic allowlist mandatory.
5. Backup/restore and monitoring.

**Phase 3: Privacy and abuse protection**
1. Moderate public content.
2. Protect student verification.
3. Add CAPTCHA/Turnstile for public forms.
4. Reduce Telegram PII.
5. Data retention policy for student info.

---

## Final Verdict

Untuk launch VPS 2026, proyek ini belum aman jika fitur akun guru/dashboard/API ikut dibuka. Bagian frontend konten publik dan beberapa baseline security header sudah cukup baik, tetapi backend authorization, role registration, Worker origin, credential production, dan persistence masih perlu dibereskan dulu.

Prioritas mutlak: tutup privilege escalation guru, protect API, ganti mock API ke DB, hilangkan hardcoded prod secrets, dan amankan network/Worker origin.

---

> *Dokumen ini adalah salinan verbatim dari output sub-agent GPT 5.5 sesi 2026-07-06.*
> *Tidak ada yang diringkas, di-skip, atau diubah dari output asli.*
