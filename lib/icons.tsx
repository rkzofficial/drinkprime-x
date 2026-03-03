/**
 * Icon components wrapping @hugeicons/react-native + @hugeicons/core-free-icons.
 * All icon names from the plan are mapped to actual available icons.
 */
import React from "react";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  DashboardCircleIcon as _Dashboard,
  ArrowDataTransferHorizontalIcon as _Sync,
  SlidersHorizontalIcon as _Settings,
  WifiFullSignalIcon as _Wifi,
  WifiCircleIcon as _WifiConnected,
  WifiNoSignalIcon as _WifiDisconnected,
  CalendarSyncIcon as _Calendar,
  RainDropIcon as _Water,
  FilterIcon as _Filter,
  ThermometerIcon as _Thermometer,
  CpuIcon as _Cpu,
  FingerPrintScanIcon as _Fingerprint,
  PlugSocketIcon as _Plug,
  AlertCircleIcon as _Alert,
  CloudUploadIcon as _CloudUpload,
  ArrowReloadHorizontalIcon as _Refresh,
  CheckListIcon as _Check,
} from "@hugeicons/core-free-icons";

export type IconProps = {
  size?: number;
  color?: string;
};

function makeIcon(iconData: unknown) {
  return function Icon({ size = 24, color = "currentColor" }: IconProps) {
    return (
      <HugeiconsIcon
        icon={iconData as Parameters<typeof HugeiconsIcon>[0]["icon"]}
        size={size}
        color={color}
      />
    );
  };
}

export const DashboardSquare01Icon = makeIcon(_Dashboard);
export const ArrowDataTransferHorizontalIcon = makeIcon(_Sync);
export const Settings01Icon = makeIcon(_Settings);
export const Wifi01Icon = makeIcon(_Wifi);
export const WifiConnected01Icon = makeIcon(_WifiConnected);
export const WifiDisconnected01Icon = makeIcon(_WifiDisconnected);
export const CalendarCheck01Icon = makeIcon(_Calendar);
export const WaterIcon = makeIcon(_Water);
export const FilterIcon = makeIcon(_Filter);
export const ThermometerIcon = makeIcon(_Thermometer);
export const Cpu01Icon = makeIcon(_Cpu);
export const FingerprintScanIcon = makeIcon(_Fingerprint);
export const Plug01Icon = makeIcon(_Plug);
export const Alert01Icon = makeIcon(_Alert);
export const CloudUploadIcon = makeIcon(_CloudUpload);
export const RefreshIcon = makeIcon(_Refresh);
export const CheckIcon = makeIcon(_Check);
