"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { SoalPracticeEngine } from "@/components/siswa/SoalPracticeEngine";

interface SoalItem {
  id: string;
  pertanyaan: string;
  tipe: "PG" | "ISIAN" | "ESSAY";
  pilihanGanda: Record<string, string> | null;
  poin: number;
  kunci: string;
}

interface SoalBatchDetail {
  aiGenerationId: string;
  judul: string;
  kursusJudul: string;
  soal: SoalItem[];
}

function mapToEngine(batch: SoalBatchDetail) {
  return {
    id: batch.aiGenerationId,
    judul: batch.judul,
    totalSoal: batch.soal.length,
    soal: batch.soal.map((s, i) => ({
      id: s.id,
      nomor: i + 1,
      pertanyaan: s.pertanyaan,
      tipe: s.tipe,
      opsi: s.pilihanGanda || {},
      kunci: s.kunci,
    })),
  };
}

export default function SiswaSoalPracticePage({ params }: { params: Promise<{ aiGenId: string }> }) {
  const router = useRouter();
  const { aiGenId } = use(params);
  const [batch, setBatch] = useState<SoalBatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!aiGenId) return;
    fetch(`/api/v1/siswa/soal/${aiGenId}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setBatch(j.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, [aiGenId]);

  if (loading) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-8 shadow-glass-lg text-center">
        <div className="w-16 h-16 rounded-2xl bg-tertiary/10 animate-pulse mx-auto mb-4" />
        <div className="h-5 w-48 bg-tertiary/10 rounded animate-pulse mx-auto mb-2" />
        <div className="h-4 w-64 bg-tertiary/5 rounded animate-pulse mx-auto" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm text-red-700 mb-4">{error || "Soal latihan tidak ditemukan"}</p>
        <Link
          href="/siswa/soal"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Soal Latihan
        </Link>
      </div>
    );
  }

  return (
    <SoalPracticeEngine
      batch={mapToEngine(batch)}
      onBack={() => router.push("/siswa/soal")}
    />
  );
}