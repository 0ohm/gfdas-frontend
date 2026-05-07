/* api/system.ts — Servicio de Estado del Sistema */
import { api, type ApiResponse } from './config';

/* ─── Tipos ─── */
export interface SystemStatus {
  drone: {
    connected: boolean;
    batteryPercent: number;
    batteryVoltage: number;     // Volts
    signalStrength: number;     // dBm
    flightMode: 'manual' | 'auto' | 'rtl' | 'land' | 'idle';
    armed: boolean;
    motorStatus: 'ok' | 'warning' | 'error';
  };
  gps: {
    connected: boolean;
    fixType: 'none' | 'autonomous' | 'DGPS' | 'RTK_float' | 'RTK_fixed';
    latitude: number;
    longitude: number;
    altitude: number;
    hdop: number;
    satellites: number;
    accuracy: number;           // Metros
  };
  sensor: {
    connected: boolean;
    status: 'healthy' | 'warning' | 'error';
    temperature: number;        // Celsius
    currentReading: number;     // nT
  };
  storage: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
  };
  network: {
    type: 'wifi' | 'lora' | 'cellular' | 'usb';
    rssi: number;               // dBm
    latency: number;            // ms
  };
  uptime: number;               // Segundos
  firmwareVersion: string;
  lastSync: string;             // ISO date
}

export interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  heading: number;
  speed: number;
  timestamp: string;
  datum: 'WGS84';
}

/* ─── Metodos ─── */

/**
 * Obtener estado general de todos los subsistemas
 */
export async function getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
  return api.get<SystemStatus>('/system/status');
}

/**
 * Obtener posicion GPS actual con precision WGS84
 */
export async function getGPSPosition(): Promise<ApiResponse<GPSPosition>> {
  return api.get<GPSPosition>('/system/gps');
}

/**
 * Obtener estado detallado del dron
 */
export async function getDroneStatus(): Promise<ApiResponse<SystemStatus['drone']>> {
  return api.get<SystemStatus['drone']>('/system/drone');
}

/**
 * Enviar comando de emergencia al dron
 */
export async function emergencyStop(): Promise<ApiResponse<{ executed: boolean }>> {
  return api.post<{ executed: boolean }>('/system/emergency-stop', {});
}

/**
 * Enviar comando de retorno a casa
 */
export async function returnToHome(): Promise<ApiResponse<{ executed: boolean }>> {
  return api.post<{ executed: boolean }>('/system/rtl', {});
}

/**
 * Obtener logs del sistema
 */
export async function getSystemLogs(
  options?: { level?: 'info' | 'warning' | 'error'; limit?: number }
): Promise<ApiResponse<Array<{
  timestamp: string;
  level: string;
  message: string;
  source: string;
}>>> {
  const params = new URLSearchParams();
  if (options?.level) params.set('level', options.level);
  if (options?.limit) params.set('limit', String(options.limit));
  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get(`/system/logs${query}`);
}
