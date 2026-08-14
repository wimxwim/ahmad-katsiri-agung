"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { Upload, FileText, Loader2, AlertCircle, X, History, FilePlus, Layers, CheckCircle2 } from "lucide-react";
import { UploadProgress } from "@/components/ui/ScreenContracts";
import { useToast } from "@/components/ui/Toast";
import { csrfHeaders } from "@/lib/csrf";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 10 * 1024 * 1024;
const DIRECT_UPLOAD_THRESHOLD = 4 * 1024 * 1024;

interface KursusItem { id: string; judul: string; slug: string; }
interface KelasItem { id: string; nama: string; tingkat: number; }
interface FileHistoryItem { id: string; namaFile: string; sizeBytes: number; status: string; createdAt: string; link: string; }
interface JobProgress { state: "idle" | "uploading" | "extracting" | "ready" | "failed"; progress: number; message: string; }

function GuruUploadContent() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [selectedKursus, setSelectedKursus] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [job, setJob] = useState<JobProgress>({ state: "idle", progress: 0, message: "" });
  const [error, setError] = useState("");
  const [kursusError, setKursusError] = useState("");
  const [history, setHistory] = useState<FileHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [successFileName, setSuccessFileName] = useState<string | null>(null);
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { toast } = useToast();

  // F11-2 Offline guard + localStorage autosave
  useEffect(() => {
    if (typeof navigator !== "undefined") setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("akal-draft-upload");
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.selectedKursus === "string") setSelectedKursus(p.selectedKursus);
        if (typeof p.selectedKelasId === "string") setSelectedKelasId(p.selectedKelasId);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("akal-draft-upload", JSON.stringify({ selectedKursus, selectedKelasId })); } catch {}
  }, [selectedKursus, selectedKelasId]);

  // F11-5 90s timeout tanpa countdown -> tambah countdown
  useEffect(() => {
    if (job.state !== "uploading" && job.state !== "extracting") { setCountdown(null); return; }
    setCountdown(90);
    const iv = setInterval(() => setCountdown((c) => (c !== null && c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [job.state]);

  async function loadHistory() {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/v1/guru/uploads", { credentials: "include", signal: controller.signal });
      clearTimeout(t);
      if (res.ok) { const { data } = await res.json(); setHistory(data || []); }
      else {
        if (res.status === 404) { setHistory([]); return; }
        if (res.status === 429) { setHistoryError(`Terlalu banyak permintaan, coba lagi dalam ${res.headers.get("Retry-After") || 30} detik`); return; }
        if (res.status === 402) { setHistoryError("Saldo tidak cukup — Topup Rp10.000"); return; }
        if (res.status === 403) { setHistoryError("Sesi habis, muat ulang halaman"); return; }
        setHistoryError("Gagal memuat riwayat upload");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") setHistoryError("Request timeout (15 detik)");
      else if (typeof navigator !== "undefined" && !navigator.onLine) setHistoryError("Kamu offline — beberapa fitur tidak tersedia");
      else setHistoryError("Gagal memuat riwayat upload");
    } finally { setLoadingHistory(false); }
  }

  useEffect(() => {
    const c1 = new AbortController();
    fetch("/api/v1/kursus", { credentials: "include", signal: c1.signal })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => { setKursus(j.data || []); if (j.data?.[0]) setSelectedKursus((prev) => prev || j.data[0].id); })
      .catch(() => setKursusError("Gagal memuat daftar kursus"));
    const c2 = new AbortController();
    fetch("/api/v1/guru/kelas", { credentials: "include", signal: c2.signal })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setKelasList(j.data || []))
      .catch(() => {});
    loadHistory();
    return () => { c1.abort(); c2.abort(); };
  }, []);

  useEffect(() => { if (kursus.length > 0 && !selectedKursus) setSelectedKursus(kursus[0].id); }, [kursus, selectedKursus]);

  function validate(f: File): { ok: boolean; reason?: string } {
    // F11-5 magic bytes check (basic: extension + size + 0 bytes)
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return { ok: false, reason: `Ekstensi ${ext} tidak diizinkan. Pakai PDF atau DOCX.` };
    if (f.size > MAX_SIZE) return { ok: false, reason: `Ukuran file ${(f.size / 1024 / 1024).toFixed(1)}MB melebihi batas 10MB.` };
    if (f.size === 0) return { ok: false, reason: "File kosong (0 bytes) — pilih file yang valid." };
    return { ok: true };
  }

  function pickFile(f: File | null) {
    setError(""); setJob({ state: "idle", progress: 0, message: "" }); setSuccessFileName(null);
    if (!f) { setFile(null); return; }
    const v = validate(f);
    if (!v.ok) { setError(v.reason || "File tidak valid"); setFile(null); return; }
    // F11-5 magic bytes async check (header sniff)
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer).slice(0, 4);
      const header = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      const isPdf = header.startsWith("25504446");
      const isZip = header.startsWith("504b0304") || header.startsWith("504b0506") || header.startsWith("504b0708");
      if (!isPdf && !isZip) {
        setError("File tidak valid (magic bytes tidak sesuai PDF/DOCX)");
        setFile(null);
        return;
      }
      setFile(f);
    };
    reader.onerror = () => setFile(f);
    reader.readAsArrayBuffer(f.slice(0, 4));
  }

  function onDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) pickFile(f); }

  async function handleUpload() {
    if (!isOnline) { setError("Kamu offline — beberapa fitur tidak tersedia"); return; }
    if (!file) { setError("Pilih file dulu"); return; }
    if (!selectedKursus) { setError("Pilih kursus dulu"); return; }
    if (!selectedKelasId) { setError(kelasList.length === 0 ? "Buat kelas dulu sebelum upload dokumen." : "Pilih kelas untuk melanjutkan"); return; }
    setError(""); setSuccessFileName(null);

    if (file.size > DIRECT_UPLOAD_THRESHOLD) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 15000);
        const authRes = await fetch("/api/v1/storage/auth", { credentials: "include", signal: controller.signal });
        clearTimeout(t);
        const authJson = await authRes.json().catch(() => ({}));
        if (authRes.ok && authJson.success && authJson.data) {
          const { publicKey, token, expire, signature, folder } = authJson.data;
          const ikForm = new FormData();
          ikForm.append("file", file); ikForm.append("fileName", file.name); ikForm.append("folder", folder);
          ikForm.append("publicKey", publicKey); ikForm.append("token", token); ikForm.append("expire", String(expire));
          ikForm.append("signature", signature); ikForm.append("useUniqueFileName", "true");
          setJob({ state: "uploading", progress: 30, message: "Mengupload file besar langsung ke penyimpanan..." });
          const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: ikForm });
          const ikJson = await ikRes.json().catch(() => ({}));
          if (!ikRes.ok) throw new Error((typeof ikJson.error === "string" ? ikJson.error : ikJson.error?.message) || "Upload ke ImageKit gagal");
          setJob({ state: "uploading", progress: 70, message: "Menyimpan..." });
          const res = await fetch("/api/v1/guru/uploads", {
            method: "POST", headers: { "Content-Type": "application/json", ...csrfHeaders() },
            body: JSON.stringify({ imagekitFileId: ikJson.fileId, linkAkses: ikJson.url, fileName: ikJson.name, sizeBytes: ikJson.size, kursusId: selectedKursus, kelasId: selectedKelasId }),
            credentials: "include",
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            const msg = (typeof json.error === "string" ? json.error : json.error?.message) || "Upload gagal";
            setJob({ state: "failed", progress: 0, message: msg }); setError(msg); toast("error", msg); return;
          }
          setJob({ state: "ready", progress: 100, message: "Upload selesai!" }); setSuccessFileName(file.name);
          toast("success", "Dokumen berhasil diupload. Teks sedang diekstrak otomatis — pantau progres di halaman Draft AI.");
          await loadHistory(); return;
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("[guru/upload] direct upload failed, fallback ke multipart:", e);
      }
    }

    const fd = new FormData(); fd.append("file", file); fd.append("kursusId", selectedKursus); fd.append("kelasId", selectedKelasId);
    setJob({ state: "uploading", progress: 40, message: "Mengupload ke server..." });
    try {
      const controller = new AbortController();
      const t = setTimeout(() => { controller.abort(); setJob({ state: "failed", progress: 0, message: "Timeout 90 detik" }); setError("Upload timeout (90 detik) — coba lagi"); }, 90000);
      const res = await fetch("/api/v1/guru/uploads", { method: "POST", headers: csrfHeaders(), body: fd, credentials: "include", signal: controller.signal });
      clearTimeout(t);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) { const msg = `Terlalu banyak permintaan, coba lagi dalam ${res.headers.get("Retry-After") || 30} detik`; setJob({ state: "failed", progress: 0, message: msg }); setError(msg); toast("error", msg); return; }
        if (res.status === 402) { const msg = "Saldo tidak cukup — Topup Rp10.000"; setJob({ state: "failed", progress: 0, message: msg }); setError(msg); return; }
        if (res.status === 403) { const msg = "Sesi habis, muat ulang halaman"; setJob({ state: "failed", progress: 0, message: msg }); setError(msg); return; }
        const msg = (typeof json.error === "string" ? json.error : json.error?.message) || "Upload gagal";
        setJob({ state: "failed", progress: 0, message: msg }); setError(msg); toast("error", msg); return;
      }
      setJob({ state: "ready", progress: 100, message: "Upload selesai!" }); setSuccessFileName(file.name);
      toast("success", "Dokumen berhasil diupload. Teks sedang diekstrak otomatis — pantau progres di halaman Draft AI.");
      await loadHistory();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") { setJob({ state: "failed", progress: 0, message: "Timeout 90 detik" }); setError("Upload timeout (90 detik) — coba lagi"); }
      else { setJob({ state: "failed", progress: 0, message: "Gagal" }); setError(e instanceof Error ? e.message : "Gagal"); toast("error", e instanceof Error ? e.message : "Gagal memproses file"); }
    }
  }

  function reset() { setFile(null); setError(""); setJob({ state: "idle", progress: 0, message: "" }); setSuccessFileName(null); }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Upload Dokumen</h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">Upload PDF atau DOCX materi pembelajaran. File akan disimpan aman — teks akan diekstrak otomatis. Generate AI bisa dilakukan dari halaman Draft.</p>
      </div>

      {!isOnline && (
        <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> Kamu offline — beberapa fitur tidak tersedia
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Kursus</label>
          {kursusError ? (<div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{kursusError}</div>
          ) : kursus.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">Belum ada kursus. <Link href="/guru/buat" className="font-semibold underline">Buat kursus dulu</Link> sebelum upload dokumen.</div>
          ) : (
            <><label htmlFor="upload-kursus" className="sr-only">Pilih kursus</label>
            <select id="upload-kursus" aria-label="Pilih kursus" value={selectedKursus} onChange={(e) => setSelectedKursus(e.target.value)} className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40">
              {kursus.map((k) => (<option key={k.id} value={k.id}>{k.judul}</option>))}
            </select></>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Kelas tujuan <span className="font-normal text-primary">(wajib)</span></label>
          {kelasList.length === 0 ? (
            <Link href="/guru/kelas" className="w-full px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm text-on-surface-variant flex items-center gap-2 hover:bg-surface transition-colors"><Layers className="w-4 h-4" /> Buat kelas dulu</Link>
          ) : (
            <><label htmlFor="upload-kelas" className="sr-only">Pilih kelas</label>
            <select id="upload-kelas" aria-label="Pilih kelas" value={selectedKelasId} onChange={(e) => setSelectedKelasId(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40">
              <option value="" disabled>Pilih kelas...</option>
              {kelasList.map((k) => (<option key={k.id} value={k.id}>{k.nama} (Tingkat {k.tingkat})</option>))}
            </select></>
          )}
        </div>
      </div>

      <label htmlFor="upload-input" onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
        className={`block cursor-pointer rounded-xl border-2 border-dashed transition-all ${dragOver ? "border-primary bg-primary/5" : file ? "border-primary/40 bg-primary/5" : "border-border-precision bg-glass hover:border-primary/30"} p-10 text-center`}>
        <input id="upload-input" type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] || null)} />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div className="text-left"><p className="font-semibold text-on-surface">{file.name}</p><p className="text-xs text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB · siap diupload</p></div>
            <button type="button" onClick={(e) => { e.preventDefault(); pickFile(null); }} className="ml-2 p-1.5 rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-600 active:scale-[0.98]" aria-label="Buang file"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <><Upload className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" /><p className="font-heading font-semibold text-on-surface mb-1">Tarik file ke sini atau klik untuk pilih</p><p className="text-xs text-on-surface-variant">Format: PDF, DOCX · Maks: 10 MB</p></>
        )}
      </label>

      {job.state !== "idle" && (
        <div className="mt-4">
          <UploadProgress status={job.state} progress={job.progress} message={job.message} fileName={file?.name} />
          {countdown !== null && countdown > 0 && job.state !== "ready" && job.state !== "failed" && (
            <p className="text-xs text-on-surface-variant mt-1" aria-live="polite">Timeout dalam {countdown}s</p>
          )}
        </div>
      )}

      {error && (<div role="alert" aria-live="assertive" className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>{error.includes("Topup") && <Link href="/guru/topup" className="ml-2 underline font-semibold">Topup</Link>}</div>)}

      {successFileName && job.state === "ready" && (
        <div className="mt-4 p-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 text-emerald-900">
          <p className="font-heading font-semibold mb-1 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" /> Dokumen berhasil diupload</p>
          <p className="text-sm"><b>{successFileName}</b> telah tersimpan dan teks berhasil diekstrak. Buka halaman <Link href="/guru/drafts" className="text-primary underline">Draft AI</Link> untuk generate materi, kuis, dan soal.</p>
          <div className="mt-3 flex flex-wrap gap-2"><button onClick={reset} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"><FilePlus className="w-4 h-4" /> Upload Dokumen Lain</button></div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <button onClick={handleUpload} disabled={!file || !selectedKursus || !isOnline || (job.state !== "idle" && job.state !== "failed" && job.state !== "ready")} className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {job.state === "uploading" || job.state === "extracting" ? (<Loader2 className="w-4 h-4 animate-spin" />) : (<Upload className="w-4 h-4" />)} Upload Dokumen
        </button>
        {file && (job.state === "idle" || job.state === "failed" || job.state === "ready") && (<button onClick={reset} className="text-xs text-on-surface-variant hover:text-primary active:scale-[0.98] transition-colors">Bersihkan pilihan</button>)}
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2 mb-3"><History className="w-4 h-4 text-on-surface-variant" /><h2 className="font-heading font-semibold text-on-surface">Riwayat Upload</h2></div>
        {historyError ? (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{historyError}</span></div>
        ) : loadingHistory ? (
          <div aria-busy="true" role="status" aria-label="Memuat riwayat upload"><div className="space-y-2">{[1, 2].map((i) => (<div key={i} className="bg-glass rounded-[32px] p-4 h-16 animate-pulse" />))}</div></div>
        ) : history.length === 0 ? (<p className="text-sm text-on-surface-variant">Belum ada file yang diupload.</p>
        ) : (
          <motion.div className="space-y-2" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
            {history.slice(0, 10).map((h) => {
              const meta: Record<string, { label: string; color: string }> = { uploaded: { label: "Tersimpan", color: "bg-blue-50 text-blue-700" }, extracting: { label: "Ekstraksi...", color: "bg-amber-50 text-amber-700" }, extracted: { label: "Terekstrak", color: "bg-emerald-50 text-emerald-700" }, failed: { label: "Gagal", color: "bg-red-50 text-red-700" } };
              const m = meta[h.status] || { label: h.status, color: "bg-surface text-on-surface-variant" };
              return (
                <motion.div key={h.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }} className="bg-glass border border-border-precision rounded-[32px] p-4 flex items-center gap-3 hover:shadow-glass-lg transition-shadow duration-300">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><FileText className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-on-surface text-sm truncate">{h.namaFile}</p><p className="text-xs text-on-surface-variant">{(h.sizeBytes / 1024).toFixed(1)} KB · {new Date(h.createdAt).toLocaleString("id-ID")}</p></div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${m.color}`}>{m.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default function GuruUploadPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div aria-busy="true" role="status"><SkeletonList /></div>}>
        <GuruUploadContent />
      </Suspense>
    </ErrorBoundary>
  );
}
