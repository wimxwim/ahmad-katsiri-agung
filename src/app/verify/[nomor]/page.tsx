"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";

interface CertData {
  nama: string;
  kursus: string;
  issuedAt: string;
}

export default function VerifyPage() {
  const params = useParams();
  const nomor = params?.nomor as string;

  const [state, setState] = useState<"loading" | "valid" | "invalid" | "error">("loading");
  const [data, setData] = useState<CertData | null>(null);

  const fetchCert = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(nomor)}`);
      if (!res.ok) throw new Error("Gagal memverifikasi");
      const json = await res.json();
      if (json.valid) {
        setData(json.data);
        setState("valid");
      } else {
        setState("invalid");
      }
    } catch (error) {
      console.error("[verify] fetchCert failed:", error);
      setState("error");
    }
  };

  useEffect(() => {
    if (nomor) fetchCert();
  }, [nomor]);

  if (state === "loading") {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
        <div className="bg-glass rounded-2xl p-10 w-full max-w-md animate-pulse">
          <div className="w-16 h-16 rounded-full bg-on-surface/5 mx-auto mb-4" />
          <div className="h-5 bg-on-surface/5 rounded w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-on-surface/5 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="bg-glass border border-border-precision rounded-2xl shadow-glass-lg p-8 sm:p-10 w-full max-w-md text-center"
      >
        {state === "valid" && data && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_CURVE, type: "spring", stiffness: 200, damping: 20 }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="font-heading font-bold text-xl text-on-surface mb-1">
              Sertifikat Valid
            </h1>
            <p className="text-sm text-on-surface-variant mb-6">
              Sertifikat ini diterbitkan oleh AKAL Center
            </p>
            <div className="bg-surface/50 rounded-2xl p-5 space-y-3 text-left">
              <div>
                <p className="text-xs text-on-surface-variant">Nama Peserta</p>
                <p className="font-heading font-semibold text-on-surface">{data.nama}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Kursus</p>
                <p className="text-on-surface">{data.kursus}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Tanggal Terbit</p>
                <p className="text-on-surface">
                  {new Date(data.issuedAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </>
        )}

        {state === "invalid" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_CURVE, type: "spring", stiffness: 200, damping: 20 }}
            >
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="font-heading font-bold text-xl text-on-surface mb-1">
              Sertifikat Tidak Valid
            </h1>
            <p className="text-sm text-on-surface-variant">
              Nomor sertifikat tidak ditemukan dalam sistem AKAL Center.
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="font-heading font-bold text-xl text-on-surface mb-1">
              Gagal Memverifikasi
            </h1>
            <p className="text-sm text-on-surface-variant mb-4">
              Terjadi kesalahan saat menghubungi server.
            </p>
            <button
              onClick={fetchCert}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
