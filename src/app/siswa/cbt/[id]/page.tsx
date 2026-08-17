"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [materiHref, setMateriHref] = useState<string | undefined>(undefined);
  const [nextMateriHref, setNextMateriHref] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 15000);
    fetch(`/api/v1/siswa/quiz/${id}`, { credentials: "include", signal: c.signal })
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 429) throw new Error(`Terlalu banyak permintaan, coba lagi dalam ${r.headers.get("Retry-After") || 30} detik`);
          if (r.status === 402) throw new Error("Saldo tidak cukup — Topup Rp10.000");
          if (r.status === 403) throw new Error("Sesi habis, muat ulang halaman");
          if (r.status === 404) throw new Error("Kuis tidak ditemukan");
          const j = await r.json().catch(() => ({} as Record<string, unknown>));
          throw new Error((j as { error?: string }).error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setQuiz(j.data);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === "AbortError") {
          setError("Request timeout (15 detik)");
        } else {
          setError(e instanceof Error ? e.message : "Gagal memuat");
        }
        setLoading(false);
      });
    return () => { clearTimeout(t); c.abort(); };
  }, [id]);

  useEffect(() => {
    const dariMateri = searchParams.get("dariMateri");
    const nextMateri = searchParams.get("nextMateri");
    if (dariMateri) {
      setMateriHref(`/siswa/materi/${dariMateri}`);
    }
    if (nextMateri) {
      setNextMateriHref(`/siswa/materi/${nextMateri}`);
    }
  }, [searchParams]);

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
      materiHref={materiHref}
      nextMateriHref={nextMateriHref}
    />
  );
}