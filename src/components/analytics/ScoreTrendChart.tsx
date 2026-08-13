"use client";

import EChartsBase from "@/components/charts/EChartsBase";
import { KKM } from "@/lib/constants";

type ScoreTrendRow = {
  week: string;
  rata: number;
  total: number;
};

type ScoreTrendChartProps = {
  data: ScoreTrendRow[];
  ariaLabel?: string;
};

export default function ScoreTrendChart({ data, ariaLabel = "Perkembangan rata-rata nilai" }: ScoreTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground">Tren Nilai</h3>
        <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground text-center px-4">
          Belum ada data — ajak siswa kerjakan quiz
        </div>
      </div>
    );
  }

  const weeks = data.map((d) => d.week);
  const rataValues = data.map((d) => d.rata);

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Tren Nilai</h3>
      <EChartsBase
        height={260}
        ariaLabel={ariaLabel}
        option={{
          aria: { enabled: true, decal: { show: false } },
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderColor: "rgba(27,107,69,0.15)",
            textStyle: { color: "#1a1a1a", fontFamily: "Inter, sans-serif" },
          },
          grid: { left: 8, right: 16, top: 12, bottom: 24, containLabel: true },
          xAxis: {
            type: "category",
            data: weeks,
            boundaryGap: false,
            axisLine: { lineStyle: { color: "rgba(27,107,69,0.15)" } },
            axisLabel: { color: "#6f7a71", fontSize: 11, fontFamily: "Inter, sans-serif" },
            axisTick: { show: false },
          },
          yAxis: {
            type: "value",
            min: 0,
            max: 100,
            axisLine: { show: false },
            axisLabel: { color: "#6f7a71", fontSize: 11, fontFamily: "Inter, sans-serif" },
            splitLine: { lineStyle: { color: "rgba(27,107,69,0.08)", type: "dashed" } },
          },
          series: [
            {
              type: "line",
              data: rataValues,
              smooth: true,
              symbol: "circle",
              symbolSize: 5,
              lineStyle: { color: "#005231", width: 2 },
              itemStyle: { color: "#005231", borderColor: "#fff", borderWidth: 1.5 },
              areaStyle: { color: "rgba(0,82,49,0.08)" },
              markLine: {
                silent: true,
                symbol: "none",
                lineStyle: { color: "#e67e22", type: "dashed", width: 1.5 },
                label: { color: "#e67e22", fontSize: 11, fontFamily: "Inter, sans-serif", formatter: `KKM ${KKM}` },
                data: [{ yAxis: KKM }],
              },
              emphasis: { focus: "series" },
            },
          ],
          animation: true,
        }}
      />
    </div>
  );
}

export { ScoreTrendChart };
export type { ScoreTrendRow };
