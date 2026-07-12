import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#005231",
    colorInfo: "#005231",
    colorSuccess: "#005231",
    colorWarning: "#5a4200",
    colorError: "#ba1a1a",
    colorTextBase: "#141d1b",
    colorBgBase: "#f2fcf7",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBorder: "rgba(27, 107, 69, 0.15)",
    colorBorderSecondary: "rgba(27, 107, 69, 0.08)",
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyCode: "var(--font-jetbrains-mono), 'SF Mono', SFMono-Regular, ui-monospace, monospace",
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 13,
    fontSizeXL: 20,
    lineHeight: 1.5,
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,
    boxShadow:
      "0 4px 24px -2px rgba(0, 82, 49, 0.06)",
    boxShadowSecondary:
      "0 2px 12px -2px rgba(0, 82, 49, 0.04)",
    wireframe: false,
  },
  components: {
    Button: {
      borderRadius: 13,
      borderRadiusLG: 16,
      borderRadiusSM: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 600,
      primaryShadow: "0 2px 8px -2px rgba(0, 82, 49, 0.2)",
    },
    Card: {
      borderRadiusLG: 28,
      paddingLG: 24,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Modal: {
      borderRadiusLG: 24,
    },
    Menu: {
      itemBorderRadius: 12,
      itemHeight: 40,
      horizontalItemBorderRadius: 20,
    },
    Collapse: {
      borderRadiusLG: 16,
      contentPadding: "16px 24px",
    },
    Table: {
      borderRadiusLG: 16,
      headerBg: "#e6f0eb",
    },
    Input: {
      borderRadius: 12,
      borderRadiusLG: 16,
      borderRadiusSM: 8,
      controlHeight: 44,
    },
    Select: {
      borderRadius: 12,
      borderRadiusLG: 16,
      borderRadiusSM: 8,
      controlHeight: 44,
    },
    Steps: {
      iconSize: 32,
    },
    Typography: {
      fontFamilyCode: "var(--font-jetbrains-mono), 'SF Mono', SFMono-Regular, ui-monospace, monospace",
    },
  },
};