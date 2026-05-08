/* BottomNav.tsx — Navegacion inferior mobile (72px) */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faChartLine,
  faHistory,
  faCog,
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { href: '/', label: 'Panel', icon: faTachometerAlt },
  { href: '/visor', label: 'Visor', icon: faChartLine },
  { href: '/historial', label: 'Historial', icon: faHistory },
  { href: '/ajustes', label: 'Ajustes', icon: faCog },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t-2 border-[#001F2D] z-[100] lg:hidden shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 
                min-w-[64px] min-h-[48px] px-3 py-2 rounded-lg
                transition-all duration-150
                ${isActive
                  ? 'bg-[#A8CF45]/15 text-[#001F2D]'
                  : 'text-[#475569] hover:text-[#001F2D] hover:bg-[#F8F9FA]'
                }
              `}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-[#A8CF45]' : ''
                }`}
              />
              <span className={`text-[11px] font-bold tracking-wide ${
                isActive ? 'text-[#001F2D]' : ''
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-[3px] bg-[#A8CF45] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
