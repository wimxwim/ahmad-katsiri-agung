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
  color: ["#005231", "#0d7a4a", "#e67e22", "#c0392b"],
  backgroundColor: "transparent",
  textStyle: {
    fontFamily: "Inter, sans-serif",
    color: "#1a1a1a",
  },
  grid: {
    containLabel: true,
  },
  tooltip: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "rgba(27,107,69,0.15)",
    textStyle: {
      color: "#1a1a1a",
    },
  },
};

echarts.registerTheme("akalMint", AKAL_THEME);

export { echarts };
