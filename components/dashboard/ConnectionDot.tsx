import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { useTheme } from "../../lib/theme";
import { ConnectionStatus } from "../../lib/types";

interface ConnectionDotProps {
  status: ConnectionStatus;
  latencyMs?: number | null;
}

export function ConnectionDot({ status, latencyMs }: ConnectionDotProps) {
  const theme = useTheme();
  const color =
    status === "connected" ? "#34C759"
    : status === "connecting" ? "#FF9F0A"
    : "#FF3B30";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ width: 8, height: 8, alignItems: "center", justifyContent: "center" }}>
        {status === "connecting" ? (
          <MotiView
            from={{ opacity: 0.3, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 700, loop: true }}
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }}
          />
        ) : (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        )}
      </View>
      <Text style={{ fontSize: 12, fontWeight: "500", color: theme.textSecondary }}>
        {status === "connected"
          ? latencyMs ? `${latencyMs}ms` : "Online"
          : status === "connecting" ? "Connecting…"
          : "Offline"}
      </Text>
    </View>
  );
}
