/**
 * borrar/DataTableView.tsx
 * Tabla paginada de telemetria.
 * BORRAR CUANDO SE CONECTE EL BACKEND REAL.
 */
'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { TelemetryPoint } from '@/lib/api/telemetry';

interface DataTableViewProps { points: TelemetryPoint[]; pageSize?: number; }

export default function DataTableView({ points, pageSize = 50 }: DataTableViewProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(points.length / pageSize);
  const pageData = useMemo(() => points.slice(page * pageSize, (page + 1) * pageSize), [points, page, pageSize]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-bold text-[#475569] uppercase">{points.length.toLocaleString('es-CL')} muestras totales</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="w-8 h-8 flex items-center justify-center rounded border border-[#C2C7CC] hover:bg-[#F8F9FA] disabled:opacity-30">
            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
          </button>
          <span className="text-xs font-bold text-[#001F2D] min-w-[80px] text-center">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="w-8 h-8 flex items-center justify-center rounded border border-[#C2C7CC] hover:bg-[#F8F9FA] disabled:opacity-30">
            <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto border border-[#C2C7CC] rounded-lg">
        <table className="hmi-table text-[11px]">
          <thead>
            <tr><th>#</th><th>Tiempo</th><th>B Total (nT)</th><th>Bx</th><th>By</th><th>Bz</th><th>Lat</th><th>Lng</th><th>Alt</th><th>HDOP</th><th>SAT</th><th>Bat%</th></tr>
          </thead>
          <tbody>
            {pageData.map(p => (
              <tr key={p.sampleIndex}>
                <td className="font-mono text-[10px] text-[#475569]">{p.sampleIndex}</td>
                <td className="font-mono text-[10px] whitespace-nowrap">{new Date(p.timestamp).toISOString().substring(11, 23)}</td>
                <td className="hmi-metric font-bold">{p.magneticField.total.toFixed(2)}</td>
                <td className="hmi-metric">{p.magneticField.x.toFixed(1)}</td>
                <td className="hmi-metric">{p.magneticField.y.toFixed(1)}</td>
                <td className="hmi-metric">{p.magneticField.z.toFixed(1)}</td>
                <td className="font-mono text-[10px]">{p.gps.latitude.toFixed(6)}</td>
                <td className="font-mono text-[10px]">{p.gps.longitude.toFixed(6)}</td>
                <td className="hmi-metric">{p.gps.altitude.toFixed(1)}</td>
                <td>{p.gps.hdop.toFixed(2)}</td>
                <td>{p.gps.satellites}</td>
                <td>{p.drone.batteryPercent.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
