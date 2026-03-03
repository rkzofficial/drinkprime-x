import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { GlassView } from "../ui/GlassView";
import { useTheme } from "../../lib/theme";
import { Plug01Icon } from "../../lib/icons";

interface PowerStateBadgeProps {
  on: boolean;
}

export function PowerStateBadge({ on }: PowerStateBadgeProps) {
  const theme = useTheme();
  return (
    <GlassView
      variant="hero"
      radius={28}
      style={{
        padding: 20,
        borderColor: on ? "rgba(52,199,89,0.4)" : theme.separator,
        backgroundColor: on ? "rgba(52,199,89,0.14)" : theme.card,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View style={{ width: 60, height: 60, alignItems: "center", justifyContent: "center" }}>
          {on && (
            <MotiView
              from={{ opacity: 0.5, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.7 }}
              transition={{ type: "timing", duration: 1500, loop: true }}
              style={{
                position: "absolute",
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: "rgba(52,199,89,0.35)",
              }}
            />
          )}
          <View style={{
            width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center",
            backgroundColor: on ? "rgba(52,199,89,0.9)" : "rgba(120,120,128,0.4)",
          }}>
            <Plug01Icon size={26} color="#FFFFFF" />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 26, fontWeight: "700", letterSpacing: -0.4,
            color: on ? "#34C759" : theme.text,
          }}>
            {on ? "Online" : "Offline"}
          </Text>
          <Text style={{
            fontSize: 13, marginTop: 2,
            color: on ? "rgba(52,199,89,0.8)" : theme.textSecondary,
          }}>
            {on ? "Purifier is active" : "Purifier is inactive"}
          </Text>
        </View>
      </View>
    </GlassView>
  );
}
