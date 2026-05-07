/* api/telemetry.ts — Servicio de Telemetria */
import { api, type ApiResponse } from './config';

/* ─── Tipos ─── */
export interface TelemetryPoint {
  timestamp: string;
  magneticField: {
    total: number;          // nT (nanoteslas)
    x: number;
    y: number;
    z: number;
  };
  gps: {
    latitude: number;
    longitude: number;
    altitude: number;       // Metros sobre el nivel del mar
    hdop: number;
    satellites: number;
  };
  drone: {
    batteryPercent: number;
    signalStrength: number; // dBm
    altitude: number;       // Metros AGL
    speed: number;          // m/s
    heading: number;        // Grados
  };
  environment: {
    temperature: number;    // Celsius
    humidity: number;       // Porcentaje
    pressure: number;       // hPa
    windSpeed: number;      // m/s
    windDirection: number;  // Grados
  };
  sampleIndex: number;
}

export interface LiveTelemetry {
  isConnected: boolean;
  isAcquiring: boolean;
  lastUpdate: string;
  current: TelemetryPoint;
  sessionStats: {
    samplesCollected: number;
    elapsedTime: number;    // Segundos
    dataRate: number;       // Muestras/segundo
    coverage: number;       // Porcentaje del area cubierta
  };
}

export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  value: number;            // Intensidad magnetica en nT
  timestamp: string;
}

export interface TelemetryHistory {
  flightId: string;
  points: TelemetryPoint[];
  totalPoints: number;
  startTime: string;
  endTime: string;
}

/* ─── Metodos ─── */

/**
 * Obtener telemetria en tiempo real (polling).
 * En produccion se reemplazaria por WebSocket.
 */
export async function getLiveTelemetry(): Promise<ApiResponse<LiveTelemetry>> {
  return api.get<LiveTelemetry>('/telemetry/live');
}

/**
 * Obtener historico de telemetria de un vuelo especifico
 */
export async function getTelemetryByFlightId(
  flightId: string,
  options?: { downsample?: number; startTime?: string; endTime?: string }
): Promise<ApiResponse<TelemetryHistory>> {
  const params = new URLSearchParams();
  if (options?.downsample) params.set('downsample', String(options.downsample));
  if (options?.startTime) params.set('startTime', options.startTime);
  if (options?.endTime) params.set('endTime', options.endTime);
  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get<TelemetryHistory>(`/telemetry/flights/${flightId}${query}`);
}

/**
 * Obtener datos para mapa de calor magnetometrico
 */
export async function getHeatmapData(
  flightId: string,
  resolution?: number
): Promise<ApiResponse<HeatmapDataPoint[]>> {
  const query = resolution ? `?resolution=${resolution}` : '';
  return api.get<HeatmapDataPoint[]>(`/telemetry/flights/${flightId}/heatmap${query}`);
}

/**
 * Obtener tendencia de campo total (serie temporal reducida)
 */
export async function getFieldTrend(
  flightId: string,
  windowSize: number = 60
): Promise<ApiResponse<{ timestamps: string[]; values: number[] }>> {
  return api.get<{ timestamps: string[]; values: number[] }>(
    `/telemetry/flights/${flightId}/field-trend?window=${windowSize}`
  );
}
