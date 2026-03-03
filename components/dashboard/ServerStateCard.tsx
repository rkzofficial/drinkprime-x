import React from "react";
import { View, Text } from "react-native";
import { GlassView } from "../ui/GlassView";
import { useTheme } from "../../lib/theme";
import { CalendarCheck01Icon, WaterIcon, CloudUploadIcon } from "../../lib/icons";
import { CloudNormalized } from "../../lib/types";
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
  const iconColor = accent ?? "#34C759";
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

export function ServerStateCard({ data }: { data: CloudNormalized }) {
  return (
    <GlassView variant="card" radius={24} style={{ padding: 16 }}>
      <Row Icon={CalendarCheck01Icon} label="Validity" value={formatDateDisplay(data.validity)} accent="#34C759" />
      <Row Icon={CalendarCheck01Icon} label="Validity on device" value={formatDateDisplay(data.validityOnBot)} accent="#8E8E93" />
      <Row Icon={WaterIcon} label="Allowed litres" value={`${data.allowedLitres} L`} accent="#007AFF" />
      <Row Icon={WaterIcon} label="Allowed (device)" value={`${data.allowedLitresOnBot} L`} accent="#8E8E93" />
      <Row Icon={WaterIcon} label="Consumed" value={`${data.consumedLitres} L`} accent="#FF9F0A" />
      <Row Icon={CloudUploadIcon} label="Bot ID" value={data.botId || "—"} accent="#8E8E93" />
      <Row Icon={CloudUploadIcon} label="Vendor flag" value={String(data.botVendorFlag)} accent="#8E8E93" />
      <View style={{ borderBottomWidth: 0 }}>
        <Row Icon={CloudUploadIcon} label="New offline flow" value={data.isNewOfflineFlowEnabled ? "Yes" : "No"} accent={data.isNewOfflineFlowEnabled ? "#34C759" : "#8E8E93"} />
      </View>
    </GlassView>
  );
}
