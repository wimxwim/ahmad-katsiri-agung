"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Copy, Check, FileText, Eraser, Info } from "lucide-react";
import Link from "next/link";

const BAB_LIST = [
  { slug: "beriman-kepada-malaikat", title: "Beriman kepada Malaikat", kelas: "7" },
  { slug: "membiasakan-tabayyun-menjauhi-ghibah", title: "Membiasakan Tabayyun, Menjauhi Ghibah", kelas: "7" },
  { slug: "salat-mencegah-perbuatan-keji-dan-mungkar", title: "Salat Mencegah Perbuatan Keji dan Mungkar", kelas: "7" },
  { slug: "melestarikan-alam-cerminan-orang-beriman", title: "Melestarikan Alam Cerminan Orang Beriman", kelas: "7" },
  { slug: "amanah-dan-jujur", title: "Amanah dan Jujur", kelas: "8" },
  { slug: "beriman-kepada-kitab-allah", title: "Beriman kepada Kitab Allah", kelas: "8" },
  { slug: "beriman-kepada-nabi-dan-rasul", title: "Beriman kepada Nabi dan Rasul", kelas: "8" },
  { slug: "membangun-toleransi", title: "Membangun Toleransi", kelas: "8" },
  { slug: "moderasi-beragama", title: "Moderasi Beragama", kelas: "8" },
  { slug: "adab-dalam-islam", title: "Adab dalam Islam", kelas: "9" },
  { slug: "beriman-kepada-hari-akhir", title: "Beriman kepada Hari Akhir", kelas: "9" },
  { slug: "beriman-kepada-qada-dan-qadar", title: "Beriman kepada Qada dan Qadar", kelas: "9" },
  { slug: "semangat-mencari-ilmu", title: "Semangat Mencari Ilmu", kelas: "9" },
  { slug: "manusia-khalifah-di-muka-bumi", title: "Manusia sebagai Khalifah di Muka Bumi", kelas: "9" },
];

const SAMPLE_TEXT = `1. Beriman kepada malaikat merupakan rukun iman yang ke...
A. 1
B. 2
C. 3
D. 4
Jawaban: B

2. Malaikat yang bertugas meniup sangkakala adalah...
A. Jibril
B. Mikail
C. Israfil
D. Izrail
Jawaban: C`;

interface ParsedSoal {
  nomor: number;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  opsiE?: string;
  jawaban: string;
}

function parseSoal(text: string): { soal: ParsedSoal[]; errors: string[] } {
  const errors: string[] = [];
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const soal: ParsedSoal[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter((l) => l);

    if (lines.length < 4) {
      errors.push(`Blok (${block.slice(0, 40)}...) — terlalu pendek`);
      continue;
    }

    const firstLine = lines[0];
    const pertanyaanMatch = firstLine.match(/^\d+[.)]\s*(.+)$/);
    if (!pertanyaanMatch) {
      errors.push(`${firstLine} — tidak diawali nomor (contoh: "1. Pertanyaan")`);
      continue;
    }
    const pertanyaan = pertanyaanMatch[1];

    const opsi: { key: string; value: string }[] = [];
    let jawaban = "";

    for (const line of lines.slice(1)) {
      const opsiMatch = line.match(/^([A-E])[.)]\s*(.+)$/);
      const jawabanMatch = line.match(/^Jawaban:\s*([A-E])$/i);
      if (opsiMatch) {
        opsi.push({ key: opsiMatch[1], value: opsiMatch[2] });
      } else if (jawabanMatch) {
        jawaban = jawabanMatch[1].toUpperCase();
      }
    }

    if (opsi.length < 2) {
      errors.push(`"${pertanyaan.slice(0, 30)}..." — minimal 2 opsi, ditemukan ${opsi.length}`);
      continue;
    }
    if (!jawaban) {
      errors.push(`"${pertanyaan.slice(0, 30)}..." — tidak ada jawaban benar`);
      continue;
    }
    if (!["A", "B", "C", "D", "E"].includes(jawaban)) {
      errors.push(`"${pertanyaan.slice(0, 30)}..." — jawaban harus A/B/C/D/E`);
      continue;
    }
    if (opsi.find((o) => o.key === jawaban) === undefined) {
      errors.push(`"${pertanyaan.slice(0, 30)}..." — jawaban ${jawaban} tidak cocok dengan opsi yang ada`);
      continue;
    }

    const getOpsi = (key: string) => opsi.find((o) => o.key === key)?.value ?? "";

    soal.push({
      nomor: soal.length + 1,
      pertanyaan,
      opsiA: getOpsi("A"),
      opsiB: getOpsi("B"),
      opsiC: getOpsi("C"),
      opsiD: getOpsi("D"),
      ...(opsi.find((o) => o.key === "E") ? { opsiE: getOpsi("E") } : {}),
      jawaban,
    });
  }

  return { soal, errors };
}

export default function BulkSoalPage() {
  const [selectedBab, setSelectedBab] = useState(BAB_LIST[0].slug);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ json: string; count: number; errors: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleParse = useCallback(() => {
    if (!text.trim()) return;
    const { soal, errors } = parseSoal(text);
    const json = JSON.stringify(soal, null, 2);
    setResult({ json, count: soal.length, errors });
  }, [text]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleClear = useCallback(() => {
    setText("");
    setResult(null);
    setCopied(false);
  }, []);

  const handleLoadSample = useCallback(() => {
    setText(SAMPLE_TEXT);
    setResult(null);
  }, []);

  const selectedBabData = BAB_LIST.find((b) => b.slug === selectedBab);

  return (
    <div className="max-w-[900px] mx-auto px-3 sm:px-5 lg:px-8 py-8 sm:py-12">
      <Link
        href="/pendidik"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Portal Pendidik
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-7 h-7 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-on-surface">
          Impor Soal Massal
        </h1>
      </div>
      <p className="text-sm text-on-surface-variant mb-8 max-w-2xl">
        Paste soal dalam format teks sederhana, lalu copy JSON hasil parsing
        untuk ditempel ke CMS Keystatic.
      </p>

      <div className="grid gap-8">
        <div className="bg-glass rounded-[32px] border border-border-precision shadow-glass-lg p-6 sm:p-8">
          <div className="mb-5">
            <label className="block text-sm font-heading font-semibold text-on-surface mb-1.5">
              Pilih Bab
            </label>
            <select
              value={selectedBab}
              onChange={(e) => { setSelectedBab(e.target.value); setResult(null); }}
              className="w-full sm:w-80 rounded-xl border border-border-precision bg-white/80 px-3.5 py-2.5 text-sm text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/30 appearance-none"
            >
              {BAB_LIST.map((bab) => (
                <option key={bab.slug} value={bab.slug}>
                  Kelas {bab.kelas} — {bab.title}
                </option>
              ))}
            </select>
            {selectedBabData && (
              <p className="text-xs text-on-surface-variant mt-1">
                Slug: <code className="bg-primary/10 px-1 rounded">{selectedBabData.slug}</code> &middot;
                File: <code className="bg-primary/10 px-1 rounded">content/soal/{selectedBabData.slug}/index.json</code>
              </p>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-heading font-semibold text-on-surface">
                Paste Soal
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleLoadSample}
                  className="text-xs text-primary hover:underline"
                >
                  Muat Contoh
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs text-on-surface-variant hover:text-red-600 flex items-center gap-1"
                >
                  <Eraser className="w-3 h-3" />
                  Hapus
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setResult(null); }}
              rows={12}
              className="w-full rounded-xl border border-border-precision bg-white/80 px-3.5 py-3 text-sm text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/30 resize-y font-mono"
              placeholder={`Tempel soal di sini...\n\nContoh:\n1. Pertanyaan?\nA. Opsi A\nB. Opsi B\nC. Opsi C\nD. Opsi D\nJawaban: A`}
            />
          </div>

          <button
            onClick={handleParse}
            disabled={!text.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary text-sm font-heading font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Parse Soal
          </button>
        </div>

        <div className="bg-glass rounded-[32px] border border-border-precision shadow-glass-lg p-6 sm:p-8">
          <h2 className="text-lg font-heading font-bold text-on-surface mb-1">
            Hasil JSON
          </h2>
          <p className="text-xs text-on-surface-variant mb-4">
            Copy JSON ini, lalu buka CMS &rarr; pilih bab &rarr; paste di editor.
          </p>

          {result ? (
            <>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                  <FileText className="w-4 h-4" />
                  {result.count} soal
                </span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-sm bg-primary text-on-primary px-4 py-1.5 rounded-xl hover:brightness-110 transition-all font-heading font-semibold"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Tersalin!" : "Salin JSON"}
                </button>
              </div>

              {result.errors.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    {result.errors.length} peringatan:
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="relative">
                <pre className="w-full max-h-[500px] overflow-auto rounded-xl bg-[#0d1117] text-[13px] leading-relaxed p-4 sm:p-5 text-[#e6edf3] font-mono whitespace-pre-wrap">
                  {result.json}
                </pre>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-[#0d1117] p-8 text-center text-sm text-[#8b949e]">
              <p>Paste soal di atas, lalu klik &quot;Parse Soal&quot;</p>
            </div>
          )}
        </div>

        <div className="bg-glass rounded-[32px] border border-border-precision shadow-glass-lg p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-primary" />
            <h3 className="text-base font-heading font-bold text-on-surface">
              Format Teks
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-on-surface-variant">
            <div>
              <p className="font-semibold text-on-surface mb-1">Aturan:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Setiap soal dipisah baris kosong</li>
                <li>Nomor diikuti titik (1.) atau kurung (1))</li>
                <li>Opsi A/B/C/D, opsional E</li>
                <li>Baris &quot;Jawaban: X&quot; di akhir</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1">Cara ke CMS:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Buka akalcenter.my.id/keystatic</li>
                <li>Pilih Bank Soal &rarr; bab yang sesuai</li>
                <li>Hapus isi JSON lama, paste hasil di atas</li>
                <li>Simpan (tombol di pojok kanan atas)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
