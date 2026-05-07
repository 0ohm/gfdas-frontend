/* api/sensor.ts — Servicio de Configuracion del Sensor */
import { api, type ApiResponse } from './config';

/* ─── Tipos ─── */
export interface SensorConfig {
  sensorType: string;           // e.g., "Overhauser", "Fluxgate", "Cesium"
  serialNumber: string;
  firmwareVersion: string;
  samplingRate: number;         // Hz
  sensitivity: number;          // nT
  noiseFloor: number;           // pT/√Hz
  dynamicRange: {
    min: number;                // nT
    max: number;                // nT
  };
  lastCalibration: string;      // ISO date
  calibrationStatus: 'valid' | 'expired' | 'never';
  autoCompensation: boolean;
  filterType: 'none' | 'low_pass' | 'band_pass' | 'median';
  filterFrequency: number;      // Hz
}

export interface UpdateSensorPayload {
  samplingRate?: number;
  autoCompensation?: boolean;
  filterType?: SensorConfig['filterType'];
  filterFrequency?: number;
}

export interface CalibrationResult {
  success: boolean;
  timestamp: string;
  baselineValue: number;        // nT
  deviation: number;            // nT
  nextCalibrationDue: string;   // ISO date
  diagnostics: {
    xAxisOk: boolean;
    yAxisOk: boolean;
    zAxisOk: boolean;
    temperatureCompensation: boolean;
  };
}

/* ─── Metodos ─── */

/**
 * Obtener configuracion actual del sensor magnetometrico
 */
export async function getSensorConfig(): Promise<ApiResponse<SensorConfig>> {
  return api.get<SensorConfig>('/sensor/config');
}

/**
 * Actualizar parametros del sensor
 */
export async function updateSensorConfig(
  data: UpdateSensorPayload
): Promise<ApiResponse<SensorConfig>> {
  return api.patch<SensorConfig>('/sensor/config', data);
}

/**
 * Iniciar proceso de calibracion del sensor
 */
export async function calibrateSensor(): Promise<ApiResponse<CalibrationResult>> {
  return api.post<CalibrationResult>('/sensor/calibrate', {});
}

/**
 * Reset de fabrica del sensor (ACCION IRREVERSIBLE)
 */
export async function factoryReset(): Promise<ApiResponse<{ reset: boolean; message: string }>> {
  return api.post<{ reset: boolean; message: string }>('/sensor/factory-reset', {});
}

/**
 * Obtener diagnostico rapido del sensor
 */
export async function getSensorDiagnostics(): Promise<ApiResponse<{
  status: 'healthy' | 'warning' | 'error';
  temperature: number;
  uptime: number;
  errorCount: number;
  lastError?: string;
}>> {
  return api.get('/sensor/diagnostics');
}
