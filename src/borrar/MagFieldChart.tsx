/**
 * borrar/MagFieldChart.tsx
 * Grafica de campo magnetico triaxial con Chart.js y Zoom.
 * BORRAR CUANDO SE CONECTE EL BACKEND REAL.
 */
'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'hammerjs'; // Necesario para pinch-to-zoom en dispositivos moviles
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin);

interface MagFieldChartProps {
  timestamps: number[];
  values: number[]; // Campo Total
  xValues?: number[];
  yValues?: number[];
  zValues?: number[];
  height?: number;
  showTotal?: boolean;
  title?: string;
}

export default function MagFieldChart({
  timestamps, values, xValues, yValues, zValues,
  height = 300, showTotal = true, title,
}: MagFieldChartProps) {
  const data = useMemo(() => {
    const labels = timestamps.map(t => {
      const d = new Date(t);
      const totalSec = (d.getTime() - new Date(timestamps[0]).getTime()) / 1000;
      const m = Math.floor(totalSec / 60);
      const s = Math.floor(totalSec % 60);
      return `${m}:${String(s).padStart(2, '0')}`;
    });
    
    const datasets: any[] = [];
    if (xValues && yValues && zValues) {
      datasets.push(
        { label: 'Bx', data: xValues, borderColor: '#A8CF45', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: 0.1, fill: false },
        { label: 'By', data: yValues, borderColor: '#E6007E', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: 0.1, fill: false },
        { label: 'Bz', data: zValues, borderColor: '#475569', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: 0.1, fill: false },
      );
    }

    if (showTotal && values) {
      datasets.unshift({
        label: 'Total (nT)', data: values,
        borderColor: 'rgba(0,31,45, 0.4)', backgroundColor: 'rgba(0,31,45,0.05)',
        borderWidth: 1, pointRadius: 0, tension: 0.1, fill: true, borderDash: [5, 5]
      });
    }

    return { labels, datasets };
  }, [timestamps, values, xValues, yValues, zValues, showTotal]);

  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: true, position: 'top' as const, labels: { font: { family: 'Inter', size: 11, weight: 700 as const }, color: '#475569', usePointStyle: true, padding: 16 } },
      title: title ? { display: true, text: title, font: { family: 'Inter', size: 12, weight: 700 as const }, color: '#001F2D', padding: { bottom: 12 } } : { display: false },
      tooltip: {
        backgroundColor: '#001F2D', titleFont: { family: 'Inter', size: 11, weight: 700 as const }, bodyFont: { family: 'Inter', size: 11 }, padding: 10, cornerRadius: 4,
        callbacks: { label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(2) ?? 'N/A'} nT` },
      },
      zoom: {
        pan: { enabled: true, mode: 'x' as const },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' as const },
      }
    },
    scales: {
      x: { title: { display: true, text: 'Tiempo (min:seg)', font: { family: 'Inter', size: 11, weight: 700 as const }, color: '#475569' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#475569', maxTicksLimit: 15, maxRotation: 0 }, grid: { color: 'rgba(71,85,105,0.08)' } },
      y: { title: { display: true, text: 'nT', font: { family: 'Inter', size: 11, weight: 700 as const }, color: '#475569' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#475569', callback: (v: string | number) => typeof v === 'number' ? v.toFixed(0) : v }, grid: { color: 'rgba(71,85,105,0.08)' } },
    },
    animation: { duration: 0 },
  }), [title]);

  return <div style={{ height }}><Line data={data} options={options} /></div>;
}
