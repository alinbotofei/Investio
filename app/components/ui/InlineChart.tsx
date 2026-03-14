"use client";

import React from "react";

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface ComparisonItem {
  label: string;
  value: number;
  change?: number;
  color?: string;
}

interface PieItem {
  label: string;
  value: number;
  color?: string;
}

interface SparklineData {
  values: number[];
  color?: string;
}

type ChartData =
  | { type: "bar"; title?: string; items: BarItem[] }
  | { type: "comparison"; title?: string; items: ComparisonItem[] }
  | { type: "pie" | "donut"; title?: string; items: PieItem[] }
  | { type: "sparkline"; title?: string; sparkline: SparklineData }
  | { type: "allocation"; title?: string; items: PieItem[] };

const PALETTE = [
  "#22d3ee",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#06b6d4",
  "#a855f7",
];

const SUPPORTED_CHART_TYPES = new Set([
  "bar",
  "comparison",
  "pie",
  "donut",
  "sparkline",
  "allocation",
]);

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((n) => typeof n === "number" && Number.isFinite(n));
}

function isValidChartData(value: any): value is ChartData {
  if (!value || typeof value !== "object") return false;
  if (!SUPPORTED_CHART_TYPES.has(value.type)) return false;

  if (value.type === "sparkline") {
    return isNumberArray(value?.sparkline?.values);
  }

  return Array.isArray(value.items);
}

function BarChart({ data }: { data: Extract<ChartData, { type: "bar" }> }) {
  const max = Math.max(...data.items.map((i) => i.value), 1);
  return (
    <div className="space-y-2.5">
      {data.items.map((item, idx) => {
        const pct = (item.value / max) * 100;
        const color = item.color || PALETTE[idx % PALETTE.length];
        return (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-300 w-24 shrink-0 truncate text-right">
              {item.label}
            </span>
            <div className="flex-1 h-6 bg-slate-800/60 rounded-lg overflow-hidden border border-slate-700/30">
              <div
                className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700 shadow-lg"
                style={{ 
                  width: `${pct}%`, 
                  background: `linear-gradient(90deg, ${color}dd, ${color})`,
                  boxShadow: `0 0 6px ${color}40`
                }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {typeof item.value === "number" && item.value >= 1000
                    ? `${(item.value / 1000).toFixed(1)}k`
                    : item.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonChart({
  data,
}: {
  data: Extract<ChartData, { type: "comparison" }>;
}) {
  const max = Math.max(...data.items.map((i) => Math.abs(i.value)), 1);
  return (
    <div className="grid grid-cols-1 gap-3">
      {data.items.map((item, idx) => {
        const pct = (Math.abs(item.value) / max) * 100;
        const color = item.color || PALETTE[idx % PALETTE.length];
        const isPositive = (item.change ?? 0) >= 0;
        return (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/70 to-slate-900/60 rounded-xl px-4 py-3 border border-slate-700/40 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-100">
                {item.label}
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold drop-shadow-lg" style={{ color }}>
                  {typeof item.value === "number" && item.value > 100
                    ? `$${item.value.toFixed(2)}`
                    : item.value}
                </span>
                {item.change !== undefined && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
                  >
                    {isPositive ? "+" : ""}
                    {item.change.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-lg"
                style={{ 
                  width: `${pct}%`, 
                  background: `linear-gradient(90deg, ${color}cc, ${color})`,
                  boxShadow: `0 0 8px ${color}60`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({
  data,
}: {
  data: Extract<ChartData, { type: "pie" | "donut" | "allocation" }>;
}) {
  const total = data.items.reduce((s, i) => s + i.value, 0) || 1;
  let cumulative = 0;
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const innerR = "type" in data && data.type === "donut" ? r * 0.55 : 0;

  const slices = data.items.map((item, idx) => {
    const pct = item.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(startAngle);
    const iy1 = cy + innerR * Math.sin(startAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;

    const color = item.color || PALETTE[idx % PALETTE.length];
    let d: string;
    if (innerR > 0) {
      d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    } else {
      d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }
    return { d, color, label: item.label, value: item.value, pct };
  });

  return (
    <div className="flex items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
      >
        <defs>
          {slices.map((slice, idx) => (
            <linearGradient key={`grad-${idx}`} id={`slice-grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={slice.color} />
              <stop offset="100%" stopColor={slice.color} stopOpacity="0.8" />
            </linearGradient>
          ))}
        </defs>
        {slices.map((slice, idx) => (
          <path
            key={idx}
            d={slice.d}
            fill={`url(#slice-grad-${idx})`}
            stroke="#0f172a"
            strokeWidth="1.5"
            opacity="0.95"
            style={{ filter: `drop-shadow(0 0 4px ${slice.color}50)` }}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {slices.map((slice, idx) => (
          <div key={idx} className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded shrink-0 shadow-md"
              style={{ 
                background: `linear-gradient(135deg, ${slice.color}, ${slice.color}cc)`,
                boxShadow: `0 0 6px ${slice.color}60`
              }}
            />
            <span className="text-xs font-medium text-slate-200 truncate flex-1">
              {slice.label}
            </span>
            <span className="text-xs font-bold text-white shrink-0 bg-slate-800/50 px-2 py-0.5 rounded">
              {slice.pct < 0.1
                ? `${(slice.pct * 100).toFixed(1)}%`
                : `${Math.round(slice.pct * 100)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SparklineChart({
  data,
}: {
  data: Extract<ChartData, { type: "sparkline" }>;
}) {
  if (!isNumberArray(data?.sparkline?.values)) return null;
  const values = data.sparkline.values;
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 200;
  const height = 60;
  const pad = 4;
  const denom = Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => {
    const x = pad + (i / denom) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });
  const isPositive =
    values[values.length - 1] >= values[0];
  const color =
    data.sparkline.color || (isPositive ? "#22d3ee" : "#f43f5e");
  const polyline = pts.join(" ");
  const fillPath = `M ${pts[0]} ${pts.slice(1).map((p) => `L ${p}`).join(" ")} L ${width - pad},${height - pad} L ${pad},${height - pad} Z`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="rounded-lg"
      style={{ filter: `drop-shadow(0 2px 8px ${color}30)` }}
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#gradient-${color})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
      <circle
        cx={pts[pts.length - 1].split(",")[0]}
        cy={pts[pts.length - 1].split(",")[1]}
        r="4"
        fill={color}
        stroke="#1e293b"
        strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 6px ${color}cc)` }}
      />
    </svg>
  );
}

export default function InlineChart({ raw }: { raw: string }) {
  let data: unknown;
  try {
    data = JSON.parse(raw.trim());
  } catch {
    return (
      <pre className="text-xs text-red-400 bg-slate-900/50 p-2 rounded">
        {raw}
      </pre>
    );
  }

  if (!isValidChartData(data)) {
    return (
      <div className="my-4 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
        Unsupported or invalid chart payload.
      </div>
    );
  }

  return (
    <div className="my-4 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/40 rounded-2xl p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
      {data.title && (
        <p className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 inline-block shadow-lg shadow-cyan-500/50" />
          {data.title}
        </p>
      )}

      {data.type === "bar" && <BarChart data={data} />}
      {data.type === "comparison" && <ComparisonChart data={data} />}
      {(data.type === "pie" ||
        data.type === "donut" ||
        data.type === "allocation") && <PieChart data={data as any} />}
      {data.type === "sparkline" && <SparklineChart data={data} />}
    </div>
  );
}
