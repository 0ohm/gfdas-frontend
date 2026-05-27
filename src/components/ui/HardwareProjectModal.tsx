'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faCheckCircle, faPause, faStop, faTimes, faInfoCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useMockProjectState } from '@/borrar/useMockProjectState';

export default function HardwareProjectModal() {
  const { state, updateState, isLoaded } = useMockProjectState();
  const [show, setShow] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [form, setForm] = useState({
    operator: '',
    site: '',
    notes: '',
    startDate: new Date()
  });

  // Simulador de detección basado en el estado
  useEffect(() => {
    if (isLoaded && state.source === 'hardware' && state.isMetadataIncomplete) {
      setShow(true);
      setIsFinished(state.projectState === 'stopped');
    } else {
      setShow(false);
    }
  }, [state.source, state.isMetadataIncomplete, state.projectState, isLoaded]);

  // Limpiar notificacion despues de 3 segundos
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  if (!show || !isLoaded) return null;

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.operator || !form.site) {
      showToast('error', 'Operador y Faena son obligatorios.');
      return;
    }
    showToast('success', 'Parámetros guardados exitosamente.');
    // Actualizamos el estado para indicar que los metadatos ya están completos
    setTimeout(() => {
      updateState({ isMetadataIncomplete: false });
      setShow(false);
    }, 800); 
  };

  const handlePause = () => {
    showToast('info', 'Proyecto pausado desde la interfaz.');
    setTimeout(() => {
      updateState({ dataCaptureStatus: 'idle', projectState: 'paused' });
      setShow(false);
    }, 800); 
  };

  const handleFinish = () => {
    showToast('success', 'Proyecto finalizado desde la interfaz.');
    setIsFinished(true);
    setTimeout(() => {
      updateState({ projectState: 'stopped', dataCaptureStatus: 'idle', isMetadataIncomplete: false });
      setShow(false);
    }, 800); 
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#001F2D]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-hmi-md shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in relative">
        
        {/* Notificación tipo Toast */}
        {notification && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-hmi-sm shadow-lg flex items-center gap-2 z-20 animate-fade-in ${
            notification.type === 'success' ? 'bg-[#A8CF45] text-[#001F2D]' :
            notification.type === 'error' ? 'bg-[#E6007E] text-white' :
            'bg-[#001F2D] text-white'
          }`}>
            <FontAwesomeIcon icon={
              notification.type === 'success' ? faCheckCircle :
              notification.type === 'error' ? faExclamationCircle : faInfoCircle
            } />
            <span className="text-sm font-bold">{notification.message}</span>
          </div>
        )}

        <div className="bg-[#001F2D] p-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faMicrochip} className="text-[#A8CF45]" />
            Proyecto Iniciado en Hardware
          </h2>
          <button onClick={() => setShow(false)} className="text-white/50 hover:text-white transition-colors">
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 p-4 bg-[#F8F9FA] border border-[#C2C7CC] rounded-lg">
            <p className="text-sm text-[#475569]">
              Se ha detectado un proyecto iniciado físicamente desde el botón del dron. 
              Por favor, ingrese los parámetros para etiquetar los datos de esta adquisición.
            </p>
            {isFinished ? (
              <p className="mt-2 text-sm font-bold text-[#A8CF45] flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} /> El proyecto ya se encuentra finalizado.
              </p>
            ) : (
              <p className="mt-2 text-sm font-bold text-[#001F2D] flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} className="text-[#A8CF45]" /> El proyecto está actualmente en ejecución.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="hmi-label">Fecha y Hora de Inicio</label>
                <DatePicker
                  selected={form.startDate}
                  onChange={(date: Date | null) => date && setForm({ ...form, startDate: date })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Hora"
                  dateFormat="dd/MM/yyyy HH:mm"
                  className="hmi-input w-full"
                  wrapperClassName="w-full"
                />
              </div>
              <div>
                <label className="hmi-label">Notas Adicionales</label>
                <input
                  type="text"
                  className="hmi-input w-full"
                  placeholder="Opcional"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#E2E8F0] mt-6">
              {!isFinished && (
                <div className="flex gap-2">
                  <button type="button" onClick={handlePause} className="hmi-btn-secondary !text-xs !min-h-[40px] !px-3">
                    <FontAwesomeIcon icon={faPause} className="mr-2" /> Pausar
                  </button>
                  <button type="button" onClick={handleFinish} className="hmi-btn-critical !text-xs !min-h-[40px] !px-3">
                    <FontAwesomeIcon icon={faStop} className="mr-2" /> Finalizar
                  </button>
                </div>
              )}

              <button type="submit" className="hmi-btn-primary ml-auto">
                Guardar Parámetros
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
