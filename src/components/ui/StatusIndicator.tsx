/* StatusIndicator.tsx — Indicador de estado Color + Icono + Texto */
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

type StatusType = 'ok' | 'warning' | 'error' | 'loading' | 'neutral';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const statusConfig = {
  ok: {
    icon: faCheckCircle,
    color: 'text-[#A8CF45]',
    bg: 'bg-[#A8CF45]/10',
    text: 'LISTO',
  },
  warning: {
    icon: faExclamationTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    text: 'ALERTA',
  },
  error: {
    icon: faTimesCircle,
    color: 'text-[#E6007E]',
    bg: 'bg-[#E6007E]/10',
    text: 'ERROR',
  },
  loading: {
    icon: faSpinner,
    color: 'text-[#475569]',
    bg: 'bg-[#475569]/10',
    text: 'CARGANDO',
  },
  neutral: {
    icon: faCheckCircle,
    color: 'text-[#475569]',
    bg: 'bg-[#475569]/10',
    text: 'INACTIVO',
  },
};

const sizeConfig = {
  sm: { icon: 'w-3 h-3', text: 'text-[10px]', gap: 'gap-1', padding: 'px-2 py-0.5' },
  md: { icon: 'w-4 h-4', text: 'text-xs', gap: 'gap-1.5', padding: 'px-3 py-1' },
  lg: { icon: 'w-5 h-5', text: 'text-sm', gap: 'gap-2', padding: 'px-4 py-1.5' },
};

export default function StatusIndicator({
  status,
  label,
  size = 'md',
  showText = true,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];

  return (
    <div className={`inline-flex items-center ${sizes.gap} ${sizes.padding} rounded-full ${config.bg}`}>
      <FontAwesomeIcon
        icon={config.icon}
        className={`${sizes.icon} ${config.color} ${status === 'loading' ? 'animate-spin' : ''}`}
      />
      {showText && (
        <span className={`${sizes.text} font-bold ${config.color} uppercase tracking-wider`}>
          {label || config.text}
        </span>
      )}
    </div>
  );
}
