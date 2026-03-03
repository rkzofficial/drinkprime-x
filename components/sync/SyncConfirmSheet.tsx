import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackgroundProps,
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "../../lib/theme";
import { GlassView } from "../ui/GlassView";
import { SyncFormData } from "../../lib/types";
import { litresToRaw, dateToEpoch, formatDateDisplay } from "../../lib/units";

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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.separator }}>
      <Text style={{ fontSize: 14, color: theme.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text, fontFamily: mono ? "monospace" : undefined }}>
        {value}
      </Text>
    </View>
  );
}

interface SyncConfirmSheetProps {
  visible: boolean;
  formData: SyncFormData;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function SyncConfirmSheet({ visible, formData, onConfirm, onCancel, loading }: SyncConfirmSheetProps) {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["88%"], []);

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.35} />
  ), []);

  const rawLitres = litresToRaw(formData.totalLitres);
  const rawDispensed = litresToRaw(formData.dispensedLitres);
  const rawValidity = dateToEpoch(formData.validityDate);
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
      <BottomSheetView style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text, letterSpacing: -0.3, marginBottom: 16 }}>
          Confirm Write
        </Text>
      </BottomSheetView>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 11, fontWeight: "700", color: theme.textTertiary, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
          What will be set
        </Text>
        <GlassView variant="subtle" radius={16} style={{ padding: 12, marginBottom: 16 }}>
          <Row label="Validity" value={formatDateDisplay(formData.validityDate)} />
          <Row label="Total litres" value={`${formData.totalLitres} L`} />
          <Row label="Dispensed" value={`${formData.dispensedLitres} L`} />
          <Row label="PID" value={formData.pid || "—"} />
          <Row label="Sync clock" value={formData.syncClock ? "Yes" : "No"} />
        </GlassView>

        <Text style={{ fontSize: 11, fontWeight: "700", color: theme.textTertiary, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
          Raw params
        </Text>
        <GlassView variant="subtle" radius={16} style={{ padding: 12 }}>
          <Row label="t_litres" value={String(rawLitres)} mono />
          <Row label="t_validity" value={String(rawValidity)} mono />
          <Row label="t_dispensed" value={String(rawDispensed)} mono />
          {formData.pid ? <Row label="t_PID" value={formData.pid} mono /> : null}
          {formData.syncClock ? <Row label="t_RTC" value={String(rawRtc)} mono /> : null}
        </GlassView>
      </BottomSheetScrollView>

      <BottomSheetView style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}>
        <TouchableOpacity onPress={onCancel} disabled={loading} style={{ flex: 1 }} activeOpacity={0.7}>
          <GlassView variant="subtle" radius={16} style={{ paddingVertical: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>Cancel</Text>
          </GlassView>
        </TouchableOpacity>
        <TouchableOpacity onPress={onConfirm} disabled={loading} style={{ flex: 1 }} activeOpacity={0.7}>
          <GlassView radius={16} style={{
            paddingVertical: 14, alignItems: "center",
            backgroundColor: "rgba(0,122,255,0.85)", borderColor: "rgba(0,122,255,0.5)",
          }}>
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>Write</Text>
            }
          </GlassView>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
