/* api/acquisition.ts — Servicio de Control de Adquisicion */
import { api, type ApiResponse } from './config';

/* ─── Tipos ─── */
export interface AcquisitionStatus {
  state: 'idle' | 'acquiring' | 'paused' | 'error' | 'finalizing';
  currentFlightId: string | null;
  startTime: string | null;
  elapsedTime: number;          // Segundos
  samplesCollected: number;
  dataRate: number;             // Muestras/seg
  storageUsed: number;          // MB
  storageRemaining: number;     // MB
  errors: AcquisitionError[];
}

export interface AcquisitionError {
  timestamp: string;
  code: string;
  message: string;
  severity: 'warning' | 'critical';
}

export interface StartAcquisitionPayload {
  flightId: string;
  samplingRate?: number;
  autoLog?: boolean;
}

/* ─── Metodos ─── */

/**
 * Iniciar adquisicion de datos magnetometricos
 */
export async function startAcquisition(
  payload: StartAcquisitionPayload
): Promise<ApiResponse<AcquisitionStatus>> {
  return api.post<AcquisitionStatus>('/acquisition/start', payload);
}

/**
 * Detener adquisicion activa
 */
export async function stopAcquisition(
  flightId: string
): Promise<ApiResponse<{ stopped: boolean; totalSamples: number; duration: number }>> {
  return api.post<{ stopped: boolean; totalSamples: number; duration: number }>(
    '/acquisition/stop',
    { flightId }
  );
}

/**
 * Pausar adquisicion
 */
export async function pauseAcquisition(
  flightId: string
): Promise<ApiResponse<AcquisitionStatus>> {
  return api.post<AcquisitionStatus>('/acquisition/pause', { flightId });
}

/**
 * Reanudar adquisicion pausada
 */
export async function resumeAcquisition(
  flightId: string
): Promise<ApiResponse<AcquisitionStatus>> {
  return api.post<AcquisitionStatus>('/acquisition/resume', { flightId });
}

/**
 * Obtener estado actual de la adquisicion
 */
export async function getAcquisitionStatus(): Promise<ApiResponse<AcquisitionStatus>> {
  return api.get<AcquisitionStatus>('/acquisition/status');
}
