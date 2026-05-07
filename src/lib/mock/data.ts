/* mock/data.ts — Datos mock para desarrollo sin backend */
import type { Flight } from '@/lib/api/flights';
import type { LiveTelemetry, TelemetryPoint } from '@/lib/api/telemetry';
import type { SensorConfig } from '@/lib/api/sensor';
import type { AcquisitionStatus } from '@/lib/api/acquisition';
import type { SystemStatus } from '@/lib/api/system';

/* ─── Vuelos de ejemplo ─── */
export const mockFlights: Flight[] = [
  {
    id: 'flt-001',
    flightCode: 'FLT-20231027-A1',
    location: 'Faena Esperanza',
    date: '2023-10-27T08:30:00Z',
    duration: 720,
    samplesCollected: 1420,
    status: 'completed',
    operator: 'Carlos Mendoza',
    droneId: 'DRN-MAG-01',
    altitude: 40,
    lineSpacing: 25,
    area: 12.5,
    notes: 'Condiciones optimas, viento bajo',
    gpsQuality: { hdop: 0.8, satelliteCount: 14, fixType: 'RTK' },
    sensorSummary: { mean: 48250.3, min: 47890.1, max: 48610.5, stdDev: 85.2 },
    createdAt: '2023-10-27T08:00:00Z',
    updatedAt: '2023-10-27T08:42:00Z',
  },
  {
    id: 'flt-002',
    flightCode: 'FLT-20231026-B2',
    location: 'Sector Norte - Mina Fortuna',
    date: '2023-10-26T14:15:00Z',
    duration: 1080,
    samplesCollected: 2340,
    status: 'completed',
    operator: 'Ana Rodriguez',
    droneId: 'DRN-MAG-01',
    altitude: 35,
    lineSpacing: 20,
    area: 18.3,
    gpsQuality: { hdop: 1.2, satelliteCount: 11, fixType: 'DGPS' },
    sensorSummary: { mean: 49120.7, min: 48500.0, max: 49780.2, stdDev: 145.8 },
    createdAt: '2023-10-26T14:00:00Z',
    updatedAt: '2023-10-26T14:33:00Z',
  },
  {
    id: 'flt-003',
    flightCode: 'FLT-20231025-C1',
    location: 'Quebrada Los Olivos',
    date: '2023-10-25T09:00:00Z',
    duration: 540,
    samplesCollected: 980,
    status: 'completed',
    operator: 'Carlos Mendoza',
    droneId: 'DRN-MAG-02',
    altitude: 50,
    lineSpacing: 30,
    area: 8.7,
    notes: 'Vuelo parcial por viento cruzado',
    gpsQuality: { hdop: 1.5, satelliteCount: 9, fixType: 'autonomous' },
    sensorSummary: { mean: 47800.0, min: 47200.5, max: 48400.8, stdDev: 210.3 },
    createdAt: '2023-10-25T08:45:00Z',
    updatedAt: '2023-10-25T09:09:00Z',
  },
  {
    id: 'flt-004',
    flightCode: 'FLT-20231024-A3',
    location: 'Faena Esperanza',
    date: '2023-10-24T07:45:00Z',
    duration: 900,
    samplesCollected: 1850,
    status: 'completed',
    operator: 'Ana Rodriguez',
    droneId: 'DRN-MAG-01',
    altitude: 40,
    lineSpacing: 25,
    area: 15.2,
    gpsQuality: { hdop: 0.7, satelliteCount: 16, fixType: 'RTK' },
    sensorSummary: { mean: 48100.5, min: 47700.2, max: 48500.9, stdDev: 92.1 },
    createdAt: '2023-10-24T07:30:00Z',
    updatedAt: '2023-10-24T07:45:00Z',
  },
  {
    id: 'flt-005',
    flightCode: 'FLT-20231023-D1',
    location: 'Cerro Colorado',
    date: '2023-10-23T11:00:00Z',
    duration: 0,
    samplesCollected: 0,
    status: 'failed',
    operator: 'Carlos Mendoza',
    droneId: 'DRN-MAG-02',
    altitude: 45,
    lineSpacing: 20,
    area: 0,
    notes: 'Abortado - fallo de GPS',
    gpsQuality: { hdop: 5.0, satelliteCount: 3, fixType: 'autonomous' },
    sensorSummary: { mean: 0, min: 0, max: 0, stdDev: 0 },
    createdAt: '2023-10-23T10:45:00Z',
    updatedAt: '2023-10-23T11:02:00Z',
  },
];

/* ─── Telemetria en vivo ─── */
export const mockLiveTelemetry: LiveTelemetry = {
  isConnected: true,
  isAcquiring: false,
  lastUpdate: new Date().toISOString(),
  current: {
    timestamp: new Date().toISOString(),
    magneticField: { total: 48253.7, x: 22150.3, y: 14820.1, z: 39450.8 },
    gps: { latitude: -23.6345, longitude: -70.3962, altitude: 1240, hdop: 0.8, satellites: 14 },
    drone: { batteryPercent: 78, signalStrength: -42, altitude: 40, speed: 3.2, heading: 135 },
    environment: { temperature: 22.5, humidity: 35, pressure: 1013.25, windSpeed: 2.1, windDirection: 180 },
    sampleIndex: 0,
  },
  sessionStats: {
    samplesCollected: 0,
    elapsedTime: 0,
    dataRate: 10,
    coverage: 0,
  },
};

/* ─── Estado del sistema ─── */
export const mockSystemStatus: SystemStatus = {
  drone: {
    connected: true,
    batteryPercent: 78,
    batteryVoltage: 22.8,
    signalStrength: -42,
    flightMode: 'idle',
    armed: false,
    motorStatus: 'ok',
  },
  gps: {
    connected: true,
    fixType: 'RTK_fixed',
    latitude: -23.6345,
    longitude: -70.3962,
    altitude: 1240,
    hdop: 0.8,
    satellites: 14,
    accuracy: 0.02,
  },
  sensor: {
    connected: true,
    status: 'healthy',
    temperature: 28.3,
    currentReading: 48253.7,
  },
  storage: {
    totalMB: 32768,
    usedMB: 12450,
    freeMB: 20318,
  },
  network: {
    type: 'wifi',
    rssi: -42,
    latency: 15,
  },
  uptime: 14400,
  firmwareVersion: 'v2.4.1',
  lastSync: new Date().toISOString(),
};

/* ─── Configuracion del sensor ─── */
export const mockSensorConfig: SensorConfig = {
  sensorType: 'Overhauser',
  serialNumber: 'MAG-OH-2023-0142',
  firmwareVersion: 'v3.1.0',
  samplingRate: 10,
  sensitivity: 0.01,
  noiseFloor: 0.022,
  dynamicRange: { min: 20000, max: 100000 },
  lastCalibration: '2023-10-20T06:00:00Z',
  calibrationStatus: 'valid',
  autoCompensation: true,
  filterType: 'low_pass',
  filterFrequency: 1.0,
};

/* ─── Estado de adquisicion ─── */
export const mockAcquisitionStatus: AcquisitionStatus = {
  state: 'idle',
  currentFlightId: null,
  startTime: null,
  elapsedTime: 0,
  samplesCollected: 0,
  dataRate: 0,
  storageUsed: 12450,
  storageRemaining: 20318,
  errors: [],
};

/* ─── Generador de puntos de telemetria para graficas ─── */
export function generateTelemetryPoints(count: number): TelemetryPoint[] {
  const baseTime = Date.now() - count * 1000;
  const baseMag = 48200;

  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(baseTime + i * 1000).toISOString(),
    magneticField: {
      total: baseMag + Math.sin(i * 0.05) * 200 + (Math.random() - 0.5) * 50,
      x: 22000 + Math.sin(i * 0.03) * 100 + (Math.random() - 0.5) * 20,
      y: 14800 + Math.cos(i * 0.04) * 80 + (Math.random() - 0.5) * 15,
      z: 39400 + Math.sin(i * 0.02) * 150 + (Math.random() - 0.5) * 30,
    },
    gps: {
      latitude: -23.6345 + i * 0.00001,
      longitude: -70.3962 + Math.sin(i * 0.1) * 0.0001,
      altitude: 1240 + Math.random() * 2,
      hdop: 0.8 + Math.random() * 0.3,
      satellites: 12 + Math.floor(Math.random() * 4),
    },
    drone: {
      batteryPercent: Math.max(20, 100 - i * 0.05),
      signalStrength: -40 - Math.random() * 10,
      altitude: 40 + Math.sin(i * 0.02) * 2,
      speed: 3 + Math.random() * 0.5,
      heading: 135 + Math.sin(i * 0.01) * 5,
    },
    environment: {
      temperature: 22 + Math.sin(i * 0.005) * 3,
      humidity: 35 + Math.random() * 5,
      pressure: 1013 + Math.random() * 2,
      windSpeed: 2 + Math.random() * 1.5,
      windDirection: 180 + Math.random() * 20,
    },
    sampleIndex: i,
  }));
}

/* ─── Generador de datos para mapa de calor ─── */
export function generateHeatmapData(count: number = 200) {
  const centerLat = -23.6345;
  const centerLng = -70.3962;
  const spread = 0.005;

  return Array.from({ length: count }, (_, i) => ({
    lat: centerLat + (Math.random() - 0.5) * spread * 2,
    lng: centerLng + (Math.random() - 0.5) * spread * 2,
    value: 47800 + Math.random() * 800,
    timestamp: new Date(Date.now() - (count - i) * 100).toISOString(),
  }));
}
