/* visor/page.tsx — Visor de Datos operativo con graficos y datos reales */
'use client';

import { useState, useMemo, lazy, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faMap, faDatabase, faDownload, faMagnet,
} from '@fortawesome/free-solid-svg-icons';
import DataCard from '@/components/ui/DataCard';
import MetricDisplay from '@/components/ui/MetricDisplay';
import { mockFlights } from '@/lib/mock/data';
/* ── Imports de /borrar/ (eliminar cuando se conecte API real) ── */
import { getDownsampledFieldData, getHeatmapPoints, getSimulatedFlightData, getFlightStats } from '@/borrar/flightSimulator';
import MagFieldChart from '@/borrar/MagFieldChart';
import CanvasHeatmap from '@/borrar/CanvasHeatmap';
import DataTableView from '@/borrar/DataTableView';

type ViewMode = 'heatmap' | 'chart' | 'table';

export default function VisorPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');
  const [selectedFlight, setSelectedFlight] = useState(mockFlights[0].id);
  const [showComponents, setShowComponents] = useState(false);
  const flight = mockFlights.find(f => f.id === selectedFlight) || mockFlights[0];

  // Datos del simulador (cacheados internamente)
  const stats = useMemo(() => getFlightStats(), []);
  const downsampled = useMemo(() => getDownsampledFieldData(1500), []);
  const heatmapPoints = useMemo(() => getHeatmapPoints(50), []);
  const tableData = useMemo(() => getSimulatedFlightData(), []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-[#001F2D]">Visor de Datos</h1>
          <p className="text-body-md text-[#475569]">
            {stats.totalSamples.toLocaleString('es-CL')} muestras / {stats.sps} SPS / {stats.durationS / 60} min
          </p>
        </div>
        <div className="flex gap-2">
          {(['heatmap', 'chart', 'table'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-hmi-sm text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === mode
                  ? 'bg-[#001F2D] text-white'
                  : 'bg-white border border-[#C2C7CC] text-[#475569] hover:border-[#001F2D]'
              }`}
            >
              <FontAwesomeIcon icon={mode === 'heatmap' ? faMap : mode === 'chart' ? faChartLine : faDatabase} className="w-3.5 h-3.5 mr-1.5" />
              {mode === 'heatmap' ? 'Mapa' : mode === 'chart' ? 'Grafica' : 'Tabla'}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de vuelo */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label htmlFor="select-flight-viewer" className="hmi-label mb-0">Vuelo:</label>
        <select
          id="select-flight-viewer"
          value={selectedFlight}
          onChange={e => setSelectedFlight(e.target.value)}
          className="hmi-select w-auto min-w-[280px]"
        >
          {mockFlights.filter(f => f.status === 'completed').map(f => (
            <option key={f.id} value={f.id}>{f.flightCode} - {f.location}</option>
          ))}
        </select>
        <button className="hmi-btn-secondary ml-auto">
          <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" /> Exportar CSV
        </button>
      </div>

      {/* Resumen rapido con stats reales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="hmi-card py-3">
          <MetricDisplay value={stats.mean.toFixed(1)} unit="nT" label="Campo Medio" size="md" />
        </div>
        <div className="hmi-card py-3">
          <MetricDisplay value={stats.min.toFixed(1)} unit="nT" label="Minimo" size="md" />
        </div>
        <div className="hmi-card py-3">
          <MetricDisplay value={stats.max.toFixed(1)} unit="nT" label="Maximo" size="md" />
        </div>
        <div className="hmi-card py-3">
          <MetricDisplay value={stats.stdDev.toFixed(1)} unit="nT" label="Desv. Est." size="md" />
        </div>
      </div>

      {/* Area de visualizacion principal */}
      {viewMode === 'heatmap' && (
        <>
          <DataCard title="Mapa de Calor Magnetometrico" icon={faMagnet}>
            <CanvasHeatmap points={heatmapPoints} height={500} />
          </DataCard>
          {/* Escala de color */}
          <div className="hmi-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase">Escala de Intensidad (nT)</span>
              <span className="text-[10px] text-[#475569]">{heatmapPoints.length} puntos renderizados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#475569]">{stats.min.toFixed(0)}</span>
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{
                background: 'linear-gradient(to right, #1a237e, #0d47a1, #01579b, #006064, #1b5e20, #33691e, #827717, #f57f17, #e65100, #bf360c, #b71c1c)',
              }} />
              <span className="text-xs font-bold text-[#475569]">{stats.max.toFixed(0)}</span>
            </div>
          </div>
        </>
      )}

      {viewMode === 'chart' && (
        <DataCard title="Campo Magnetico Total vs. Tiempo" icon={faMagnet}
          headerAction={
            <button
              onClick={() => setShowComponents(p => !p)}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                showComponents ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {showComponents ? 'Ocultar XYZ' : 'Mostrar XYZ'}
            </button>
          }
        >
          <MagFieldChart
            timestamps={downsampled.timestamps}
            values={downsampled.values}
            xValues={downsampled.xValues}
            yValues={downsampled.yValues}
            zValues={downsampled.zValues}
            showComponents={showComponents}
            height={500}
          />
        </DataCard>
      )}

      {viewMode === 'table' && (
        <DataCard title="Datos Crudos de Telemetria" icon={faDatabase}>
          <div className="h-[500px]">
            <DataTableView points={tableData} pageSize={50} />
          </div>
        </DataCard>
      )}
    </div>
  );
}
