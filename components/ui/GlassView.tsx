import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp, useColorScheme } from "react-native";

let LiquidGlassView: React.ComponentType<{
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
  effect?: "clear" | "regular" | "none";
  tintColor?: string;
  colorScheme?: "light" | "dark" | "system";
  children?: React.ReactNode;
}> | null = null;

let isLiquidGlassSupported = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("@callstack/liquid-glass");
  LiquidGlassView = mod.LiquidGlassView;
  isLiquidGlassSupported = mod.isLiquidGlassSupported ?? false;
} catch {
  // package not linked in this environment — use fallback
}

export type GlassVariant = "card" | "hero" | "subtle" | "accent";

const LIGHT: Record<GlassVariant, { bg: string; border: string; tint?: string }> = {
  card:   { bg: "rgba(255,255,255,0.72)", border: "rgba(255,255,255,0.55)" },
  hero:   { bg: "rgba(255,255,255,0.82)", border: "rgba(255,255,255,0.65)" },
  subtle: { bg: "rgba(255,255,255,0.50)", border: "rgba(255,255,255,0.40)" },
  accent: { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)", tint: "rgba(59,130,246,0.08)" },
};

const DARK: Record<GlassVariant, { bg: string; border: string; tint?: string }> = {
  card:   { bg: "rgba(44,44,46,0.80)",   border: "rgba(255,255,255,0.10)" },
  hero:   { bg: "rgba(58,58,60,0.85)",   border: "rgba(255,255,255,0.14)" },
  subtle: { bg: "rgba(28,28,30,0.60)",   border: "rgba(255,255,255,0.07)" },
  accent: { bg: "rgba(59,130,246,0.18)", border: "rgba(59,130,246,0.30)", tint: "rgba(59,130,246,0.12)" },
};

interface GlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: GlassVariant;
  radius?: number;
  interactive?: boolean;
  effect?: "clear" | "regular";
}

export function GlassView({
  children,
  style,
  variant = "card",
  radius = 24,
  interactive = false,
  effect = "regular",
}: GlassViewProps) {
  const isDark = useColorScheme() === "dark";
  const v = (isDark ? DARK : LIGHT)[variant];

  if (isLiquidGlassSupported && LiquidGlassView) {
    return (
      <LiquidGlassView
        style={[{ borderRadius: radius }, style]}
        interactive={interactive}
        effect={effect}
        tintColor={v.tint}
        colorScheme="system"
      >
        {children}
      </LiquidGlassView>
    );
  }

  return (
    <View
      style={[
        styles.base,
        { borderRadius: radius, backgroundColor: v.bg, borderColor: v.border },
        style,
      ]}
    >
      <View
        style={[styles.specular, { borderRadius: radius, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.80)" }]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  specular: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    pointerEvents: "none",
  },
});
