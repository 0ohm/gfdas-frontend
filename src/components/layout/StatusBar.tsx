/* StatusBar.tsx — Barra de estado superior persistente */
'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSatelliteDish,
  faSignal,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faClock,
  faHdd,
  faTimes,
  faPause,
} from '@fortawesome/free-solid-svg-icons';
import { mockSystemStatus } from '@/lib/mock/data';
import { useMockProjectState } from '@/borrar/useMockProjectState';

function getSignalBars(rssi: number) {
  if (rssi > -40) return 4;
  if (rssi > -55) return 3;
  if (rssi > -70) return 2;
  if (rssi > -85) return 1;
  return 0;
}

export default function StatusBar() {
  const { state: mockAcquisitionStatus, isLoaded } = useMockProjectState();
  const system = mockSystemStatus;
  const signalBars = getSignalBars(system.network.rssi);

  const storage = { usedGB: 45.2, totalGB: 128.0 };
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');
  const [alerts, setAlerts] = useState<{ id: string; type: 'warning' | 'error'; msg: string }[]>([
    { id: '1', type: 'warning', msg: 'Simulacro de alerta' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('en-US', { hour12: true, timeZone: 'UTC' }) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dismissAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  // GPS Status
  let gpsStatusText = 'FALLA';
  if (system.gps.connected) {
    gpsStatusText = system.gps.hdop < 2 ? 'Quieto' : 'En Movimiento';
  }

  // MFS Status
  const sensorStatusColor = system.sensor.connected
    ? (system.sensor.status === 'healthy' ? 'text-[#A8CF45]' : 'text-amber-500')
    : 'text-[#E6007E]';
  const sensorStatusIcon = system.sensor.connected
    ? (system.sensor.status === 'healthy' ? faCheckCircle : faExclamationTriangle)
    : faTimesCircle;
  const sensorStatusText = system.sensor.connected
    ? (system.sensor.status === 'healthy' ? 'OK' : 'Advertencia')
    : 'FALLA';

  // Sistema General Status
  const sistemaStatusColor = 'text-[#A8CF45]';
  const sistemaStatusIcon = faCheckCircle;
  const sistemaStatusText = 'OK';

  return (
    <>
      {/* Header: fila unica siempre, adaptada con tamanios mas compactos en movil */}
      <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-[#001F2D] text-white z-50 shadow-status-bar">
        <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center gap-2 sm:gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white/95 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md flex items-center justify-center">
              <img src="/logo.webp" alt="GFDAS Logo" className="h-5 sm:h-6 w-auto object-contain" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-sm font-extrabold tracking-wider leading-none">GFDAS</h1>
              <p className="text-[10px] text-white/50 font-medium tracking-wide">MAG-DRONE SYSTEM</p>
            </div>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-white/15 shrink-0 hidden sm:block"></div>

          {/* Indicadores centrales: flujo horizontal con scroll en caso extremo */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide flex-1 min-w-0">

            {/* GPS */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <FontAwesomeIcon icon={faSatelliteDish} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${system.gps.connected ? 'text-[#A8CF45]' : 'text-[#475569]'}`} />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase">GPS</span>
              <span className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded ${system.gps.connected ? 'bg-[#A8CF45]/15 text-[#A8CF45]' : 'bg-[#E6007E]/15 text-[#E6007E]'}`}>
                {gpsStatusText}
              </span>
            </div>

            <div className="w-px h-5 bg-white/10 shrink-0"></div>

            {/* Sistema */}
            <div className="flex items-center gap-1 shrink-0">
              <FontAwesomeIcon icon={sistemaStatusIcon} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${sistemaStatusColor}`} />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase hidden sm:inline">SIS</span>
              <span className={`text-[10px] sm:text-[11px] font-bold uppercase ${sistemaStatusColor}`}>{sistemaStatusText}</span>
            </div>

            <div className="w-px h-5 bg-white/10 shrink-0"></div>

            {/* MFS */}
            <div className="flex items-center gap-1 shrink-0">
              <FontAwesomeIcon icon={sensorStatusIcon} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${sensorStatusColor}`} />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase hidden sm:inline">MFS</span>
              <span className={`text-[10px] sm:text-[11px] font-bold uppercase ${sensorStatusColor}`}>{sensorStatusText}</span>
            </div>

            <div className="w-px h-5 bg-white/10 shrink-0"></div>

            {/* Hora */}
            <div className="flex items-center gap-1 shrink-0 text-white/80">
              <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-[10px] sm:text-[11px] font-bold font-mono">{currentTime}</span>
            </div>

            <div className="w-px h-5 bg-white/10 shrink-0 hidden sm:block"></div>

            {/* Almacenamiento (oculto en pantallas muy pequenas) */}
            <div className="hidden sm:flex items-center gap-1 shrink-0 text-white/80">
              <FontAwesomeIcon icon={faHdd} className="w-3 h-3" />
              <span className="text-[11px] font-bold">
                {storage.usedGB.toFixed(1)}<span className="text-[9px] text-white/50"> / {storage.totalGB} GB</span>
              </span>
            </div>
          </div>

          {/* WiFi (siempre visible) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto" title="Señal Wi-Fi">
            <span className="text-[9px] text-white/50 font-bold uppercase hidden md:inline">Wi-Fi</span>
            <div className="flex items-end gap-[2px] h-3.5 sm:h-4">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-[2.5px] sm:w-[3px] rounded-sm transition-colors ${bar <= signalBars ? 'bg-[#A8CF45]' : 'bg-[#475569]'}`}
                  style={{ height: `${bar * 3.5}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Banner de Proyecto Activo */}
      {isLoaded && mockAcquisitionStatus.projectState !== 'stopped' && (
        <div className="fixed top-14 sm:top-16 left-0 right-0 h-8 sm:h-10 bg-[#A8CF45] text-[#001F2D] z-40 flex items-center justify-center px-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <FontAwesomeIcon icon={mockAcquisitionStatus.projectState === 'active' ? faCheckCircle : faPause} className="text-[#001F2D]" />
            <span>
              {mockAcquisitionStatus.projectState === 'active' ? 'PROYECTO EN CURSO' : 'PROYECTO PAUSADO'}
            </span>
            {mockAcquisitionStatus.source === 'hardware' && (
              <span className="ml-2 px-2 py-0.5 bg-[#001F2D] text-[#A8CF45] rounded-full text-[10px] uppercase hidden sm:inline-block">
                INICIADO EN HARDWARE
              </span>
            )}
          </div>
        </div>
      )}

      {/* Alertas descartables: posicionadas debajo del header (y del banner si existe) */}
      {alerts.length > 0 && (
        <div className={`fixed right-3 sm:right-6 z-[90] flex flex-col items-end gap-2 pointer-events-none max-w-[320px] sm:max-w-sm transition-all ${isLoaded && mockAcquisitionStatus.projectState !== 'stopped' ? 'top-24 sm:top-28' : 'top-16 sm:top-[4.5rem]'}`}>
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2 rounded-lg shadow-lg border-l-4 w-full max-w-md ${alert.type === 'error' ? 'bg-[#FFF0F4] border-[#E6007E] text-[#001F2D]' : 'bg-[#FFF9E6] border-amber-500 text-[#001F2D]'
                }`}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={alert.type === 'error' ? faTimesCircle : faExclamationTriangle}
                  className={alert.type === 'error' ? 'text-[#E6007E]' : 'text-amber-500'}
                />
                <span className="text-sm font-semibold">{alert.msg}</span>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-[#001F2D]/50 hover:text-[#001F2D] transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
