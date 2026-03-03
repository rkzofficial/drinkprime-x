import { useColorScheme } from "react-native";

const light = {
  bg: "#F2F2F7",
  card: "rgba(255,255,255,0.80)",
  cardBorder: "rgba(255,255,255,0.60)",
  text: "#1C1C1E",
  textSecondary: "rgba(60,60,67,0.60)",
  textTertiary: "rgba(60,60,67,0.45)",
  textQuaternary: "rgba(60,60,67,0.30)",
  separator: "rgba(60,60,67,0.08)",
  fill: "rgba(120,120,128,0.12)",
  sheetBg: "rgba(242,242,247,0.94)",
  sheetSpecular: "rgba(255,255,255,0.45)",
  sheetBorder: "rgba(255,255,255,0.72)",
  inactiveRing: "#E5E7EB",
};

const dark = {
  bg: "#000000",
  card: "rgba(28,28,30,0.85)",
  cardBorder: "rgba(255,255,255,0.10)",
  text: "#FFFFFF",
  textSecondary: "rgba(235,235,245,0.60)",
  textTertiary: "rgba(235,235,245,0.45)",
  textQuaternary: "rgba(235,235,245,0.30)",
  separator: "rgba(255,255,255,0.08)",
  fill: "rgba(120,120,128,0.24)",
  sheetBg: "rgba(28,28,30,0.96)",
  sheetSpecular: "rgba(255,255,255,0.08)",
  sheetBorder: "rgba(255,255,255,0.12)",
  inactiveRing: "#374151",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
