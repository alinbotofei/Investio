'use client';

import { useEffect, useRef } from 'react';

interface SimpleChartProps {
  symbol: string;
  height?: number;
}

export default function SimpleChart({ symbol, height = 300 }: SimpleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // TradingView Lightweight Charts will be added in next step
    // For now, show a placeholder with mock data

    const canvas = document.createElement('canvas');
    canvas.width = containerRef.current.clientWidth;
    canvas.height = height;
    canvas.className = 'w-full';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous content
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(canvas);

    // Draw mock chart
    const drawMockChart = () => {
      const width = canvas.width;
      const chartHeight = height;
      
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, chartHeight);

      // Grid
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Generate mock data (sinusoidal with upward trend)
      const dataPoints = 50;
      const points: Array<{ x: number; y: number }> = [];
      
      for (let i = 0; i < dataPoints; i++) {
        const x = (width / dataPoints) * i;
        const baseY = chartHeight / 2;
        const wave = Math.sin(i * 0.3) * (chartHeight / 6);
        const trend = -(i / dataPoints) * (chartHeight / 3);
        const noise = (Math.random() - 0.5) * (chartHeight / 10);
        const y = baseY + wave + trend + noise;
        points.push({ x, y });
      }

      // Draw line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Draw area
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineTo(width, chartHeight);
      ctx.lineTo(0, chartHeight);
      ctx.closePath();
      ctx.fill();

      // Add current price indicator
      const lastPoint = points[points.length - 1];
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    };

    drawMockChart();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        drawMockChart();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [symbol, height]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{symbol} Chart</h3>
        <div className="flex gap-2 text-xs">
          <button className="px-3 py-1 bg-blue-500 text-white rounded">1D</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">1W</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">1M</button>
          <button className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">1Y</button>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
