"use client";

import EChartsBase from "@/components/charts/EChartsBase";

type AttemptTrendRow = {
  week: string;
  total: number;
};

type QuizAttemptsChartProps = {
  data: AttemptTrendRow[];
  ariaLabel?: string;
};

export default function QuizAttemptsChart({ data, ariaLabel = "Percobaan quiz per minggu" }: QuizAttemptsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground">Percobaan Quiz</h3>
        <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground text-center px-4">
          Belum ada data — ajak siswa kerjakan quiz
        </div>
      </div>
    );
  }

  const weeks = data.map((d) => d.week);
  const totals = data.map((d) => d.total);

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Percobaan Quiz</h3>
      <EChartsBase
        height={220}
        ariaLabel={ariaLabel}
        option={{
          aria: { enabled: true, decal: { show: false } },
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderColor: "rgba(27,107,69,0.15)",
            textStyle: { color: "#1a1a1a", fontFamily: "Inter, sans-serif" },
          },
          grid: { left: 8, right: 12, top: 12, bottom: 28, containLabel: true },
          xAxis: {
            type: "category",
            data: weeks,
            axisLine: { lineStyle: { color: "rgba(27,107,69,0.15)" } },
            axisLabel: { color: "#6f7a71", fontSize: 11, fontFamily: "Inter, sans-serif" },
            axisTick: { show: false },
          },
          yAxis: {
            type: "value",
            minInterval: 1,
            axisLine: { show: false },
            axisLabel: { color: "#6f7a71", fontSize: 11, fontFamily: "Inter, sans-serif" },
            splitLine: { lineStyle: { color: "rgba(27,107,69,0.08)", type: "dashed" } },
          },
          series: [
            {
              type: "bar",
              data: totals.map((v) => ({
                value: v,
                itemStyle: { color: "#005231", borderRadius: [8, 8, 0, 0] },
              })),
              barMaxWidth: 36,
            },
          ],
          animation: true,
        }}
      />
    </div>
  );
}

export { QuizAttemptsChart };
export type { AttemptTrendRow };
