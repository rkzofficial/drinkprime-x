import React from "react";
import { View, Text } from "react-native";
import { GlassView } from "../ui/GlassView";
import { useTheme } from "../../lib/theme";
import {
  CalendarCheck01Icon, WaterIcon, Cpu01Icon, FingerprintScanIcon,
  FilterIcon, ThermometerIcon, Wifi01Icon, Plug01Icon,
} from "../../lib/icons";
import { HeartbeatNormalized } from "../../lib/types";
import { formatDateDisplay } from "../../lib/units";

function Row({
  Icon, label, value, accent,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  accent?: string;
}) {
  const theme = useTheme();
  const iconColor = accent ?? "#007AFF";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.separator }}>
      <View style={{ width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: `${iconColor}20`, marginRight: 12 }}>
        <Icon size={15} color={iconColor} />
      </View>
      <Text style={{ flex: 1, fontSize: 14, color: theme.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text }}>{value}</Text>
    </View>
  );
}

export function DeviceStateCard({ data }: { data: HeartbeatNormalized }) {
  const theme = useTheme();
  return (
    <GlassView variant="card" radius={24} style={{ padding: 16 }}>
      <Row Icon={CalendarCheck01Icon} label="Validity" value={formatDateDisplay(data.validityDate)} accent="#34C759" />
      <Row Icon={WaterIcon} label="Limit" value={`${data.limitLitres.toFixed(2)} L`} accent="#007AFF" />
      <Row Icon={WaterIcon} label="Dispensed" value={`${data.dispensedLitres.toFixed(2)} L`} accent="#007AFF" />
      <Row Icon={FilterIcon} label="Output TDS" value={`${data.outputTds} ppm`} accent="#5856D6" />
      <Row Icon={ThermometerIcon} label="Temperature" value={`${data.outputTemp}°C`} accent="#FF9F0A" />
      <Row Icon={Plug01Icon} label="State" value={data.powerState ? "ON" : "OFF"} accent={data.powerState ? "#34C759" : "#8E8E93"} />
      <Row Icon={Cpu01Icon} label="Firmware" value={data.firmwareVersion || "—"} accent="#8E8E93" />
      <Row Icon={FingerprintScanIcon} label="PID" value={data.pid || "—"} accent="#8E8E93" />
      <Row Icon={Wifi01Icon} label="SSID" value={data.ssid || "—"} accent="#007AFF" />
      {data.deviceType ? <Row Icon={Cpu01Icon} label="Type" value={data.deviceType} accent="#8E8E93" /> : null}
      {data.installationId ? <Row Icon={Cpu01Icon} label="Install ID" value={data.installationId} accent="#8E8E93" /> : null}
      <View style={{ borderBottomWidth: 0 }}>
        <Row Icon={WaterIcon} label="Avg Flow Rate" value={`${data.avgFlowRate} L/min`} accent="#007AFF" />
      </View>
      {data.isBrevera && (
        <View style={{ marginTop: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(88,86,214,0.15)", borderRadius: 8, alignSelf: "flex-start" }}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#5856D6" }}>Brevera Model</Text>
        </View>
      )}
    </GlassView>
  );
}
