import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { AppSettings, AutoRefreshSettings } from "../lib/types";

const SETTINGS_KEY = "drinkprime_settings";
const AUTOREFRESH_KEY = "drinkprime_autorefresh";

const DEFAULT_SETTINGS: AppSettings = {
  deviceIp: "192.168.45.1",
  syncDeviceClock: true,
};

const DEFAULT_AUTOREFRESH: AutoRefreshSettings = {
  enabled: false,
  intervalSeconds: 30,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [autoRefresh, setAutoRefresh] =
    useState<AutoRefreshSettings>(DEFAULT_AUTOREFRESH);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([
          SecureStore.getItemAsync(SETTINGS_KEY),
          SecureStore.getItemAsync(AUTOREFRESH_KEY),
        ]);
        if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
        if (a) setAutoRefresh({ ...DEFAULT_AUTOREFRESH, ...JSON.parse(a) });
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const saveSettings = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(next));
  }, []);

  const saveAutoRefresh = useCallback(async (next: AutoRefreshSettings) => {
    setAutoRefresh(next);
    await SecureStore.setItemAsync(AUTOREFRESH_KEY, JSON.stringify(next));
  }, []);

  return { settings, autoRefresh, loaded, saveSettings, saveAutoRefresh };
}
