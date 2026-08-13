"use client";

import EChartsBase from "@/components/charts/EChartsBase";

type HeatmapRow = {
  dow: number;
  hour: number;
  total: number;
};

type StudentActivityHeatmapProps = {
  data: HeatmapRow[];
  ariaLabel?: string;
};

const DOW_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

export default function StudentActivityHeatmap({ data, ariaLabel = "Aktivitas siswa per hari dan jam" }: StudentActivityHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground">Aktivitas Siswa</h3>
        <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground text-center px-4">
          Belum ada aktivitas — ajak siswa kerjakan quiz
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  // ECharts heatmap data: [hour, dow, value]
  const heatmapData: [number, number, number][] = data.map((r) => [r.hour, r.dow, r.total]);

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Aktivitas Siswa</h3>
      <p className="text-xs text-muted-foreground mb-2">Hari (baris) x Jam (kolom)</p>
      <EChartsBase
        height={200}
        ariaLabel={ariaLabel}
        option={{
          aria: { enabled: true, decal: { show: false } },
          tooltip: {
            position: "top",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderColor: "rgba(27,107,69,0.15)",
            textStyle: { color: "#1a1a1a", fontFamily: "Inter, sans-serif" },
            formatter: (params: unknown) => {
              const p = params as { data: [number, number, number] };
              const [hour, dow, val] = p.data;
              return `${DOW_LABELS[dow]} jam ${String(hour).padStart(2, "0")}:00 — ${val} aktivitas`;
            },
          },
          grid: { left: 36, right: 12, top: 8, bottom: 28, containLabel: true },
          xAxis: {
            type: "category",
            data: Array.from({ length: 24 }, (_, h) => String(h)),
            splitArea: { show: true, areaStyle: { color: ["rgba(255,255,255,0.02)", "rgba(242,252,247,0.6)"] } },
            axisLine: { lineStyle: { color: "rgba(27,107,69,0.15)" } },
            axisLabel: { color: "#6f7a71", fontSize: 10, fontFamily: "Inter, sans-serif", interval: 1 },
            axisTick: { show: false },
            name: "Jam",
            nameLocation: "middle",
            nameGap: 22,
            nameTextStyle: { color: "#6f7a71", fontSize: 11, fontFamily: "Inter, sans-serif" },
          },
          yAxis: {
            type: "category",
            data: [...DOW_LABELS],
            splitArea: { show: true, areaStyle: { color: ["rgba(255,255,255,0.02)", "rgba(242,252,247,0.6)"] } },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: "#6f7a71", fontSize: 11, fontFamily: "Inter, sans-serif" },
          },
          visualMap: {
            min: 0,
            max: maxVal,
            calculable: false,
            orient: "horizontal",
            left: "center",
            bottom: 0,
            itemWidth: 12,
            itemHeight: 80,
            textStyle: { color: "#6f7a71", fontSize: 11, fontFamily: "Inter, sans-serif" },
            inRange: {
              color: ["#f2fcf7", "#c8e9d8", "#7fbf9f", "#2d8a5a", "#005231"],
            },
            show: true,
          },
          series: [
            {
              type: "heatmap",
              data: heatmapData,
              label: { show: false },
              emphasis: {
                itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,82,49,0.35)" },
              },
            },
          ],
          animation: true,
        }}
      />
    </div>
  );
}

export { StudentActivityHeatmap };
export type { HeatmapRow };
