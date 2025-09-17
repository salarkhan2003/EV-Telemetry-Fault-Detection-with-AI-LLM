export interface TelemetryData {
  battery: {
    voltage: number;
    temperature: number;
    current: number; // Amperes
    soc: number; // State of Charge (%)
  };
  motor: {
    voltage: number;
    temperature: number;
    rpm: number;
    current: number; // Amperes
  };
  vehicle: {
    speed: number; // km/h
  };
  timestamp: number;
}

export enum FaultStatus {
    Healthy = 'HEALTHY',
    Warning = 'WARNING',
    Critical = 'CRITICAL',
}

export interface FaultAnalysis {
  status: FaultStatus;
  analysis: string;
  recommendation: string;
}

export enum ConnectionType {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
}