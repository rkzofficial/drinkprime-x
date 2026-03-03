import React from "react";
import { View, Text } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { useTheme } from "../../lib/theme";
import { validityColor } from "../../lib/units";

interface ValidityCountdownProps {
  daysRemaining: number;
  validityDate: Date;
}

export function ValidityCountdown({ daysRemaining, validityDate }: ValidityCountdownProps) {
  const theme = useTheme();
  const maxDays = 365;
  const pct = Math.min(100, (daysRemaining / maxDays) * 100);
  const color = validityColor(daysRemaining);

  return (
    <View style={{ alignItems: "center" }}>
      <CircularProgress
        value={pct}
        radius={44}
        duration={1000}
        progressValueColor="transparent"
        activeStrokeColor={color}
        inActiveStrokeColor={theme.inactiveRing}
        activeStrokeWidth={8}
        inActiveStrokeWidth={8}
        showProgressValue={false}
      />
      <View style={{ position: "absolute", top: 28, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color }}>{daysRemaining}</Text>
        <Text style={{ fontSize: 12, color: theme.textTertiary }}>days</Text>
      </View>
      <Text style={{ fontSize: 12, color: theme.textTertiary, marginTop: 4, fontWeight: "500" }}>Validity</Text>
      <Text style={{ fontSize: 12, color: theme.textTertiary }}>
        {validityDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
      </Text>
    </View>
  );
}
