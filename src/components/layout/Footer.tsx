import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/pendidik", label: "Pendidik" },
  { href: "/materi", label: "Materi" },
  { href: "/game", label: "Game Edukasi" },
  { href: "/tentang", label: "Tentang Kami" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border-precision bg-surface mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Link
              href="/"
              className="font-heading font-bold text-primary text-xl tracking-tight"
            >
              Aggung Learning
            </Link>
            <p className="mt-3 text-sm text-on-surface-variant leading-relaxed max-w-xs">
              Platform pembelajaran Pendidikan Agama Islam modern untuk SMP/MTs
              Kelas 7–9.
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
              <li>Jl. Pendidikan No. 123, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-precision text-center text-xs text-on-surface-variant">
          &copy; {new Date().getFullYear()} Aggung Learning. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
}
