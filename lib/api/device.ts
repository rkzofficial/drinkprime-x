import { HeartbeatNormalized } from "../types";
import {
  rawToLitres,
  epochToDate,
  daysRemaining,
} from "../units";

const DEVICE_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

/** Probe the device — returns true if reachable. */
export async function checkConnected(ip: string): Promise<boolean> {
  try {
    const res = await withTimeout(
      fetch(`http://${ip}/getHeartbeat`),
      4000
    );
    return res.status < 500;
  } catch {
    return false;
  }
}

/** Fetch /getHeartbeat and normalize. Falls back to /getValidity on failure. */
export async function fetchDeviceState(
  ip: string
): Promise<HeartbeatNormalized> {
  try {
    return await fetchHeartbeat(ip);
  } catch {
    return await fetchValidity(ip);
  }
}

async function fetchHeartbeat(ip: string): Promise<HeartbeatNormalized> {
  const res = await withTimeout(
    fetch(`http://${ip}/getHeartbeat`),
    DEVICE_TIMEOUT_MS
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let raw = await res.json();

  // Brevera model wraps data in { k, v }
  let isBrevera = false;
  if (raw && typeof raw === "object" && "k" in raw && "v" in raw) {
    raw = raw.v;
    isBrevera = true;
  }

  const valEpoch: number = raw.val ?? 0;
  const dispRaw: number = raw.disp ?? 0;
  const limRaw: number = raw.lim ?? 0;
  const validityDate = epochToDate(valEpoch);

  return {
    dispensedLitres: rawToLitres(dispRaw),
    limitLitres: rawToLitres(limRaw),
    validityDate,
    daysRemaining: daysRemaining(validityDate),
    powerState: Boolean(raw.ps),
    firmwareVersion: String(raw.fv ?? ""),
    pid: String(raw.pid ?? ""),
    outputTds: Number(raw.outTds ?? 0),
    outputTemp: Number(raw.outTmp ?? 0),
    ssid: String(raw.ssid ?? ""),
    isBrevera,
    installationId: String(raw.iid ?? ""),
    deviceType: String(raw.type ?? ""),
    avgFlowRate: Number(raw.afr ?? 0),
    currentFlowRate: Number(raw.cfr ?? 0),
    flowRate: Number(raw.fr ?? 0),
    timestamp: Number(raw.ts ?? 0),
    reason: Number(raw.reason ?? 0),
    rawDisp: dispRaw,
    rawLim: limRaw,
    rawVal: valEpoch,
  };
}

async function fetchValidity(ip: string): Promise<HeartbeatNormalized> {
  const res = await withTimeout(
    fetch(`http://${ip}/getValidity`),
    DEVICE_TIMEOUT_MS
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();

  const valEpoch: number = raw.validity ?? 0;
  const dispRaw: number = raw.dispensed ?? 0;
  const limRaw: number = raw.flowLimit ?? 0;
  const validityDate = epochToDate(valEpoch);

  return {
    dispensedLitres: rawToLitres(dispRaw),
    limitLitres: rawToLitres(limRaw),
    validityDate,
    daysRemaining: daysRemaining(validityDate),
    powerState: false,
    firmwareVersion: "",
    pid: "",
    outputTds: 0,
    outputTemp: 0,
    ssid: "",
    isBrevera: false,
    installationId: "",
    deviceType: "legacy",
    avgFlowRate: 0,
    currentFlowRate: 0,
    flowRate: 0,
    timestamp: 0,
    reason: 0,
    rawDisp: dispRaw,
    rawLim: limRaw,
    rawVal: valEpoch,
  };
}

export interface SetupParamsInput {
  ip: string;
  tLitres: number; // raw device units
  tValidity: number; // Unix epoch seconds
  tDispensed?: number; // raw device units
  tPid?: string;
  tRtc?: number; // Unix epoch seconds
}

/** POST /setupParameters — write validity + litres to device. */
export async function setupParameters(params: SetupParamsInput): Promise<void> {
  const { ip, tLitres, tValidity, tDispensed, tPid, tRtc } = params;

  const query = new URLSearchParams({
    t_litres: String(tLitres),
    t_validity: String(tValidity),
  });
  if (tDispensed !== undefined) query.set("t_dispensed", String(tDispensed));
  if (tPid) query.set("t_PID", tPid);
  if (tRtc !== undefined) query.set("t_RTC", String(tRtc));

  const res = await withTimeout(
    fetch(`http://${ip}/setupParameters?${query.toString()}`, {
      method: "POST",
    }),
    DEVICE_TIMEOUT_MS
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`setupParameters failed HTTP ${res.status}: ${body}`);
  }
}
