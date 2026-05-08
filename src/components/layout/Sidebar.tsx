/* Sidebar.tsx — Navegacion lateral desktop (260px) */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faPlus,
  faHistory,
  faCog,
  faChartLine,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { href: '/', label: 'Panel Principal', icon: faTachometerAlt, description: 'Resumen del sistema' },
  { href: '/visor', label: 'Visor de Datos', icon: faChartLine, description: 'Mapa de calor' },
  { href: '/historial', label: 'Historial', icon: faHistory, description: 'Vuelos anteriores' },
  { href: '/ajustes', label: 'Ajustes', icon: faCog, description: 'Configuracion' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-[260px] bg-white border-r border-[#C2C7CC] z-40 flex-col">
      {/* Logo section */}
      <div className="px-5 py-6 border-b border-[#C2C7CC]">
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="GFDAS Logo" className="h-8 w-auto object-contain" />
          <div>
            <h2 className="text-sm font-extrabold text-[#001F2D] tracking-wider">GFDAS</h2>
            <p className="text-[11px] text-[#475569] font-medium">DAX</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-bold text-[#475569] uppercase tracking-[0.1em]">
          Navegacion
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-150 group
                ${isActive
                  ? 'bg-[#A8CF45]/15 border-l-4 border-[#A8CF45]'
                  : 'hover:bg-[#F8F9FA] border-l-4 border-transparent'
                }
              `}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-[#A8CF45]' : 'text-[#475569] group-hover:text-[#001F2D]'
                  }`}
              />
              <div>
                <span className={`text-sm font-bold block leading-tight ${isActive ? 'text-[#001F2D]' : 'text-[#475569] group-hover:text-[#001F2D]'
                  }`}>
                  {item.label}
                </span>
                <span className="text-[10px] text-[#475569]/70 hidden xl:block">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#C2C7CC] text-[10px] text-[#475569]">
        <p className="font-bold">Firmware v2.4.1</p>
        <p className="mt-0.5 opacity-70">GFDAS DAX</p>
      </div>
    </aside>
  );
}
