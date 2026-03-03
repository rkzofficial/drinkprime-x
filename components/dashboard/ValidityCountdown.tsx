import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../lib/theme";
import { validityColor } from "../../lib/units";

interface ValidityCountdownProps {
  daysRemaining: number;
  validityDate: Date;
}

export function ValidityCountdown({ daysRemaining, validityDate }: ValidityCountdownProps) {
  const theme = useTheme();
  const color = validityColor(daysRemaining);
  const dateLabel = validityDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ fontSize: 36, fontWeight: "800", color, letterSpacing: -1, lineHeight: 40 }}>
        {daysRemaining}
      </Text>
      <Text style={{ fontSize: 11, color: theme.textTertiary, marginTop: 2 }}>days</Text>
      <Text style={{ fontSize: 12, fontWeight: "600", color: theme.textSecondary, marginTop: 8 }}>Validity</Text>
      <Text style={{ fontSize: 11, color: theme.textTertiary }}>{dateLabel}</Text>
    </View>
  );
}
