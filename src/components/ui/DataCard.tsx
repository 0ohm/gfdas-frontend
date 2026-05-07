/* DataCard.tsx — Card de datos industriales con header slate */
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface DataCardProps {
  title: string;
  icon?: IconDefinition;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function DataCard({ title, icon, children, className = '', headerAction }: DataCardProps) {
  return (
    <div className={`hmi-card overflow-hidden ${className}`}>
      {/* Header slate */}
      <div className="flex items-center justify-between px-4 py-2.5 -mx-5 -mt-5 mb-4 bg-[#475569]">
        <div className="flex items-center gap-2">
          {icon && <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 text-white/70" />}
          <span className="text-xs font-bold text-white uppercase tracking-[0.05em]">
            {title}
          </span>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  );
}
