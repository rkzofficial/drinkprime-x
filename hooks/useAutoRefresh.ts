import { useEffect, useRef } from "react";

/**
 * Fires `callback` every `intervalMs` when `enabled` is true.
 * Cancels on disable or unmount.
 */
export function useAutoRefresh(
  callback: () => void,
  intervalMs: number,
  enabled: boolean
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    const id = setInterval(() => callbackRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);
}
