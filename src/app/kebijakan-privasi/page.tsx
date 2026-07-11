import type { Metadata } from "next";
import { WA_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan Privasi AKAL Center sesuai UU PDP Indonesia",
  alternates: { canonical: "https://akalcenter.my.id/kebijakan-privasi" },
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-8 py-20 md:py-32">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-on-surface mb-8">
        Kebijakan Privasi
      </h1>

      <div className="prose prose-sm max-w-none space-y-6 text-on-surface-variant">
        <p>Terakhir diperbarui: Juli 2026</p>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">1. Data yang Kami Kumpulkan</h2>
          <p>
            AKAL Center mengumpulkan data minimal yang diperlukan untuk menyediakan layanan pembelajaran.
            Data yang dikumpulkan: nama, kelas, nomor absen, NIS (opsional), nama sekolah, dan hasil evaluasi/kuis.
            Untuk guru: nama, email, password (terenkripsi), dan materi ajar yang diunggah.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">2. Perlindungan Data Anak</h2>
          <p>
            AKAL Center mematuhi Undang-Undang Perlindungan Data Pribadi (UU PDP) Indonesia.
            Data siswa (anak di bawah umur) diperlakukan sebagai data pribadi spesifik.
            Kami TIDAK mengumpulkan NIK, alamat rumah, nomor telepon, atau data sensitif lainnya dari siswa.
            Akses ke data siswa hanya diberikan kepada guru yang mengampu kursus terkait.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">3. Penggunaan Data</h2>
          <p>Data yang dikumpulkan digunakan untuk:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Menyediakan akses ke materi pembelajaran dan kuis</li>
            <li>Menyimpan dan menampilkan hasil evaluasi kepada guru dan siswa</li>
            <li>Menghasilkan analitik pembelajaran (skor, penguasaan materi) untuk membantu guru</li>
            <li>Mengirim notifikasi hasil kuis via Telegram (opsional)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">4. Penyimpanan Data</h2>
          <p>
            Data disimpan di server yang berlokasi di Singapura. Data hasil kuis dan materi disimpan di database terkelola
            (untuk kompatibilitas) dan database PostgreSQL (untuk analitik). Materi ajar guru disimpan di
            penyimpanan media global — AKAL Center menyimpan file materi di server yang aman dan terenkripsi.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">5. Hak Pengguna</h2>
          <p>Setiap pengguna memiliki hak untuk:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Meminta salinan data pribadi yang kami simpan</li>
            <li>Meminta koreksi data yang tidak akurat</li>
            <li>Meminta penghapusan data (right to be forgotten)</li>
            <li>Menarik persetujuan pemrosesan data</li>
          </ul>
          <p className="mt-2">Untuk permintaan ini, hubungi guru atau administrator platform.</p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">6. Keamanan</h2>
          <p>
            Kami menerapkan langkah keamanan teknis: enkripsi data dalam perjalanan (HTTPS/TLS),
            otentikasi berbasis token (JWT), pembatasan laju permintaan (rate limiting),
            validasi input, sanitasi konten, dan header keamanan (CSP, HSTS, X-Frame-Options).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-on-surface mt-8 mb-3">7. Kontak</h2>
          <p>
            Untuk pertanyaan tentang kebijakan privasi ini, hubungi:
            <br />
            Ahmad Katsiri Agung, S.Pd.
            <br />
            WhatsApp: {WA_NUMBER}
          </p>
        </section>
      </div>
    </div>
  );
}
