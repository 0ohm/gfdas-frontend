/**
 * borrar/CanvasHeatmap.tsx
 * Mapa de calor magnetometrico en Canvas HTML5.
 * BORRAR CUANDO SE CONECTE EL BACKEND REAL.
 */
'use client';

import { useRef, useEffect, useMemo } from 'react';

interface HeatmapPoint { lat: number; lng: number; value: number; }
interface CanvasHeatmapProps { points: HeatmapPoint[]; height?: number; }

function valToColor(value: number, min: number, max: number): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const stops = [
    { p: 0, r: 26, g: 35, b: 126 }, { p: 0.2, r: 1, g: 87, b: 155 },
    { p: 0.35, r: 0, g: 96, b: 100 }, { p: 0.5, r: 27, g: 94, b: 32 },
    { p: 0.65, r: 130, g: 119, b: 23 }, { p: 0.8, r: 245, g: 127, b: 23 },
    { p: 0.9, r: 230, g: 81, b: 0 }, { p: 1, r: 183, g: 28, b: 28 },
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) { if (t >= stops[i].p && t <= stops[i + 1].p) { lo = stops[i]; hi = stops[i + 1]; break; } }
  const lt = (t - lo.p) / (hi.p - lo.p || 1);
  return `rgb(${Math.round(lo.r + (hi.r - lo.r) * lt)},${Math.round(lo.g + (hi.g - lo.g) * lt)},${Math.round(lo.b + (hi.b - lo.b) * lt)})`;
}

export default function CanvasHeatmap({ points, height = 500 }: CanvasHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bounds = useMemo(() => {
    let mnLat = Infinity, mxLat = -Infinity, mnLng = Infinity, mxLng = -Infinity, mnV = Infinity, mxV = -Infinity;
    for (const p of points) {
      if (p.lat < mnLat) mnLat = p.lat; if (p.lat > mxLat) mxLat = p.lat;
      if (p.lng < mnLng) mnLng = p.lng; if (p.lng > mxLng) mxLng = p.lng;
      if (p.value < mnV) mnV = p.value; if (p.value > mxV) mxV = p.value;
    }
    const pLat = (mxLat - mnLat) * 0.1 || 0.001, pLng = (mxLng - mnLng) * 0.1 || 0.001;
    return { mnLat: mnLat - pLat, mxLat: mxLat + pLat, mnLng: mnLng - pLng, mxLng: mxLng + pLng, mnV, mxV };
  }, [points]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr; c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height, M = 50;
    const pW = W - M * 2, pH = H - M * 2;
    ctx.fillStyle = '#F8F9FA'; ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(71,85,105,0.1)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = M + (pW * i) / 5, y = M + (pH * i) / 5;
      ctx.beginPath(); ctx.moveTo(x, M); ctx.lineTo(x, M + pH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(M + pW, y); ctx.stroke();
    }

    const toX = (lng: number) => M + ((lng - bounds.mnLng) / (bounds.mxLng - bounds.mnLng)) * pW;
    const toY = (lat: number) => M + pH - ((lat - bounds.mnLat) / (bounds.mxLat - bounds.mnLat)) * pH;
    const r = Math.max(4, Math.min(10, pW / (points.length / 3)));

    // Circulos de color
    ctx.globalAlpha = 0.7;
    for (const p of points) { ctx.fillStyle = valToColor(p.value, bounds.mnV, bounds.mxV); ctx.beginPath(); ctx.arc(toX(p.lng), toY(p.lat), r * 1.8, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const p of points) { ctx.fillStyle = valToColor(p.value, bounds.mnV, bounds.mxV); ctx.beginPath(); ctx.arc(toX(p.lng), toY(p.lat), r * 0.8, 0, Math.PI * 2); ctx.fill(); }

    // Trayectoria de vuelo
    ctx.globalAlpha = 0.3; ctx.strokeStyle = '#001F2D'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < points.length; i++) { const x = toX(points[i].lng), y = toY(points[i].lat); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke(); ctx.globalAlpha = 1;

    // Ejes
    ctx.fillStyle = '#475569'; ctx.font = 'bold 10px Inter, sans-serif'; ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) { ctx.fillText((bounds.mnLng + ((bounds.mxLng - bounds.mnLng) * i) / 4).toFixed(4), toX(bounds.mnLng + ((bounds.mxLng - bounds.mnLng) * i) / 4), H - 10); }
    ctx.fillText('Longitud', W / 2, H - 0);
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) { const lat = bounds.mnLat + ((bounds.mxLat - bounds.mnLat) * i) / 4; ctx.fillText(lat.toFixed(4), M - 4, toY(lat) + 3); }
    ctx.save(); ctx.translate(10, H / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('Latitud', 0, 0); ctx.restore();

    // Leyenda
    const lX = W - M + 10, lH = pH;
    for (let i = 0; i < lH; i++) { ctx.fillStyle = valToColor(bounds.mnV + (1 - i / lH) * (bounds.mxV - bounds.mnV), bounds.mnV, bounds.mxV); ctx.fillRect(lX, M + i, 20, 1); }
    ctx.strokeStyle = '#72787C'; ctx.strokeRect(lX, M, 20, lH);
    ctx.fillStyle = '#475569'; ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`${bounds.mxV.toFixed(0)} nT`, lX + 24, M + 8);
    ctx.fillText(`${((bounds.mnV + bounds.mxV) / 2).toFixed(0)}`, lX + 24, M + lH / 2 + 3);
    ctx.fillText(`${bounds.mnV.toFixed(0)} nT`, lX + 24, M + lH);
  }, [points, bounds]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} className="rounded-lg" />;
}
