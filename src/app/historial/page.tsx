/* historial/page.tsx — Historial de Vuelos */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHistory, faSearch, faFilter, faSortUp, faSortDown, faSort,
  faCheckCircle, faTimesCircle, faExclamationTriangle,
  faEye, faDownload, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import DataCard from '@/components/ui/DataCard';
import { mockFlights } from '@/lib/mock/data';

type SortField = 'date' | 'duration' | 'samplesCollected' | 'location';
type SortOrder = 'asc' | 'desc';

function fmtDur(s: number) { const m = Math.floor(s / 60); return m > 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`; }

export default function HistorialPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortOrder('desc'); }
  };
  const sortIcon = (f: SortField) => sortField !== f ? faSort : sortOrder === 'asc' ? faSortUp : faSortDown;

  const flights = useMemo(() => {
    let list = [...mockFlights];
    if (search) { const q = search.toLowerCase(); list = list.filter(f => f.flightCode.toLowerCase().includes(q) || f.location.toLowerCase().includes(q)); }
    if (statusFilter !== 'all') list = list.filter(f => f.status === statusFilter);
    list.sort((a, b) => {
      let c = 0;
      if (sortField === 'date') c = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === 'duration') c = a.duration - b.duration;
      else if (sortField === 'samplesCollected') c = a.samplesCollected - b.samplesCollected;
      else c = a.location.localeCompare(b.location);
      return sortOrder === 'asc' ? c : -c;
    });
    return list;
  }, [search, statusFilter, sortField, sortOrder]);

  const toggleAll = () => {
    if (selectedIds.length === flights.length && flights.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(flights.map(f => f.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDownload = () => {
    if (selectedIds.length === 0) return;
    alert(`Descargando ${selectedIds.length} archivos CSV...`);
    // En prod aca se comprime o se bajan iterativamente
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`¿Seguro que desea borrar ${selectedIds.length} vuelos permanentemente?`)) {
      alert(`Borrados ${selectedIds.length} vuelos.`);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-headline-lg text-[#001F2D] font-bold">Historial de Vuelos</h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1">{flights.length} vuelos registrados</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
          <input id="search-flights" type="text" placeholder="Buscar por codigo o ubicacion..." value={search} onChange={e => setSearch(e.target.value)} className="hmi-input pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="w-4 h-4 text-[#475569]" />
          <select id="filter-status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="hmi-select w-auto min-w-[160px]">
            <option value="all">Todos</option>
            <option value="completed">Completados</option>
            <option value="in_progress">En Progreso</option>
            <option value="failed">Fallidos</option>
          </select>
        </div>
      </div>

      <DataCard title="Registro de Vuelos" icon={faHistory}>
        {/* Acciones Masivas */}
        {selectedIds.length > 0 && (
          <div className="mb-4 p-3 bg-[#F8F9FA] border border-[#C2C7CC] rounded-lg flex flex-wrap items-center gap-4 animate-fade-in">
            <span className="text-sm font-bold text-[#001F2D]">{selectedIds.length} vuelos seleccionados</span>
            <div className="flex gap-2">
              <button onClick={handleBulkDownload} className="hmi-btn-secondary py-1.5 text-xs">
                <FontAwesomeIcon icon={faDownload} className="w-3 h-3" /> Descargar CSVs
              </button>
              <button onClick={handleBulkDelete} className="hmi-btn-critical py-1.5 text-xs">
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" /> Borrar
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-5 px-1">
          <table className="hmi-table">
            <thead>
              <tr>
                <th className="w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === flights.length && flights.length > 0} 
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-[#C2C7CC] text-[#A8CF45] focus:ring-[#A8CF45]"
                  />
                </th>
                <th>Codigo</th>
                <th onClick={() => toggleSort('location')}><span className="cursor-pointer">Ubicacion <FontAwesomeIcon icon={sortIcon('location')} className="w-3 h-3 ml-1 opacity-50" /></span></th>
                <th onClick={() => toggleSort('date')}><span className="cursor-pointer">Fecha <FontAwesomeIcon icon={sortIcon('date')} className="w-3 h-3 ml-1 opacity-50" /></span></th>
                <th onClick={() => toggleSort('duration')}><span className="cursor-pointer">Duracion <FontAwesomeIcon icon={sortIcon('duration')} className="w-3 h-3 ml-1 opacity-50" /></span></th>
                <th onClick={() => toggleSort('samplesCollected')}><span className="cursor-pointer">Muestras <FontAwesomeIcon icon={sortIcon('samplesCollected')} className="w-3 h-3 ml-1 opacity-50" /></span></th>
                <th>GPS</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {flights.map(f => (
                <tr key={f.id} className={selectedIds.includes(f.id) ? 'bg-[#A8CF45]/10' : ''}>
                  <td className="text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(f.id)}
                      onChange={() => toggleOne(f.id)}
                      className="w-4 h-4 rounded border-[#C2C7CC] text-[#A8CF45] focus:ring-[#A8CF45]"
                    />
                  </td>
                  <td><Link href={`/historial/${f.id}`} className="font-bold text-[#001F2D] hover:text-[#A8CF45]">{f.flightCode}</Link></td>
                  <td className="text-[#475569] max-w-[180px] truncate">{f.location}</td>
                  <td className="text-[#475569] whitespace-nowrap">{new Date(f.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                  <td className="hmi-metric">{fmtDur(f.duration)}</td>
                  <td className="hmi-metric">{f.samplesCollected.toLocaleString('es-CL')}</td>
                  <td><span className={`text-xs font-bold ${f.gpsQuality.fixType === 'RTK' ? 'text-[#A8CF45]' : 'text-amber-500'}`}>{f.gpsQuality.fixType}</span></td>
                  <td>
                    <span className={`hmi-badge ${f.status === 'completed' ? 'hmi-badge-ok' : f.status === 'failed' ? 'hmi-badge-critical' : 'hmi-badge-neutral'}`}>
                      <FontAwesomeIcon icon={f.status === 'completed' ? faCheckCircle : f.status === 'failed' ? faTimesCircle : faExclamationTriangle} className="w-3 h-3" />
                      {f.status === 'completed' ? 'OK' : 'FALLO'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link href={`/historial/${f.id}`} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#A8CF45]/10 text-[#475569]" title="Ver"><FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" /></Link>
                      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#A8CF45]/10 text-[#475569]" title="Exportar"><FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" /></button>
                      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#E6007E]/10 text-[#475569] hover:text-[#E6007E]" title="Eliminar"><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /></button>
                    </div>
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
