import { useState, useEffect, useRef } from "react";
import { checkConnected } from "../lib/api/device";
import { ConnectionStatus } from "../lib/types";

export function useConnectionStatus(ip: string, pollMs = 15000) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function probe() {
      if (!ip) {
        if (mounted) setStatus("disconnected");
        return;
      }
      const t0 = Date.now();
      try {
        const ok = await checkConnected(ip);
        if (!mounted) return;
        setStatus(ok ? "connected" : "disconnected");
        if (ok) setLatencyMs(Date.now() - t0);
        else setLatencyMs(null);
      } catch {
        if (mounted) {
          setStatus("disconnected");
          setLatencyMs(null);
        }
      }
    }

    setStatus("connecting");
    probe();
    timerRef.current = setInterval(probe, pollMs);
    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ip, pollMs]);

  return { status, latencyMs };
}
