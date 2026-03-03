import { useState, useCallback } from "react";
import { fetchDeviceState } from "../lib/api/device";
import { HeartbeatNormalized } from "../lib/types";

interface UseDeviceStateResult {
  data: HeartbeatNormalized | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDeviceState(ip: string): UseDeviceStateResult {
  const [data, setData] = useState<HeartbeatNormalized | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ip) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDeviceState(ip);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch device state");
    } finally {
      setLoading(false);
    }
  }, [ip]);

  return { data, loading, error, refresh };
}
