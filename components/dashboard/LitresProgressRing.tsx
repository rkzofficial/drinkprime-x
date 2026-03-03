import React from "react";
import { View, Text } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { useTheme } from "../../lib/theme";

interface LitresProgressRingProps {
  dispensed: number;
  limit: number;
}

export function LitresProgressRing({ dispensed, limit }: LitresProgressRingProps) {
  const theme = useTheme();
  const pct = limit > 0 ? Math.min(100, (dispensed / limit) * 100) : 0;
  const remaining = Math.max(0, limit - dispensed);
  const color = pct > 90 ? "#EF4444" : pct > 70 ? "#F59E0B" : "#3B82F6";

  return (
    <View style={{ alignItems: "center" }}>
      <CircularProgress
        value={pct}
        radius={44}
        duration={1200}
        progressValueColor="transparent"
        activeStrokeColor={color}
        inActiveStrokeColor={theme.inactiveRing}
        activeStrokeWidth={8}
        inActiveStrokeWidth={8}
        showProgressValue={false}
      />
      <View style={{ position: "absolute", top: 22, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color }} numberOfLines={1}>
          {remaining.toFixed(0)}L
        </Text>
        <Text style={{ fontSize: 12, color: theme.textTertiary }}>left</Text>
      </View>
      <Text style={{ fontSize: 12, color: theme.textTertiary, marginTop: 4, fontWeight: "500" }}>Water</Text>
      <Text style={{ fontSize: 12, color: theme.textTertiary }}>{dispensed.toFixed(0)}L used</Text>
    </View>
  );
}
