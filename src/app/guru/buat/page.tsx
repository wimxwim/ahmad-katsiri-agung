"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { csrfHeaders } from "@/lib/csrf";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const COVER_COLOR = "#005231";

function BuatKursusContent() {
  const router = useRouter();
  const [judul, setJudul] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kelas, setKelas] = useState("7");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ judul?: string; deskripsi?: string; kelas?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // F11-2 Offline guard + localStorage autosave
  useEffect(() => {
    if (typeof navigator !== "undefined") setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // F11-2 load autosave
  useEffect(() => {
    try {
      const saved = localStorage.getItem("akal-draft-buat");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.judul === "string" && parsed.judul) setJudul(parsed.judul);
        if (typeof parsed.deskripsi === "string" && parsed.deskripsi) setDeskripsi(parsed.deskripsi);
        if (typeof parsed.kelas === "string" && ["7","8","9"].includes(parsed.kelas)) setKelas(parsed.kelas);
      }
    } catch {}
  }, []);

  // F11-2 autosave judul+deskripsi+kelas
  useEffect(() => {
    try {
      localStorage.setItem("akal-draft-buat", JSON.stringify({ judul, deskripsi, kelas }));
    } catch {}
  }, [judul, deskripsi, kelas]);

  useEffect(() => {
    setSlugPreview(slugify(judul));
  }, [judul]);

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    const j = judul.trim();
    if (!j) errs.judul = "Judul wajib diisi";
    else if (j.length < 3) errs.judul = "Judul minimal 3 karakter";
    else if (j.length > 200) errs.judul = "Judul maksimal 200 karakter";
    if (deskripsi.length > 500) errs.deskripsi = "Deskripsi maksimal 500 karakter";
    if (!["7", "8", "9"].includes(kelas)) errs.kelas = "Kelas harus 7, 8, atau 9";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!isOnline) {
      setError("Kamu offline — beberapa fitur tidak tersedia");
      return;
    }
    if (!validate()) return;
    // F11-4 file 0 bytes check (judul 0 bytes guard) + kelas 7/8/9 sudah divalidate
    if (judul.trim().length === 0) {
      setFieldErrors((prev) => ({ ...prev, judul: "Judul wajib diisi" }));
      return;
    }
    setLoading(true);

    const body = {
      judul: judul.trim(),
      slug: slugify(judul.trim()),
      deskripsi: deskripsi.trim(),
      kelas,
      coverColor: COVER_COLOR,
    };

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/v1/kursus", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(t);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // F11-3 status terdiferensiasi + F11-4 409 slug duplicate
        if (res.status === 409) {
          const msg = (typeof data.error === "string" ? data.error : data.error?.message) || "Slug sudah dipakai, ganti judul";
          setFieldErrors((prev) => ({ ...prev, judul: "Slug sudah dipakai, ganti judul" }));
          setError(msg);
          return;
        }
        if (res.status === 429) {
          const retry = res.headers.get("Retry-After");
          const waitSec = retry ? parseInt(retry, 10) : 30;
          throw new Error(`Terlalu banyak permintaan, coba lagi dalam ${waitSec} detik`);
        }
        if (res.status === 402) throw new Error("Saldo tidak cukup — Topup Rp10.000");
        if (res.status === 403) throw new Error("Sesi habis, muat ulang halaman");
        if (res.status === 404) throw new Error("Data tidak ditemukan");
        const err = data.error;
        // F11-4 Zod fieldErrors surface per-input jika ada details
        if (data.error?.details && typeof data.error.details === "object") {
          const details = data.error.details as Record<string, string[]>;
          const fe: typeof fieldErrors = {};
          if (details.judul) fe.judul = details.judul[0];
          if (details.deskripsi) fe.deskripsi = details.deskripsi[0];
          if (details.kelas) fe.kelas = details.kelas[0];
          if (Object.keys(fe).length > 0) setFieldErrors((prev) => ({ ...prev, ...fe }));
        }
        const msg = (typeof err === "string" ? err : err?.message) || data.message || "Gagal membuat kursus";
        throw new Error(msg);
      }
      try { localStorage.removeItem("akal-draft-buat"); } catch {}
      setSuccess(true);
      setTimeout(() => {
        router.push("/guru/kursus");
        router.refresh();
      }, 900);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timeout (15 detik) — periksa koneksi lalu coba lagi");
      } else if (err instanceof Error && err.message.includes("Failed to fetch")) {
        setError("Kamu offline — beberapa fitur tidak tersedia");
      } else {
        setError(err instanceof Error ? err.message : "Gagal membuat kursus");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/guru/kursus"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8 min-h-11 px-2 py-2.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      {!isOnline && (
        <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Kamu offline — beberapa fitur tidak tersedia
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="bg-glass backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-6 sm:p-8 max-w-2xl shadow-glass-xl mx-auto"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_CURVE } },
          }}
        >
          <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">
            Buat Kursus Baru
          </h1>
          <p className="text-on-surface-variant text-sm mb-8">
            Buat kursus untuk mengorganisir materi, kuis, dan siswa.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          noValidate
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_CURVE } },
            }}
          >
            <label htmlFor="judul" className="block text-sm font-medium text-on-surface mb-1.5">
              Judul Kursus
            </label>
            <input
              id="judul"
              name="judul"
              required
              maxLength={200}
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              onBlur={validate}
              aria-invalid={!!fieldErrors.judul}
              aria-describedby={fieldErrors.judul ? "err-judul" : undefined}
              className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-300"
              placeholder="Contoh: Akidah Akhlak Kelas 7"
            />
            {fieldErrors.judul && (
              <p id="err-judul" role="alert" className="text-red-600 text-xs mt-1.5">
                {fieldErrors.judul}
              </p>
            )}
            <p aria-live="polite" className="text-xs text-on-surface-variant/60 mt-1 min-h-4">
              {slugPreview ? `Slug: ${slugPreview}` : ""}
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_CURVE } },
            }}
          >
            <label htmlFor="deskripsi" className="block text-sm font-medium text-on-surface mb-1.5">
              Deskripsi
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              maxLength={500}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              onBlur={validate}
              aria-invalid={!!fieldErrors.deskripsi}
              aria-describedby={fieldErrors.deskripsi ? "err-deskripsi" : undefined}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm resize-none min-h-11 aria-[invalid=true]:border-red-300"
              placeholder="Deskripsi singkat kursus"
            />
            {fieldErrors.deskripsi && (
              <p id="err-deskripsi" role="alert" className="text-red-600 text-xs mt-1.5">
                {fieldErrors.deskripsi}
              </p>
            )}
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_CURVE } },
            }}
          >
            <label htmlFor="kelas" className="block text-sm font-medium text-on-surface mb-1.5">
              Kelas
            </label>
            <select
              id="kelas"
              name="kelas"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              onBlur={validate}
              aria-invalid={!!fieldErrors.kelas}
              aria-describedby={fieldErrors.kelas ? "err-kelas" : undefined}
              className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm appearance-none aria-[invalid=true]:border-red-300"
            >
              <option value="7">Kelas 7</option>
              <option value="8">Kelas 8</option>
              <option value="9">Kelas 9</option>
            </select>
            {fieldErrors.kelas && (
              <p id="err-kelas" role="alert" className="text-red-600 text-xs mt-1.5">
                {fieldErrors.kelas}
              </p>
            )}
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_CURVE } },
            }}
            className="flex items-center gap-2"
            aria-hidden="true"
          >
            <span className="text-xs text-on-surface-variant">Cover</span>
            <span className="w-6 h-6 rounded-full border border-border-precision shadow-sm" style={{ backgroundColor: COVER_COLOR }} />
            <span className="text-xs font-mono text-on-surface-variant">{COVER_COLOR}</span>
          </motion.div>

          {error && (
            <div role="alert" aria-live="assertive" className="text-red-600 text-sm bg-red-50 px-3.5 py-2.5 rounded-lg border border-red-200">
              {error}
              {error.includes("Topup") && (
                <Link href="/guru/topup" className="ml-2 underline font-semibold">Topup Rp10.000</Link>
              )}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading || success || !isOnline}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_CURVE } },
            }}
            className="w-full min-h-11 min-w-11 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 font-heading inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Membuat..." : success ? "Berhasil!" : "Buat Kursus"}
          </motion.button>
        </motion.form>

        <div className="mt-6 bg-white/60 rounded-2xl p-4 border border-border-precision" aria-live="polite">
          <p className="text-xs font-semibold text-on-surface-variant mb-1">Preview</p>
          <p className="text-sm text-on-surface truncate">
            {judul || "Judul kursus"} - {slugPreview || "slug-preview"}
          </p>
          <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: COVER_COLOR }} />
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_CURVE }}
            className="mt-4 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-sm font-semibold"
            role="status"
            aria-live="polite"
          >
            <CheckCircle className="w-5 h-5" />
            Kursus berhasil dibuat!
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function BuatKursusPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div aria-busy="true" role="status"><SkeletonList /></div>}>
        <BuatKursusContent />
      </Suspense>
    </ErrorBoundary>
  );
}
