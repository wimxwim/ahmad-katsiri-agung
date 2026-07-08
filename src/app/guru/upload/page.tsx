"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, FileText, Sparkles, Loader2, AlertCircle, X, History, FilePlus, Layers } from "lucide-react";
import { UploadProgress } from "@/components/ui/ScreenContracts";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 10 * 1024 * 1024;

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
}

interface FileHistoryItem {
  id: string;
  namaFile: string;
  sizeBytes: number;
  status: string;
  generationStatus?: string;
  generationId?: string;
  createdAt: string;
  link: string;
}

interface JobProgress {
  state: "idle" | "uploading" | "extracting" | "generating" | "ready" | "failed";
  progress: number;
  message: string;
}

export default function GuruUploadPage() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [selectedKursus, setSelectedKursus] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [job, setJob] = useState<JobProgress>({ state: "idle", progress: 0, message: "" });
  const [error, setError] = useState("");
  const [history, setHistory] = useState<FileHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [successFileName, setSuccessFileName] = useState<string | null>(null);

  async function loadHistory() {
    try {
      const res = await fetch("/api/v1/guru/uploads", { credentials: "include" });
      if (res.ok) {
        const { data } = await res.json();
        setHistory(data || []);
      }
    } catch (error) {
      console.error("[guru/upload] loadHistory failed:", error);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    fetch("/api/v1/kursus", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        setKursus(j.data || []);
        if (j.data?.[0]) setSelectedKursus((prev) => prev || j.data[0].id);
      })
      .catch((error) => { console.error("[guru/upload] fetch kursus failed:", error); });
    loadHistory();
  }, []);

  function validate(f: File): { ok: boolean; reason?: string } {
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { ok: false, reason: `Ekstensi ${ext} tidak diizinkan. Pakai PDF atau DOCX.` };
    }
    if (f.size > MAX_SIZE) {
      return { ok: false, reason: `Ukuran file ${(f.size / 1024 / 1024).toFixed(1)}MB melebihi batas 10MB.` };
    }
    if (f.size === 0) {
      return { ok: false, reason: "File kosong." };
    }
    return { ok: true };
  }

  function pickFile(f: File | null) {
    setError("");
    setJob({ state: "idle", progress: 0, message: "" });
    setSuccessFileName(null);
    if (!f) {
      setFile(null);
      return;
    }
    const v = validate(f);
    if (!v.ok) {
      setError(v.reason || "File tidak valid");
      setFile(null);
      return;
    }
    setFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }

  async function handleUpload() {
    if (!file) {
      setError("Pilih file dulu");
      return;
    }
    if (!selectedKursus) {
      setError("Pilih kursus dulu");
      return;
    }
    setError("");
    setSuccessFileName(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("kursusId", selectedKursus);

    setJob({ state: "uploading", progress: 25, message: "Mengupload ke ImageKit..." });
    try {
      const res = await fetch("/api/v1/guru/uploads", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setJob({ state: "failed", progress: 0, message: json.error || "Upload gagal" });
        setError(json.error || "Upload gagal");
        return;
      }

      setJob({ state: "extracting", progress: 50, message: "Mengekstrak teks..." });
      await new Promise((r) => setTimeout(r, 400));
      setJob({ state: "generating", progress: 75, message: "AI membuat draft materi, kuis, dan soal..." });

      let attempts = 0;
      let genId = json.generationId as string;
      while (attempts < 60) {
        await new Promise((r) => setTimeout(r, 2000));
        const poll = await fetch(`/api/v1/guru/drafts/${genId}`, { credentials: "include" });
        if (poll.ok) {
          const { data } = await poll.json();
          if (data.status === "ready") {
            setJob({ state: "ready", progress: 100, message: "Draft siap direview!" });
            setSuccessFileName(file.name);
            await loadHistory();
            return;
          }
          if (data.status === "failed") {
            setJob({ state: "failed", progress: 0, message: data.errorMessage || "AI generation gagal" });
            setError(data.errorMessage || "AI generation gagal");
            return;
          }
        }
        attempts += 1;
      }
      setJob({ state: "failed", progress: 0, message: "Timeout menunggu AI" });
    } catch (e) {
      setJob({ state: "failed", progress: 0, message: "Gagal" });
      setError(e instanceof Error ? e.message : "Gagal");
    }
  }

  function reset() {
    setFile(null);
    setError("");
    setJob({ state: "idle", progress: 0, message: "" });
    setSuccessFileName(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Upload Dokumen</h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Gunakan PDF atau DOCX untuk membuat draft materi, kuis, dan soal. File akan diproses
          aman sebagai draft — guru tetap meninjau sebelum diterbitkan.
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Kursus</label>
          {kursus.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              Belum ada kursus.{" "}
              <Link href="/guru/buat" className="font-semibold underline">
                Buat kursus dulu
              </Link>{" "}
              sebelum upload dokumen.
            </div>
          ) : (
            <select
              value={selectedKursus}
              onChange={(e) => setSelectedKursus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40"
            >
              {kursus.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.judul}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
            Kelas tujuan <span className="font-normal text-on-surface-variant">(opsional)</span>
          </label>
          <Link
            href="/guru/kelas"
            className="w-full px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm text-on-surface-variant flex items-center gap-2 hover:bg-surface transition-colors"
          >
            <Layers className="w-4 h-4" />
            Pilih kelas nanti di halaman kelas
          </Link>
        </div>
      </div>

      <label
        htmlFor="upload-input"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`block cursor-pointer rounded-[24px] border-2 border-dashed transition-all ${
          dragOver
            ? "border-primary bg-primary/5"
            : file
              ? "border-primary/40 bg-primary/5"
              : "border-border-precision bg-glass hover:border-primary/30"
        } p-10 text-center`}
      >
        <input
          id="upload-input"
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          onChange={(e) => pickFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div className="text-left">
              <p className="font-semibold text-on-surface">{file.name}</p>
              <p className="text-xs text-on-surface-variant">
                {(file.size / 1024).toFixed(1)} KB · siap diupload
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); pickFile(null); }}
              className="ml-2 p-1.5 rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-600"
              aria-label="Buang file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
            <p className="font-heading font-semibold text-on-surface mb-1">
              Tarik file ke sini atau klik untuk pilih
            </p>
            <p className="text-xs text-on-surface-variant">Format: PDF, DOCX · Maks: 10 MB</p>
          </>
        )}
      </label>

      {job.state !== "idle" && (
        <div className="mt-4">
          <UploadProgress
            status={job.state}
            progress={job.progress}
            message={job.message}
            fileName={file?.name}
          />
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successFileName && job.state === "ready" && (
        <div className="mt-4 p-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 text-emerald-900">
          <p className="font-heading font-semibold mb-1">✅ Dokumen berhasil diproses</p>
          <p className="text-sm">
            Draft materi, kuis, dan soal sudah siap untuk ditinjau untuk{" "}
            <b>{successFileName}</b>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/guru/drafts"
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Review Draft
            </Link>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-white text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/5 transition-colors"
            >
              <FilePlus className="w-4 h-4" />
              Upload Dokumen Lain
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <button
          onClick={handleUpload}
          disabled={!file || !selectedKursus || (job.state !== "idle" && job.state !== "failed" && job.state !== "ready")}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
        >
          {job.state === "uploading" || job.state === "extracting" || job.state === "generating" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Unggah dan Proses
        </button>
        {file && (job.state === "idle" || job.state === "failed" || job.state === "ready") && (
          <button
            onClick={reset}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            Bersihkan pilihan
          </button>
        )}
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-on-surface-variant" />
          <h2 className="font-heading font-semibold text-on-surface">Riwayat Upload</h2>
        </div>
        {loadingHistory ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-glass rounded-2xl p-4 h-16 animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Belum ada file yang diupload.</p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((h) => {
              const gen = h.generationStatus || "unknown";
              const meta: Record<string, { label: string; color: string }> = {
                uploaded: { label: "Uploaded", color: "bg-blue-50 text-blue-700" },
                extracting: { label: "Ekstraksi...", color: "bg-amber-50 text-amber-700" },
                extracted: { label: "Terekstrak", color: "bg-amber-50 text-amber-700" },
                generating: { label: "AI bekerja...", color: "bg-amber-50 text-amber-700" },
                ready: { label: "Siap direview", color: "bg-emerald-50 text-emerald-700" },
                approved: { label: "Disetujui", color: "bg-emerald-50 text-emerald-800" },
                rejected: { label: "Ditolak", color: "bg-red-50 text-red-700" },
                failed: { label: "Gagal", color: "bg-red-50 text-red-700" },
                queued: { label: "Antrian", color: "bg-blue-50 text-blue-700" },
                unknown: { label: "—", color: "bg-surface text-on-surface-variant" },
              };
              const m = meta[gen] || meta.unknown;
              return (
                <div
                  key={h.id}
                  className="bg-glass border border-border-precision rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{h.namaFile}</p>
                    <p className="text-xs text-on-surface-variant">
                      {(h.sizeBytes / 1024).toFixed(1)} KB · {new Date(h.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${m.color}`}>
                    {m.label}
                  </span>
                  {h.generationId && (gen === "ready" || gen === "approved") && (
                    <Link
                      href={`/guru/drafts/${h.generationId}`}
                      className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                    >
                      Review →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
