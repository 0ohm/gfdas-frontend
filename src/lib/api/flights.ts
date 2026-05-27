/* api/flights.ts — Servicio de Vuelos */
import { api, type ApiResponse, type PaginatedResponse } from './config';

/* ─── Tipos ─── */
export interface Flight {
  id: string;
  flightCode: string;           // e.g., "FLT-20231027-A1"
  location: string;             // Nombre de la faena/ubicacion
  date: string;                 // ISO date
  duration: number;             // Segundos
  samplesCollected: number;
  flightsCount: number;         // Cantidad de vuelos fisicos (baterias) en el proyecto
  status: 'completed' | 'in_progress' | 'failed' | 'pending';
  operator: string;
  droneId: string;
  altitude: number;             // Metros
  lineSpacing: number;          // Metros entre lineas de vuelo
  area: number;                 // Hectareas cubiertas
  notes?: string;
  gpsQuality: {
    hdop: number;
    satelliteCount: number;
    fixType: 'RTK' | 'DGPS' | 'autonomous';
  };
  sensorSummary: {
    mean: number;               // nT
    min: number;
    max: number;
    stdDev: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlightPayload {
  location: string;
  operator: string;
  droneId: string;
  altitude: number;
  lineSpacing: number;
  sensorType: string;
  samplingRate: number;
  notes?: string;
}

export interface FlightFilters {
  page?: number;
  pageSize?: number;
  status?: Flight['status'];
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'duration' | 'samples' | 'location';
  sortOrder?: 'asc' | 'desc';
}

/* ─── Metodos ─── */

/**
 * Obtener lista paginada de vuelos con filtros opcionales
 */
export async function getFlights(
  filters: FlightFilters = {}
): Promise<ApiResponse<PaginatedResponse<Flight>>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get<PaginatedResponse<Flight>>(`/flights${query}`);
}

/**
 * Obtener detalle completo de un vuelo por ID
 */
export async function getFlightById(
  id: string
): Promise<ApiResponse<Flight>> {
  return api.get<Flight>(`/flights/${id}`);
}

/**
 * Registrar un nuevo vuelo (configuracion pre-vuelo)
 */
export async function createFlight(
  data: CreateFlightPayload
): Promise<ApiResponse<Flight>> {
  return api.post<Flight>('/flights', data);
}

/**
 * Eliminar un vuelo y sus datos asociados
 */
export async function deleteFlightById(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return api.delete<{ deleted: boolean }>(`/flights/${id}`);
}

/**
 * Exportar datos de un vuelo (CSV/PDF)
 */
export async function exportFlightData(
  id: string,
  format: 'csv' | 'pdf' = 'csv'
): Promise<ApiResponse<{ downloadUrl: string }>> {
  return api.get<{ downloadUrl: string }>(`/flights/${id}/export?format=${format}`);
}
