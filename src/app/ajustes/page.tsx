/* ajustes/page.tsx — Ajustes del Sistema */
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faMagnet, faWaveSquare, faFlask, faSyncAlt,
  faPowerOff, faExclamationTriangle, faCheckCircle,
  faSdCard, faWifi, faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import DataCard from '@/components/ui/DataCard';
import MetricDisplay from '@/components/ui/MetricDisplay';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { mockSensorConfig, mockSystemStatus } from '@/lib/mock/data';

export default function AjustesPage() {
  const sensor = mockSensorConfig;
  const system = mockSystemStatus;
  const [samplingRate, setSamplingRate] = useState(sensor.samplingRate);
  const [autoComp, setAutoComp] = useState(sensor.autoCompensation);
  const [filterType, setFilterType] = useState(sensor.filterType);
  const [filterFreq, setFilterFreq] = useState(sensor.filterFrequency);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    console.log('[Ajustes] Guardando:', { samplingRate, autoComp, filterType, filterFreq });
    // TODO: Llamar a updateSensorConfig()
    setTimeout(() => { setIsSaving(false); alert('Configuracion guardada (demo)'); }, 1000);
  };

  const handleCalibrate = async () => {
    if (!confirm('Iniciar calibracion del sensor? El proceso tarda aprox. 30 segundos.')) return;
    console.log('[Ajustes] Calibrando sensor...');
    // TODO: Llamar a calibrateSensor()
    alert('Calibracion iniciada (demo - conectar API)');
  };

  const handleFactoryReset = async () => {
    if (!confirm('ATENCION: Esta accion borrara TODOS los datos y calibraciones. Es irreversible. Continuar?')) return;
    if (!confirm('CONFIRMAR: Se eliminaran permanentemente todos los datos del sistema.')) return;
    console.log('[Ajustes] Factory reset...');
    // TODO: Llamar a factoryReset()
    alert('Reset de fabrica ejecutado (demo - conectar API)');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-headline-lg text-[#001F2D]">Ajustes del Sistema</h1>
        <p className="text-body-md text-[#475569] mt-1">Configuracion del sensor y sistema</p>
      </div>

      {/* Info del sensor */}
      <DataCard title="Informacion del Sensor" icon={faMagnet}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><span className="hmi-label text-[10px]">Tipo</span><p className="text-sm font-bold">{sensor.sensorType}</p></div>
          <div><span className="hmi-label text-[10px]">Serial</span><p className="text-sm font-bold font-mono">{sensor.serialNumber}</p></div>
          <div><span className="hmi-label text-[10px]">Firmware</span><p className="text-sm font-bold">{sensor.firmwareVersion}</p></div>
          <div><span className="hmi-label text-[10px]">Sensibilidad</span><p className="text-sm font-bold">{sensor.sensitivity} nT</p></div>
          <div><span className="hmi-label text-[10px]">Rango Dinamico</span><p className="text-sm font-bold">{sensor.dynamicRange.min.toLocaleString()} - {sensor.dynamicRange.max.toLocaleString()} nT</p></div>
          <div>
            <span className="hmi-label text-[10px]">Calibracion</span>
            <StatusIndicator status={sensor.calibrationStatus === 'valid' ? 'ok' : 'warning'} label={sensor.calibrationStatus === 'valid' ? 'Valida' : 'Expirada'} size="sm" />
          </div>
        </div>
      </DataCard>

      {/* Configuracion del sensor */}
      <DataCard title="Configuracion del Sensor" icon={faCog}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="input-sampling" className="hmi-label"><FontAwesomeIcon icon={faWaveSquare} className="w-3 h-3 mr-1.5" /> Frecuencia de Muestreo (Hz)</label>
              <input id="input-sampling" type="number" value={samplingRate} onChange={e => setSamplingRate(Number(e.target.value))} min={1} max={100} className="hmi-input" />
            </div>
            <div>
              <label htmlFor="select-filter" className="hmi-label"><FontAwesomeIcon icon={faFlask} className="w-3 h-3 mr-1.5" /> Tipo de Filtro</label>
              <select id="select-filter" value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)} className="hmi-select">
                <option value="none">Sin Filtro</option>
                <option value="low_pass">Paso Bajo</option>
                <option value="band_pass">Paso Banda</option>
                <option value="median">Mediana</option>
              </select>
            </div>
            {filterType !== 'none' && (
              <div>
                <label htmlFor="input-filter-freq" className="hmi-label">Frecuencia de Corte (Hz)</label>
                <input id="input-filter-freq" type="number" value={filterFreq} onChange={e => setFilterFreq(Number(e.target.value))} min={0.1} max={50} step={0.1} className="hmi-input" />
              </div>
            )}
            <div className="flex items-center gap-3 min-h-[48px]">
              <label htmlFor="toggle-autocomp" className="hmi-label mb-0">Auto-Compensacion</label>
              <button
                id="toggle-autocomp"
                onClick={() => setAutoComp(p => !p)}
                className={`relative w-12 h-6 rounded-full transition-colors ${autoComp ? 'bg-[#A8CF45]' : 'bg-[#C2C7CC]'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoComp ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#C2C7CC]">
            <button onClick={handleCalibrate} className="hmi-btn-secondary"><FontAwesomeIcon icon={faSyncAlt} className="w-4 h-4" /> Calibrar</button>
            <button onClick={handleSave} disabled={isSaving} className="hmi-btn-primary">
              <FontAwesomeIcon icon={isSaving ? faSyncAlt : faCheckCircle} className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </DataCard>

      {/* Almacenamiento */}
      <DataCard title="Almacenamiento" icon={faSdCard}>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#475569]">Usado: {(system.storage.usedMB / 1024).toFixed(1)} GB</span>
            <span className="font-bold">{(system.storage.totalMB / 1024).toFixed(0)} GB Total</span>
          </div>
          <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#A8CF45] rounded-full" style={{ width: `${(system.storage.usedMB / system.storage.totalMB) * 100}%` }} />
          </div>
          <p className="text-xs text-[#475569]">{(system.storage.freeMB / 1024).toFixed(1)} GB disponibles</p>
        </div>
      </DataCard>

      {/* Red */}
      <DataCard title="Conectividad" icon={faWifi}>
        <div className="grid grid-cols-3 gap-4">
          <div><span className="hmi-label text-[10px]">Tipo</span><p className="text-sm font-bold uppercase">{system.network.type}</p></div>
          <div><span className="hmi-label text-[10px]">RSSI</span><p className="text-sm font-bold">{system.network.rssi} dBm</p></div>
          <div><span className="hmi-label text-[10px]">Latencia</span><p className="text-sm font-bold">{system.network.latency} ms</p></div>
        </div>
      </DataCard>

      {/* Zona peligrosa */}
      <div className="border-2 border-[#E6007E]/30 rounded-hmi-md p-5 bg-[#E6007E]/5">
        <div className="flex items-start gap-3 mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-[#E6007E] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-[#E6007E] uppercase">Zona Peligrosa</h3>
            <p className="text-xs text-[#475569] mt-1">Advertencia: Accion irreversible. Borra todos los datos y calibraciones.</p>
          </div>
        </div>
        <button onClick={handleFactoryReset} className="hmi-btn-critical w-full sm:w-auto">
          <FontAwesomeIcon icon={faPowerOff} className="w-4 h-4" /> Reset de Fabrica
        </button>
      </div>
    </div>
  );
}
