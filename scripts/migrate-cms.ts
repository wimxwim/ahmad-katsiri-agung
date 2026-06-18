import { ALL_MATERI, type BabMateri } from "../src/data/materi";
import { ALL_SOAL } from "../src/data/soal";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(import.meta.dirname, "..", "content");

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ✓ ${path}`);
}

// ── Game data sync dengan src/app/game/page.tsx ──
const GAMES = [
  { judul: "Game Beriman kepada Malaikat", desc: "Game interaktif tentang malaikat Allah untuk siswa SMP.", url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-malaikat", badge: "EKSTERNAL", image: "/images/games/game-beriman-kepada-malaikat.webp" },
  { judul: "Game Membiasakan Tabayyun dan Menjauhi Ghibah", desc: "Game interaktif tentang tabayyun dan menjauhi ghibah untuk siswa SMP.", url: "https://kuis-bangun-ruang9.my.canva.site/membiasakan-tabayyun-dan-menjauhi-ghibah", badge: "EKSTERNAL", image: "/images/games/game-membiasakan-tabayyun-dan-menjauhi-ghibah.webp" },
  { judul: "Game Salat Mencegah Perbuatan Keji dan Mungkar", desc: "Game interaktif tentang hikmah salat mencegah perbuatan keji dan mungkar.", url: "https://kuis-bangun-ruang9.my.canva.site/salat-mencegah-perbuatan-keji-dan-mungkarr", badge: "EKSTERNAL", image: "/images/games/game-salat-mencegah-perbuatan-keji-dan-mungkar.webp" },
  { judul: "Game Amanah dan Jujur", desc: "Game interaktif tentang sifat amanah dan jujur dalam kehidupan sehari-hari.", url: "https://jujurdanamanah.my.canva.site/", badge: "EKSTERNAL", image: "/images/games/game-jujur-dan-amanah.webp" },
  { judul: "Game Kitab Allah SWT", desc: "Game interaktif mengenal kitab-kitab Allah SWT untuk siswa SMP.", url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-kitab-allah", badge: "EKSTERNAL", image: "/images/games/game-kitab-allah-swt.webp" },
  { judul: "Game Beriman kepada Nabi dan Rasul", desc: "Game interaktif tentang nabi dan rasul untuk siswa SMP.", url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-nabi-dan-rasul", badge: "EKSTERNAL", image: "/images/games/game-beriman-kepada-nabi-dan-rasul.webp" },
  { judul: "Game Moderasi Beragama", desc: "Game interaktif tentang moderasi beragama sebagai wujud Islam rahmatan lil alamin.", url: "https://kuis-bangun-ruang9.my.canva.site/moderasi-beragama", badge: "EKSTERNAL", image: "/images/games/game-moderasi-beragama.webp" },
  { judul: "Game Adab dalam Islam", desc: "Game interaktif tentang adab-adab dalam Islam untuk siswa SMP.", url: "https://kuis-bangun-ruang9.my.canva.site/adab-dalam-islamm", badge: "EKSTERNAL", image: "/images/games/game-adab-dalam-islam.webp" },
  { judul: "Game Beriman kepada Hari Akhir", desc: "Game interaktif tentang iman kepada hari akhir untuk siswa SMP.", url: "https://kuis-bangun-ruang9.my.canva.site/aplikasi-tanpa-judul", badge: "EKSTERNAL", image: "/images/games/game-beriman-kepada-hari-akhir.webp" },
  { judul: "Game Beriman kepada Qada & Qadar", desc: "Game interaktif tentang qada dan qadar untuk siswa SMP.", url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-qada-dan-qadar", badge: "EKSTERNAL", image: "/images/games/game-beriman-kepada-qada-&-qadar.webp" },
  { judul: "Game Semangat Mencari Ilmu", desc: "Game interaktif tentang semangat mencari ilmu sebagai kewajiban setiap muslim.", url: "https://kuis-bangun-ruang9.my.canva.site/semangat-mencari-ilmu", badge: "EKSTERNAL", image: "/images/games/game-semangat-mencari-ilmu.webp" },
  { judul: "Game Manusia sebagai Khalifah di Bumi", desc: "Game interaktif tentang peran dan tanggung jawab manusia sebagai khalifah di muka bumi.", url: "https://kuis-bangun-ruang9.my.canva.site/manusia-sebagai-khalifah-di-bumi", badge: "EKSTERNAL", image: "/images/games/game-manusia-khalifah-di-muka-bumi.webp" },
];

// ── Hadits data sync dengan AyatBlock.tsx ──
const HADITS_LIST = [
  { teks: "Sesungguhnya kejujuran itu membawa kepada kebaikan dan kebaikan itu membawa ke Surga.", sumber: "HR. Muslim" },
  { teks: "Barang siapa yang beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam.", sumber: "HR. Bukhari & Muslim" },
  { teks: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.", sumber: "HR. Ahmad" },
  { teks: "Tidak sempurna iman seseorang di antara kalian sampai ia mencintai saudaranya seperti ia mencintai dirinya sendiri.", sumber: "HR. Bukhari & Muslim" },
  { teks: "Sesungguhnya Allah tidak melihat kepada rupa dan harta kalian, tetapi Dia melihat kepada hati dan amal kalian.", sumber: "HR. Muslim" },
  { teks: "Mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah.", sumber: "HR. Muslim" },
];

// ── Navigation data sync dengan layout components ──
const NAVIGATION = {
  navbarItems: [
    { href: "/", label: "Beranda" },
    { href: "/pendidik", label: "Pendidik" },
    { href: "/materi", label: "Materi" },
    { href: "/evaluasi", label: "Evaluasi" },
    { href: "/game", label: "Game" },
    { href: "/tentang", label: "Tentang" },
  ],
  bottomTabs: [
    { href: "/", label: "Beranda", icon: "Home" },
    { href: "/materi", label: "Materi", icon: "BookOpen" },
    { href: "/evaluasi", label: "Kuis", icon: "ClipboardList" },
    { href: "/game", label: "Game", icon: "Gamepad2" },
    { href: "/tentang", label: "Tentang", icon: "Info" },
  ],
  footerLinks: [
    { href: "/", label: "Beranda" },
    { href: "/materi", label: "Materi" },
    { href: "/hafalan", label: "Hafalan Dalil" },
    { href: "/dalil/al-isra-34", label: "Analisis Dalil" },
    { href: "/video", label: "Video" },
    { href: "/evaluasi", label: "Kuis" },
    { href: "/game", label: "Game Edukasi" },
    { href: "/pendidik", label: "Pendidik" },
    { href: "/tentang", label: "Tentang Kami" },
  ],
  waNumber: "6285158795502",
  igHandle: "@ahmadkatsiria",
  tiktokHandle: "@sir.ahmd",
  youtubeChannel: "Ahmad Katsiri Agung",
};

// ── Site Config sync dengan layout.tsx metadata ──
const SITE_CONFIG = {
  siteTitle: "AKAL Center",
  tagline: "Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning",
  description: "Platform pembelajaran Akidah Akhlak tingkat SMP/MTs berbasis Deep Learning dengan 3 pilar: Mindful Learning, Meaningful Learning, Joyful Learning. Kurikulum Merdeka.",
  keywords: "akidah akhlak, deep learning, pai, smp, mts, kurikulum merdeka, pembelajaran interaktif, aqidah akhlak, mindful learning, meaningful learning, joyful learning",
  googleAnalyticsId: "G-FKHV466K10",
};

// ── About sync dengan halaman /tentang ──
const ABOUT = {
  filosofi: "AKAL Center lahir dari keprihatinan terhadap metode pembelajaran PAI yang masih konvensional dan kurang menyentuh dimensi spiritual siswa. Deep Learning bukan sekadar model — ia adalah pendekatan yang mengajak siswa untuk mindful dalam setiap proses belajar, meaningful dalam menghayati nilai, dan joyful dalam mengamalkannya.",
  pendiriNama: "Ahmad Katsiri Aggung, S.Pd.",
  pendiriFoto: "/images/tentang/ahmad-katsiri.jpg",
  visi: "Mewujudkan generasi muslim yang berakidah kuat, berakhlak mulia, dan mampu mengimplementasikan nilai-nilai Islam dalam kehidupan sehari-hari melalui model pembelajaran Deep Learning.",
  misi: [
    "Menyediakan materi Akidah Akhlak yang terstruktur dan aplikatif sesuai Kurikulum Merdeka",
    "Mengintegrasikan 3 pilar Deep Learning (Mindful, Meaningful, Joyful) dalam setiap proses pembelajaran",
    "Memberdayakan guru PAI dengan perangkat ajar dan instrumen evaluasi yang inovatif",
    "Menciptakan ekosistem belajar yang interaktif dan menyenangkan bagi siswa SMP/MTs",
  ],
  verifikator: [
    { nama: "Sabilil Muttaqin, M.Ed., Ph.D.", peran: "Verifikator Ahli 1" },
    { nama: "Dr. Ekawati, M.A.", peran: "Verifikator Ahli 2" },
    { nama: "Dr. Hamam Faizin, M.A.", peran: "Verifikator Ahli 3" },
    { nama: "Nofi Maria Krisnawati, M.Pd.", peran: "Verifikator Ahli Media" },
  ],
};

// ── Pendidik Page sync dengan halaman /pendidik ──
const PENDIDIK_PAGE = {
  featureCards: [
    {
      badge: "TERBARU: KURIKULUM MERDEKA",
      title: "Modul Ajar",
      desc: "Akses pustaka modul ajar digital yang telah dikurasi untuk standar pendidikan global terkini.",
    },
    {
      badge: "120+ Materi Visual",
      title: "Video",
      desc: "Koleksi video pembelajaran Akidah Akhlak yang sinematik dan mudah dipahami.",
    },
    {
      badge: "BLOOM TAKSONOMI",
      title: "Soal & Kisi-kisi",
      desc: "Bank soal adaptif dengan klasifikasi level kognitif Bloom yang presisi.",
    },
  ],
  stats: [
    { value: "98%", label: "EFISIENSI WAKTU" },
    { value: "12K+", label: "GURU AKTIF" },
    { value: "240TB", label: "DATA TERARSIP" },
  ],
};

// ── Perangkat Ajar sync dengan src/app/pendidik/page.tsx ──
const PERANGKAT_AJAR = {
  items: [
    { kelas: "7", label: "PROTA", file: "/pdf/perangkat/prota-7.pdf", tersedia: true },
    { kelas: "8", label: "PROTA", file: "", tersedia: false },
    { kelas: "9", label: "PROTA", file: "/pdf/perangkat/prota-9.pdf", tersedia: true },
    { kelas: "7", label: "PROSEM", file: "/pdf/perangkat/prosem-7.pdf", tersedia: true },
    { kelas: "8", label: "PROSEM", file: "/pdf/perangkat/prosem-8.pdf", tersedia: true },
    { kelas: "9", label: "PROSEM", file: "/pdf/perangkat/prosem-9.pdf", tersedia: true },
    { kelas: "7", label: "ATP", file: "/pdf/perangkat/atp-7.pdf", tersedia: true },
    { kelas: "8", label: "ATP", file: "/pdf/perangkat/atp-8.pdf", tersedia: true },
    { kelas: "9", label: "ATP", file: "/pdf/perangkat/atp-9.pdf", tersedia: true },
  ],
};

// ── Helper: convert BabMateri to Keystatic JSON format ──
function materiToJson(m: BabMateri) {
  return {
    title: m.title,
    kelas: String(m.kelas),
    bab: m.bab,
    babLabel: m.babLabel,
    ringkasan: m.ringkasan,
    subTopik: m.subTopik,
    waktuBaca: m.waktuBaca,
    icon: m.icon,
    videoUrl: m.videoUrl ?? "",
    soalUrl: m.soalUrl ?? "",
    gameUrl: m.gameUrl ?? "",
    pendahuluan: m.pendahuluan,
    konten: m.konten,
    dalil: m.dalil ?? { surah: "", arab: "", arti: "" },
    dimensi: m.dimensi ?? [],
    poinPenting: m.poinPenting,
    prevSlug: m.prevSlug ?? "",
    prevTitle: m.prevTitle ?? "",
    nextSlug: m.nextSlug ?? "",
    nextTitle: m.nextTitle ?? "",
  };
}

// ── Helper: convert BabSoal to Keystatic JSON format ──
function soalToJson(bab: (typeof ALL_SOAL)[string]) {
  return {
    title: bab.title,
    kelas: String(bab.kelas),
    bab: bab.bab,
    soal: bab.soal.map((s) => ({
      nomor: s.nomor,
      pertanyaan: s.pertanyaan,
      opsiA: s.opsi.A,
      opsiB: s.opsi.B,
      opsiC: s.opsi.C,
      opsiD: s.opsi.D,
      opsiE: s.opsi.E ?? "",
      jawaban: s.jawaban,
    })),
  };
}

// ── MAIN ──
console.log("\n🔨 Migrasi CMS — AKAL Center\n");

// 1. Materi ── 14 entries
console.log("📚 Materi...");
Object.values(ALL_MATERI).forEach((m) => {
  const dir = join(CONTENT_DIR, "materi", m.slug);
  ensureDir(dir);
  writeJson(join(dir, "index.json"), materiToJson(m));
});

// 2. Soal ── 8 entries
console.log("📝 Soal...");
Object.values(ALL_SOAL).forEach((bab) => {
  const slug = bab.slug;
  const dir = join(CONTENT_DIR, "soal", slug);
  ensureDir(dir);
  writeJson(join(dir, "index.json"), soalToJson(bab));
});

// 3. Game ── 12 entries
console.log("🎮 Game...");
GAMES.forEach((g) => {
  const slug = g.judul.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const dir = join(CONTENT_DIR, "game", slug);
  ensureDir(dir);
  writeJson(join(dir, "index.json"), g);
});

// 4. Hadits ── 6 entries
console.log("🕌 Hadits...");
HADITS_LIST.forEach((h, i) => {
  const slug = `hadits-${String(i + 1).padStart(2, "0")}`;
  const dir = join(CONTENT_DIR, "hadits", slug);
  ensureDir(dir);
  writeJson(join(dir, "index.json"), h);
});

// 5. Navigation singleton
console.log("🧭 Navigation...");
ensureDir(join(CONTENT_DIR, "navigation"));
writeJson(join(CONTENT_DIR, "navigation", "index.json"), NAVIGATION);

// 6. Site Config singleton
console.log("⚙️  Site Config...");
ensureDir(join(CONTENT_DIR, "site-config"));
writeJson(join(CONTENT_DIR, "site-config", "index.json"), SITE_CONFIG);

// 7. About singleton
console.log("👤 About...");
ensureDir(join(CONTENT_DIR, "about"));
writeJson(join(CONTENT_DIR, "about", "index.json"), ABOUT);

// 8. Pendidik Page singleton
console.log("🎓 Pendidik Page...");
ensureDir(join(CONTENT_DIR, "pendidik-page"));
writeJson(join(CONTENT_DIR, "pendidik-page", "index.json"), PENDIDIK_PAGE);

// 9. Perangkat Ajar singleton
console.log("📋 Perangkat Ajar...");
ensureDir(join(CONTENT_DIR, "perangkat-ajar"));
writeJson(join(CONTENT_DIR, "perangkat-ajar", "index.json"), PERANGKAT_AJAR);

// Summary
const totalFiles = Object.keys(ALL_MATERI).length + Object.keys(ALL_SOAL).length + GAMES.length + HADITS_LIST.length + 5;
console.log(`\n✅ Selesai! ${totalFiles} file JSON tergenerate (termasuk 5 singleton).\n`);
