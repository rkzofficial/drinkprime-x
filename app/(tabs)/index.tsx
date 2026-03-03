import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAppContext } from "../../context/AppContext";
import { useTheme } from "../../lib/theme";
import { GlassView } from "../../components/ui/GlassView";
import { ConnectionDot } from "../../components/dashboard/ConnectionDot";
import { ValidityCountdown } from "../../components/dashboard/ValidityCountdown";
import { LitresProgressRing } from "../../components/dashboard/LitresProgressRing";
import { TDSGauge } from "../../components/dashboard/TDSGauge";
import { SyncConfirmSheet } from "../../components/sync/SyncConfirmSheet";
import { ReportToServerButton } from "../../components/sync/ReportToServerButton";
import { setupParameters } from "../../lib/api/device";
import { postOfflineSync } from "../../lib/api/cloud";
import { litresToRaw, dateToEpoch, formatDateString, formatDateDisplay, isUnlimited } from "../../lib/units";
import { SyncFormData } from "../../lib/types";
import { Wifi01Icon } from "../../lib/icons";

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    settings,
    deviceData, deviceLoading, deviceError,
    cloudData, cloudLoading, cloudError,
    connectionStatus, connectionLatencyMs,
    refreshAll, refreshDevice, refreshCloud,
  } = useAppContext();

  const [writeVisible, setWriteVisible] = useState(false);
  const [writing, setWriting] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleWrite = useCallback(async (form: SyncFormData) => {
    setWriting(true);
    try {
      const pid = form.pid || deviceData?.pid || "";
      await setupParameters({
        ip: settings.deviceIp,
        tLitres: litresToRaw(form.totalLitres),
        tValidity: dateToEpoch(form.validityDate),
        tDispensed: litresToRaw(form.dispensedLitres),
        tPid: pid || undefined,
        tRtc: form.syncClock ? Math.floor(Date.now() / 1000) : undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWriteVisible(false);
      showToast(true, "Written to device successfully!");
      if (deviceData?.pid) {
        try {
          await postOfflineSync({
            deviceCode: deviceData.pid,
            validity: formatDateString(form.validityDate),
            totalLitres: form.totalLitres,
            consumedLitres: form.dispensedLitres,
            outputTDS: deviceData?.outputTds,
            firmwareVersion: deviceData?.firmwareVersion,
            ssid: deviceData?.ssid,
          });
        } catch { /* non-fatal */ }
      }
      await refreshDevice();
    } catch (e: unknown) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWriteVisible(false);
      showToast(false, e instanceof Error ? e.message : "Write failed");
    } finally {
      setWriting(false);
    }
  }, [settings, deviceData, refreshDevice]);

  // ── No IP set ──────────────────────────────────────────────────────────────
  if (!settings.deviceIp) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <SafeAreaView edges={["top"]} style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <GlassView variant="card" radius={28} style={{ padding: 32, alignItems: "center", gap: 16, width: "100%" }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,122,255,0.12)", alignItems: "center", justifyContent: "center" }}>
              <Wifi01Icon size={30} color="#007AFF" />
            </View>
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 22, fontWeight: "700", color: theme.text, letterSpacing: -0.4 }}>No Device Set Up</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: "center", lineHeight: 20 }}>
                Enter your purifier's IP address in Settings to get started.
              </Text>
            </View>
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate("/(tabs)/settings"); }} activeOpacity={0.8} style={{ width: "100%" }}>
              <View style={{ borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: "#007AFF" }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>Go to Settings</Text>
              </View>
            </TouchableOpacity>
          </GlassView>
        </SafeAreaView>
      </View>
    );
  }

  // ── Initial loading ────────────────────────────────────────────────────────
  const isInitialLoading =
    deviceLoading || cloudLoading ||
    (!deviceData && !deviceError) ||
    (!!deviceData?.pid && !cloudData && !cloudError);

  if (isInitialLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <SafeAreaView edges={["top"]} style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <GlassView variant="card" radius={28} style={{ padding: 32, alignItems: "center", gap: 20, width: "100%" }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 17, fontWeight: "600", color: theme.text }}>
                {deviceLoading || (!deviceData && !deviceError) ? "Connecting to device…" : "Fetching server data…"}
              </Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>{settings.deviceIp}</Text>
            </View>
          </GlassView>
        </SafeAreaView>
      </View>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const loading = deviceLoading || cloudLoading;

  // Compute sync status
  const hasMismatch = deviceData && cloudData && (() => {
    const dv = formatDateString(deviceData.validityDate);
    const cv = formatDateString(cloudData.validity);
    if (dv !== cv) return true;
    if (Math.abs(Math.round(deviceData.limitLitres) - cloudData.allowedLitres) > 1) return true;
    return false;
  })();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshAll} tintColor={theme.textTertiary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4, marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: "700", color: theme.text, letterSpacing: -0.5 }}>DrinkPrime X</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                <ConnectionDot status={connectionStatus} latencyMs={connectionLatencyMs} />
              </View>
            </View>
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); refreshAll(); }} disabled={loading} activeOpacity={0.7}>
              <GlassView variant="subtle" radius={14} style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
                {loading
                  ? <ActivityIndicator size="small" color={theme.textSecondary} />
                  : <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text }}>Refresh</Text>
                }
              </GlassView>
            </TouchableOpacity>
          </View>

          {/* ── Toast / errors ── */}
          {toast && (
            <GlassView radius={14} style={{ padding: 14, marginBottom: 12, borderColor: toast.ok ? "rgba(52,199,89,0.4)" : "rgba(255,59,48,0.4)", backgroundColor: toast.ok ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.12)" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: toast.ok ? "#34C759" : "#FF453A" }}>{toast.msg}</Text>
            </GlassView>
          )}
          {(deviceError || cloudError) && (
            <GlassView radius={14} style={{ padding: 14, marginBottom: 12, borderColor: "rgba(255,59,48,0.35)", backgroundColor: "rgba(255,59,48,0.08)" }}>
              {deviceError && <Text style={{ fontSize: 13, color: "#FF453A" }}>Device: {deviceError}</Text>}
              {cloudError && <Text style={{ fontSize: 13, color: "#FF453A", marginTop: 2 }}>Cloud: {cloudError}</Text>}
            </GlassView>
          )}

          {/* ── Key metrics ── */}
          {deviceData && (
            <GlassView variant="hero" radius={28} style={{ paddingVertical: 20, paddingHorizontal: 8, flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
              <ValidityCountdown daysRemaining={deviceData.daysRemaining} validityDate={deviceData.validityDate} />
              <View style={{ width: 1, alignSelf: "stretch", backgroundColor: theme.separator, marginVertical: 4 }} />
              <LitresProgressRing dispensed={deviceData.dispensedLitres} limit={deviceData.limitLitres} />
              <View style={{ width: 1, alignSelf: "stretch", backgroundColor: theme.separator, marginVertical: 4 }} />
              <TDSGauge tds={deviceData.outputTds} />
            </GlassView>
          )}

          {/* ── Info card ── */}
          {(deviceData || cloudData) && (
            <GlassView variant="card" radius={20} style={{ marginBottom: 12, overflow: "hidden" }}>
              {/* Sync status row */}
              <View style={{
                flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12,
                backgroundColor: "rgba(52,199,89,0.08)",
                borderBottomWidth: 1, borderBottomColor: theme.separator,
              }}>
                <View style={{
                  width: 8, height: 8, borderRadius: 4, marginRight: 8,
                  backgroundColor: "#34C759",
                }} />
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#34C759" }}>
                  {hasMismatch ? "Validity Overridden" : "In sync"}
                </Text>
              </View>

              {deviceData && (
                <InfoRow label="PID" value={deviceData.pid || "—"} mono />
              )}
              {deviceData && (
                <InfoRow label="Device validity" value={formatDateDisplay(deviceData.validityDate)} separator />
              )}
              {cloudData && (
                <InfoRow label="Cloud validity" value={formatDateDisplay(cloudData.validity)} separator />
              )}
              {cloudData && (
                <InfoRow label="Cloud litres" value={isUnlimited(cloudData.allowedLitres) ? "Unlimited" : `${cloudData.allowedLitres} L allowed`} separator />
              )}
              {deviceData?.ssid && (
                <InfoRow label="SSID" value={deviceData.ssid} separator last />
              )}
            </GlassView>
          )}

          {/* ── Actions ── */}
          <GlassView variant="card" radius={20} style={{ overflow: "hidden", marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWriteVisible(true); }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: theme.text }}>Write to Device</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>Set validity, litres and sync clock</Text>
                </View>
                <Text style={{ fontSize: 20, color: "#007AFF", fontWeight: "300" }}>›</Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: theme.separator, marginLeft: 16 }} />

            {deviceData ? (
              <ReportToServerButton
                deviceData={deviceData}
                onResult={(ok, msg) => { showToast(ok, msg); if (ok) refreshCloud(); }}
                asRow
              />
            ) : (
              <View style={{ paddingHorizontal: 16, paddingVertical: 16, opacity: 0.4 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: theme.text }}>Report to Cloud</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>Load device data first</Text>
              </View>
            )}
          </GlassView>
        </ScrollView>
      </SafeAreaView>

      <SyncConfirmSheet
        visible={writeVisible}
        deviceData={deviceData}
        cloudData={cloudData}
        onConfirm={handleWrite}
        onCancel={() => setWriteVisible(false)}
        loading={writing}
      />
    </View>
  );
}

function InfoRow({ label, value, mono, separator, last }: {
  label: string; value: string; mono?: boolean; separator?: boolean; last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View>
      {separator && <View style={{ height: 1, backgroundColor: theme.separator, marginLeft: 16 }} />}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 11 }}>
        <Text style={{ fontSize: 14, color: theme.textSecondary, width: 110 }}>{label}</Text>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: theme.text, textAlign: "right", fontFamily: mono ? "monospace" : undefined }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
