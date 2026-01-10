'use client';

import { useState, useEffect } from 'react';

interface SimpleChartProps {
  symbol: string;
  height?: number;
}

export default function SimpleChart({ symbol, height = 400 }: SimpleChartProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [chartData, setChartData] = useState<Array<{ x: number; y: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const quoteRes = await fetch(`/api/stocks/quote?symbol=${symbol}`);
        const quoteData = await quoteRes.json();
        
        // Support both API formats
        const currentPrice = quoteData.price || quoteData.c;
        const prevClose = quoteData.previousClose || quoteData.pc;
        
        // Validate data
        if (!currentPrice || !prevClose || isNaN(currentPrice) || isNaN(prevClose)) {
          console.error('Invalid quote data:', quoteData);
          setChartData([]);
          setLoading(false);
          return;
        }
        
        setCurrentPrice(currentPrice);
        
        const dataPoints = timeframe === '1D' ? 50 : timeframe === '1W' ? 70 : timeframe === '1M' ? 100 : 200;
        const priceRange = currentPrice * 0.05;
        const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        const points: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < dataPoints; i++) {
          const progress = i / dataPoints;
          const basePrice = prevClose;
          const trend = (currentPrice - prevClose) * progress;
          const wave = Math.sin((i + seed) * 0.15) * (priceRange * 0.4);
          const noise = Math.sin((i + seed) * 0.5) * (priceRange * 0.15);
          const y = basePrice + trend + wave + noise;
          
          // Validate each point
          if (!isNaN(y) && isFinite(y)) {
            points.push({ x: i, y });
          }
        }
        
        if (points.length > 0) {
          setChartData(points);
        } else {
          console.error('No valid chart data generated');
          setChartData([]);
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeframe]);

  const CHART_WIDTH = 800;
  const CHART_HEIGHT = height - 60;
  const PADDING = 40;
  const RIGHT_PADDING = 80;

  if (chartData.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{symbol} Price Chart</h3>
        </div>
        <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-slate-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  const maxY = Math.max(...chartData.map(p => p.y));
  const minY = Math.min(...chartData.map(p => p.y));
  const range = maxY - minY || 1;

  const scaleX = (x: number) => PADDING + (x / (chartData.length - 1)) * (CHART_WIDTH - PADDING - RIGHT_PADDING);
  const scaleY = (y: number) => CHART_HEIGHT - PADDING - ((y - minY) / range) * (CHART_HEIGHT - 2 * PADDING);

  const pathData = chartData.map((point, i) => {
    const x = scaleX(point.x);
    const y = scaleY(point.y);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaData = `M ${scaleX(0)} ${CHART_HEIGHT - PADDING} L ${scaleX(0)} ${scaleY(chartData[0].y)} ${pathData.substring(1)} L ${scaleX(chartData.length - 1)} ${CHART_HEIGHT - PADDING} Z`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          {symbol} Price Chart
          {loading && <span className="ml-2 text-xs text-slate-400 animate-pulse">Loading...</span>}
        </h3>
        <div className="flex gap-2 text-xs">
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900">
        <svg 
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} 
          className="w-full"
          style={{ height: `${height}px` }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`grid-${i}`}
              x1={PADDING}
              y1={(CHART_HEIGHT / 5) * i}
              x2={CHART_WIDTH - RIGHT_PADDING}
              y2={(CHART_HEIGHT / 5) * i}
              stroke="#1e293b"
              strokeWidth="1"
            />
          ))}
          
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.4)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
            </linearGradient>
          </defs>
          
          <path d={areaData} fill={`url(#gradient-${symbol})`} />
          <path d={pathData} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          
          <circle
            cx={scaleX(chartData[chartData.length - 1].x)}
            cy={scaleY(chartData[chartData.length - 1].y)}
            r="5"
            fill="#22d3ee"
            stroke="#0f172a"
            strokeWidth="2"
          />
          
          <text x={CHART_WIDTH - RIGHT_PADDING + 10} y={scaleY(maxY) + 4} fill="#94a3b8" fontSize="12" className="select-none">
            ${maxY.toFixed(2)}
          </text>
          <text x={CHART_WIDTH - RIGHT_PADDING + 10} y={scaleY(minY) + 4} fill="#94a3b8" fontSize="12" className="select-none">
            ${minY.toFixed(2)}
          </text>
          
          {currentPrice > 0 && (
            <g>
              <rect
                x={scaleX(chartData[chartData.length - 1].x) - 40}
                y={scaleY(chartData[chartData.length - 1].y) - 25}
                width="80"
                height="20"
                fill="rgba(34, 211, 238, 0.9)"
                rx="4"
              />
              <text
                x={scaleX(chartData[chartData.length - 1].x)}
                y={scaleY(chartData[chartData.length - 1].y) - 11}
                fill="#0f172a"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                className="select-none"
              >
                ${currentPrice.toFixed(2)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
