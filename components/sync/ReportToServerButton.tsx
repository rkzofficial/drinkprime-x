import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackgroundProps,
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { GlassView } from "../ui/GlassView";
import { useTheme } from "../../lib/theme";
import { CloudUploadIcon } from "../../lib/icons";
import { postOfflineSync } from "../../lib/api/cloud";
import { HeartbeatNormalized } from "../../lib/types";
import { formatDateString } from "../../lib/units";

function GlassBackground({ style }: BottomSheetBackgroundProps) {
  const theme = useTheme();
  return (
    <View style={[style, {
      backgroundColor: theme.sheetBg,
      borderTopLeftRadius: 32, borderTopRightRadius: 32,
      borderWidth: 1, borderColor: theme.sheetBorder,
      overflow: "hidden",
    }]}>
      <View pointerEvents="none" style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 40,
        backgroundColor: theme.sheetSpecular,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
      }} />
    </View>
  );
}

function Handle(_: BottomSheetHandleProps) {
  const theme = useTheme();
  return (
    <View style={{ paddingTop: 14, paddingBottom: 6, alignItems: "center" }}>
      <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.fill }} />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.separator }}>
      <Text style={{ fontSize: 13, color: theme.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, maxWidth: 180 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}

interface ReportToServerButtonProps {
  deviceData: HeartbeatNormalized;
  onResult?: (success: boolean, message: string) => void;
}

export function ReportToServerButton({ deviceData, onResult }: ReportToServerButtonProps) {
  const theme = useTheme();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (confirmVisible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [confirmVisible]);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.35} />
  ), []);

  const payload = {
    deviceCode: deviceData.pid,
    validity: formatDateString(deviceData.validityDate),
    totalLitres: Math.round(deviceData.limitLitres),
    consumedLitres: Math.round(deviceData.dispensedLitres),
    outputTDS: deviceData.outputTds,
    firmwareVersion: deviceData.firmwareVersion,
    ssid: deviceData.ssid,
    connectivity: "BLE",
    syncFrom: "app",
    reason: 0,
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await postOfflineSync(payload);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setConfirmVisible(false);
      onResult?.(true, `Server: ${result.body ?? "OK"}`);
    } catch (e: unknown) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onResult?.(false, e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setConfirmVisible(true);
        }}
        activeOpacity={0.8}
      >
        <GlassView radius={18} style={{
          padding: 16, flexDirection: "row", alignItems: "center",
          justifyContent: "center", gap: 10,
          backgroundColor: "rgba(52,199,89,0.16)", borderColor: "rgba(52,199,89,0.4)",
        }}>
          <CloudUploadIcon size={20} color="#34C759" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#34C759" }}>Report to Server</Text>
        </GlassView>
      </TouchableOpacity>

      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose={!loading}
        onDismiss={() => setConfirmVisible(false)}
        backdropComponent={renderBackdrop}
        backgroundComponent={GlassBackground}
        handleComponent={Handle}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text, marginBottom: 16, letterSpacing: -0.3 }}>
            Report Sync to Cloud
          </Text>

          <GlassView variant="subtle" radius={16} style={{ padding: 12, marginBottom: 20 }}>
            {Object.entries(payload).map(([k, v]) => (
              <Row key={k} label={k} value={String(v ?? "—")} />
            ))}
          </GlassView>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setConfirmVisible(false)}
              disabled={loading}
              style={{ flex: 1 }}
              activeOpacity={0.7}
            >
              <GlassView variant="subtle" radius={16} style={{ paddingVertical: 14, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>Cancel</Text>
              </GlassView>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} disabled={loading} style={{ flex: 1 }} activeOpacity={0.7}>
              <GlassView radius={16} style={{
                paddingVertical: 14, alignItems: "center",
                backgroundColor: "rgba(52,199,89,0.85)", borderColor: "rgba(52,199,89,0.5)",
              }}>
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>Confirm</Text>
                }
              </GlassView>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
