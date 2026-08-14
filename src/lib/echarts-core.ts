import * as echarts from "echarts/core";
import { LineChart, BarChart, PieChart, HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  AriaComponent,
  VisualMapComponent,
  CalendarComponent,
  MarkLineComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  AriaComponent,
  VisualMapComponent,
  CalendarComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

export const AKAL_THEME = {
  color: ["oklch(0.31 0.08 155)", "oklch(0.45 0.08 155)", "oklch(0.65 0.15 45)", "oklch(0.45 0.15 25)"],
  backgroundColor: "transparent",
  textStyle: {
    fontFamily: "Inter, sans-serif",
    color: "var(--color-on-surface)",
  },
  grid: {
    containLabel: true,
  },
  tooltip: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "var(--color-border-precision)",
    textStyle: {
      color: "var(--color-on-surface)",
    },
  },
};

echarts.registerTheme("akalMint", AKAL_THEME);

export { echarts };
