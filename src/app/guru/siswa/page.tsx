"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { Search, Users, Filter, ShieldAlert, AlertCircle, RefreshCw, Download, LayoutGrid, List } from "lucide-react";
import * as XLSX from "xlsx";
import { apiFetch } from "@/lib/api-helpers";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface SiswaItem {
  siswaId: string;
  nama: string;
  kursus: string[];
  status: string;
  riskScore: number | null;
  riskStatus: string | null;
}

interface KursusOption {
  id: string;
  judul: string;
}

function Countdown({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onDone?.(); return; }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);
  if (left <= 0) return null;
  return <span className="ml-1 font-mono text-xs">{left}s</span>;
}

function SiswaContent() {
  const [siswa, setSiswa] = useState<SiswaItem[]>([]);
  const [kursusOptions, setKursusOptions] = useState<KursusOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterKursus, setFilterKursus] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"daftar" | "gradebook">("daftar");
  const PAGE_SIZE = 20;
  const abortRef = useRef<AbortController | null>(null);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(siswa.map((s) => ({ Nama: s.nama, Kursus: s.kursus.join(", "), Status: s.riskStatus ?? s.status })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "siswa-akal.xlsx");
  };

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
      const saved = localStorage.getItem("akal-draft-siswa");
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.search === "string") setSearch(p.search);
        if (typeof p.filterKursus === "string") setFilterKursus(p.filterKursus);
        if (typeof p.filterRisk === "string") setFilterRisk(p.filterRisk);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("akal-draft-siswa", JSON.stringify({ search, filterKursus, filterRisk })); } catch {}
  }, [search, filterKursus, filterRisk]);

  const load = useCallback(async (kursusId?: string) => {
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError("");
      setErrorStatus(null);
      setRetryAfter(null);
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError("Kamu offline — beberapa fitur tidak tersedia");
        setErrorStatus(0);
        return;
      }
      const params = new URLSearchParams();
      if (kursusId) params.set("kursusId", kursusId);
      const url = `/api/v1/guru/siswa${params.toString() ? `?${params.toString()}` : ""}`;
      const result = await apiFetch<SiswaItem[]>(url, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!result.ok) {
        setErrorStatus(result.status);
        setRetryAfter(result.retryAfter ?? null);
        if (result.status === 429) {
          setError(`Terlalu banyak permintaan, coba lagi dalam ${result.retryAfter || 30} detik`);
        } else if (result.status === 402) {
          setError("Saldo tidak cukup — Topup Rp10.000");
        } else if (result.status === 403) {
          setError("Sesi habis, muat ulang halaman");
        } else if (result.status === 404) {
          setError("");
          setSiswa([]);
          return;
        } else {
          throw new Error(result.error || "Gagal memuat data");
        }
        setSiswa([]);
        return;
      }
      const body = result.data;
      setSiswa(body || []);
      const raw = result.raw as { kursusOptions?: KursusOption[] } | null;
      if (raw?.kursusOptions) setKursusOptions(raw.kursusOptions);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (err instanceof Error && err.message.includes("Terlalu banyak")) {
        setError(err.message);
        setErrorStatus(429);
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filterKursus); }, [filterKursus, load]);

  const filtered = useMemo(() => siswa.filter((s) => {
    const q = search.toLowerCase();
    const matchNama = s.nama.toLowerCase().includes(q) || s.kursus.some((k) => k.toLowerCase().includes(q));
    const matchRisk = filterRisk
      ? filterRisk === "berisiko"
        ? s.riskStatus === "berisiko" || s.riskStatus === "kritis"
        : filterRisk === "aman"
        ? s.riskStatus === "aman"
        : true
      : true;
    return matchNama && matchRisk;
  }), [siswa, search, filterRisk]);

  // F11-4 pagination 20 per page + TODO virtual
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedFiltered = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);
  useEffect(() => { setPage(1); }, [search, filterKursus, filterRisk]);

  const total = siswa.length;
  const kritis = siswa.filter((s) => s.riskStatus === "kritis").length;
  const berisiko = siswa.filter((s) => s.riskStatus === "berisiko").length;
  const aman = total - kritis - berisiko;

  if (loading) {
    return (
      <div aria-busy="true" role="status" aria-label="Memuat daftar siswa">
        <SkeletonList />
      </div>
    );
  }

  if (errorStatus === 404) {
    return <EmptyState icon={Users} title="Belum ada siswa" description="Undang siswa dengan kode kelas" action={{ label: "Undang siswa", href: "/guru/kelas" }} secondaryAction={{ label: "Lihat cara undang", href: "/panduan-ai" }} />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p role="alert" aria-live="assertive" className="text-red-600 mb-2">{error} {errorStatus === 429 && retryAfter && <Countdown seconds={parseInt(retryAfter, 10) || 30} onDone={() => load(filterKursus)} />}</p>
        {errorStatus === 402 && <Link href="/guru/topup" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold mb-3">Topup Rp10.000</Link>}
        {errorStatus === 403 && <p className="text-xs text-on-surface-variant mb-3">Sesi habis, muat ulang halaman untuk login kembali.</p>}
        <button onClick={() => load(filterKursus)} className="text-sm text-primary hover:underline active:scale-[0.98] min-h-11 min-w-11 px-4 py-2.5 inline-flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Coba lagi</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Siswa</h1>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-white border border-border-precision rounded-full p-1">
            <button onClick={() => setViewMode("daftar")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${viewMode === "daftar" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"}`}><List className="w-3.5 h-3.5" /> Daftar</button>
            <button onClick={() => setViewMode("gradebook")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${viewMode === "gradebook" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"}`}><LayoutGrid className="w-3.5 h-3.5" /> Gradebook</button>
          </div>
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-border-precision text-xs font-semibold text-on-surface hover:border-primary/20 transition-colors min-h-11"><Download className="w-4 h-4" /> Export Excel</button>
        </div>
      </div>

      {!isOnline && (
        <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> Kamu offline — beberapa fitur tidak tersedia
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
        <div className="relative flex-1">
          <label htmlFor="cari-siswa" className="sr-only">Cari siswa</label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input id="cari-siswa" aria-label="Cari siswa" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau kursus..." className="w-full pl-10 pr-4 py-2.5 min-h-11 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm" />
        </div>
        <div className="relative">
          <label htmlFor="filter-kursus-siswa" className="sr-only">Filter kursus</label>
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <select id="filter-kursus-siswa" value={filterKursus} onChange={(e) => setFilterKursus(e.target.value)} className="pl-10 pr-4 py-2.5 min-h-11 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer min-w-[160px]">
            <option value="">Semua Kursus</option>
            {kursusOptions.map((k) => (<option key={k.id} value={k.id}>{k.judul}</option>))}
          </select>
        </div>
        <div className="relative">
          <label htmlFor="filter-risiko-siswa" className="sr-only">Filter risiko</label>
          <ShieldAlert className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <select id="filter-risiko-siswa" value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="pl-10 pr-4 py-2.5 min-h-11 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer min-w-[140px]">
            <option value="">Semua Risiko</option>
            <option value="aman">Aman</option>
            <option value="berisiko">Berisiko / Kritis</option>
          </select>
        </div>
      </div>

      {total > 0 && (
        <div className="mb-4 bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-4">
          <p className="text-xs font-semibold text-on-surface mb-2">Distribusi Risiko</p>
          <div className="flex gap-2 mb-3">
            <div className="h-2 rounded-full bg-red-500 transition-all" style={{ width: `${total > 0 ? (kritis / total) * 100 : 0}%` }} role="progressbar" aria-valuenow={kritis} aria-valuemin={0} aria-valuemax={total} aria-label={`Kritis ${kritis} dari ${total}`} />
            <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${total > 0 ? (berisiko / total) * 100 : 0}%` }} role="progressbar" aria-valuenow={berisiko} aria-valuemin={0} aria-valuemax={total} aria-label={`Berisiko ${berisiko} dari ${total}`} />
            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${total > 0 ? (aman / total) * 100 : 0}%` }} role="progressbar" aria-valuenow={aman} aria-valuemin={0} aria-valuemax={total} aria-label={`Aman ${aman} dari ${total}`} />
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" aria-hidden="true" /> Kritis: {kritis}</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" aria-hidden="true" /> Berisiko: {berisiko}</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" aria-hidden="true" /> Aman: {aman}</span>
            <span className="text-on-surface-variant/60">Total {total}</span>
          </div>
        </div>
      )}

      <div className="mb-4"><ScoreTrendChart data={[]} ariaLabel="Tren risiko mingguan" /></div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Belum ada siswa" description="Undang siswa dengan kode kelas" action={{ label: "Undang siswa", href: "/guru/kelas" }} secondaryAction={{ label: "Lihat cara undang", href: "/panduan-ai" }} />
      ) : viewMode === "gradebook" ? (
        <div className="bg-white rounded-[32px] border border-border-precision overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Gradebook siswa x kursus</caption>
              <thead><tr className="border-b border-border-precision bg-surface/50"><th scope="col" className="text-left px-4 py-3 font-medium text-on-surface-variant sticky left-0 bg-surface/50">Siswa</th>{(kursusOptions.length > 0 ? kursusOptions : filtered.slice(0, 5).map((_, i) => ({ id: `k${i}`, judul: `Kursus ${i + 1}` }))).map((k) => (<th key={k.id} scope="col" className="text-center px-3 py-3 font-medium text-on-surface-variant whitespace-nowrap">{k.judul}</th>))}<th scope="col" className="text-center px-4 py-3 font-medium text-on-surface-variant">Status</th></tr></thead>
              <tbody>
                {pagedFiltered.map((s) => (
                  <tr key={s.siswaId} className="border-b border-border-precision/50 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface sticky left-0 bg-white"><Link href={`/guru/siswa/${s.siswaId}`} className="hover:text-primary hover:underline">{s.nama}</Link></td>
                    {(kursusOptions.length > 0 ? kursusOptions : filtered.slice(0, 5).map((_, i) => ({ id: `k${i}`, judul: `Kursus ${i + 1}` }))).map((k) => {
                      const enrolled = s.kursus.includes(k.judul);
                      return <td key={k.id} className="px-3 py-3 text-center text-on-surface-variant">{enrolled ? <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">✓</span> : <span className="text-on-surface-variant/30">—</span>}</td>;
                    })}
                    <td className="px-4 py-3 text-center">{s.riskStatus && s.riskStatus !== "aman" ? <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${s.riskStatus === "kritis" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{s.riskStatus === "kritis" ? "KRITIS" : "BERISIKO"}</span> : <span className="inline-flex px-2 py-0.5 text-xs rounded-full font-medium bg-emerald-50 text-emerald-700">Aman</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-3 flex items-center justify-center gap-2 border-t border-border-precision">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Prev</button>
              <span className="text-xs text-on-surface-variant">Halaman {page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <motion.div className="hidden sm:block bg-white rounded-[32px] border border-border-precision overflow-hidden" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
            <table className="w-full text-sm">
              <caption className="sr-only">Daftar siswa terdaftar</caption>
              <thead><tr className="border-b border-border-precision bg-surface/50"><th scope="col" className="text-left px-4 py-3 font-medium text-on-surface-variant">No</th><th scope="col" className="text-left px-4 py-3 font-medium text-on-surface-variant">Nama</th><th scope="col" className="text-left px-4 py-3 font-medium text-on-surface-variant">Kursus</th><th scope="col" className="text-left px-4 py-3 font-medium text-on-surface-variant">Status</th></tr></thead>
              <tbody>
                {pagedFiltered.map((s, i) => (
                  <motion.tr key={s.siswaId} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }} className="border-b border-border-precision/50 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-on-surface"><Link href={`/guru/siswa/${s.siswaId}`} className="hover:text-primary hover:underline transition-colors">{s.nama}</Link></td>
                    <td className="px-4 py-3 text-on-surface-variant"><div className="flex flex-wrap gap-1">{s.kursus.map((k, j) => (<span key={j} className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/5 text-primary">{k}</span>))}</div></td>
                    <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${s.status === "AKTIF" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{s.status}</span>{s.riskStatus && s.riskStatus !== "aman" && (<span className={`ml-1.5 inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${s.riskStatus === "kritis" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{s.riskStatus === "kritis" ? "KRITIS" : "BERISIKO"}</span>)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <motion.div className="sm:hidden space-y-3" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
            {pagedFiltered.map((s) => (
              <motion.div key={s.siswaId} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}><Link href={`/guru/siswa/${s.siswaId}`} className="block bg-glass border border-border-precision rounded-[32px] p-4 active:scale-[0.99] transition-all min-h-11">
                <div className="flex items-center justify-between mb-2"><span className="font-semibold text-on-surface">{s.nama}</span><span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${s.status === "AKTIF" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{s.status}</span></div>
                <div className="flex flex-wrap gap-1 mb-2">{s.kursus.map((k, j) => (<span key={j} className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/5 text-primary break-words">{k}</span>))}</div>
                {s.riskStatus && s.riskStatus !== "aman" ? (<span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${s.riskStatus === "kritis" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>Risiko: {s.riskStatus === "kritis" ? "Kritis" : "Berisiko"}</span>) : (<span className="inline-flex px-2 py-0.5 text-xs rounded-full font-medium bg-emerald-50 text-emerald-700">Risiko: Aman</span>)}
              </Link></motion.div>
            ))}
          </motion.div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Prev</button>
              <span className="text-xs text-on-surface-variant">Halaman {page} / {totalPages} — {filtered.length} siswa</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Next</button>
            </div>
          )}
          {/* TODO virtual: jika siswa >200, ganti table dengan @tanstack/react-virtual virtualizer */}
        </>
      )}
    </div>
  );
}

export default function SiswaListPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div aria-busy="true" role="status"><SkeletonList /></div>}>
        <SiswaContent />
      </Suspense>
    </ErrorBoundary>
  );
}
