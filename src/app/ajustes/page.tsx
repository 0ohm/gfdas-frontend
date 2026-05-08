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
  const [gain, setGain] = useState(1.0);
  const [offset, setOffset] = useState(0.0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Info del sensor editable
  const [sensorInfo, setSensorInfo] = useState({
    type: sensor.sensorType,
    serial: sensor.serialNumber,
    firmware: sensor.firmwareVersion,
    sensitivity: sensor.sensitivity,
    rangeMin: sensor.dynamicRange.min,
    rangeMax: sensor.dynamicRange.max,
    drone: 'DJI Matrice 300 RTK' // Default mock value
  });

  // Conectividad editable
  const [wifiConfig, setWifiConfig] = useState({
    ssid: 'GFDAS_AP_01',
    password: 'password123',
  });

  const handleSave = async () => {
    setIsSaving(true);
    console.log('[Ajustes] Guardando:', { samplingRate, gain, offset });
    // TODO: Llamar a updateSensorConfig()
    setTimeout(() => { setIsSaving(false); alert('Configuracion guardada (demo)'); }, 1000);
  };

  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    console.log('[Ajustes] Guardando info del sensor:', sensorInfo);
    // TODO: Llamar a updateSensorInfo()
    setTimeout(() => { setIsSavingInfo(false); alert('Informacion del sensor actualizada (demo)'); }, 1000);
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
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-headline-lg text-[#001F2D] font-bold">Ajustes del Sistema</h1>
        <p className="text-xs sm:text-sm text-[#475569] mt-1">Configuracion del sensor y sistema</p>
      </div>

      {/* Info del sensor */}
      <DataCard title="Informacion del Equipo" icon={faMagnet}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><span className="hmi-label text-[10px]">Tipo</span><input type="text" className="hmi-input w-full mt-1" value={sensorInfo.type} onChange={e => setSensorInfo({ ...sensorInfo, type: e.target.value })} /></div>
          <div><span className="hmi-label text-[10px]">Serial</span><input type="text" className="hmi-input w-full mt-1 font-mono" value={sensorInfo.serial} onChange={e => setSensorInfo({ ...sensorInfo, serial: e.target.value })} /></div>
          <div><span className="hmi-label text-[10px]">Dron</span><input type="text" className="hmi-input w-full mt-1" value={sensorInfo.drone} onChange={e => setSensorInfo({ ...sensorInfo, drone: e.target.value })} /></div>
          <div><span className="hmi-label text-[10px]">Firmware</span><p className="text-sm font-bold mt-1 text-[#475569]">{sensorInfo.firmware}</p></div>
          <div><span className="hmi-label text-[10px]">Sensibilidad (nT)</span><input type="number" step="0.001" className="hmi-input w-full mt-1" value={sensorInfo.sensitivity} onChange={e => setSensorInfo({ ...sensorInfo, sensitivity: Number(e.target.value) })} /></div>
          <div>
            <span className="hmi-label text-[10px]">Rango Min - Max (nT)</span>
            <div className="flex gap-2 mt-1">
              <input type="number" className="hmi-input w-1/2" value={sensorInfo.rangeMin} onChange={e => setSensorInfo({ ...sensorInfo, rangeMin: Number(e.target.value) })} />
              <input type="number" className="hmi-input w-1/2" value={sensorInfo.rangeMax} onChange={e => setSensorInfo({ ...sensorInfo, rangeMax: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <span className="hmi-label text-[10px]">Calibracion</span>
            <div className="mt-2">
              <StatusIndicator status={sensor.calibrationStatus === 'valid' ? 'ok' : 'warning'} label={sensor.calibrationStatus === 'valid' ? 'Valida' : 'Expirada'} size="sm" />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4 mt-4 border-t border-[#C2C7CC]">
          <button onClick={handleSaveInfo} disabled={isSavingInfo} className="hmi-btn-primary">
            <FontAwesomeIcon icon={isSavingInfo ? faSyncAlt : faCheckCircle} className={`w-4 h-4 ${isSavingInfo ? 'animate-spin' : ''}`} />
            {isSavingInfo ? 'Guardando...' : 'Guardar Info'}
          </button>
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
              <label htmlFor="input-gain" className="hmi-label">Ganancia</label>
              <input id="input-gain" type="number" value={gain} onChange={e => setGain(Number(e.target.value))} step={0.1} className="hmi-input" />
            </div>
            <div>
              <label htmlFor="input-offset" className="hmi-label">Offset (nT)</label>
              <input id="input-offset" type="number" value={offset} onChange={e => setOffset(Number(e.target.value))} step={0.1} className="hmi-input" />
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#C2C7CC]">
            <div><span className="hmi-label text-[10px]">Tipo</span><p className="text-sm font-bold uppercase">{system.network.type}</p></div>
            <div><span className="hmi-label text-[10px]">RSSI</span><p className="text-sm font-bold">{system.network.rssi} dBm</p></div>
            <div><span className="hmi-label text-[10px]">Latencia</span><p className="text-sm font-bold">{system.network.latency} ms</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="hmi-label text-[10px]">Punto de Acceso (SSID)</label>
              <input type="text" className="hmi-input w-full mt-1" value={wifiConfig.ssid} onChange={e => setWifiConfig({ ...wifiConfig, ssid: e.target.value })} />
            </div>
            <div>
              <label className="hmi-label text-[10px]">Contraseña Wi-Fi</label>
              <input type="password" className="hmi-input w-full mt-1" value={wifiConfig.password} onChange={e => setWifiConfig({ ...wifiConfig, password: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} className="hmi-btn-secondary text-xs">Guardar Red</button>
          </div>
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
