/* adquisicion/page.tsx — Control de Adquisicion con grafica en vivo */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faPause, faStop, faMagnet, faSatelliteDish,
  faThermometerHalf, faWind, faCubes,
  faClock, faDatabase,
} from '@fortawesome/free-solid-svg-icons';
import DataCard from '@/components/ui/DataCard';
import MetricDisplay from '@/components/ui/MetricDisplay';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { mockLiveTelemetry, mockSystemStatus } from '@/lib/mock/data';
/* ── Import de /borrar/ ── */
import MagFieldChart from '@/borrar/MagFieldChart';

/* Generador de ruido gaussiano para simulacion en vivo */
function gaussNoise(mean = 0, std = 1) {
  const u1 = Math.random(); const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
}

const SPS_LIVE = 100;
const CHART_WINDOW = 500; // Ultimos 500 puntos en pantalla (~5 seg)

export default function AdquisicionPage() {
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [samples, setSamples] = useState(0);
  const [magField, setMagField] = useState(24200.0);
  const [magX, setMagX] = useState(20960.0);
  const [magY, setMagY] = useState(-2110.0);
  const [magZ, setMagZ] = useState(-12100.0);
  const [chartTimestamps, setChartTimestamps] = useState<number[]>([]);
  const [chartValues, setChartValues] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sampleCountRef = useRef(0);
  const system = mockSystemStatus;
  const telemetry = mockLiveTelemetry;

  // Timer de adquisicion: actualiza metricas + grafica
  useEffect(() => {
    if (isAcquiring && !isPaused) {
      timerRef.current = setInterval(() => {
        sampleCountRef.current += SPS_LIVE;
        const t = sampleCountRef.current / SPS_LIVE;

        // Simular lectura realista
        const drift = 2.0 * (t / 300);
        const anomaly = 380 * Math.exp(-((t - 45) ** 2) / 50); // Anomalia a los 45s
        const noise = gaussNoise(0, 0.3);
        const gradient = 0.8 * Math.sin(t * 0.02) * 50;
        const totalField = 24200 + gradient + anomaly + drift + noise;

        const inclination = -30 * Math.PI / 180;
        const declination = -5 * Math.PI / 180;
        const bz = totalField * Math.sin(inclination);
        const bh = totalField * Math.cos(inclination);
        const bx = bh * Math.cos(declination) + gaussNoise(0, 0.2);
        const by = bh * Math.sin(declination) + gaussNoise(0, 0.2);

        setElapsed(Math.floor(t));
        setSamples(sampleCountRef.current);
        setMagField(totalField);
        setMagX(bx);
        setMagY(by);
        setMagZ(bz);

        // Actualizar grafica
        const now = Date.now();
        setChartTimestamps(prev => [...prev.slice(-CHART_WINDOW + 1), now]);
        setChartValues(prev => [...prev.slice(-CHART_WINDOW + 1), totalField]);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAcquiring, isPaused]);

  const handleStart = () => {
    setIsAcquiring(true); setIsPaused(false);
    sampleCountRef.current = 0;
    setElapsed(0); setSamples(0);
    setChartTimestamps([]); setChartValues([]);
    console.log('[Adquisicion] Inicio — 100 SPS');
  };
  const handlePause = () => { setIsPaused(p => !p); console.log('[Adquisicion] Pausa:', !isPaused); };
  const handleStop = () => {
    setIsAcquiring(false); setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    console.log(`[Adquisicion] Stop — ${samples} muestras`);
  };
  const fmtTime = (s: number) => { const m = Math.floor(s / 60); return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-[#001F2D]">Control de Adquisicion</h1>
          <p className="text-body-md text-[#475569]">Monitoreo y control en tiempo real — {SPS_LIVE} SPS</p>
        </div>
        <div className="flex gap-3">
          {!isAcquiring ? (
            <button onClick={handleStart} className="hmi-btn-primary"><FontAwesomeIcon icon={faPlay} className="w-4 h-4" /> Iniciar</button>
          ) : (
            <>
              <button onClick={handlePause} className="hmi-btn-secondary"><FontAwesomeIcon icon={isPaused ? faPlay : faPause} className="w-4 h-4" /> {isPaused ? 'Reanudar' : 'Pausar'}</button>
              <button onClick={handleStop} className="hmi-btn-critical"><FontAwesomeIcon icon={faStop} className="w-4 h-4" /> Detener</button>
            </>
          )}
        </div>
      </div>

      {/* Estado de adquisicion */}
      {isAcquiring && (
        <div className={`p-4 rounded-hmi-md border-2 ${isPaused ? 'border-amber-500 bg-amber-500/5' : 'border-[#A8CF45] bg-[#A8CF45]/5'} flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-[#A8CF45] animate-pulse'}`} />
            <span className="text-sm font-bold text-[#001F2D]">{isPaused ? 'PAUSADO' : 'ADQUIRIENDO DATOS'}</span>
          </div>
          <div className="flex items-center gap-6">
            <MetricDisplay value={fmtTime(elapsed)} label="Tiempo" icon={faClock} size="sm" />
            <MetricDisplay value={samples.toLocaleString('es-CL')} label="Muestras" icon={faCubes} size="sm" />
            <MetricDisplay value={SPS_LIVE.toString()} unit="SPS" label="Data Rate" icon={faDatabase} size="sm" />
          </div>
        </div>
      )}

      {/* Grid telemetria */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <DataCard title="Campo Magnetico Total" icon={faMagnet} className="md:col-span-2 xl:col-span-1">
          <MetricDisplay value={magField.toFixed(1)} unit="nT" label="Intensidad" size="xl" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MetricDisplay value={magX.toFixed(0)} unit="nT" label="Eje X" size="sm" />
            <MetricDisplay value={magY.toFixed(0)} unit="nT" label="Eje Y" size="sm" />
            <MetricDisplay value={magZ.toFixed(0)} unit="nT" label="Eje Z" size="sm" />
          </div>
        </DataCard>

        <DataCard title="Ubicacion (WGS84)" icon={faSatelliteDish}>
          <div className="space-y-2">
            <MetricDisplay value={system.gps.latitude.toFixed(6)} label="Latitud" size="md" />
            <MetricDisplay value={system.gps.longitude.toFixed(6)} label="Longitud" size="md" />
            <MetricDisplay value={`${system.gps.altitude.toFixed(0)}`} unit="m" label="Altitud MSL" size="sm" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <StatusIndicator status="ok" label={system.gps.fixType.replace('_', ' ')} size="sm" />
            <span className="text-xs font-bold text-[#475569]">HDOP: {system.gps.hdop}</span>
          </div>
        </DataCard>

        <DataCard title="Entorno" icon={faThermometerHalf}>
          <div className="space-y-3">
            <MetricDisplay value={telemetry.current.environment.temperature.toFixed(1)} unit="C" label="Temperatura" size="lg" />
            <div className="grid grid-cols-2 gap-3">
              <MetricDisplay value={`${telemetry.current.environment.humidity.toFixed(0)}%`} label="Humedad" size="sm" />
              <MetricDisplay value={telemetry.current.environment.pressure.toFixed(0)} unit="hPa" label="Presion" size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faWind} className="w-3 h-3 text-[#475569]" />
              <span className="text-xs text-[#475569]">{telemetry.current.environment.windSpeed.toFixed(1)} m/s - {telemetry.current.environment.windDirection} deg</span>
            </div>
          </div>
        </DataCard>
      </div>

      {/* Grafica en vivo */}
      <DataCard title="Tendencia de Campo Total (Tiempo Real)" icon={faMagnet}>
        {chartTimestamps.length > 2 ? (
          <MagFieldChart
            timestamps={chartTimestamps}
            values={chartValues}
            height={280}
          />
        ) : (
          <div className="h-[280px] flex items-center justify-center border border-[#C2C7CC] rounded-lg bg-[#F8F9FA]">
            <p className="text-sm text-[#475569]">
              {isAcquiring ? 'Esperando datos...' : 'Presione INICIAR para comenzar la adquisicion'}
            </p>
          </div>
        )}
      </DataCard>
    </div>
  );
}
