import { ShieldCheck, Sparkles, School, Users } from "lucide-react";
import Link from "next/link";

export default function OwnerIndex() {
  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-tertiary">
          <ShieldCheck className="w-3 h-3" />
          OWNER CONSOLE
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">
          Pusat kendali AKAL Center
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Pantau sekolah, pengguna, dan biaya AI dari satu tempat. Halaman ini bertahap dibangun
          sesuai TODO Multi-Guru V2.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <School className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Manajemen Sekolah</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Onboarding sekolah, paket langganan, dan konfigurasi subdomain.
          </p>
          <span className="inline-flex items-center mt-4 text-[10px] font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Pengguna & Role</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Lihat semua pengguna, ubah role, dan audit aktivitas mencurigakan.
          </p>
          <span className="inline-flex items-center mt-4 text-[10px] font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">AI Cost & Quota</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Pantau penggunaan token per sekolah dan setel rate limit global.
          </p>
          <span className="inline-flex items-center mt-4 text-[10px] font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-[24px] border border-primary/20 bg-primary/5">
        <p className="text-sm text-on-surface">
          Halaman ini adalah <b>placeholder Owner</b>. Detail implementasi menyusul di Gelombang 5+
          sesuai TODO V2 Multi-Guru. Kembali ke{" "}
          <Link href="/" className="text-primary font-semibold hover:underline">
            beranda
          </Link>{" "}
          atau cek{" "}
          <Link href="/guru/beranda" className="text-primary font-semibold hover:underline">
            ruang guru
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
