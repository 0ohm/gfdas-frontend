/* nuevo-vuelo/page.tsx — Registro de Nuevo Vuelo (Configuracion Pre-Vuelo) */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRocket,
  faMapMarkerAlt,
  faUser,
  faMountain,
  faRuler,
  faWaveSquare,
  faMagnet,
  faCheckCircle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import DataCard from '@/components/ui/DataCard';
import { createFlight, type CreateFlightPayload } from '@/lib/api/flights';

export default function NuevoVueloPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateFlightPayload>({
    location: '',
    operator: '',
    droneId: 'DRN-MAG-01',
    altitude: 40,
    lineSpacing: 25,
    sensorType: 'Overhauser',
    samplingRate: 10,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('[NuevoVuelo] Enviando configuracion pre-vuelo:', formData);
      const result = await createFlight(formData);
      
      if (result.success) {
        console.log('[NuevoVuelo] Vuelo creado:', result.data);
        router.push('/adquisicion');
      } else {
        console.error('[NuevoVuelo] Error:', result.error);
        // TODO: Mostrar error al usuario
        alert(`Error al crear vuelo: ${result.error || 'Error de conexion con el backend'}`);
      }
    } catch (error) {
      console.error('[NuevoVuelo] Excepcion:', error);
      alert('Error inesperado al crear el vuelo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg text-[#001F2D]">Nuevo Vuelo</h1>
        <p className="text-body-md text-[#475569] mt-1">
          Inicialice los parametros de la mision antes de proceder al modo de adquisicion.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-[#A8CF45]/10 border border-[#A8CF45]/30 rounded-hmi-md">
        <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 text-[#A8CF45] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[#001F2D]">Configuracion Pre-Vuelo</p>
          <p className="text-xs text-[#475569] mt-1">
            Complete todos los campos obligatorios. El sistema verificara la conexion con el sensor y GPS antes de iniciar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos de la mision */}
        <DataCard title="Datos de la Mision" icon={faMapMarkerAlt}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="input-location" className="hmi-label">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 mr-1.5" />
                Ubicacion / Faena *
              </label>
              <input
                id="input-location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Faena Esperanza"
                className="hmi-input"
                required
              />
            </div>
            <div>
              <label htmlFor="input-operator" className="hmi-label">
                <FontAwesomeIcon icon={faUser} className="w-3 h-3 mr-1.5" />
                Operador *
              </label>
              <input
                id="input-operator"
                type="text"
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                placeholder="Nombre del operador"
                className="hmi-input"
                required
              />
            </div>
            <div>
              <label htmlFor="select-drone" className="hmi-label">
                <FontAwesomeIcon icon={faRocket} className="w-3 h-3 mr-1.5" />
                ID del Dron *
              </label>
              <select
                id="select-drone"
                name="droneId"
                value={formData.droneId}
                onChange={handleChange}
                className="hmi-select"
              >
                <option value="DRN-MAG-01">DRN-MAG-01</option>
                <option value="DRN-MAG-02">DRN-MAG-02</option>
              </select>
            </div>
            <div>
              <label htmlFor="textarea-notes" className="hmi-label">Notas (Opcional)</label>
              <textarea
                id="textarea-notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Observaciones adicionales..."
                className="hmi-input min-h-[48px] resize-y"
                rows={2}
              />
            </div>
          </div>
        </DataCard>

        {/* Parametros de vuelo */}
        <DataCard title="Parametros de Vuelo" icon={faMountain}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="input-altitude" className="hmi-label">
                <FontAwesomeIcon icon={faMountain} className="w-3 h-3 mr-1.5" />
                Altitud de Vuelo (m) *
              </label>
              <input
                id="input-altitude"
                type="number"
                name="altitude"
                value={formData.altitude}
                onChange={handleChange}
                min={10}
                max={120}
                step={5}
                className="hmi-input"
                required
              />
              <p className="text-[10px] text-[#475569] mt-1">Rango recomendado: 30-50m AGL</p>
            </div>
            <div>
              <label htmlFor="input-line-spacing" className="hmi-label">
                <FontAwesomeIcon icon={faRuler} className="w-3 h-3 mr-1.5" />
                Espaciado entre Lineas (m) *
              </label>
              <input
                id="input-line-spacing"
                type="number"
                name="lineSpacing"
                value={formData.lineSpacing}
                onChange={handleChange}
                min={5}
                max={100}
                step={5}
                className="hmi-input"
                required
              />
              <p className="text-[10px] text-[#475569] mt-1">Menor = mayor resolucion, mayor tiempo</p>
            </div>
          </div>
        </DataCard>

        {/* Configuracion del sensor */}
        <DataCard title="Configuracion del Sensor" icon={faMagnet}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="select-sensor-type" className="hmi-label">
                <FontAwesomeIcon icon={faMagnet} className="w-3 h-3 mr-1.5" />
                Tipo de Sensor
              </label>
              <select
                id="select-sensor-type"
                name="sensorType"
                value={formData.sensorType}
                onChange={handleChange}
                className="hmi-select"
              >
                <option value="Overhauser">Overhauser</option>
                <option value="Fluxgate">Fluxgate</option>
                <option value="Cesium">Cesium</option>
              </select>
            </div>
            <div>
              <label htmlFor="input-sampling-rate" className="hmi-label">
                <FontAwesomeIcon icon={faWaveSquare} className="w-3 h-3 mr-1.5" />
                Frecuencia de Muestreo (Hz)
              </label>
              <input
                id="input-sampling-rate"
                type="number"
                name="samplingRate"
                value={formData.samplingRate}
                onChange={handleChange}
                min={1}
                max={100}
                step={1}
                className="hmi-input"
              />
            </div>
          </div>
        </DataCard>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="hmi-btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.location || !formData.operator}
            className="hmi-btn-primary"
          >
            <FontAwesomeIcon icon={isSubmitting ? faCheckCircle : faRocket} className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
            {isSubmitting ? 'Creando...' : 'Iniciar Mision'}
          </button>
        </div>
      </form>
    </div>
  );
}
