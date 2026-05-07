/**
 * borrar/MagFieldChart.tsx
 * Grafica de campo magnetico con Chart.js.
 * BORRAR CUANDO SE CONECTE EL BACKEND REAL.
 */
'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface MagFieldChartProps {
  timestamps: number[];
  values: number[];
  xValues?: number[];
  yValues?: number[];
  zValues?: number[];
  height?: number;
  showComponents?: boolean;
  title?: string;
}

export default function MagFieldChart({
  timestamps, values, xValues, yValues, zValues,
  height = 300, showComponents = false, title,
}: MagFieldChartProps) {
  const data = useMemo(() => {
    const labels = timestamps.map(t => {
      const d = new Date(t);
      const totalSec = (d.getTime() - new Date(timestamps[0]).getTime()) / 1000;
      const m = Math.floor(totalSec / 60);
      const s = Math.floor(totalSec % 60);
      return `${m}:${String(s).padStart(2, '0')}`;
    });
    const datasets: {
      label: string; data: number[]; borderColor: string;
      backgroundColor: string; borderWidth: number; pointRadius: number;
      tension: number; fill: boolean;
    }[] = [{
      label: 'Campo Total (nT)', data: values,
      borderColor: '#001F2D', backgroundColor: 'rgba(0,31,45,0.05)',
      borderWidth: 1.2, pointRadius: 0, tension: 0.1, fill: true,
    }];
    if (showComponents && xValues && yValues && zValues) {
      datasets.push(
        { label: 'Bx', data: xValues, borderColor: '#A8CF45', backgroundColor: 'transparent', borderWidth: 1, pointRadius: 0, tension: 0.1, fill: false },
        { label: 'By', data: yValues, borderColor: '#E6007E', backgroundColor: 'transparent', borderWidth: 1, pointRadius: 0, tension: 0.1, fill: false },
        { label: 'Bz', data: zValues, borderColor: '#475569', backgroundColor: 'transparent', borderWidth: 1, pointRadius: 0, tension: 0.1, fill: false },
      );
    }
    return { labels, datasets };
  }, [timestamps, values, xValues, yValues, zValues, showComponents]);

  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: showComponents, position: 'top' as const, labels: { font: { family: 'Inter', size: 11, weight: 700 as const }, color: '#475569', usePointStyle: true, padding: 16 } },
      title: title ? { display: true, text: title, font: { family: 'Inter', size: 12, weight: 700 as const }, color: '#001F2D', padding: { bottom: 12 } } : { display: false },
      tooltip: {
        backgroundColor: '#001F2D', titleFont: { family: 'Inter', size: 11, weight: 700 as const }, bodyFont: { family: 'Inter', size: 11 }, padding: 10, cornerRadius: 4,
        callbacks: { label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} nT` },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Tiempo (min:seg)', font: { family: 'Inter', size: 11, weight: 700 as const }, color: '#475569' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#475569', maxTicksLimit: 15, maxRotation: 0 }, grid: { color: 'rgba(71,85,105,0.08)' } },
      y: { title: { display: true, text: 'nT', font: { family: 'Inter', size: 11, weight: 700 as const }, color: '#475569' }, ticks: { font: { family: 'Inter', size: 10 }, color: '#475569', callback: (v: string | number) => typeof v === 'number' ? v.toFixed(0) : v }, grid: { color: 'rgba(71,85,105,0.08)' } },
    },
    animation: { duration: 0 },
  }), [showComponents, title]);

  return <div style={{ height }}><Line data={data} options={options} /></div>;
}
