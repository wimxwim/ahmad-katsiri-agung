"use client";

import EChartsBase from "@/components/charts/EChartsBase";

type CompletionDonutProps = {
  tuntas: number;
  belumTuntas: number;
  ariaLabel?: string;
};

export default function CompletionDonut({ tuntas, belumTuntas, ariaLabel = "Status ketuntasan" }: CompletionDonutProps) {
  const total = tuntas + belumTuntas;
  const pct = total > 0 ? Math.round((tuntas / total) * 100) : 0;
  const isEmpty = total === 0;

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-1">Ketuntasan</h3>
      <p className="text-xs text-muted-foreground mb-2">
        {isEmpty ? "Belum ada data ketuntasan" : `${tuntas} tuntas / ${belumTuntas} belum tuntas`}
      </p>
      <EChartsBase
        height={220}
        ariaLabel={ariaLabel}
        option={{
          aria: { enabled: true, decal: { show: false } },
          tooltip: {
            trigger: "item",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderColor: "rgba(27,107,69,0.15)",
            textStyle: { color: "#1a1a1a", fontFamily: "Inter, sans-serif" },
            formatter: "{b}: {c} ({d}%)",
          },
          series: [
            {
              type: "pie",
              radius: ["62%", "82%"],
              center: ["50%", "52%"],
              avoidLabelOverlap: true,
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 2,
              },
              label: {
                show: !isEmpty,
                position: "center",
                formatter: `${pct}% Tuntas`,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Bricolage Grotesque, sans-serif",
                color: "#005231",
              },
              labelLine: { show: false },
              emphasis: { scale: true, scaleSize: 4 },
              emptyCircleStyle: {
                color: "#e6f0eb",
                borderColor: "rgba(27,107,69,0.15)",
                borderWidth: 1,
              },
              data: isEmpty
                ? [{ value: 1, name: "Belum ada data", itemStyle: { color: "#e6f0eb" } }]
                : [
                    { value: tuntas, name: "Tuntas", itemStyle: { color: "#005231" } },
                    { value: belumTuntas, name: "Belum tuntas", itemStyle: { color: "#e67e22" } },
                  ],
            },
          ],
          animation: true,
        }}
      />
      {!isEmpty ? (
        <div className="flex items-center justify-center gap-4 mt-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005231] inline-block" /> Tuntas
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e67e22] inline-block" /> Belum tuntas
          </span>
        </div>
      ) : null}
    </div>
  );
}

export { CompletionDonut };
