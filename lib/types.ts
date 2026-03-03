export interface HeartbeatNormalized {
  // Core display fields
  dispensedLitres: number; // disp / 1000
  limitLitres: number; // lim / 1000
  validityDate: Date; // from val epoch seconds
  daysRemaining: number;
  powerState: boolean; // ps
  firmwareVersion: string; // fv
  pid: string;
  outputTds: number; // outTds
  outputTemp: number; // outTmp
  ssid: string;
  isBrevera: boolean;
  // Additional heartbeat fields
  installationId: string; // iid
  deviceType: string; // type
  avgFlowRate: number; // afr
  currentFlowRate: number; // cfr
  flowRate: number; // fr
  timestamp: number; // ts
  reason: number; // reason (offline reason code)
  // Raw data for offlineSync payload construction
  rawDisp: number; // disp (original)
  rawLim: number; // lim (original)
  rawVal: number; // val (original epoch)
}

export interface CloudNormalized {
  validity: Date; // validity YYYY-MM-DD parsed
  validityOnBot: Date; // validity_on_bot
  allowedLitres: number; // allowed_litres — server-authoritative plain litres
  allowedLitresOnBot: number; // allowed_litres_on_bot
  consumedLitres: number; // consumed_liters
  botId: string; // bot_id
  botVendorFlag: number; // bot_vendor_flag (2 = Brevera)
  isNewOfflineFlowEnabled: boolean; // is_new_offline_flow_enable
  daysRemaining: number;
}

export interface AppSettings {
  deviceIp: string;
  syncDeviceClock: boolean; // default true
}

export interface AutoRefreshSettings {
  enabled: boolean;
  intervalSeconds: number;
}

export interface StateMismatch {
  field: string;
  label: string;
  serverValue: string;
  deviceValue: string;
  isCritical: boolean;
}

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface SyncFormData {
  validityDate: Date;
  totalLitres: number; // in plain litres (shown to user)
  dispensedLitres: number; // in plain litres
  syncClock: boolean;
  pid: string;
}
