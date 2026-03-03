import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { GlassView } from "../../components/ui/GlassView";
import { Wifi01Icon, FingerprintScanIcon } from "../../lib/icons";
import { useAppContext } from "../../context/AppContext";
import { useTheme } from "../../lib/theme";
import { checkConnected } from "../../lib/api/device";
import { AppSettings } from "../../lib/types";
import { DeviceScannerSheet } from "../../components/settings/DeviceScannerSheet";

function SectionHeader({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <Text style={{
      fontSize: 12, fontWeight: "600", color: theme.textTertiary,
      letterSpacing: 0.4, textTransform: "uppercase",
      marginTop: 24, marginBottom: 6, paddingHorizontal: 4,
    }}>
      {label}
    </Text>
  );
}

function InputRow({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, hint, mono, last,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any; autoCapitalize?: any;
  hint?: string; mono?: boolean; last?: boolean;
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <View style={{
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 12, minHeight: 52,
      }}>
        <Text style={{ fontSize: 15, fontWeight: "500", color: theme.text, width: 120 }}>
          {label}
        </Text>
        <TextInput
          style={{
            flex: 1, fontSize: 15,
            color: focused ? "#007AFF" : theme.text,
            textAlign: "right",
            fontFamily: mono ? "monospace" : undefined,
            padding: 0,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textQuaternary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "none"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {hint && (
        <Text style={{ fontSize: 11, color: theme.textTertiary, paddingHorizontal: 16, marginTop: -6, marginBottom: 8 }}>
          {hint}
        </Text>
      )}
      {!last && <View style={{ height: 1, backgroundColor: theme.separator, marginLeft: 16 }} />}
    </View>
  );
}

function ToggleRow({
  label, subtitle, value, onValueChange,
}: {
  label: string; subtitle?: string; value: boolean; onValueChange: (v: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, minHeight: 52 }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: "500", color: theme.text }}>{label}</Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: theme.textTertiary, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: "#34C759", false: "rgba(120,120,128,0.3)" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="rgba(120,120,128,0.3)"
      />
    </View>
  );
}

function WifiStep({ num, text, mono }: { num: string; text: string; mono?: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 12, paddingVertical: 6 }}>
      <View style={{
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: "rgba(0,122,255,0.15)", alignItems: "center", justifyContent: "center", marginTop: 1,
      }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#007AFF" }}>{num}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: 14, color: theme.textSecondary, lineHeight: 20 }}>
        {text}
        {mono && (
          <Text style={{ fontFamily: "monospace", fontWeight: "700", color: theme.text }}> {mono}</Text>
        )}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, saveSettings, refreshAll } = useAppContext();

  const [form, setForm] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  function update(patch: Partial<AppSettings>) {
    setForm(f => ({ ...f, ...patch }));
    setDirty(true);
    setTestResult(null);
  }

  const handleSave = async () => {
    await saveSettings(form);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setTimeout(() => refreshAll(), 300);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const t0 = Date.now();
    try {
      const ok = await checkConnected(form.deviceIp);
      const latency = Date.now() - t0;
      Haptics.notificationAsync(ok
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
      );
      setTestResult(ok
        ? { ok: true, msg: `Reachable · ${latency}ms` }
        : { ok: false, msg: "Device unreachable" }
      );
    } catch (e: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTestResult({ ok: false, msg: e instanceof Error ? e.message : "Connection failed" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <Text style={{ fontSize: 34, fontWeight: "700", color: theme.text, letterSpacing: -0.5, marginTop: 8, marginBottom: 4 }}>
            Settings
          </Text>

          {saved && (
            <MotiView from={{ opacity: 0, translateY: -6 }} animate={{ opacity: 1, translateY: 0 }}>
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                backgroundColor: "rgba(52,199,89,0.15)", borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 10, marginTop: 8,
                borderWidth: 1, borderColor: "rgba(52,199,89,0.3)",
              }}>
                <Text style={{ fontSize: 16 }}>✓</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#34C759" }}>Settings saved</Text>
              </View>
            </MotiView>
          )}

          <SectionHeader label="Device" />
          <GlassView variant="card" radius={16} style={{ overflow: "hidden" }}>
            <InputRow
              label="IP Address"
              value={form.deviceIp}
              onChangeText={(v) => update({ deviceIp: v })}
              placeholder="192.168.45.1"
              keyboardType="url"
              hint="Default 192.168.45.1 · some devices use 10.1.1.217"
            />
            <TouchableOpacity onPress={() => setScannerVisible(true)} activeOpacity={0.7}>
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 }}>
                <Wifi01Icon size={17} color="#007AFF" />
                <Text style={{ fontSize: 15, fontWeight: "500", color: "#007AFF", marginLeft: 10, flex: 1 }}>
                  Scan for Devices
                </Text>
                <Text style={{ fontSize: 13, color: theme.textTertiary }}>›</Text>
              </View>
            </TouchableOpacity>
          </GlassView>

          <SectionHeader label="Preferences" />
          <GlassView variant="card" radius={16} style={{ overflow: "hidden" }}>
            <ToggleRow
              label="Sync device clock"
              subtitle="Sends t_RTC on every write"
              value={form.syncDeviceClock}
              onValueChange={(v) => update({ syncDeviceClock: v })}
            />
          </GlassView>

          <SectionHeader label="Connection" />
          <GlassView variant="card" radius={16} style={{ overflow: "hidden" }}>
            <TouchableOpacity onPress={handleTest} disabled={testing} activeOpacity={0.7}>
              <View style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 16, paddingVertical: 14, minHeight: 52,
              }}>
                <FingerprintScanIcon size={18} color="#007AFF" />
                <Text style={{ fontSize: 15, fontWeight: "500", color: "#007AFF", marginLeft: 10, flex: 1 }}>
                  Test Connection
                </Text>
                {testing
                  ? <ActivityIndicator size="small" color="#007AFF" />
                  : <Text style={{ fontSize: 13, color: theme.textTertiary }}>›</Text>
                }
              </View>
            </TouchableOpacity>

            {testResult && (
              <>
                <View style={{ height: 1, backgroundColor: theme.separator, marginLeft: 16 }} />
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <View style={{
                    flexDirection: "row", alignItems: "center", gap: 8,
                    paddingHorizontal: 16, paddingVertical: 12,
                  }}>
                    <View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: testResult.ok ? "#34C759" : "#FF3B30",
                    }} />
                    <Text style={{
                      fontSize: 13, fontWeight: "500",
                      color: testResult.ok ? "#34C759" : "#FF453A",
                    }}>
                      {testResult.msg}
                    </Text>
                  </View>
                </MotiView>
              </>
            )}
          </GlassView>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!dirty}
            activeOpacity={0.8}
            style={{ marginTop: 28 }}
          >
            <View style={{
              borderRadius: 14, paddingVertical: 16, alignItems: "center",
              backgroundColor: dirty ? "#007AFF" : "rgba(0,122,255,0.35)",
            }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.2 }}>
                Save Settings
              </Text>
            </View>
          </TouchableOpacity>

          <SectionHeader label="How to Connect" />
          <GlassView radius={16} style={{ padding: 16, backgroundColor: "rgba(0,122,255,0.07)", borderColor: "rgba(0,122,255,0.2)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Wifi01Icon size={16} color="#007AFF" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#007AFF", letterSpacing: 0.2 }}>
                WiFi AP Mode
              </Text>
            </View>
            <WifiStep num="1" text="Put purifier into offline mode — hold the button or use the app's Offline Sync option." />
            <WifiStep num="2" text="Connect your phone to the purifier's WiFi. Password:" mono="pass123456789" />
            <WifiStep num="3" text="Open this app. The device will be reachable at" mono="192.168.45.1" />
            <WifiStep num="4" text="If unreachable, try a different IP like" mono="10.1.1.217" />
          </GlassView>

          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <Text style={{ fontSize: 12, color: theme.textQuaternary }}>DrinkPrime X · v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <DeviceScannerSheet
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onSelect={(ip) => {
          update({ deviceIp: ip });
          setScannerVisible(false);
        }}
      />
    </View>
  );
}
