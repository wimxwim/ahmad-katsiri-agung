import type { Metadata } from "next";
import { Sparkles, Shield, AlertTriangle, CheckCircle2, BookOpen, Eye, FileCheck, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Panduan AI — AKAL Center",
  description: "Panduan penggunaan AI secara bijak dan etis untuk guru di AKAL Center.",
};

const SECTIONS = [
  {
    icon: BookOpen,
    title: "Apa itu AI di AKAL Center?",
    content:
      "AKAL Center menggunakan kecerdasan buatan (AI) untuk membantu guru membuat materi pembelajaran, kuis, dan soal dari dokumen PDF atau DOCX. AI bukan pengganti guru — AI adalah asisten yang mempercepat persiapan mengajar.",
  },
  {
    icon: CheckCircle2,
    title: "Kapan AI bisa membantu?",
    items: [
      "Membuat rangkuman materi dari dokumen Anda",
      "Menghasilkan soal pilihan ganda dari teks materi",
      "Membuat soal campuran (PG, isian, essay) otomatis",
      "Mengekstrak poin-poin penting dari buku atau modul",
    ],
  },
  {
    icon: Eye,
    title: "WAJIB: Review sebelum publish",
    content:
      "Semua konten yang dihasilkan AI berstatus DRAFT dan harus ditinjau oleh guru sebelum dipublikasikan ke siswa. Guru bertanggung jawab penuh atas akurasi, kesesuaian kurikulum, dan kualitas konten yang dipublikasikan.",
  },
  {
    icon: AlertTriangle,
    title: "Batasan AI yang perlu diketahui",
    items: [
      "AI bisa membuat kesalahan faktual — selalu verifikasi fakta",
      "AI tidak memahami konteks lokal atau budaya setempat secara mendalam",
      "AI bisa menghasilkan konten yang bias — tinjau dengan kritis",
      "Kualitas output tergantung pada kualitas input dokumen",
      "AI tidak bisa menggantikan penilaian profesional guru",
    ],
  },
  {
    icon: Shield,
    title: "Etika & Privasi",
    items: [
      "Data siswa TIDAK dikirim ke AI untuk training",
      "Hanya konten pembelajaran yang diproses oleh AI",
      "Jangan upload dokumen yang mengandung data pribadi siswa (nama, NISN, nilai)",
      "Hasil AI adalah milik Anda — bisa diedit, dihapus, atau dipublikasikan sesuai kebutuhan",
    ],
  },
  {
    icon: FileCheck,
    title: "Cara menggunakan AI dengan benar",
    items: [
      "Upload dokumen PDF/DOCX yang berkualitas baik",
      "Periksa kembali semua fakta, tanggal, dan istilah",
      "Sesuaikan bahasa dan gaya dengan tingkat siswa Anda",
      "Edit konten AI sebelum dipublikasikan",
      "Gunakan AI untuk ide awal, bukan hasil akhir",
    ],
  },
  {
    icon: Sparkles,
    title: "Model AI yang digunakan",
    content:
      "AKAL Center menggunakan model AI terkini melalui NaraRouter. Untuk tugas ringan (kuis pilihan ganda, ringkasan) digunakan model hemat. Untuk tugas berat (materi lengkap, soal essay) digunakan model yang lebih canggih. Biaya AI sudah termasuk dalam kuota bulanan guru.",
  },
  {
    icon: Zap,
    title: "Tips untuk hasil terbaik",
    items: [
      "Gunakan dokumen dengan struktur jelas (judul, subjudul, paragraf)",
      "Hindari dokumen hasil scan yang buram atau tidak terbaca",
      "Maksimal 50 halaman per dokumen untuk hasil optimal",
      "Gunakan format PDF text-based (bukan gambar) jika memungkinkan",
      "Jika hasil kurang memuaskan, coba upload ulang atau edit manual",
    ],
  },
];

export default function PanduanAIPage() {
  return (
    <main className="min-h-dvh bg-surface">
      <div className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-on-surface">
            Panduan AI untuk Guru
          </h1>
          <p className="mt-3 text-on-surface-variant max-w-lg mx-auto">
            Panduan penggunaan kecerdasan buatan secara bijak, etis, dan efektif di AKAL Center.
          </p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((section, i) => (
            <div
              key={i}
              className="bg-glass border border-border-precision rounded-2xl sm:rounded-2xl p-6 sm:p-8 shadow-glass"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <section.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading font-semibold text-lg text-on-surface mb-3">
                    {section.title}
                  </h2>
                  {section.content && (
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {section.items && (
                    <ul className="space-y-2">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-on-surface-variant leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0 mt-1.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-on-surface-variant/60">
            AKAL Center · Panduan AI · Terakhir diperbarui 11 Juli 2026
          </p>
        </div>
      </div>
    </main>
  );
}
