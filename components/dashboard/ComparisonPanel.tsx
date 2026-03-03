import React from "react";
import { View, Text } from "react-native";
import { GlassView } from "../ui/GlassView";
import { useTheme } from "../../lib/theme";
import { Alert01Icon } from "../../lib/icons";
import { HeartbeatNormalized, CloudNormalized, StateMismatch } from "../../lib/types";
import { formatDateString } from "../../lib/units";

function computeMismatches(device: HeartbeatNormalized, cloud: CloudNormalized): StateMismatch[] {
  const out: StateMismatch[] = [];
  const dv = formatDateString(device.validityDate);
  const cv = formatDateString(cloud.validity);
  if (dv !== cv) {
    out.push({ field: "validity", label: "Validity date", serverValue: cv, deviceValue: dv, isCritical: true });
  }
  if (Math.abs(Math.round(device.limitLitres) - cloud.allowedLitres) > 1) {
    out.push({ field: "litres", label: "Total litres", serverValue: `${cloud.allowedLitres} L`, deviceValue: `${Math.round(device.limitLitres)} L`, isCritical: false });
  }
  return out;
}

export function ComparisonPanel({ device, cloud }: { device: HeartbeatNormalized; cloud: CloudNormalized }) {
  const theme = useTheme();
  const mismatches = computeMismatches(device, cloud);

  if (mismatches.length === 0) {
    return (
      <GlassView radius={20} style={{ padding: 16, backgroundColor: "rgba(52,199,89,0.13)", borderColor: "rgba(52,199,89,0.35)" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(52,199,89,0.85)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>✓</Text>
          </View>
          <View>
            <Text style={{ fontWeight: "700", fontSize: 15, color: "#34C759" }}>In Sync</Text>
            <Text style={{ fontSize: 12, color: "rgba(52,199,89,0.8)", marginTop: 1 }}>Device and server data match</Text>
          </View>
        </View>
      </GlassView>
    );
  }

  return (
    <GlassView radius={20} style={{ padding: 16, backgroundColor: "rgba(255,159,10,0.12)", borderColor: "rgba(255,159,10,0.4)" }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Alert01Icon size={18} color="#FF9F0A" />
        <Text style={{ fontWeight: "700", fontSize: 15, color: "#FF9F0A", marginLeft: 8, flex: 1 }}>Sync Required</Text>
        <View style={{ backgroundColor: "rgba(255,159,10,0.25)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#FF9F0A" }}>
            {mismatches.length} mismatch{mismatches.length > 1 ? "es" : ""}
          </Text>
        </View>
      </View>
      {mismatches.map((m) => (
        <GlassView key={m.field} variant="subtle" radius={14} style={{ padding: 12, marginBottom: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#FF9F0A", marginBottom: 6 }}>
            {m.label}{m.isCritical ? "  ·  Critical" : ""}
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: theme.textTertiary, marginBottom: 2 }}>Server</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text }}>{m.serverValue}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: theme.textTertiary, marginBottom: 2 }}>Device</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text }}>{m.deviceValue}</Text>
            </View>
          </View>
        </GlassView>
      ))}
    </GlassView>
  );
}
