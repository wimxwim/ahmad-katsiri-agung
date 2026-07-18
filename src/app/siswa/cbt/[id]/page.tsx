"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { QuizEngine } from "@/components/siswa/QuizEngine";

interface SoalItem {
  id: string;
  pertanyaan: string;
  tipe: "PG" | "ISIAN" | "ESSAY";
  pilihanGanda: Record<string, string> | null;
  poin: number;
  kunci?: string;
}

interface QuizDetail {
  id: string;
  judul: string;
  modeEvaluasi: "BELAJAR" | "ULANGAN" | "CBT";
  durasiMenit: number;
  soal: SoalItem[];
}

function mapToEngine(quiz: QuizDetail) {
  return {
    id: quiz.id,
    judul: quiz.judul,
    durasiMenit: quiz.durasiMenit,
    totalSoal: quiz.soal.length,
    modeEvaluasi: quiz.modeEvaluasi,
    soal: quiz.soal.map((s, i) => ({
      id: s.id,
      nomor: i + 1,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      opsi: s.pilihanGanda || {},
      kunci: s.kunci || "",
    })),
  };
}

export default function SiswaCBTPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/siswa/quiz/${id}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setQuiz(j.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-8 shadow-glass-lg text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 animate-pulse mx-auto mb-4" />
        <div className="h-5 w-48 bg-primary/10 rounded animate-pulse mx-auto mb-2" />
        <div className="h-4 w-64 bg-primary/5 rounded animate-pulse mx-auto" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm text-red-700 mb-4">{error || "Kuis tidak ditemukan"}</p>
        <Link
          href="/siswa/quiz"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          Kembali ke Daftar Kuis
        </Link>
      </div>
    );
  }

  return (
    <QuizEngine
      quiz={mapToEngine(quiz)}
      onBack={() => router.push("/siswa/quiz")}
    />
  );
}