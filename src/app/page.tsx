/* page.tsx — Panel Principal (Dashboard) */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faClock,
  faCubes,
  faMagnet,
  faChartLine,
  faSatelliteDish,
  faThermometerHalf,
  faWind,
  faRocket,
  faHistory,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
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
  const router = useRouter();
  const lastFlight = getSimulatedFlight(); // /borrar/ — Usa datos del simulador
  const telemetry = mockLiveTelemetry;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ operator: '', site: '', notes: '', duration: '60' });

  const handleStartFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.operator || !form.site) return alert('Operador y Faena son obligatorios.');

    // Guardamos la info en algun estado global/sessionStorage si fuera necesario
    // Por ahora solo redirigimos a la vista de adquisicion
    router.push('/adquisicion');
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-headline-lg text-[#001F2D] font-bold">Panel Principal</h1>
            <p className="text-xs sm:text-sm text-[#475569] mt-1">
              DAX - Resumen de operaciones
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(true)} className="hmi-btn-primary">
              <FontAwesomeIcon icon={faRocket} className="w-4 h-4" />
              Nuevo Vuelo
            </button>
          </div>
        </div>

        {/* Resumen ultimo vuelo */}
        <DataCard title="Resumen del Ultimo Vuelo" icon={faHistory}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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

        {/* Ocultamos temporalmente el grid completo de estado ya que GPS, Bateria y Sensor estan en el header, y entorno esta en adquisicion */}

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
                      <span className={`hmi-badge ${flight.status === 'completed' ? 'hmi-badge-ok' :
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

      {/* Modal Nuevo Vuelo */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-[#001F2D]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-hmi-md shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in">
            <div className="bg-[#001F2D] p-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <FontAwesomeIcon icon={faRocket} className="text-[#A8CF45]" />
                Configurar Nuevo Vuelo
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">
                <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStartFlight} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="hmi-label">Operador *</label>
                  <input
                    type="text"
                    required
                    className="hmi-input w-full"
                    placeholder="Ej. Juan Perez"
                    value={form.operator}
                    onChange={(e) => setForm({ ...form, operator: e.target.value })}
                  />
                </div>
                <div>
                  <label className="hmi-label">Faena / Sitio *</label>
                  <input
                    type="text"
                    required
                    className="hmi-input w-full"
                    placeholder="Ej. Sector Norte B"
                    value={form.site}
                    onChange={(e) => setForm({ ...form, site: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="hmi-label">Notas Adicionales</label>
                <input
                  type="text"
                  className="hmi-input w-full"
                  placeholder="Ej. Clima despejado, viento leve"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="hmi-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="hmi-btn-primary">
                  Comenzar Adquisición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
