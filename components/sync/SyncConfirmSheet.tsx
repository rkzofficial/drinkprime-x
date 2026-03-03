import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackgroundProps,
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "../../lib/theme";
import { GlassView } from "../ui/GlassView";
import { SyncForm } from "./SyncForm";
import { SyncFormData, HeartbeatNormalized, CloudNormalized } from "../../lib/types";
import { litresToRaw, dateToEpoch, formatDateDisplay } from "../../lib/units";

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

function RawRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.separator }}>
      <Text style={{ fontSize: 14, color: theme.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text, fontFamily: "monospace" }}>{value}</Text>
    </View>
  );
}

function makeDefaultForm(pid?: string, cloudData?: CloudNormalized | null): SyncFormData {
  if (cloudData) {
    return {
      validityDate: cloudData.validity,
      totalLitres: cloudData.allowedLitres,
      dispensedLitres: cloudData.consumedLitres,
      syncClock: true,
      pid: pid ?? "",
    };
  }
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return { validityDate: d, totalLitres: 60, dispensedLitres: 0, syncClock: true, pid: pid ?? "" };
}

interface SyncConfirmSheetProps {
  visible: boolean;
  deviceData?: HeartbeatNormalized | null;
  cloudData?: CloudNormalized | null;
  onConfirm: (form: SyncFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function SyncConfirmSheet({ visible, deviceData, cloudData, onConfirm, onCancel, loading }: SyncConfirmSheetProps) {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["88%"], []);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [form, setForm] = useState<SyncFormData>(() => makeDefaultForm(deviceData?.pid));

  useEffect(() => {
    if (visible) {
      setStep("form");
      setForm(makeDefaultForm(deviceData?.pid, cloudData));
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.35} />
  ), []);

  const rawLitres = litresToRaw(form.totalLitres);
  const rawDispensed = litresToRaw(form.dispensedLitres);
  const rawValidity = dateToEpoch(form.validityDate);
  const rawRtc = Math.floor(Date.now() / 1000);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={!loading}
      onDismiss={onCancel}
      backdropComponent={renderBackdrop}
      backgroundComponent={GlassBackground}
      handleComponent={Handle}
    >
      <BottomSheetView style={{ flex: 1 }}>
        {step === "form" ? (
          <>
            <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text, letterSpacing: -0.3 }}>
                Write to Device
              </Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>
                {deviceData?.pid ? `Device: ${deviceData.pid}` : "Set parameters to write"}
              </Text>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <SyncForm
                form={form}
                onChange={(f) => setForm({ ...f, pid: f.pid || deviceData?.pid || "" })}
                deviceData={deviceData}
                cloudData={cloudData}
              />
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 34 }}>
              <TouchableOpacity onPress={onCancel} style={{ flex: 1 }} activeOpacity={0.7}>
                <GlassView variant="subtle" radius={16} style={{ paddingVertical: 14, alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>Cancel</Text>
                </GlassView>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep("confirm")} style={{ flex: 1 }} activeOpacity={0.7}>
                <GlassView radius={16} style={{ paddingVertical: 14, alignItems: "center", backgroundColor: "rgba(0,122,255,0.85)", borderColor: "rgba(0,122,255,0.5)" }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>Review →</Text>
                </GlassView>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
              <TouchableOpacity onPress={() => setStep("form")} activeOpacity={0.7} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: "#007AFF" }}>← Edit</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text, letterSpacing: -0.3 }}>
                Confirm Write
              </Text>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: theme.textTertiary, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
                What will be set
              </Text>
              <GlassView variant="subtle" radius={16} style={{ padding: 12, marginBottom: 16 }}>
                <RawRow label="Validity" value={formatDateDisplay(form.validityDate)} />
                <RawRow label="Total litres" value={`${form.totalLitres} L`} />
                <RawRow label="Dispensed" value={`${form.dispensedLitres} L`} />
                <RawRow label="PID" value={form.pid || "—"} />
                <RawRow label="Sync clock" value={form.syncClock ? "Yes" : "No"} />
              </GlassView>
              <Text style={{ fontSize: 11, fontWeight: "700", color: theme.textTertiary, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
                Raw params
              </Text>
              <GlassView variant="subtle" radius={16} style={{ padding: 12 }}>
                <RawRow label="t_litres" value={String(rawLitres)} />
                <RawRow label="t_validity" value={String(rawValidity)} />
                <RawRow label="t_dispensed" value={String(rawDispensed)} />
                {form.pid ? <RawRow label="t_PID" value={form.pid} /> : null}
                {form.syncClock ? <RawRow label="t_RTC" value={String(rawRtc)} /> : null}
              </GlassView>
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 34 }}>
              <TouchableOpacity onPress={onCancel} disabled={loading} style={{ flex: 1 }} activeOpacity={0.7}>
                <GlassView variant="subtle" radius={16} style={{ paddingVertical: 14, alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>Cancel</Text>
                </GlassView>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onConfirm(form)} disabled={loading} style={{ flex: 1 }} activeOpacity={0.7}>
                <GlassView radius={16} style={{ paddingVertical: 14, alignItems: "center", backgroundColor: "rgba(0,122,255,0.85)", borderColor: "rgba(0,122,255,0.5)" }}>
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>Write</Text>
                  }
                </GlassView>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
