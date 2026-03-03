import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import { GlassView } from "../ui/GlassView";
import { useTheme } from "../../lib/theme";
import { SyncFormData, CloudNormalized, HeartbeatNormalized } from "../../lib/types";

interface SyncFormProps {
  form: SyncFormData;
  onChange: (f: SyncFormData) => void;
  deviceData?: HeartbeatNormalized | null;
  cloudData?: CloudNormalized | null;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function SyncForm({ form, onChange, deviceData, cloudData }: SyncFormProps) {
  const theme = useTheme();
  const [validityInput, setValidityInput] = useState(formatDate(form.validityDate));

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

  function onValidityChange(s: string) {
    setValidityInput(s);
    const parts = s.split("-");
    if (parts.length === 3 && parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) onChange({ ...form, validityDate: d });
    }
  }

  function prefillFromServer() {
    if (!cloudData) return;
    setValidityInput(formatDate(cloudData.validity));
    onChange({ ...form, validityDate: cloudData.validity, totalLitres: cloudData.allowedLitres, dispensedLitres: cloudData.consumedLitres });
  }

  return (
    <GlassView variant="card" radius={24} style={{ padding: 16, gap: 14 }}>
      {cloudData && (
        <TouchableOpacity onPress={prefillFromServer}>
          <GlassView variant="accent" radius={12} style={{ paddingVertical: 10, alignItems: "center", backgroundColor: "rgba(0,122,255,0.1)", borderColor: "rgba(0,122,255,0.3)" }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#007AFF" }}>Pre-fill from Server</Text>
          </GlassView>
        </TouchableOpacity>
      )}

      <View>
        <Text style={labelStyle}>Validity Date (YYYY-MM-DD)</Text>
        <TextInput style={inputStyle} value={validityInput} onChangeText={onValidityChange} placeholder="2026-12-31" keyboardType="default" autoCapitalize="none" placeholderTextColor={theme.textQuaternary} />
      </View>

      <View>
        <Text style={labelStyle}>Total Litres</Text>
        <TextInput style={inputStyle} value={String(form.totalLitres)} onChangeText={(v) => onChange({ ...form, totalLitres: Number(v) || 0 })} keyboardType="numeric" placeholder="60" placeholderTextColor={theme.textQuaternary} />
      </View>

      <View>
        <Text style={labelStyle}>Dispensed Litres</Text>
        <TextInput style={inputStyle} value={String(form.dispensedLitres)} onChangeText={(v) => onChange({ ...form, dispensedLitres: Number(v) || 0 })} keyboardType="numeric" placeholder="0" placeholderTextColor={theme.textQuaternary} />
      </View>

      <View>
        <Text style={labelStyle}>Device PID</Text>
        <View style={[inputStyle, { justifyContent: "center" }]}>
          <Text style={{ fontSize: 14, color: theme.textTertiary, fontFamily: "monospace" }}>
            {form.pid || deviceData?.pid || "—"}
          </Text>
        </View>
      </View>

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
