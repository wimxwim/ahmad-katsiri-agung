import Link from "next/link";
import { WA_NUMBER } from "@/lib/constants";
import { Sparkles, GraduationCap, Check, HelpCircle, Shield } from "lucide-react";
import { WaIcon } from "@/components/ui/WaIcon";

const gratisFitur = [
  "1 guru",
  "1 kelas aktif",
  "Materi & quiz dasar — kuota harian untuk coba",
  "Akses AI dasar (materi & quiz)",
  "Draft — review oleh guru",
  "Bank soal dasar",
  "Support komunitas",
];

const sekolahFitur = [
  "Multi-guru (hingga 20)",
  "Multi-kelas (tak terbatas)",
  "Kuota AI besar — disesuaikan sekolah (via WA)",
  "Akses AI penuh (materi, quiz, soal, CBT)",
  "Laporan agregat per kelas & per guru",
  "Bank soal kolaboratif",
  "Prioritas support via WA",
  "Dashboard admin sekolah",
];

const faqItems = [
  {
    q: "Apakah benar-benar gratis?",
    a: "Ya. Paket Gratis tidak memerlukan kartu kredit dan bisa dipakai selama-lamanya. Anda tetap bisa membuat materi, quiz, dan mengelola satu kelas tanpa biaya.",
  },
  {
    q: "Bagaimana cara upgrade ke paket Sekolah?",
    a: "Saat ini pembayaran masih dilakukan secara manual. Hubungi kami via WhatsApp untuk konsultasi kebutuhan sekolah Anda dan kami akan bantu proses aktivasi.",
  },
  {
    q: "Apakah ada tagihan tersembunyi?",
    a: "Tidak ada. Semua biaya sudah disebutkan di halaman ini. Tidak ada biaya per siswa, biaya storage, atau biaya tak terduga lainnya.",
  },
  {
    q: "Apakah data siswa aman di paket Gratis?",
    a: "Ya. Semua data dilindungi dengan RLS (Row Level Security) di database dan koneksi HTTPS. Kebijakan keamanan berlaku sama untuk semua paket.",
  },
  {
    q: "Bisakah saya ganti paket kapan saja?",
    a: "Tentu. Anda bisa upgrade ke Sekolah kapan pun tanpa kehilangan data. Jika perlu turun paket, hubungi kami untuk proses migrasi.",
  },
];

export default function HargaPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pb-16 md:pb-32">
      <section
        className="max-w-3xl mx-auto text-center mb-16 sm:mb-24 animate-fade-up"
        style={{ "--anim-duration": "0.7s" } as React.CSSProperties}
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Sparkles className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Mulai Gratis.
          <br />
          Bayar Hanya Saat Anda Siap.
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed max-w-xl mx-auto">
          Tidak ada kartu kredit. Tidak ada tagihan tersembunyi.
          Guru bisa mencoba semua fitur dasar tanpa biaya.
        </p>
      </section>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-24">
        <div
          className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-glass animate-fade-up"
          style={{ "--anim-delay": "0.1s" } as React.CSSProperties}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl text-on-surface">Gratis</h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">Untuk guru perorangan</p>
            </div>
          </div>

          <p className="text-3xl sm:text-4xl font-heading text-on-surface mb-2">
            Rp0
            <span className="text-base font-body text-on-surface-variant font-normal">/bulan</span>
          </p>

          <p className="text-xs sm:text-sm text-on-surface-variant mb-8">
            Selamanya gratis — tanpa kartu kredit
          </p>

          <ul className="space-y-3 mb-10" role="list">
            {gratisFitur.map((fitur, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <span>{fitur}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/daftar"
            className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary px-6 py-3.5 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            Daftar Gratis
          </Link>
        </div>

        <div
          className="bg-glass backdrop-blur-2xl border-2 border-tertiary/30 rounded-2xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-glass-xl relative animate-fade-up"
          style={{ "--anim-delay": "0.2s" } as React.CSSProperties}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tertiary text-on-tertiary text-xs font-semibold px-4 py-1 rounded-full">
            POPULER
          </span>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-tertiary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl text-on-surface">Sekolah</h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">Untuk institusi pendidikan</p>
            </div>
          </div>

          <p className="text-3xl sm:text-4xl font-heading text-on-surface mb-2">
            Hubungi kami
          </p>

          <p className="text-xs sm:text-sm text-on-surface-variant mb-8">
            Konsultasi gratis via WhatsApp — harga disesuaikan kebutuhan sekolah
          </p>

          <ul className="space-y-3 mb-10" role="list">
            {sekolahFitur.map((fitur, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant">
                <Check className="w-4 h-4 text-tertiary mt-0.5 shrink-0" aria-hidden="true" />
                <span>{fitur}</span>
              </li>
            ))}
          </ul>

          <Link
            href={`https://wa.me/${WA_NUMBER}?text=Halo%20AKAL%20Center%2C%20saya%20tertarik%20paket%20Sekolah`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-tertiary text-on-tertiary px-6 py-3.5 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            <WaIcon className="w-5 h-5 text-[#25D366]" />
            Hubungi via WhatsApp
          </Link>
        </div>
      </div>

      <section
        className="max-w-2xl mx-auto mb-16 sm:mb-24 text-center bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-glass animate-fade-up"
        style={{ "--anim-delay": "0.3s" } as React.CSSProperties}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Shield className="w-7 h-7 text-primary" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-xl sm:text-2xl text-on-surface mb-3">
          Pembayaran Online Segera Hadir
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-lg mx-auto">
          Saat ini semua transaksi masih dilakukan secara manual melalui WhatsApp.
          Kami sedang mengintegrasikan pembayaran online dan akan diumumkan segera.
          Tidak ada tagihan tersembunyi — semua biaya transparan.
        </p>
      </section>

      <section className="max-w-2xl mx-auto mb-16 sm:mb-24">
        <h2
          className="font-heading text-2xl sm:text-3xl text-on-surface text-center mb-10 sm:mb-12 animate-fade-up"
          style={{ "--anim-delay": "0.35s" } as React.CSSProperties}
        >
          Pertanyaan Umum
        </h2>

        <div className="space-y-3 [&_details>summary::-webkit-details-marker]:hidden [&_details>summary::marker]:hidden" role="list">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-5 sm:p-6 shadow-glass open:shadow-glass-lg transition-all duration-300 animate-fade-up"
              style={{ "--anim-delay": `${0.4 + i * 0.08}s` } as React.CSSProperties}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-sm sm:text-base font-semibold text-on-surface">
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                  {item.q}
                </span>
                <span className="text-on-surface-variant transition-transform duration-300 group-open:rotate-180 shrink-0">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-sm sm:text-base text-on-surface-variant leading-relaxed pl-8">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section
        className="max-w-xl mx-auto text-center animate-fade-up"
        style={{ "--anim-delay": "0.6s" } as React.CSSProperties}
      >
        <h2 className="font-heading text-2xl sm:text-3xl text-on-surface mb-4">
          Siap Mencoba?
        </h2>

        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-8">
          Tidak perlu ragu. Daftar gratis, nikmati semua fitur dasar,
          dan upgrade kapan pun Anda dan sekolah Anda siap.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            Daftar Gratis
          </Link>

          <Link
            href={`https://wa.me/${WA_NUMBER}?text=Halo%20AKAL%20Center%2C%20saya%20ingin%20tahu%20lebih%20lanjut%20tentang%20paket%20Sekolah`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border-precision text-on-surface px-8 py-4 rounded-full font-semibold hover:bg-glass active:scale-[0.98] transition-all duration-300"
          >
            <WaIcon className="w-5 h-5 text-[#25D366]" />
            Konsultasi via WhatsApp
          </Link>
        </div>

        <p className="mt-6 text-xs text-on-surface-variant">
          Tidak ada kartu kredit. Tidak ada komitmen. Batalkan kapan saja.
        </p>

        <div className="mt-12 flex justify-center gap-6 text-xs text-on-surface-variant">
          <Link href="/kebijakan-privasi" className="hover:text-primary transition-colors underline underline-offset-2">
            Kebijakan Privasi
          </Link>
          <Link href="/syarat-layanan" className="hover:text-primary transition-colors underline underline-offset-2">
            Syarat Layanan
          </Link>
        </div>
      </section>
    </div>
  );
}
