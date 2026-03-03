import React from "react";
import { View, Text, TextInput, Switch, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { GlassView } from "../ui/GlassView";
import { useTheme } from "../../lib/theme";
import { SyncFormData, CloudNormalized, HeartbeatNormalized } from "../../lib/types";

interface SyncFormProps {
  form: SyncFormData;
  onChange: (f: SyncFormData) => void;
  deviceData?: HeartbeatNormalized | null;
  cloudData?: CloudNormalized | null;
}

export function SyncForm({ form, onChange, deviceData, cloudData }: SyncFormProps) {
  const theme = useTheme();
  const inputStyle = {
    backgroundColor: theme.fill,
    borderWidth: 1,
    borderColor: theme.separator,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: theme.text,
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: "600" as const,
    color: theme.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.2,
  };

  function onDateChange(_: DateTimePickerEvent, selected?: Date) {
    if (selected) onChange({ ...form, validityDate: selected });
  }

  return (
    <GlassView variant="card" radius={24} style={{ padding: 16, gap: 14 }}>
      {/* Validity date */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={[labelStyle, { marginBottom: 0 }]}>Validity Date</Text>
        <DateTimePicker
          value={form.validityDate}
          mode="date"
          display="compact"
          minimumDate={new Date()}
          onChange={onDateChange}
          themeVariant="dark"
        />
      </View>

      {/* Total litres */}
      <View>
        <Text style={labelStyle}>Total Litres</Text>
        <TextInput
          style={inputStyle}
          value={String(form.totalLitres)}
          onChangeText={(v) => onChange({ ...form, totalLitres: Number(v) || 0 })}
          keyboardType="numeric"
          placeholder="60"
          placeholderTextColor={theme.textQuaternary}
        />
      </View>

      {/* Dispensed litres */}
      <View>
        <Text style={labelStyle}>Dispensed Litres</Text>
        <TextInput
          style={inputStyle}
          value={String(form.dispensedLitres)}
          onChangeText={(v) => onChange({ ...form, dispensedLitres: Number(v) || 0 })}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={theme.textQuaternary}
        />
      </View>

      {/* Device PID (read-only) */}
      <View>
        <Text style={labelStyle}>Device PID</Text>
        <View style={[inputStyle, { justifyContent: "center" }]}>
          <Text style={{ fontSize: 14, color: theme.textTertiary, fontFamily: "monospace" }}>
            {form.pid || deviceData?.pid || "—"}
          </Text>
        </View>
      </View>

      {/* Sync clock toggle */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 2 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text }}>Sync device clock</Text>
          <Text style={{ fontSize: 12, color: theme.textTertiary, marginTop: 2 }}>Sends t_RTC with current time</Text>
        </View>
        <Switch
          value={form.syncClock}
          onValueChange={(v) => onChange({ ...form, syncClock: v })}
          trackColor={{ true: "#34C759", false: "rgba(120,120,128,0.3)" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="rgba(120,120,128,0.3)"
        />
      </View>
    </GlassView>
  );
}
