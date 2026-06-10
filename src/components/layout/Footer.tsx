import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/materi", label: "Materi" },
  { href: "/hafalan", label: "Hafalan Dalil" },
  { href: "/dalil/al-isra-34", label: "Analisis Dalil" },
  { href: "/video", label: "Video" },
  { href: "/evaluasi", label: "Kuis" },
  { href: "/game", label: "Game Edukasi" },
  { href: "/pendidik", label: "Pendidik" },
  { href: "/tentang", label: "Tentang Kami" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border-precision bg-surface mt-auto">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-bold text-primary text-xl tracking-tight"
            >
              <img src="/logo.svg" alt="Logo PAI" className="w-8 h-8 object-contain" />
              <span>AKAL Centre</span>
            </Link>
            <p className="mt-3 text-sm text-on-surface-variant leading-relaxed max-w-xs">
              Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning untuk
              SMP/MTs Kelas 7–9.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-on-surface mb-4">
              Navigasi
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-on-surface mb-4">
              Kontak
            </h4>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li>Ahmad Katsiri Aggung, S.Pd.</li>
              <li>
                <a
                  href="https://wa.me/6285158795502"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WA: 0851-5879-5502
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/ahmadkatsiria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  IG: @ahmadkatsiria
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@sir.ahmd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  TikTok: @sir.ahmd
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@ahmadkatsiriagung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  YouTube: Ahmad Katsiri Agung
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-precision text-center text-xs text-on-surface-variant">
          &copy; {new Date().getFullYear()} AKAL Centre. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
}
