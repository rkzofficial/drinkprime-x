import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, useWindowDimensions } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackgroundProps,
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { GlassView } from "../ui/GlassView";
import { useTheme } from "../../lib/theme";
import { Wifi01Icon, FingerprintScanIcon } from "../../lib/icons";
import { scanNetwork, ScannedDevice } from "../../lib/scanner";

function GlassBackground({ style }: BottomSheetBackgroundProps) {
  const theme = useTheme();
  return (
    <View style={[style, {
      backgroundColor: theme.sheetBg,
      borderTopLeftRadius: 32, borderTopRightRadius: 32,
      borderWidth: 1, borderColor: theme.sheetBorder,
      overflow: "hidden",
    }]} />
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

interface DeviceScannerSheetProps {
  visible: boolean;
  onSelect: (ip: string) => void;
  onClose: () => void;
}

type ScanState = "idle" | "scanning" | "done";

export function DeviceScannerSheet({ visible, onSelect, onClose }: DeviceScannerSheetProps) {
  const theme = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(254);
  const [subnet, setSubnet] = useState("");
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const cancelRef = useRef({ cancelled: false });

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.35} />
  ), []);

  const startScan = useCallback(async () => {
    cancelRef.current = { cancelled: false };
    setDevices([]);
    setProgress(0);
    setTotal(254);
    setScanState("scanning");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await scanNetwork(
        (scanned, tot) => { setProgress(scanned); setTotal(tot); },
        (device) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setDevices((prev) => [...prev, device]);
        },
        cancelRef.current
      );
      setSubnet(result.subnet);
    } finally {
      if (!cancelRef.current.cancelled) {
        setScanState("done");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, []);

  const stopScan = useCallback(() => {
    cancelRef.current.cancelled = true;
    setScanState("done");
  }, []);

  const handleClose = useCallback(() => {
    cancelRef.current.cancelled = true;
    setScanState("idle");
    setDevices([]);
    setProgress(0);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((ip: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleClose();
    onSelect(ip);
  }, [handleClose, onSelect]);

  const pct = total > 0 ? progress / total : 0;

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={handleClose}
      backdropComponent={renderBackdrop}
      backgroundComponent={GlassBackground}
      handleComponent={Handle}
    >
      <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Wifi01Icon size={20} color="#007AFF" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text, letterSpacing: -0.3 }}>
              Scan Network
            </Text>
            <Text style={{ fontSize: 12, color: theme.textTertiary, marginTop: 1, fontFamily: subnet ? "monospace" : undefined }}>
              {subnet ? `${subnet}1 – ${subnet}254` : "Finds DrinkPrime devices on your WiFi"}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {(scanState === "scanning" || scanState === "done") && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ height: 4, backgroundColor: theme.fill, borderRadius: 2, overflow: "hidden" }}>
              <MotiView
                animate={{ width: `${Math.round(pct * 100)}%` as any }}
                transition={{ type: "timing", duration: 200 }}
                style={{ height: 4, backgroundColor: scanState === "done" ? "#34C759" : "#007AFF", borderRadius: 2 }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
              <Text style={{ fontSize: 11, color: theme.textTertiary }}>
                {scanState === "scanning" ? `Scanning ${progress}/${total}…` : `Complete · ${progress} checked`}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: devices.length > 0 ? "#007AFF" : theme.textTertiary }}>
                {devices.length} found
              </Text>
            </View>
          </View>
        )}

        {/* Device list */}
        <ScrollView
          style={{ maxHeight: screenHeight * 0.45 }}
          showsVerticalScrollIndicator={false}
        >
          {scanState === "idle" && devices.length === 0 && (
            <GlassView variant="subtle" radius={16} style={{ padding: 24, alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 28 }}>📶</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: "center", lineHeight: 20 }}>
                Tap Scan to search your WiFi network for DrinkPrime purifiers.
              </Text>
            </GlassView>
          )}

          {devices.length === 0 && scanState === "done" && (
            <GlassView variant="subtle" radius={16} style={{ padding: 24, alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 28 }}>📡</Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: theme.text }}>No devices found</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: "center", lineHeight: 18 }}>
                Make sure your phone is on the same WiFi as the purifier.
              </Text>
            </GlassView>
          )}

          {devices.map((device, idx) => (
            <MotiView
              key={device.ip}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "spring", damping: 20, delay: idx * 40 }}
            >
              <TouchableOpacity onPress={() => handleSelect(device.ip)} activeOpacity={0.75}>
                <GlassView radius={14} style={{
                  flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 8,
                  backgroundColor: "rgba(0,122,255,0.07)", borderColor: "rgba(0,122,255,0.2)",
                }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: "rgba(0,122,255,0.15)",
                    alignItems: "center", justifyContent: "center", marginRight: 12,
                  }}>
                    <FingerprintScanIcon size={18} color="#007AFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text, fontFamily: "monospace" }}>
                      {device.ip}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                      {[device.pid && `PID: ${device.pid}`, device.firmware && `FW: ${device.firmware}`]
                        .filter(Boolean).join("  ·  ") || "DrinkPrime device"}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: "#007AFF", fontWeight: "600" }}>Select →</Text>
                </GlassView>
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>

        {/* Footer buttons */}
        <View style={{ flexDirection: "row", gap: 10, paddingTop: 16 }}>
          <TouchableOpacity onPress={handleClose} style={{ flex: 1 }} activeOpacity={0.7}>
            <GlassView variant="subtle" radius={14} style={{ paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: theme.text }}>Cancel</Text>
            </GlassView>
          </TouchableOpacity>

          {scanState === "scanning" ? (
            <TouchableOpacity onPress={stopScan} style={{ flex: 1 }} activeOpacity={0.7}>
              <GlassView radius={14} style={{
                paddingVertical: 14, alignItems: "center", flexDirection: "row",
                justifyContent: "center", gap: 8,
                backgroundColor: "rgba(255,59,48,0.85)", borderColor: "rgba(255,59,48,0.5)",
              }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>Stop</Text>
              </GlassView>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startScan} style={{ flex: 1 }} activeOpacity={0.7}>
              <GlassView radius={14} style={{
                paddingVertical: 14, alignItems: "center",
                backgroundColor: "rgba(0,122,255,0.85)", borderColor: "rgba(0,122,255,0.5)",
              }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>
                  {scanState === "done" ? "Scan Again" : "Scan"}
                </Text>
              </GlassView>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
