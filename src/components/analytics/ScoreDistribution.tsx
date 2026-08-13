"use client";

import EChartsBase from "@/components/charts/EChartsBase";
import { KKM } from "@/lib/constants";

type ScoreDistributionData = {
  bucket0_59: number;
  bucket60_69: number;
  bucket70_79: number;
  bucket80_89: number;
  bucket90_100: number;
};

type ScoreDistributionProps = {
  data: ScoreDistributionData;
  ariaLabel?: string;
};

const BUCKET_LABELS = ["0-59", "60-69", "70-79", "80-89", "90-100"] as const;
const BUCKET_COLORS = ["#c0392b", "#e67e22", "#0d7a4a", "#005231", "#005231"] as const;

export default function ScoreDistribution({ data, ariaLabel = "Distribusi nilai" }: ScoreDistributionProps) {
  const values = [
    data?.bucket0_59 ?? 0,
    data?.bucket60_69 ?? 0,
    data?.bucket70_79 ?? 0,
    data?.bucket80_89 ?? 0,
    data?.bucket90_100 ?? 0,
  ];
  const total = values.reduce((s, v) => s + v, 0);

  if (total === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground">Distribusi Nilai</h3>
        <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground text-center px-4">
          Belum ada data — ajak siswa kerjakan quiz
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Distribusi Nilai</h3>
      <EChartsBase
        height={240}
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
            data: [...BUCKET_LABELS],
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
              data: values.map((v, i) => ({
                value: v,
                itemStyle: { color: BUCKET_COLORS[i], borderRadius: [8, 8, 0, 0] },
              })),
              barMaxWidth: 48,
              markLine: {
                silent: true,
                symbol: "none",
                lineStyle: { color: "#e67e22", type: "dashed", width: 1.5 },
                label: {
                  color: "#e67e22",
                  fontSize: 11,
                  fontFamily: "Inter, sans-serif",
                  formatter: `KKM ${KKM}`,
                },
                // KKM 70 sits between bucket 60-69 and 70-79; draw at xAxis boundary
                data: [{ xAxis: "70-79" }],
              },
            },
          ],
          animation: true,
        }}
      />
      <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#c0392b] inline-block" /> 0-59
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#e67e22] inline-block" /> 60-69
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#005231] inline-block" /> 70+
        </span>
      </div>
    </div>
  );
}

export type { ScoreDistributionData };
