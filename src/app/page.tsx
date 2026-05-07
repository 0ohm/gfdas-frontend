/* page.tsx — Panel Principal (Dashboard) */
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faClock,
  faCubes,
  faMagnet,
  faChartLine,
  faSatelliteDish,
  faBatteryThreeQuarters,
  faThermometerHalf,
  faWind,
  faRocket,
  faHistory,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import DataCard from '@/components/ui/DataCard';
import MetricDisplay from '@/components/ui/MetricDisplay';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { mockFlights, mockSystemStatus, mockLiveTelemetry } from '@/lib/mock/data';
/* ── Import de /borrar/ ── */
import { getFlightStats, getSimulatedFlight } from '@/borrar/flightSimulator';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  }
  return `${mins}m ${secs}s`;
}

export default function DashboardPage() {
  const lastFlight = getSimulatedFlight(); // /borrar/ — Usa datos del simulador
  const system = mockSystemStatus;
  const telemetry = mockLiveTelemetry;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-[#001F2D]">Panel Principal</h1>
          <p className="text-body-md text-[#475569] mt-1">
            Sistema Mag-Drone - Resumen de operaciones
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/nuevo-vuelo" className="hmi-btn-primary">
            <FontAwesomeIcon icon={faRocket} className="w-4 h-4" />
            Nuevo Vuelo
          </Link>
          <Link href="/adquisicion" className="hmi-btn-secondary">
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4" />
            Adquisicion
          </Link>
        </div>
      </div>

      {/* Resumen ultimo vuelo */}
      <DataCard title="Resumen del Ultimo Vuelo" icon={faHistory}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#001F2D]/5 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-[#001F2D]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Ubicacion</span>
              <p className="text-body-lg text-[#001F2D] mt-0.5">{lastFlight.location}</p>
              <p className="text-xs text-[#475569] mt-0.5">{lastFlight.flightCode}</p>
            </div>
          </div>
          <MetricDisplay
            value={formatDuration(lastFlight.duration)}
            label="Duracion"
            icon={faClock}
            size="lg"
          />
          <MetricDisplay
            value={lastFlight.samplesCollected}
            label="Muestras Recogidas"
            icon={faCubes}
            size="lg"
          />
        </div>
        <div className="mt-4 pt-4 border-t border-[#C2C7CC] flex flex-wrap items-center gap-4">
          <StatusIndicator
            status={lastFlight.status === 'completed' ? 'ok' : 'warning'}
            label={lastFlight.status === 'completed' ? 'Completado' : lastFlight.status}
          />
          <span className="text-xs text-[#475569]">
            {new Date(lastFlight.date).toLocaleDateString('es-CL', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </span>
          <Link href={`/historial/${lastFlight.id}`} className="ml-auto text-xs font-bold text-[#A8CF45] hover:underline uppercase tracking-wider">
            Ver Reporte Completo
          </Link>
        </div>
      </DataCard>

      {/* Grid de estado del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Sensor */}
        <DataCard title="Sensor Magnetometrico" icon={faMagnet}>
          <MetricDisplay
            value={system.sensor.currentReading.toFixed(1)}
            unit="nT"
            label="Campo Total"
            size="xl"
          />
          <div className="mt-4 flex items-center gap-2">
            <StatusIndicator status={system.sensor.status === 'healthy' ? 'ok' : 'warning'} label={system.sensor.status === 'healthy' ? 'Operativo' : 'Alerta'} size="sm" />
          </div>
        </DataCard>

        {/* GPS */}
        <DataCard title="Posicion GPS" icon={faSatelliteDish}>
          <div className="space-y-2">
            <MetricDisplay value={system.gps.latitude.toFixed(6)} unit="lat" label="Latitud" size="sm" />
            <MetricDisplay value={system.gps.longitude.toFixed(6)} unit="lon" label="Longitud" size="sm" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <StatusIndicator status="ok" label={system.gps.fixType.replace('_', ' ')} size="sm" />
            <span className="text-xs font-bold text-[#475569]">{system.gps.satellites} SAT</span>
          </div>
        </DataCard>

        {/* Dron */}
        <DataCard title="Estado del Dron" icon={faBatteryThreeQuarters}>
          <MetricDisplay
            value={`${system.drone.batteryPercent}%`}
            label="Bateria"
            size="lg"
          />
          <div className="mt-3 space-y-2">
            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${system.drone.batteryPercent}%`,
                  backgroundColor: system.drone.batteryPercent > 50 ? '#A8CF45' : system.drone.batteryPercent > 20 ? '#F59E0B' : '#E6007E'
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span>{system.drone.batteryVoltage.toFixed(1)}V</span>
              <StatusIndicator status="ok" label="Conectado" size="sm" />
            </div>
          </div>
        </DataCard>

        {/* Entorno */}
        <DataCard title="Condiciones Ambientales" icon={faThermometerHalf}>
          <div className="space-y-3">
            <MetricDisplay value={telemetry.current.environment.temperature.toFixed(1)} unit="C" label="Temperatura" size="md" />
            <div className="grid grid-cols-2 gap-2">
              <MetricDisplay value={`${telemetry.current.environment.humidity.toFixed(0)}%`} label="Humedad" size="sm" />
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faWind} className="w-3 h-3 text-[#475569]" />
                <span className="text-xs font-bold text-[#475569]">
                  {telemetry.current.environment.windSpeed.toFixed(1)} m/s
                </span>
              </div>
            </div>
          </div>
        </DataCard>
      </div>

      {/* Vuelos recientes */}
      <DataCard title="Vuelos Recientes" icon={faHistory}
        headerAction={
          <Link href="/historial" className="text-[10px] font-bold text-white/70 hover:text-white uppercase tracking-wider">
            Ver Todo
          </Link>
        }
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="hmi-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Ubicacion</th>
                <th>Fecha</th>
                <th>Duracion</th>
                <th>Muestras</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {mockFlights.slice(0, 5).map((flight) => (
                <tr key={flight.id} className="cursor-pointer">
                  <td>
                    <Link href={`/historial/${flight.id}`} className="font-bold text-[#001F2D] hover:text-[#A8CF45]">
                      {flight.flightCode}
                    </Link>
                  </td>
                  <td className="text-[#475569]">{flight.location}</td>
                  <td className="text-[#475569]">
                    {new Date(flight.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="hmi-metric">{formatDuration(flight.duration)}</td>
                  <td className="hmi-metric">{flight.samplesCollected.toLocaleString('es-CL')}</td>
                  <td>
                    <span className={`hmi-badge ${
                      flight.status === 'completed' ? 'hmi-badge-ok' :
                      flight.status === 'failed' ? 'hmi-badge-critical' :
                      flight.status === 'in_progress' ? 'hmi-badge-warning' :
                      'hmi-badge-neutral'
                    }`}>
                      <FontAwesomeIcon icon={flight.status === 'completed' ? faCheckCircle : faExclamationTriangle} className="w-3 h-3" />
                      {flight.status === 'completed' ? 'OK' : flight.status === 'failed' ? 'FALLO' : flight.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataCard>
    </div>
  );
}
