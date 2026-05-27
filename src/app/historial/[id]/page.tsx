/* historial/[id]/page.tsx — Reporte de Vuelo con graficas reales */
'use client';

import { use, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faDownload, faClock, faMagnet, faSatelliteDish,
  faCheckCircle, faExclamationTriangle, faCubes, faRocket, faMountain, faRuler,
} from '@fortawesome/free-solid-svg-icons';
import DataCard from '@/components/ui/DataCard';
import MetricDisplay from '@/components/ui/MetricDisplay';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { mockFlights } from '@/lib/mock/data';
/* ── Imports de /borrar/ ── */
import { getDownsampledFieldData, getFlightStats } from '@/borrar/flightSimulator';
import dynamic from 'next/dynamic';

const MagFieldChart = dynamic(() => import('@/borrar/MagFieldChart'), { ssr: false });

function fmtDur(s: number) { const m = Math.floor(s / 60); return m > 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${s % 60}s`; }

export default function FlightReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { id } = use(params);
  const flight = mockFlights.find(f => f.id === id) || mockFlights[0];
  const stats = useMemo(() => getFlightStats(), []);
  const downsampled = useMemo(() => getDownsampledFieldData(1000), []);

  if (!isMounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/historial" className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-[#001F2D] hover:bg-[#001F2D]/5">
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-headline-lg text-[#001F2D] font-bold">Reporte de Proyecto</h1>
          <p className="text-xs sm:text-sm text-[#475569]">ID: {flight.flightCode}</p>
        </div>
        <button 
          className="hmi-btn-secondary"
          onClick={() => {
            if (!downsampled || downsampled.timestamps.length === 0) return alert("No hay datos para exportar.");
            const headers = ['Timestamp', 'Latitud', 'Longitud', 'Campo Total (nT)', 'Eje X (nT)', 'Eje Y (nT)', 'Eje Z (nT)'];
            const rows = downsampled.timestamps.map((ts, i) => [
              new Date(ts).toISOString(),
              '-23.6345',
              '-70.3962',
              downsampled.values[i].toFixed(2),
              downsampled.xValues[i].toFixed(2),
              downsampled.yValues[i].toFixed(2),
              downsampled.zValues[i].toFixed(2)
            ]);
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `GFDAS_export_${flight.flightCode}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" /> Exportar
        </button>
      </div>

      {/* Grafica de componentes (Prioridad de visualización) */}
      <DataCard title="Componentes Vectoriales" icon={faMagnet}>
        <MagFieldChart
          timestamps={downsampled.timestamps}
          values={downsampled.values}
          xValues={downsampled.xValues}
          yValues={downsampled.yValues}
          zValues={downsampled.zValues}
          showTotal={false}
          height={200}
        />
      </DataCard>

      {/* Metadatos */}
      <DataCard title="Metadatos del Proyecto" icon={faRocket}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><span className="text-[11px] font-bold text-[#475569] uppercase block mb-1">Ubicacion</span><p className="text-sm font-bold">{flight.location}</p></div>
          <div><span className="text-[11px] font-bold text-[#475569] uppercase block mb-1">Operador</span><p className="text-sm font-bold">{flight.operator}</p></div>
          <div><span className="text-[11px] font-bold text-[#475569] uppercase block mb-1">Dron</span><p className="text-sm font-bold">{flight.droneId}</p></div>
          <div><span className="text-[11px] font-bold text-[#475569] uppercase block mb-1">Fecha</span><p className="text-sm font-bold">{new Date(flight.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
          <MetricDisplay value={fmtDur(flight.duration)} label="Duracion" icon={faClock} size="md" />
          <MetricDisplay value={stats.totalSamples.toLocaleString('es-CL')} label="Muestras" icon={faCubes} size="md" />
          <MetricDisplay value={String(flight.flightsCount || 1)} label="Vuelos" icon={faRocket} size="md" />
        </div>
        <div className="mt-4 pt-4 border-t border-[#C2C7CC] flex items-center gap-3">
          <StatusIndicator status={flight.status === 'completed' ? 'ok' : 'error'} label={flight.status === 'completed' ? 'Completado' : 'Fallido'} />
          {flight.notes && <span className="text-xs text-[#475569]">{flight.notes}</span>}
        </div>
      </DataCard>

      {/* Sensor con estadisticas reales */}
      <DataCard title="Resumen del Sensor (nT)" icon={faMagnet}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetricDisplay value={stats.mean.toFixed(1)} unit="nT" label="Media" size="lg" />
          <MetricDisplay value={stats.min.toFixed(1)} unit="nT" label="Minimo" size="md" />
          <MetricDisplay value={stats.max.toFixed(1)} unit="nT" label="Maximo" size="md" />
        </div>
        {/* Opcion de total removida segun instruccion, el grafico vectorial queda. Sin embargo, "el grafico vs tiempo esta bien" implica mantener este grafico pero sin el titulo de 'Total'. O bien eliminar el grafico de total. Se elimina el grafico del total y se deja el vectorial. Wait, el que tiene titulo 'vs tiempo' es el de total. Voy a mantener el chart pero le quitare la palabra Total. O quito el chart de Total directamente. Quitare el bloque del grafico Total y la tarjeta Componentes Vectoriales se convertira en el unico grafico vs tiempo. */}
      </DataCard>

      {/* Tarjeta Calidad GPS eliminada por peticion */}

      {/* Logs del sistema */}
      <DataCard title="Registros del Sistema" icon={faClock}>
        <div className="space-y-2">
          {[
            { time: '08:30:00.000', msg: 'Inicio de mision — Vuelo FLT-20231027-A1', level: 'info' },
            { time: '08:30:00.150', msg: 'GPS fix adquirido — RTK Fixed, 14 satelites, HDOP 0.8', level: 'info' },
            { time: '08:30:00.320', msg: 'Sensor Overhauser (MAG-OH-2023-0142): calibracion OK', level: 'info' },
            { time: '08:30:00.500', msg: 'Adquisicion iniciada: 100 SPS, filtro paso-bajo 1.0 Hz', level: 'info' },
            { time: '08:30:15.000', msg: 'Linea 1/10 iniciada — heading 000 deg', level: 'info' },
            { time: '08:31:54.200', msg: 'Linea 2/10 iniciada — heading 180 deg', level: 'info' },
            { time: '08:33:33.400', msg: 'Linea 3/10 iniciada — heading 000 deg', level: 'info' },
            { time: '08:34:10.100', msg: 'Anomalia detectada: +380 nT sobre baseline en (-23.6335, -70.3957)', level: 'warning' },
            { time: '08:35:00.000', msg: `Muestras: ${(stats.totalSamples / 2).toLocaleString('es-CL')} — Bateria: 60%`, level: 'info' },
            { time: '08:35:00.600', msg: 'Linea 5/10 iniciada', level: 'info' },
            { time: '08:37:20.000', msg: 'Anomalia secundaria: -250 nT (posible pipe)', level: 'warning' },
            { time: '08:35:00.000', msg: `Mision completada — ${stats.totalSamples.toLocaleString('es-CL')} muestras recogidas`, level: 'info' },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[#E2E8F0] last:border-0">
              <span className="text-xs font-mono text-[#475569] shrink-0">{log.time}</span>
              <FontAwesomeIcon
                icon={log.level === 'warning' ? faExclamationTriangle : faCheckCircle}
                className={`w-3 h-3 shrink-0 ${log.level === 'warning' ? 'text-amber-500' : 'text-[#A8CF45]'}`}
              />
              <span className={`text-sm ${log.level === 'warning' ? 'text-amber-700 font-bold' : 'text-[#001F2D]'}`}>{log.msg}</span>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
}
