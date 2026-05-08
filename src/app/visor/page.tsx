/* visor/page.tsx — Visor de Datos operativo con graficos y datos reales */
'use client';

import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faMap, faDatabase, faDownload, faMagnet,
} from '@fortawesome/free-solid-svg-icons';
import DataCard from '@/components/ui/DataCard';
import MetricDisplay from '@/components/ui/MetricDisplay';
import { mockFlights } from '@/lib/mock/data';
/* ── Imports de /borrar/ (eliminar cuando se conecte API real) ── */
import { getDownsampledFieldData, getHeatmapPoints, getSimulatedFlightData, getFlightStats } from '@/borrar/flightSimulator';
import dynamic from 'next/dynamic';

const MagFieldChart = dynamic(() => import('@/borrar/MagFieldChart'), { ssr: false });
import CanvasHeatmap from '@/borrar/CanvasHeatmap';
import DataTableView from '@/borrar/DataTableView';

type ViewMode = 'heatmap' | 'chart' | 'table';

export default function VisorPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');
  const [selectedFlight, setSelectedFlight] = useState(mockFlights[0].id);
  const [showComponents, setShowComponents] = useState(false);
  const flight = mockFlights.find(f => f.id === selectedFlight) || mockFlights[0];

  // Datos del simulador (cacheados internamente)
  const stats = useMemo(() => getFlightStats(), []);
  const downsampled = useMemo(() => getDownsampledFieldData(1500), []);
  const heatmapPoints = useMemo(() => getHeatmapPoints(50), []);
  const tableData = useMemo(() => getSimulatedFlightData(), []);

  if (!isMounted) return null;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-headline-lg text-[#001F2D] font-bold">Visor de Datos</h1>
          <p className="text-xs sm:text-sm text-[#475569]">
            {stats.totalSamples.toLocaleString('es-CL')} muestras / {stats.sps} SPS / {stats.durationS / 60} min
          </p>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          {(['heatmap', 'chart', 'table'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-hmi-sm text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === mode
                  ? 'bg-[#001F2D] text-white'
                  : 'bg-white border border-[#C2C7CC] text-[#475569] hover:border-[#001F2D]'
              }`}
            >
              <FontAwesomeIcon icon={mode === 'heatmap' ? faMap : mode === 'chart' ? faChartLine : faDatabase} className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
              {mode === 'heatmap' ? 'Mapa' : mode === 'chart' ? 'Grafica' : 'Tabla'}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de vuelo */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <label htmlFor="select-flight-viewer" className="hmi-label mb-0 text-xs sm:text-sm shrink-0">Vuelo:</label>
        <select
          id="select-flight-viewer"
          value={selectedFlight}
          onChange={e => setSelectedFlight(e.target.value)}
          className="hmi-select w-full sm:w-auto sm:min-w-[280px] sm:flex-1 lg:flex-none"
        >
          {mockFlights.filter(f => f.status === 'completed').map(f => (
            <option key={f.id} value={f.id}>{f.flightCode} - {f.location}</option>
          ))}
        </select>
        <button 
          className="hmi-btn-secondary w-full sm:w-auto sm:ml-auto"
          onClick={() => {
            if (!tableData || tableData.length === 0) return alert("No hay datos para exportar.");
            const headers = ['Timestamp', 'Latitud', 'Longitud', 'Altitud (m)', 'Campo Total (nT)', 'Eje X (nT)', 'Eje Y (nT)', 'Eje Z (nT)'];
            const rows = tableData.map(p => [
              new Date(p.timestamp).toISOString(),
              p.gps.latitude.toFixed(6),
              p.gps.longitude.toFixed(6),
              p.gps.altitude.toFixed(2),
              p.magneticField.total.toFixed(2),
              p.magneticField.x.toFixed(2),
              p.magneticField.y.toFixed(2),
              p.magneticField.z.toFixed(2)
            ]);
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `GFDAS_${selectedFlight}_export.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
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
            <CanvasHeatmap points={heatmapPoints || []} height={400} />
          </DataCard>
          {/* Escala de color */}
          <div className="hmi-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase">Escala de Intensidad (nT)</span>
              <span className="text-[10px] text-[#475569]">{(heatmapPoints || []).length} puntos renderizados</span>
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
        <DataCard title="Campo Magnetico Triaxial vs. Tiempo" icon={faMagnet}
          headerAction={
            <button
              onClick={() => setShowComponents(p => !p)}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                showComponents ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {showComponents ? 'Ocultar Total' : 'Mostrar Total'}
            </button>
          }
        >
          <MagFieldChart
            timestamps={downsampled.timestamps}
            values={downsampled.values}
            xValues={downsampled.xValues}
            yValues={downsampled.yValues}
            zValues={downsampled.zValues}
            showTotal={showComponents}
            height={350}
          />
        </DataCard>
      )}

      {viewMode === 'table' && (
        <DataCard title="Datos Crudos de Telemetria" icon={faDatabase}>
          <div className="h-[400px] sm:h-[500px]">
            <DataTableView points={tableData} pageSize={50} />
          </div>
        </DataCard>
      )}
    </div>
  );
}
