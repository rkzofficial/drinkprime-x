import React from "react";
import { View, Text } from "react-native";
import { FilterIcon } from "../../lib/icons";
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
    <View style={{ alignItems: "center" }}>
      <View style={{
        width: 88, height: 88, borderRadius: 44,
        alignItems: "center", justifyContent: "center",
        backgroundColor: color + "20",
        borderWidth: 8, borderColor: color,
      }}>
        <FilterIcon size={20} color={color} />
        <Text style={{ fontSize: 18, fontWeight: "700", color }}>{tds}</Text>
        <Text style={{ fontSize: 12, color }}>ppm</Text>
      </View>
      <Text style={{ fontSize: 12, color: theme.textTertiary, marginTop: 4, fontWeight: "500" }}>TDS</Text>
      <Text style={{ fontSize: 12, fontWeight: "600", color }}>{label}</Text>
    </View>
  );
}
