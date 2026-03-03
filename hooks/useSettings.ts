import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { AppSettings } from "../lib/types";

const SETTINGS_KEY = "drinkprime_settings";

const DEFAULT_SETTINGS: AppSettings = {
  deviceIp: "",
  syncDeviceClock: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await SecureStore.getItemAsync(SETTINGS_KEY);
        if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
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

  return { settings, loaded, saveSettings };
}
