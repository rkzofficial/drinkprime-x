import * as Network from "expo-network";

export interface ScannedDevice {
  ip: string;
  pid?: string;
  firmware?: string;
}

async function probeIp(ip: string, timeoutMs: number): Promise<ScannedDevice | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`http://${ip}/getHeartbeat`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    // Brevera devices wrap payload under .v
    const raw: Record<string, unknown> =
      json && typeof json === "object" && "k" in json && "v" in json ? json.v : json;
    return {
      ip,
      pid: typeof raw.pid === "string" ? raw.pid : undefined,
      firmware: typeof raw.fv === "string" ? raw.fv : undefined,
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

async function getSubnet(): Promise<string> {
  try {
    const ip = await Network.getIpAddressAsync();
    if (ip && ip !== "0.0.0.0") {
      const parts = ip.split(".");
      if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.`;
    }
  } catch {}
  return "192.168.1.";
}

export async function scanNetwork(
  onProgress: (scanned: number, total: number) => void,
  onFound: (device: ScannedDevice) => void,
  cancelRef: { cancelled: boolean },
  timeoutMs = 1200
): Promise<{ subnet: string }> {
  const subnet = await getSubnet();
  const TOTAL = 254;
  const BATCH = 25;
  let scanned = 0;

  for (let start = 1; start <= TOTAL; start += BATCH) {
    if (cancelRef.cancelled) break;
    const end = Math.min(start + BATCH - 1, TOTAL);
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    await Promise.all(
      indices.map(async (i) => {
        if (cancelRef.cancelled) return;
        const device = await probeIp(`${subnet}${i}`, timeoutMs);
        scanned++;
        if (!cancelRef.cancelled) {
          onProgress(scanned, TOTAL);
          if (device) onFound(device);
        }
      })
    );
  }

  return { subnet };
}
