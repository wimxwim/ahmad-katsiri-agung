"use client";

import { ListChecks, Lightbulb } from "lucide-react";

interface StructuredMateri {
  ringkasan?: string;
  pendahuluan?: string;
  konten?: { judul: string; isi: string }[];
  poinPenting?: string[];
}

function parseStructuredMateri(raw: string): StructuredMateri | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && (parsed.konten || parsed.pendahuluan || parsed.poinPenting)) {
      return parsed as StructuredMateri;
    }
  } catch {
    // not JSON — old format flat text
  }
  return null;
}

export function MateriRenderer({ konten }: { konten: string }) {
  const structured = parseStructuredMateri(konten);

  if (!structured) {
    return (
      <div className="prose prose-sm max-w-none text-on-surface whitespace-pre-wrap leading-relaxed">
        {konten}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {structured.ringkasan && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Ringkasan</p>
          </div>
          <p className="text-sm text-on-surface leading-relaxed">{structured.ringkasan}</p>
        </div>
      )}

      {structured.pendahuluan && (
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Pendahuluan</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">{structured.pendahuluan}</p>
        </div>
      )}

      {structured.konten?.map((section, i) => (
        <div key={i} className="p-4 rounded-2xl bg-white/50 border border-border-precision">
          <h3 className="text-sm font-bold text-on-surface mb-2">{section.judul}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">{section.isi}</p>
        </div>
      ))}

      {structured.poinPenting && structured.poinPenting.length > 0 && (
        <div className="p-4 rounded-2xl bg-tertiary/5 border border-tertiary/10">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-4 h-4 text-tertiary" />
            <p className="text-xs font-bold text-tertiary uppercase tracking-wider">Poin Penting</p>
          </div>
          <ul className="space-y-1.5">
            {structured.poinPenting.map((poin, i) => (
              <li key={i} className="text-sm text-on-surface-variant flex items-start gap-2">
                <span className="text-tertiary font-bold shrink-0">{i + 1}.</span>
                <span>{poin}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}