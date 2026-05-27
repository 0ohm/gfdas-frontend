'use client';

import { useState, useEffect } from 'react';
import { mockAcquisitionStatus } from '@/lib/mock/data';
import type { AcquisitionStatus } from '@/lib/api/acquisition';

export function useMockProjectState() {
  // Inicializamos con un estado por defecto seguro para evitar errores de hidratacion SSR
  const [state, setState] = useState<AcquisitionStatus>({
    ...mockAcquisitionStatus,
    projectState: 'stopped',
    source: null,
    isMetadataIncomplete: false
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = () => {
      const saved = localStorage.getItem('mockProjectState');
      if (saved) {
        setState(JSON.parse(saved));
      } else {
        // Inicializamos como activo desde hardware para el flujo del mockup
        const initState: AcquisitionStatus = {
           ...mockAcquisitionStatus,
           projectId: 'flt-mock-hardware',
           projectState: 'active',
           source: 'hardware',
           isMetadataIncomplete: true,
           dataCaptureStatus: 'capturing'
        };
        localStorage.setItem('mockProjectState', JSON.stringify(initState));
        setState(initState);
      }
      setIsLoaded(true);
    };

    loadState();

    const onUpdate = () => loadState();
    window.addEventListener('storage', onUpdate);
    window.addEventListener('mockStateUpdate', onUpdate);
    return () => {
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('mockStateUpdate', onUpdate);
    };
  }, []);

  const updateState = (updates: Partial<AcquisitionStatus>) => {
    const current = localStorage.getItem('mockProjectState');
    const parsed = current ? JSON.parse(current) : state;
    const nextState = { ...parsed, ...updates };
    localStorage.setItem('mockProjectState', JSON.stringify(nextState));
    setState(nextState);
    window.dispatchEvent(new Event('mockStateUpdate'));
  };

  return { state, updateState, isLoaded };
}
