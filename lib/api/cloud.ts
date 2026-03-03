import { CloudNormalized } from "../types";
import { parseDateString, daysRemaining } from "../units";

const BASE_URL = "https://api.drinkprime.in/";

const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "User-Agent": "okhttp/4.9.3",
};

/** GET /sponsor/device/details/consumption?deviceCode=X */
export async function fetchCloudState(
  deviceCode: string
): Promise<CloudNormalized> {
  const url = `${BASE_URL}sponsor/device/details/consumption?deviceCode=${encodeURIComponent(deviceCode)}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Cloud API ${res.status}: ${body}`);
  }
  const json = await res.json();
  const body = json?.body ?? json;

  const validity = parseDateString(body.validity ?? "1970-01-01");
  const validityOnBot = parseDateString(body.validity_on_bot ?? "1970-01-01");

  return {
    validity,
    validityOnBot,
    allowedLitres: Number(body.allowed_litres ?? 0),
    allowedLitresOnBot: Number(body.allowed_litres_on_bot ?? 0),
    consumedLitres: Number(body.consumed_liters ?? 0),
    botId: String(body.bot_id ?? ""),
    botVendorFlag: Number(body.bot_vendor_flag ?? 0),
    isNewOfflineFlowEnabled: Boolean(body.is_new_offline_flow_enable),
    daysRemaining: daysRemaining(validity),
  };
}

export interface OfflineSyncPayload {
  deviceCode: string;
  validity: string; // YYYY-MM-DD
  totalLitres: number; // plain litres
  consumedLitres: number; // plain litres
  outputTDS?: number;
  firmwareVersion?: string;
  ssid?: string;
  connectivity?: string;
  syncFrom?: string;
  reason?: number;
}

/** POST /sponsor/device/details/offlineSync */
export async function postOfflineSync(
  payload: OfflineSyncPayload
): Promise<{ success: boolean; body?: string }> {
  const fullPayload = {
    connectivity: "BLE",
    syncFrom: "app",
    reason: 0,
    ...payload,
  };
  const res = await fetch(`${BASE_URL}sponsor/device/details/offlineSync`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(fullPayload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`offlineSync failed HTTP ${res.status}: ${body}`);
  }
  return await res.json();
}
