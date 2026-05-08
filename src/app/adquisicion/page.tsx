/* adquisicion/page.tsx — Control de Adquisicion con grafica en vivo y maquina de estados */
'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faPause, faStop, faMagnet, faSatelliteDish,
  faThermometerHalf, faWind, faCubes,
  faClock, faDatabase, faSpinner, faCheck, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import DataCard from '@/components/ui/DataCard';
import MetricDisplay from '@/components/ui/MetricDisplay';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { useRouter } from 'next/navigation';
import { mockLiveTelemetry, mockSystemStatus } from '@/lib/mock/data';
import dynamic from 'next/dynamic';

const MagFieldChart = dynamic(() => import('@/borrar/MagFieldChart'), { ssr: false });

function gaussNoise(mean = 0, std = 1) {
  const u1 = Math.random(); const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
}

const SPS_LIVE = 100;
const CHART_WINDOW = 500;

type AcqState = 'idle' | 'waiting_gps' | 'ready' | 'acquiring' | 'stopped' | 'error';

export default function AdquisicionPage() {
  const router = useRouter();
  // Inicia automaticamente la adquisicion apenas entramos a la vista
  const [acqState, setAcqState] = useState<AcqState>('acquiring');
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [samples, setSamples] = useState(0);
  const [magField, setMagField] = useState(24200.0);
  const [magX, setMagX] = useState(20960.0);
  const [magY, setMagY] = useState(-2110.0);
  const [magZ, setMagZ] = useState(-12100.0);
  
  const [chartTimestamps, setChartTimestamps] = useState<number[]>([]);
  const [chartValues, setChartValues] = useState<number[]>([]);
  const [chartXValues, setChartXValues] = useState<number[]>([]);
  const [chartYValues, setChartYValues] = useState<number[]>([]);
  const [chartZValues, setChartZValues] = useState<number[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sampleCountRef = useRef(0);
  const system = mockSystemStatus;
  const telemetry = mockLiveTelemetry;

  // Usa "any" en lugar de importar el tipo explícitamente si es necesario para evitar errores TS, pero es mejor usar el mock
  const [currentPt, setCurrentPt] = useState<any>(null);

  // El formulario ya no es necesario acá, se llena en el Modal del Dashboard

  // Simulacion de espera de GPS (removida para auto-iniciar)

  // Timer de adquisicion
  useEffect(() => {
    let isActive = true;

    if (acqState === 'acquiring' && !isPaused) {
      import('@/borrar/flightSimulator').then(({ getSimulatedFlightData }) => {
        if (!isActive) return; // Evitar crear un timer si el usuario ya detuvo la adquisicion mientras cargaba

        const points = getSimulatedFlightData();
        timerRef.current = setInterval(() => {
          // Si es cada 0.5s, avanzamos la mitad de muestras por segundo de la tasa SPS_LIVE
          sampleCountRef.current += Math.floor(SPS_LIVE / 2) || 1; 
          const idx = Math.min(sampleCountRef.current, points.length - 1);
          const pt = points[idx];

          setElapsed(Math.floor(idx / SPS_LIVE));
          setSamples(idx);
          
          if (pt) {
            setCurrentPt(pt);
            setMagField(pt.magneticField.total);
            setMagX(pt.magneticField.x);
            setMagY(pt.magneticField.y);
            setMagZ(pt.magneticField.z);

            const now = Date.now();
            setChartTimestamps(prev => [...prev.slice(-CHART_WINDOW + 1), now]);
            setChartValues(prev => [...prev.slice(-CHART_WINDOW + 1), pt.magneticField.total]);
            setChartXValues(prev => [...prev.slice(-CHART_WINDOW + 1), pt.magneticField.x]);
            setChartYValues(prev => [...prev.slice(-CHART_WINDOW + 1), pt.magneticField.y]);
            setChartZValues(prev => [...prev.slice(-CHART_WINDOW + 1), pt.magneticField.z]);
          }

          if (idx >= points.length - 1) {
             setAcqState('stopped'); // Finalizar si llegamos al tope
          }
        }, 500); // Se actualiza cada 0.5 segundos (500ms) como lo pediste
      });
    }

    return () => { 
      isActive = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [acqState, isPaused]);



  const handleStart = () => {
    setAcqState('acquiring'); setIsPaused(false);
    sampleCountRef.current = 0;
    setElapsed(0); setSamples(0);
    setChartTimestamps([]); setChartValues([]);
    setChartXValues([]); setChartYValues([]); setChartZValues([]);
  };

  const handleStop = () => {
    setAcqState('stopped'); setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const fmtTime = (s: number) => { const m = Math.floor(s / 60); return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-headline-lg text-[#001F2D] font-bold">Control de Adquisición</h1>
          <p className="text-xs sm:text-sm text-[#475569]">Monitoreo y control en tiempo real — {SPS_LIVE} SPS</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {acqState === 'idle' && (
             <span className="text-xs font-bold text-[#475569] uppercase bg-white px-3 py-1 rounded shadow-sm border border-[#C2C7CC]">Esperando config...</span>
          )}
          {acqState === 'waiting_gps' && (
            <button disabled className="hmi-btn-primary opacity-50 cursor-not-allowed">
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" /> Esperando GPS...
            </button>
          )}
          {acqState === 'ready' && (
            <button onClick={handleStart} className="hmi-btn-primary">
              <FontAwesomeIcon icon={faPlay} className="w-4 h-4" /> Iniciar Vuelo
            </button>
          )}
          {acqState === 'acquiring' && (
            <>
              <button onClick={() => setIsPaused(!isPaused)} className="hmi-btn-secondary"><FontAwesomeIcon icon={isPaused ? faPlay : faPause} className="w-4 h-4" /> {isPaused ? 'Reanudar' : 'Pausar'}</button>
              <button onClick={handleStop} className="hmi-btn-critical"><FontAwesomeIcon icon={faStop} className="w-4 h-4" /> Detener</button>
            </>
          )}
          {acqState === 'stopped' && (
            <button onClick={() => router.push('/')} className="hmi-btn-secondary">
              <FontAwesomeIcon icon={faPlay} className="w-4 h-4" /> Volver al Inicio
            </button>
          )}
        </div>
      </div>


      {/* Estado de adquisicion visual */}
      {(acqState === 'acquiring' || acqState === 'stopped') && (
        <div className={`p-4 rounded-hmi-md border-2 ${acqState === 'stopped' ? 'border-[#475569] bg-[#475569]/5' : (isPaused ? 'border-amber-500 bg-amber-500/5' : 'border-[#A8CF45] bg-[#A8CF45]/5')} flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${acqState === 'stopped' ? 'bg-[#475569]' : (isPaused ? 'bg-amber-500' : 'bg-[#A8CF45] animate-pulse')}`} />
            <span className="text-sm font-bold text-[#001F2D]">
              {acqState === 'stopped' ? 'VUELO FINALIZADO' : (isPaused ? 'PAUSADO' : 'ADQUIRIENDO DATOS')}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <MetricDisplay value={fmtTime(elapsed)} label="Tiempo" icon={faClock} size="sm" />
            <MetricDisplay value={samples.toLocaleString('es-CL')} label="Muestras" icon={faCubes} size="sm" />
            <MetricDisplay value={SPS_LIVE.toString()} unit="SPS" label="Data Rate" icon={faDatabase} size="sm" />
          </div>
        </div>
      )}

      {/* Grid telemetria, solo visible si no estamos en idle */}
      {acqState !== 'idle' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <DataCard title="Campo Magnetico Total" icon={faMagnet} className="sm:col-span-2 xl:col-span-1">
            <MetricDisplay value={magField.toFixed(1)} unit="nT" label="Intensidad" size="xl" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <MetricDisplay value={magX.toFixed(0)} unit="nT" label="Eje X" size="sm" />
              <MetricDisplay value={magY.toFixed(0)} unit="nT" label="Eje Y" size="sm" />
              <MetricDisplay value={magZ.toFixed(0)} unit="nT" label="Eje Z" size="sm" />
            </div>
          </DataCard>

          <DataCard title="Ubicacion (WGS84)" icon={faSatelliteDish}>
            <div className="space-y-2">
              <MetricDisplay value={currentPt?.gps?.latitude?.toFixed(6) ?? system.gps.latitude.toFixed(6)} label="Latitud" size="md" />
              <MetricDisplay value={currentPt?.gps?.longitude?.toFixed(6) ?? system.gps.longitude.toFixed(6)} label="Longitud" size="md" />
              <MetricDisplay value={`${currentPt?.gps?.altitude?.toFixed(0) ?? system.gps.altitude.toFixed(0)}`} unit="m" label="Altitud MSL" size="sm" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <StatusIndicator status="ok" label={system.gps.fixType.replace('_', ' ')} size="sm" />
              <span className="text-xs font-bold text-[#475569]">
                Sats: {currentPt?.gps?.satellites ?? 12} | HDOP: {currentPt?.gps?.hdop?.toFixed(1) ?? system.gps.hdop}
              </span>
            </div>
          </DataCard>

          <DataCard title="Entorno" icon={faThermometerHalf}>
            <div className="space-y-3">
              <MetricDisplay value={currentPt?.environment?.temperature?.toFixed(1) ?? telemetry.current.environment.temperature.toFixed(1)} unit="C" label="Temperatura" size="lg" />
              <div className="grid grid-cols-2 gap-3">
                <MetricDisplay value={`${currentPt?.environment?.humidity?.toFixed(0) ?? telemetry.current.environment.humidity.toFixed(0)}%`} label="Humedad" size="sm" />
                <MetricDisplay value={currentPt?.environment?.pressure?.toFixed(0) ?? telemetry.current.environment.pressure.toFixed(0)} unit="hPa" label="Presion" size="sm" />
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWind} className="w-3 h-3 text-[#475569]" />
                <span className="text-xs text-[#475569]">
                  {currentPt?.environment?.windSpeed?.toFixed(1) ?? telemetry.current.environment.windSpeed.toFixed(1)} m/s - {currentPt?.environment?.windDirection?.toFixed(0) ?? telemetry.current.environment.windDirection} deg
                </span>
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {/* Grafica en vivo */}
      {acqState !== 'idle' && (
        <DataCard title="Tendencia de Campo Triaxial (Tiempo Real)" icon={faMagnet}>
          {chartTimestamps.length > 2 ? (
            <MagFieldChart
              timestamps={chartTimestamps}
              values={chartValues}
              xValues={chartXValues}
              yValues={chartYValues}
              zValues={chartZValues}
              showTotal={true}
              height={280}
            />
          ) : (
            <div className="h-[280px] flex items-center justify-center border border-[#C2C7CC] rounded-lg bg-[#F8F9FA]">
              <p className="text-sm text-[#475569]">
                {acqState === 'acquiring' ? 'Esperando datos...' : 'Presione INICIAR VUELO para comenzar'}
              </p>
            </div>
          )}
        </DataCard>
      )}
    </div>
  );
}
