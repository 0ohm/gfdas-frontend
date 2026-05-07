/* MetricDisplay.tsx — Display numerico grande para lectura rapida a distancia */
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface MetricDisplayProps {
  value: string | number;
  unit?: string;
  label: string;
  icon?: IconDefinition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

const sizeStyles = {
  sm: 'text-lg font-semibold',
  md: 'text-2xl font-bold',
  lg: 'text-[32px] font-bold leading-[40px]',
  xl: 'text-[48px] font-extrabold leading-[56px] tracking-[-0.02em]',
};

export default function MetricDisplay({
  value,
  unit,
  label,
  icon,
  size = 'md',
  className = '',
}: MetricDisplayProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <FontAwesomeIcon icon={icon} className="w-3 h-3 text-[#475569]" />}
        <span className="text-[11px] font-bold text-[#475569] uppercase tracking-[0.05em]">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`hmi-metric text-[#001F2D] ${sizeStyles[size]}`}>
          {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
        </span>
        {unit && (
          <span className="text-sm font-bold text-[#475569]">{unit}</span>
        )}
      </div>
    </div>
  );
}
