import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat Layanan",
  description: "Syarat dan Ketentuan Layanan AKAL Center",
  alternates: { canonical: "https://akalcenter.my.id/syarat-layanan" },
};

export default function SyaratLayananPage() {
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-8 py-20 md:py-32">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface mb-8">
        Syarat Layanan
      </h1>

      <div className="prose prose-sm max-w-none space-y-6 text-on-surface-variant">
        <p>Terakhir diperbarui: Juli 2026</p>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">1. Penerimaan Syarat</h2>
          <p>
            Dengan mengakses dan menggunakan AKAL Center, Anda menyetujui syarat dan ketentuan ini.
            Jika Anda tidak setuju, mohon tidak menggunakan platform ini.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">2. Layanan</h2>
          <p>
            AKAL Center menyediakan platform pembelajaran Pendidikan Agama Islam (PAI) untuk tingkat SMP/MTs.
            Layanan mencakup akses materi, kuis evaluasi, game edukasi, video pembelajaran, dan alat bantu mengajar untuk guru.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">3. Akun Pengguna</h2>
          <p>
            Pengguna bertanggung jawab menjaga kerahasiaan kredensial akun. Aktivitas di bawah akun
            Anda adalah tanggung jawab Anda. Guru bertanggung jawab atas konten materi yang diunggah.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">4. Konten yang Dilarang</h2>
          <p>Dilarang mengunggah atau membagikan konten yang:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Melanggar hukum atau peraturan yang berlaku</li>
            <li>Mengandung ujaran kebencian, diskriminasi, atau pelecehan</li>
            <li>Melanggar hak kekayaan intelektual pihak lain</li>
            <li>Mengandung malware, virus, atau kode berbahaya</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">5. Batasan Tanggung Jawab</h2>
          <p>
            AKAL Center disediakan &quot;sebagaimana adanya&quot;. Kami tidak bertanggung jawab atas
            kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan platform.
          </p>
        </section>
      </div>
    </div>
  );
}
