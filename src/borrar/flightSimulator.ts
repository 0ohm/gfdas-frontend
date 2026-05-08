/**
 * borrar/flightSimulator.ts
 * Generador de datos FAKE de un vuelo magnetometrico completo.
 * 100 SPS durante 5 minutos = 30,000 muestras.
 * BORRAR ESTE ARCHIVO CUANDO SE CONECTE EL BACKEND REAL.
 */
import type { TelemetryPoint } from '@/lib/api/telemetry';
import type { Flight } from '@/lib/api/flights';

const SPS = 100;
const DURATION_S = 300;
const TOTAL_SAMPLES = SPS * DURATION_S;
const SURVEY_CENTER_LAT = -23.63450;
const SURVEY_CENTER_LNG = -70.39620;
const SURVEY_SIZE_M = 200;
const LINE_COUNT = 10;
const LINE_SPACING_M = SURVEY_SIZE_M / LINE_COUNT;
const FLIGHT_SPEED_MS = 8.0;
const ALTITUDE_AGL = 40;
const ALTITUDE_MSL = 1240;
const BASE_FIELD_NT = 24200;
const GRADIENT_NS = 0.8;
const METERS_PER_DEG_LAT = 111320;
const METERS_PER_DEG_LNG = Math.cos(SURVEY_CENTER_LAT * Math.PI / 180) * 111320;

function gaussianNoise(mean = 0, stdDev = 1): number {
  const u1 = Math.random(); const u2 = Math.random();
  return mean + stdDev * Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
}

function dipoleMagAnomaly(x: number, y: number, z: number, x0: number, y0: number, depth: number, moment: number): number {
  const dx = x - x0, dy = y - y0, dz = z + depth;
  const r2 = dx * dx + dy * dy + dz * dz;
  const r5 = Math.pow(r2, 2.5);
  if (r5 < 1e-10) return 0;
  return (moment / (4 * Math.PI)) * (2 * dz * dz - dx * dx - dy * dy) / r5;
}

function getSerpentinPosition(sampleIndex: number): { x: number; y: number; heading: number } {
  const time = sampleIndex / SPS;
  const dist = time * FLIGHT_SPEED_MS;
  const turnDist = (Math.PI * LINE_SPACING_M) / 2;
  const totalLineDist = SURVEY_SIZE_M + turnDist;
  
  if (dist >= totalLineDist * LINE_COUNT) {
     const endX = (LINE_COUNT - 1) * LINE_SPACING_M - SURVEY_SIZE_M / 2;
     const endY = ((LINE_COUNT - 1) % 2 === 0) ? SURVEY_SIZE_M / 2 : -SURVEY_SIZE_M / 2;
     return { 
       x: endX + gaussianNoise(0, 0.2), 
       y: endY + gaussianNoise(0, 0.2), 
       heading: ((LINE_COUNT - 1) % 2 === 0) ? 180 : 0 
     };
  }

  const lineIdx = Math.floor(dist / totalLineDist);
  const distInLine = dist % totalLineDist;
  const isEven = lineIdx % 2 === 0;
  
  let x: number, y: number, heading: number;
  
  if (distInLine <= SURVEY_SIZE_M) {
    const progress = distInLine / SURVEY_SIZE_M;
    x = lineIdx * LINE_SPACING_M - SURVEY_SIZE_M / 2;
    y = isEven ? -SURVEY_SIZE_M / 2 + progress * SURVEY_SIZE_M : SURVEY_SIZE_M / 2 - progress * SURVEY_SIZE_M;
    heading = isEven ? 0 : 180;
    
    // Wobble lateral realista por viento cruzado
    x += Math.sin(dist * 0.05) * 0.5 + gaussianNoise(0, 0.2);
    y += gaussianNoise(0, 0.2);
  } else {
    // Giro de U en semicirculo en lugar de cuadrado bloque
    const turnProgress = (distInLine - SURVEY_SIZE_M) / turnDist;
    const R = LINE_SPACING_M / 2;
    const xc = lineIdx * LINE_SPACING_M - SURVEY_SIZE_M / 2 + R;
    
    if (isEven) {
      const yc = SURVEY_SIZE_M / 2;
      x = xc - R * Math.cos(Math.PI * turnProgress);
      y = yc + R * Math.sin(Math.PI * turnProgress);
      heading = turnProgress * 180;
    } else {
      const yc = -SURVEY_SIZE_M / 2;
      x = xc - R * Math.cos(Math.PI * turnProgress);
      y = yc - R * Math.sin(Math.PI * turnProgress);
      heading = 180 + turnProgress * 180;
    }
  }
  return { x, y, heading };
}

let _cachedPoints: TelemetryPoint[] | null = null;

export function getSimulatedFlightData(): TelemetryPoint[] {
  if (_cachedPoints) return _cachedPoints;
  console.log(`[FlightSimulator] Generando ${TOTAL_SAMPLES} muestras a ${SPS} SPS...`);
  const startTime = new Date('2023-10-27T08:30:00Z').getTime();
  const points: TelemetryPoint[] = new Array(TOTAL_SAMPLES);
  const a1 = { x: 50, y: 80, depth: 15, moment: 5e8 };
  const a2 = { x: -100, y: -50, depth: 30, moment: 2e8 };
  const a3 = { x: 120, y: -120, depth: 8, moment: -3e8 };
  let battery = 98;
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const timeMs = startTime + (i / SPS) * 1000;
    const timeS = i / SPS;
    const pos = getSerpentinPosition(i);
    const gradient = GRADIENT_NS * pos.y;
    const d1 = dipoleMagAnomaly(pos.x, pos.y, ALTITUDE_AGL, a1.x, a1.y, a1.depth, a1.moment);
    const d2 = dipoleMagAnomaly(pos.x, pos.y, ALTITUDE_AGL, a2.x, a2.y, a2.depth, a2.moment);
    const d3 = dipoleMagAnomaly(pos.x, pos.y, ALTITUDE_AGL, a3.x, a3.y, a3.depth, a3.moment);
    const thermalDrift = 2.0 * (timeS / DURATION_S);
    const sensorNoise = gaussianNoise(0, 0.3);
    const powerlineNoise = 0.1 * Math.sin(i * 0.628);
    const totalField = BASE_FIELD_NT + gradient + d1 + d2 + d3 + thermalDrift + sensorNoise + powerlineNoise;
    const inc = -30 * Math.PI / 180, dec = -5 * Math.PI / 180;
    const Bz = totalField * Math.sin(inc), Bh = totalField * Math.cos(inc);
    const Bx = Bh * Math.cos(dec) + gaussianNoise(0, 0.2);
    const By = Bh * Math.sin(dec) + gaussianNoise(0, 0.2);
    const lat = SURVEY_CENTER_LAT + pos.y / METERS_PER_DEG_LAT;
    const lng = SURVEY_CENTER_LNG + pos.x / METERS_PER_DEG_LNG;
    battery = Math.max(22, 98 - timeS * 0.25);
    const speed = FLIGHT_SPEED_MS + gaussianNoise(0, 0.15);
    const temp = 22.5 + 1.5 * Math.sin(timeS * 0.002) + gaussianNoise(0, 0.1);
    const humidity = 35 + 3 * Math.sin(timeS * 0.001) + gaussianNoise(0, 0.5);
    const wind = 2.1 + 0.8 * Math.sin(timeS * 0.003) + Math.abs(gaussianNoise(0, 0.2));
    points[i] = {
      timestamp: new Date(timeMs).toISOString(),
      magneticField: { total: totalField, x: Bx, y: By, z: Bz },
      gps: { latitude: lat, longitude: lng, altitude: ALTITUDE_MSL + gaussianNoise(0, 0.3), hdop: 0.7 + Math.abs(gaussianNoise(0, 0.1)), satellites: 13 + Math.floor(Math.random() * 3) },
      drone: { batteryPercent: battery, signalStrength: -38 + gaussianNoise(0, 2), altitude: ALTITUDE_AGL + gaussianNoise(0, 0.5), speed: Math.max(0, speed), heading: pos.heading + gaussianNoise(0, 1) },
      environment: { temperature: temp, humidity, pressure: 1013.25 + gaussianNoise(0, 0.3), windSpeed: wind, windDirection: 175 + gaussianNoise(0, 5) },
      sampleIndex: i,
    };
  }
  console.log(`[FlightSimulator] ${TOTAL_SAMPLES} muestras generadas.`);
  _cachedPoints = points;
  return points;
}

interface DownsampledData {
  timestamps: number[];
  values: number[];
  xValues: number[];
  yValues: number[];
  zValues: number[];
}

let _cachedDown: DownsampledData | null = null;
export function getDownsampledFieldData(targetPoints = 1500): DownsampledData {
  if (_cachedDown && _cachedDown.timestamps.length === targetPoints) return _cachedDown;
  const raw = getSimulatedFlightData();
  const step = Math.max(1, Math.floor(raw.length / targetPoints));
  const timestamps: number[] = [], values: number[] = [], xValues: number[] = [], yValues: number[] = [], zValues: number[] = [];
  for (let i = 0; i < raw.length; i += step) {
    const end = Math.min(i + step, raw.length);
    let sT = 0, sV = 0, sX = 0, sY = 0, sZ = 0;
    const c = end - i;
    for (let j = i; j < end; j++) { sT += new Date(raw[j].timestamp).getTime(); sV += raw[j].magneticField.total; sX += raw[j].magneticField.x; sY += raw[j].magneticField.y; sZ += raw[j].magneticField.z; }
    timestamps.push(sT / c); values.push(sV / c); xValues.push(sX / c); yValues.push(sY / c); zValues.push(sZ / c);
  }
  _cachedDown = { timestamps, values, xValues, yValues, zValues };
  return _cachedDown;
}

interface HeatmapPointCache {
  lat: number;
  lng: number;
  value: number;
  timestamp: string;
}

let _cachedHeatmap: HeatmapPointCache[] | null = null;
export function getHeatmapPoints(everyN = 100): HeatmapPointCache[] {
  if (_cachedHeatmap) return _cachedHeatmap;
  const raw = getSimulatedFlightData();
  const pts: HeatmapPointCache[] = [];
  for (let i = 0; i < raw.length; i += everyN) {
    pts.push({ lat: raw[i].gps.latitude, lng: raw[i].gps.longitude, value: raw[i].magneticField.total, timestamp: raw[i].timestamp });
  }
  _cachedHeatmap = pts;
  return pts;
}

export function getFlightStats() {
  const raw = getSimulatedFlightData();
  let sum = 0, min = Infinity, max = -Infinity;
  for (const p of raw) { sum += p.magneticField.total; if (p.magneticField.total < min) min = p.magneticField.total; if (p.magneticField.total > max) max = p.magneticField.total; }
  const mean = sum / raw.length;
  let ssq = 0; for (const p of raw) ssq += (p.magneticField.total - mean) ** 2;
  return { mean, min, max, stdDev: Math.sqrt(ssq / raw.length), totalSamples: raw.length, sps: SPS, durationS: DURATION_S };
}

export function getSimulatedFlight(): Flight {
  const s = getFlightStats();
  return {
    id: 'flt-001', flightCode: 'FLT-20231027-A1', location: 'Faena Esperanza',
    date: '2023-10-27T08:30:00Z', duration: DURATION_S, samplesCollected: TOTAL_SAMPLES,
    status: 'completed', operator: 'Carlos Mendoza', droneId: 'DRN-MAG-01',
    altitude: ALTITUDE_AGL, lineSpacing: LINE_SPACING_M, area: (SURVEY_SIZE_M ** 2) / 10000,
    notes: `Survey completo, ${SPS} SPS, patron serpentin, ${LINE_COUNT} lineas`,
    gpsQuality: { hdop: 0.8, satelliteCount: 14, fixType: 'RTK' },
    sensorSummary: { mean: Math.round(s.mean * 10) / 10, min: Math.round(s.min * 10) / 10, max: Math.round(s.max * 10) / 10, stdDev: Math.round(s.stdDev * 10) / 10 },
    createdAt: '2023-10-27T08:00:00Z', updatedAt: '2023-10-27T08:35:00Z',
  };
}

export { TOTAL_SAMPLES, SPS, DURATION_S };
