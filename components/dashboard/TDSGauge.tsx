import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../lib/theme";
import { tdsQualityLabel, tdsQualityColor } from "../../lib/units";

interface TDSGaugeProps {
  tds: number;
}

export function TDSGauge({ tds }: TDSGaugeProps) {
  const theme = useTheme();
  const color = tdsQualityColor(tds);
  const label = tdsQualityLabel(tds);

  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ fontSize: 36, fontWeight: "800", color, letterSpacing: -1, lineHeight: 40 }}>
        {tds}
      </Text>
      <Text style={{ fontSize: 11, color: theme.textTertiary, marginTop: 2 }}>ppm</Text>
      <Text style={{ fontSize: 12, fontWeight: "600", color: theme.textSecondary, marginTop: 8 }}>TDS</Text>
      <Text style={{ fontSize: 11, fontWeight: "600", color }}>{label}</Text>
    </View>
  );
}
