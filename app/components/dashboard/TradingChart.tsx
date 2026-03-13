"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  AreaSeries,
  UTCTimestamp,
} from "lightweight-charts";

interface TradingChartProps {
  symbol: string;
  category?: "stock" | "crypto";
  height?: number;
  onLastClose?: (price: number) => void;
}

type Timeframe = "1D" | "1W" | "1M" | "1Y" | "5Y";

const TIMEFRAMES: { label: Timeframe }[] = [
  { label: "1D" },
  { label: "1W" },
  { label: "1M" },
  { label: "1Y" },
  { label: "5Y" },
];

interface CandleResponse {
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
  t: number[];
  s: string;
}

interface CrosshairData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
}

const UP_COLOR   = "#22d3ee";
const DOWN_COLOR = "#f43f5e";

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)         return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(0);
}

function formatTs(ts: number, timeframe: Timeframe): string {
  const d = new Date(ts * 1000);
  if (timeframe === "1D") {
    return d.toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function TradingChart({
  symbol,
  category = "stock",
  height = 400,
  onLastClose,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null>(null);
  const candlesRef   = useRef<{ ts: number; o: number; h: number; l: number; c: number; v: number }[]>([]);

  const [timeframe,    setTimeframe]    = useState<Timeframe>("1M");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [periodChange, setPeriodChange] = useState<{
    value: number; percent: number; isPositive: boolean; lastClose: number;
  } | null>(null);
  const [crosshair, setCrosshair] = useState<CrosshairData | null>(null);

  const destroyChart = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }
  }, []);

  const buildChart = useCallback(() => {
    if (!containerRef.current) return null;
    destroyChart();

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontSize: 11,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(51,65,85,0.35)", style: LineStyle.Dotted },
        horzLines: { color: "rgba(51,65,85,0.35)", style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(148,163,184,0.5)", labelBackgroundColor: "#1e293b" },
        horzLine: { color: "rgba(148,163,184,0.5)", labelBackgroundColor: "#1e293b" },
      },
      rightPriceScale: {
        borderColor: "rgba(51,65,85,0.5)",
        textColor: "#94a3b8",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(51,65,85,0.5)",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale:  { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
      width:  containerRef.current.clientWidth,
      height,
    });

    chartRef.current = chart;
    return chart;
  }, [height, destroyChart]);

  const fetchAndRender = useCallback(async () => {
    setLoading(true);
    setError(false);
    setCrosshair(null);

    try {
      const res = await fetch(
        `/api/stocks/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&category=${category}`
      );
      if (!res.ok) { setError(true); setLoading(false); return; }

      const data: CandleResponse = await res.json();
      if (!data || data.s === "no_data" || !data.c?.length) {
        setError(true); setLoading(false); return;
      }

      const raw = data.t
        .map((ts, i) => ({ ts, o: data.o[i], h: data.h[i], l: data.l[i], c: data.c[i], v: data.v?.[i] ?? 0 }))
        .filter(d => isFinite(d.c) && isFinite(d.o))
        .sort((a, b) => a.ts - b.ts);

      if (!raw.length) { setError(true); setLoading(false); return; }

      candlesRef.current = raw;

      const chart = buildChart();
      if (!chart) return;

      const hasOHLC = raw.every(d => isFinite(d.h) && isFinite(d.l));

      if (hasOHLC) {
        const series = chart.addSeries(CandlestickSeries, {
          upColor: UP_COLOR, downColor: DOWN_COLOR,
          borderUpColor: UP_COLOR, borderDownColor: DOWN_COLOR,
          wickUpColor: UP_COLOR, wickDownColor: DOWN_COLOR,
        });
        series.setData(raw.map(d => ({
          time: d.ts as UTCTimestamp,
          open: d.o, high: d.h, low: d.l, close: d.c,
        })));
        seriesRef.current = series;
      } else {
        const positive = raw[raw.length - 1].c >= raw[0].c;
        const color = positive ? UP_COLOR : DOWN_COLOR;
        const series = chart.addSeries(AreaSeries, {
          lineColor: color, topColor: `${color}22`, bottomColor: "transparent",
          lineWidth: 2, crosshairMarkerRadius: 4,
          crosshairMarkerBorderColor: color, crosshairMarkerBackgroundColor: color,
        });
        series.setData(raw.map(d => ({ time: d.ts as UTCTimestamp, value: d.c })));
        seriesRef.current = series;
      }

      const firstClose = raw[0].c;
      const lastClose  = raw[raw.length - 1].c;
      const change     = lastClose - firstClose;
      const pct        = (change / firstClose) * 100;
      setPeriodChange({ value: change, percent: pct, isPositive: change >= 0, lastClose });
      onLastClose?.(lastClose);

      chart.timeScale().fitContent();

      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData.size) {
          setCrosshair(null);
          return;
        }
        const ts = param.time as number;
        const candle = candlesRef.current.find(d => d.ts === ts)
          ?? candlesRef.current.reduce((prev, cur) =>
            Math.abs(cur.ts - ts) < Math.abs(prev.ts - ts) ? cur : prev
          );
        if (!candle) { setCrosshair(null); return; }

        setCrosshair({
          time:   formatTs(candle.ts, timeframe),
          open:   candle.o,
          high:   candle.h,
          low:    candle.l,
          close:  candle.c,
          volume: candle.v,
          isUp:   candle.c >= candle.o,
        });
      });

    } catch (err) {
      console.error("TradingChart error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, category, buildChart, destroyChart, onLastClose]);

  useEffect(() => {
    fetchAndRender();
    return () => destroyChart();
  }, [fetchAndRender, destroyChart]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && chartRef.current) chartRef.current.applyOptions({ width: w });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isPositive = crosshair ? crosshair.isUp : (periodChange?.isPositive ?? true);
  const accentColor = isPositive ? "text-cyan-400" : "text-rose-400";

  return (
    <div className="w-full select-none">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="min-h-[44px]">
          {crosshair ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 font-medium">{crosshair.time}</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-slate-400">O <span className="text-white font-semibold">${crosshair.open.toFixed(2)}</span></span>
                <span className="text-xs text-slate-400">H <span className="text-emerald-400 font-semibold">${crosshair.high.toFixed(2)}</span></span>
                <span className="text-xs text-slate-400">L <span className="text-rose-400 font-semibold">${crosshair.low.toFixed(2)}</span></span>
                <span className={`text-xs text-slate-400`}>C <span className={`font-semibold ${accentColor}`}>${crosshair.close.toFixed(2)}</span></span>
                {crosshair.volume > 0 && (
                  <span className="text-xs text-slate-400">Vol <span className="text-slate-300 font-semibold">{formatVolume(crosshair.volume)}</span></span>
                )}
              </div>
            </div>
          ) : periodChange ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-500 font-medium">{timeframe} change</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold tabular-nums ${accentColor}`}>
                  {periodChange.isPositive ? "+" : ""}{periodChange.value.toFixed(2)}
                  {" "}({periodChange.isPositive ? "+" : ""}{periodChange.percent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg p-1 border border-slate-700/50 flex-shrink-0">
          {TIMEFRAMES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setTimeframe(label)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                timeframe === label
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <span className="text-slate-500 text-xs">Loading chart...</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Chart data unavailable</p>
              <button
                onClick={fetchAndRender}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full h-full transition-opacity duration-200 ${
            loading || error ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        />
      </div>

      <p className="text-[10px] text-slate-700 mt-1.5 text-right">
        Powered by TradingView Lightweight Charts &middot; Data via Yahoo Finance
      </p>
    </div>
  );
}
