import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { useTheme } from "../../lib/theme";
import { AutoRefreshSettings } from "../../lib/types";

const INTERVALS = [
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
];

interface AutoRefreshControlProps {
  settings: AutoRefreshSettings;
  onChange: (next: AutoRefreshSettings) => void;
}

export function AutoRefreshControl({ settings, onChange }: AutoRefreshControlProps) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: "500", color: theme.textSecondary }}>Auto-refresh</Text>
        <Switch
          value={settings.enabled}
          onValueChange={(v) => onChange({ ...settings, enabled: v })}
          trackColor={{ true: "#34C759", false: "rgba(120,120,128,0.3)" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="rgba(120,120,128,0.3)"
        />
      </View>
      {settings.enabled && (
        <View style={{ flexDirection: "row", gap: 4 }}>
          {INTERVALS.map((i) => (
            <TouchableOpacity
              key={i.value}
              onPress={() => onChange({ ...settings, intervalSeconds: i.value })}
              style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                backgroundColor: settings.intervalSeconds === i.value
                  ? "rgba(0,122,255,0.85)" : theme.fill,
              }}
            >
              <Text style={{
                fontSize: 12, fontWeight: "600",
                color: settings.intervalSeconds === i.value ? "#FFFFFF" : theme.textSecondary,
              }}>
                {i.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
