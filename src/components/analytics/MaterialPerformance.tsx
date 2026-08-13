"use client";

import EChartsBase from "@/components/charts/EChartsBase";

type PerMateriRow = {
  skillId: string;
  nama: string;
  avgBenar: number;
  total: number;
};

type MaterialPerformanceProps = {
  data: PerMateriRow[];
  ariaLabel?: string;
};

function barColor(avgBenar: number): string {
  if (avgBenar >= 0.7) return "#005231";
  if (avgBenar >= 0.5) return "#e67e22";
  return "#c0392b";
}

export default function MaterialPerformance({ data, ariaLabel = "Performa per materi" }: MaterialPerformanceProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground">Performa per Materi</h3>
        <div className="flex items-center justify-center h-[120px] text-sm text-muted-foreground text-center px-4">
          Belum ada data performa materi
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => a.avgBenar - b.avgBenar);
  const names = sorted.map((r) => r.nama);
  const pctValues = sorted.map((r) => Math.round(r.avgBenar * 100));
  const height = Math.min(300, Math.max(120, sorted.length * 28 + 40));

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Performa per Materi</h3>
      <p className="text-xs text-muted-foreground mb-2">Diurutkan dari yang perlu perhatian (rendah) ke tinggi</p>
      <EChartsBase
        height={height}
        ariaLabel={ariaLabel}
        option={{
          aria: { enabled: true, decal: { show: false } },
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderColor: "rgba(27,107,69,0.15)",
            textStyle: { color: "#1a1a1a", fontFamily: "Inter, sans-serif" },
            formatter: (params: unknown) => {
              const arr = params as { name: string; value: number; dataIndex: number }[];
              const p = arr[0];
              const row = sorted[p.dataIndex];
              return `${p.name}<br/>Benar: ${p.value}% &middot; ${row.total} jawaban`;
            },
          },
          grid: { left: 8, right: 44, top: 4, bottom: 8, containLabel: true },
          xAxis: {
            type: "value",
            min: 0,
            max: 100,
            axisLabel: {
              color: "#6f7a71",
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
              formatter: "{value}%",
            },
            splitLine: { lineStyle: { color: "rgba(27,107,69,0.08)", type: "dashed" } },
          },
          yAxis: {
            type: "category",
            data: names,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: "#1a1a1a",
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
              width: 140,
              overflow: "truncate",
            },
          },
          series: [
            {
              type: "bar",
              data: pctValues.map((v, i) => ({
                value: v,
                itemStyle: { color: barColor(sorted[i].avgBenar), borderRadius: [0, 8, 8, 0] },
                label: {
                  show: true,
                  position: "right",
                  formatter: "{c}%",
                  color: "#6f7a71",
                  fontSize: 11,
                  fontFamily: "Inter, sans-serif",
                },
              })),
              barMaxWidth: 18,
            },
          ],
          animation: true,
        }}
      />
    </div>
  );
}

export { MaterialPerformance };
export type { PerMateriRow };
