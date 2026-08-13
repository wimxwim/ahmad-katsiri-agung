"use client";

type KursusBreakdownRow = {
  kursusId: string;
  judul: string;
  totalSiswa: number;
  totalAttempt: number;
  rataNilai: number;
  siswaTuntas: number;
  siswaBelumTuntas: number;
};

type CourseProgressProps = {
  data: KursusBreakdownRow[];
};

export default function CourseProgress({ data }: CourseProgressProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground">Progress per Kursus</h3>
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground text-center px-4">
          Belum ada kursus
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Progress per Kursus</h3>
      <div className="flex flex-col gap-3">
        {data.map((row) => {
          const totalForPct = row.totalSiswa > 0 ? row.totalSiswa : row.siswaTuntas + row.siswaBelumTuntas;
          const pct = totalForPct > 0 ? Math.round((row.siswaTuntas / totalForPct) * 100) : 0;
          const kelulusanLabel = totalForPct > 0 ? `${pct}% lulus` : "Belum ada data";
          return (
            <div
              key={row.kursusId}
              className="rounded-2xl border border-border-precision bg-white/70 p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-semibold text-sm text-foreground truncate" title={row.judul}>
                    {row.judul}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {row.totalSiswa} siswa &middot; {row.totalAttempt} percobaan &middot; Rata-rata {row.rataNilai}
                  </p>
                </div>
                <span
                  className={
                    pct >= 70
                      ? "shrink-0 inline-flex items-center rounded-full bg-[#005231] text-white text-xs font-medium px-2.5 py-1"
                      : pct >= 50
                        ? "shrink-0 inline-flex items-center rounded-full bg-[#e67e22] text-white text-xs font-medium px-2.5 py-1"
                        : "shrink-0 inline-flex items-center rounded-full bg-surface-container border border-border-precision text-muted-foreground text-xs font-medium px-2.5 py-1"
                  }
                >
                  {kelulusanLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden border border-border-precision">
                  <div
                    className="h-full rounded-full bg-[#005231] transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Kelulusan ${row.judul}: ${pct}%`}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums text-foreground shrink-0">{pct}%</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#005231] inline-block" /> {row.siswaTuntas} tuntas
                </span>
                <span className="text-border-precision">|</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#e67e22] inline-block" /> {row.siswaBelumTuntas} belum tuntas
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CourseProgress };
export type { KursusBreakdownRow };
