"use client";

import { useState, useEffect, useRef } from "react";
import { WA_NUMBER } from "@/lib/constants";
import Image from "next/image";
import { Upload, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { csrfHeaders } from "@/lib/csrf";

export default function PembayaranPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("File terlalu besar (maks 5MB)"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { setError("Format tidak didukung (JPG/PNG/WebP)"); return; }
    setError("");
    setFile(f);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(f);
    previewRef.current = url;
    setPreview(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Pilih bukti pembayaran dulu"); return; }
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const search = new URLSearchParams(window.location.search);
      const paket = search.get("paket") || "premium";
      const jumlah = parseInt(search.get("harga") || "0", 10) || 50000;
      fd.set("paket", paket);
      fd.set("jumlah", String(jumlah));
      const res = await fetch("/api/v1/payment/submit", { method: "POST", headers: csrfHeaders(), credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) {
        const err = data.error;
        const msg = (typeof err === "string" ? err : err?.message) || "Gagal mengirim";
        throw new Error(msg);
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center p-4">
        <div className="bg-glass border border-border-precision rounded-2xl p-8 sm:p-10 shadow-glass-lg max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-on-surface mb-2">Bukti Terkirim</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Bukti pembayaran kamu sudah kami terima. Tim kami akan verifikasi dalam 1x24 jam.
            Kamu akan mendapat notifikasi setelah pembayaran dikonfirmasi.
          </p>
          <Link href="/siswa" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:brightness-110 transition-all">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/harga" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke harga
        </Link>

        <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-10 shadow-glass-lg">
          <h1 className="font-heading text-2xl font-bold text-on-surface mb-2">Pembayaran QRIS</h1>
          <p className="text-sm text-on-surface-variant mb-8">
            Scan kode QR di bawah pakai aplikasi GoPay, DANA, OVO, atau mobile banking kamu.
          </p>

          <div className="bg-white rounded-2xl p-4 border border-border-precision mb-6 flex justify-center">
            <Image
              src="/qris-gopay.webp"
              alt="QRIS GoPay"
              width={280}
              height={280}
              className="rounded-xl"
              priority
            />
          </div>

          <div className="bg-surface rounded-2xl p-4 mb-8">
            <p className="text-xs text-on-surface-variant mb-2 font-semibold">Cara bayar:</p>
            <ol className="text-xs text-on-surface-variant space-y-1.5 list-decimal list-inside">
              <li>Buka GoPay / DANA / OVO / mobile banking kamu</li>
              <li>Pilih menu <b>Scan QRIS</b></li>
              <li>Scan kode QR di atas</li>
              <li>Masukkan nominal sesuai paket yang dipilih</li>
              <li>Konfirmasi & simpan bukti (screenshot)</li>
              <li>Upload bukti di form bawah ini</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Upload Bukti Pembayaran</label>
              <div className="border-2 border-dashed border-border-precision rounded-2xl p-6 text-center hover:border-primary/30 transition-colors">
                {preview ? (
                  <div className="space-y-3">
                    <Image src={preview} alt="Preview" width={200} height={200} className="rounded-xl mx-auto max-h-48 object-cover" />
                    <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="text-xs text-primary hover:underline">Ganti file</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                    <p className="text-sm text-on-surface-variant">Klik untuk pilih screenshot</p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">JPG, PNG, atau WebP — maks 5MB</p>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-4 bg-primary text-white rounded-full font-semibold text-md transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
            </button>

            <p className="text-center text-xs text-on-surface-variant">
              Tim kami akan verifikasi dalam 1x24 jam. Butuh bantuan?{" "}
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                WhatsApp kami
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
