import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { useSettings } from "../hooks/useSettings";
import { useDeviceState } from "../hooks/useDeviceState";
import { useCloudState } from "../hooks/useCloudState";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { AppSettings, HeartbeatNormalized, CloudNormalized, ConnectionStatus } from "../lib/types";

const AUTO_REFRESH_MS = 30_000;

interface AppContextValue {
  // Settings
  settings: AppSettings;
  settingsLoaded: boolean;
  saveSettings: (s: AppSettings) => Promise<void>;

  // Device
  deviceData: HeartbeatNormalized | null;
  deviceLoading: boolean;
  deviceError: string | null;
  refreshDevice: () => Promise<void>;

  // Cloud
  cloudData: CloudNormalized | null;
  cloudLoading: boolean;
  cloudError: string | null;
  refreshCloud: () => Promise<void>;

  // Connection
  connectionStatus: ConnectionStatus;
  connectionLatencyMs: number | null;

  // Combined refresh
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const { settings, loaded: settingsLoaded, saveSettings } = useSettings();

  const {
    data: deviceData,
    loading: deviceLoading,
    error: deviceError,
    refresh: refreshDevice,
  } = useDeviceState(settings.deviceIp);

  const {
    data: cloudData,
    loading: cloudLoading,
    error: cloudError,
    refresh: refreshCloud,
  } = useCloudState(deviceData?.pid ?? "");

  const { status: connectionStatus, latencyMs: connectionLatencyMs } =
    useConnectionStatus(settings.deviceIp);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshDevice(), refreshCloud()]);
  }, [refreshDevice, refreshCloud]);

  // Initial data load once settings are ready
  useEffect(() => {
    if (settingsLoaded) refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded]);

  // Cloud fetch depends on PID from device — re-fetch when PID first becomes available
  useEffect(() => {
    if (deviceData?.pid) refreshCloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceData?.pid]);

  // Always auto-refresh every 30s
  useAutoRefresh(refreshAll, AUTO_REFRESH_MS, true);

  return (
    <AppContext.Provider
      value={{
        settings,
        settingsLoaded,
        saveSettings,
        deviceData,
        deviceLoading,
        deviceError,
        refreshDevice,
        cloudData,
        cloudLoading,
        cloudError,
        refreshCloud,
        connectionStatus,
        connectionLatencyMs,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppContextProvider");
  return ctx;
}
