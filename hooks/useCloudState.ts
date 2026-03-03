import { useState, useCallback } from "react";
import { fetchCloudState } from "../lib/api/cloud";
import { CloudNormalized } from "../lib/types";

interface UseCloudStateResult {
  data: CloudNormalized | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCloudState(purifierCode: string): UseCloudStateResult {
  const [data, setData] = useState<CloudNormalized | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!purifierCode) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCloudState(purifierCode);
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch cloud state");
    } finally {
      setLoading(false);
    }
  }, [purifierCode]);

  return { data, loading, error, refresh };
}
