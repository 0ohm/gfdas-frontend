/* StatusBar.tsx — Barra de estado superior persistente (64px) */
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBatteryFull,
  faBatteryThreeQuarters,
  faBatteryHalf,
  faBatteryQuarter,
  faBatteryEmpty,
  faSatelliteDish,
  faSignal,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { mockSystemStatus } from '@/lib/mock/data';

function getBatteryIcon(percent: number) {
  if (percent > 75) return faBatteryFull;
  if (percent > 50) return faBatteryThreeQuarters;
  if (percent > 25) return faBatteryHalf;
  if (percent > 10) return faBatteryQuarter;
  return faBatteryEmpty;
}

function getBatteryColor(percent: number) {
  if (percent > 50) return 'text-[#A8CF45]';
  if (percent > 20) return 'text-amber-500';
  return 'text-[#E6007E]';
}

function getSignalBars(rssi: number) {
  if (rssi > -40) return 4;
  if (rssi > -55) return 3;
  if (rssi > -70) return 2;
  if (rssi > -85) return 1;
  return 0;
}

interface StatusIndicatorProps {
  status: 'ok' | 'warning' | 'error' | 'offline';
  label: string;
  value?: string;
}

function StatusIndicator({ status, label, value }: StatusIndicatorProps) {
  const iconMap = {
    ok: faCheckCircle,
    warning: faExclamationTriangle,
    error: faTimesCircle,
    offline: faTimesCircle,
  };
  const colorMap = {
    ok: 'text-[#A8CF45]',
    warning: 'text-amber-500',
    error: 'text-[#E6007E]',
    offline: 'text-[#475569]',
  };
  const labelMap = {
    ok: 'LISTO',
    warning: 'ALERTA',
    error: 'ERROR',
    offline: 'SIN CONEXION',
  };

  return (
    <div className="flex items-center gap-1.5">
      <FontAwesomeIcon icon={iconMap[status]} className={`w-3.5 h-3.5 ${colorMap[status]}`} />
      <span className="text-xs font-bold text-white/70 hidden sm:inline">{label}</span>
      <span className={`text-xs font-bold ${colorMap[status]}`}>
        {value || labelMap[status]}
      </span>
    </div>
  );
}

export default function StatusBar() {
  const system = mockSystemStatus;
  const batteryPercent = system.drone.batteryPercent;
  const signalBars = getSignalBars(system.network.rssi);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#001F2D] text-white z-50 shadow-status-bar">
      <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Logo + Marca */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/95 px-2 py-1 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm">
            <img src="/logo.webp" alt="GFDAS Logo" className="h-6 w-auto object-contain" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-sm font-extrabold tracking-wider leading-none">GFDAS</h1>
            <p className="text-[10px] text-white/50 font-medium tracking-wide">MAG-DRONE SYSTEM</p>
          </div>
        </div>

        {/* Indicadores centrales */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <StatusIndicator
            status={system.sensor.connected ? (system.sensor.status === 'healthy' ? 'ok' : 'warning') : 'offline'}
            label="SENSOR"
            value={system.sensor.connected ? `${system.sensor.currentReading.toFixed(1)} nT` : undefined}
          />
          <StatusIndicator
            status={system.gps.connected ? (system.gps.hdop < 2 ? 'ok' : 'warning') : 'offline'}
            label="GPS"
            value={system.gps.connected ? `${system.gps.satellites} SAT` : undefined}
          />
          <StatusIndicator
            status={system.drone.connected ? 'ok' : 'offline'}
            label="DRON"
          />
        </div>

        {/* Indicadores derecha */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Senal */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-[2px] h-4">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-[3px] rounded-sm transition-colors ${
                    bar <= signalBars ? 'bg-[#A8CF45]' : 'bg-[#475569]'
                  }`}
                  style={{ height: `${bar * 4}px` }}
                />
              ))}
            </div>
            <FontAwesomeIcon icon={faSignal} className="w-3 h-3 text-white/50 hidden sm:block" />
          </div>

          {/* GPS */}
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon
              icon={faSatelliteDish}
              className={`w-3.5 h-3.5 ${system.gps.connected ? 'text-[#A8CF45]' : 'text-[#475569]'}`}
            />
            <span className="text-xs font-bold text-white/70 hidden sm:inline">
              {system.gps.fixType.replace('_', ' ')}
            </span>
          </div>

          {/* Bateria */}
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon
              icon={getBatteryIcon(batteryPercent)}
              className={`w-4 h-4 ${getBatteryColor(batteryPercent)}`}
            />
            <span className={`text-xs font-bold ${getBatteryColor(batteryPercent)}`}>
              {batteryPercent}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
