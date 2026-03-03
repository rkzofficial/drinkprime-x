import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../lib/theme";
import { isUnlimited } from "../../lib/units";

interface LitresProgressRingProps {
  dispensed: number;
  limit: number;
}

export function LitresProgressRing({ dispensed, limit }: LitresProgressRingProps) {
  const theme = useTheme();
  const unlimited = isUnlimited(limit);
  const pct = unlimited ? 0 : (limit > 0 ? Math.min(100, (dispensed / limit) * 100) : 0);
  const remaining = Math.max(0, limit - dispensed);
  const color = unlimited ? "#22C55E" : (pct > 90 ? "#EF4444" : pct > 70 ? "#F59E0B" : "#3B82F6");

  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ fontSize: 36, fontWeight: "800", color, letterSpacing: -1, lineHeight: 40 }}>
        {unlimited ? "∞" : dispensed.toFixed(0)}
      </Text>
      <Text style={{ fontSize: 11, color: theme.textTertiary, marginTop: 2 }}>
        {unlimited ? "plan" : "L used"}
      </Text>
      <Text style={{ fontSize: 12, fontWeight: "600", color: theme.textSecondary, marginTop: 8 }}>Water</Text>
      <Text style={{ fontSize: 11, color: theme.textTertiary }}>
        {unlimited ? "Unlimited" : `${remaining.toFixed(0)}L left`}
      </Text>
    </View>
  );
}
