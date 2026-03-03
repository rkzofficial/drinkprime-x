import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAppContext } from "../../context/AppContext";
import { useTheme } from "../../lib/theme";
import { GlassView } from "../../components/ui/GlassView";
import { ConnectionDot } from "../../components/dashboard/ConnectionDot";
import { PowerStateBadge } from "../../components/dashboard/PowerStateBadge";
import { ValidityCountdown } from "../../components/dashboard/ValidityCountdown";
import { LitresProgressRing } from "../../components/dashboard/LitresProgressRing";
import { TDSGauge } from "../../components/dashboard/TDSGauge";
import { DeviceStateCard } from "../../components/dashboard/DeviceStateCard";
import { ServerStateCard } from "../../components/dashboard/ServerStateCard";
import { ComparisonPanel } from "../../components/dashboard/ComparisonPanel";
import { AutoRefreshControl } from "../../components/dashboard/AutoRefreshControl";
import { SyncForm } from "../../components/sync/SyncForm";
import { SyncConfirmSheet } from "../../components/sync/SyncConfirmSheet";
import { ReportToServerButton } from "../../components/sync/ReportToServerButton";
import { setupParameters } from "../../lib/api/device";
import { postOfflineSync } from "../../lib/api/cloud";
import { litresToRaw, dateToEpoch, formatDateString } from "../../lib/units";
import { SyncFormData } from "../../lib/types";

function defaultForm(pid?: string): SyncFormData {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return { validityDate: d, totalLitres: 60, dispensedLitres: 0, syncClock: true, pid: pid ?? "" };
}

function SectionLabel({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: theme.textTertiary, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8, marginTop: 4, paddingHorizontal: 4 }}>
      {children}
    </Text>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const {
    settings, autoRefresh, saveAutoRefresh,
    deviceData, deviceLoading, deviceError,
    cloudData, cloudLoading, cloudError,
    connectionStatus, connectionLatencyMs,
    refreshAll, refreshDevice, refreshCloud,
  } = useAppContext();

  const loading = deviceLoading || cloudLoading;

  const [form, setForm] = useState<SyncFormData>(() => defaultForm(deviceData?.pid));
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [writing, setWriting] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleWrite = useCallback(async () => {
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
      setConfirmVisible(false);
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
      setConfirmVisible(false);
      showToast(false, e instanceof Error ? e.message : "Write failed");
    } finally {
      setWriting(false);
    }
  }, [form, settings, deviceData, refreshDevice]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshAll} tintColor={theme.textTertiary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: "700", color: theme.text, letterSpacing: -0.5 }}>DrinkPrime X</Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 1 }}>{settings.deviceIp}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <ConnectionDot status={connectionStatus} latencyMs={connectionLatencyMs} />
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); refreshAll(); }}
                disabled={loading}
              >
                <GlassView variant="subtle" radius={14} style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
                  {loading
                    ? <ActivityIndicator size="small" color={theme.textSecondary} />
                    : <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text }}>Refresh</Text>
                  }
                </GlassView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Auto refresh */}
          <GlassView variant="subtle" radius={16} style={{ padding: 12 }}>
            <AutoRefreshControl settings={autoRefresh} onChange={saveAutoRefresh} />
          </GlassView>

          {/* Toast */}
          {toast && (
            <GlassView
              radius={16}
              style={{
                padding: 14,
                borderColor: toast.ok ? "rgba(52,199,89,0.4)" : "rgba(255,59,48,0.4)",
                backgroundColor: toast.ok ? "rgba(52,199,89,0.15)" : "rgba(255,59,48,0.15)",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: toast.ok ? "#1A7A3A" : "#FF453A" }}>
                {toast.msg}
              </Text>
            </GlassView>
          )}

          {/* Errors */}
          {(deviceError || cloudError) && (
            <GlassView radius={16} style={{ padding: 14, borderColor: "rgba(255,59,48,0.35)", backgroundColor: "rgba(255,59,48,0.10)" }}>
              {deviceError && <Text style={{ fontSize: 12, color: "#FF453A" }}>Device: {deviceError}</Text>}
              {cloudError && <Text style={{ fontSize: 12, color: "#FF453A", marginTop: 2 }}>Cloud: {cloudError}</Text>}
            </GlassView>
          )}

          {/* Power state hero */}
          {deviceData && <PowerStateBadge on={deviceData.powerState} />}

          {/* Stats row */}
          {deviceData && (
            <GlassView variant="hero" radius={28} style={{ padding: 20, flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
              <ValidityCountdown daysRemaining={deviceData.daysRemaining} validityDate={deviceData.validityDate} />
              <View style={{ width: 1, height: 80, backgroundColor: theme.separator }} />
              <LitresProgressRing dispensed={deviceData.dispensedLitres} limit={deviceData.limitLitres} />
              <View style={{ width: 1, height: 80, backgroundColor: theme.separator }} />
              <TDSGauge tds={deviceData.outputTds} />
            </GlassView>
          )}

          {/* Comparison */}
          {deviceData && cloudData && <ComparisonPanel device={deviceData} cloud={cloudData} />}

          {/* Device details */}
          {deviceData && (
            <>
              <SectionLabel>Device State</SectionLabel>
              <DeviceStateCard data={deviceData} />
            </>
          )}

          {/* Server details */}
          {cloudData && (
            <>
              <SectionLabel>Server State</SectionLabel>
              <ServerStateCard data={cloudData} />
            </>
          )}

          {!deviceData && !loading && !deviceError && (
            <GlassView variant="subtle" radius={20} style={{ padding: 32, alignItems: "center" }}>
              <Text style={{ color: theme.textSecondary, textAlign: "center", fontSize: 15 }}>
                No device data yet.{"\n"}Pull to refresh.
              </Text>
            </GlassView>
          )}

          {/* Sync section */}
          <SectionLabel>Write to Device</SectionLabel>
          <SyncForm
            form={form}
            onChange={(f) => setForm({ ...f, pid: f.pid || deviceData?.pid || "" })}
            deviceData={deviceData}
            cloudData={cloudData}
          />
          <TouchableOpacity
            onPress={() => {
              if (!settings.deviceIp) { Alert.alert("No device IP", "Set device IP in Settings."); return; }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setForm((f) => ({ ...f, pid: f.pid || deviceData?.pid || "" }));
              setConfirmVisible(true);
            }}
            style={{ marginTop: 8 }}
          >
            <GlassView variant="accent" radius={18} interactive style={{ padding: 16, alignItems: "center", backgroundColor: "rgba(0,122,255,0.18)", borderColor: "rgba(0,122,255,0.35)" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#0A6EEB" }}>Write to Device</Text>
            </GlassView>
          </TouchableOpacity>

          {/* Report to cloud */}
          <SectionLabel>Report to Cloud</SectionLabel>
          {!deviceData ? (
            <GlassView variant="subtle" radius={18} style={{ padding: 16 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Load device data first.</Text>
            </GlassView>
          ) : (
            <ReportToServerButton
              deviceData={deviceData}
              onResult={(ok, msg) => { showToast(ok, msg); if (ok) refreshCloud(); }}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      <SyncConfirmSheet
        visible={confirmVisible}
        formData={form}
        onConfirm={handleWrite}
        onCancel={() => setConfirmVisible(false)}
        loading={writing}
      />
    </View>
  );
}
