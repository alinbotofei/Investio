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

function BarChart({ data }: { data: Extract<ChartData, { type: "bar" }> }) {
  const max = Math.max(...data.items.map((i) => i.value), 1);
  return (
    <div className="space-y-2">
      {data.items.map((item, idx) => {
        const pct = (item.value / max) * 100;
        const color = item.color || PALETTE[idx % PALETTE.length];
        return (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-20 shrink-0 truncate text-right">
              {item.label}
            </span>
            <div className="flex-1 h-5 bg-slate-800 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm flex items-center justify-end pr-1.5 transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              >
                <span className="text-[10px] font-bold text-white/90">
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
    <div className="grid grid-cols-1 gap-2">
      {data.items.map((item, idx) => {
        const pct = (Math.abs(item.value) / max) * 100;
        const color = item.color || PALETTE[idx % PALETTE.length];
        const isPositive = (item.change ?? 0) >= 0;
        return (
          <div
            key={idx}
            className="bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-200">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color }}>
                  {typeof item.value === "number" && item.value > 100
                    ? `$${item.value.toFixed(2)}`
                    : item.value}
                </span>
                {item.change !== undefined && (
                  <span
                    className={`text-[10px] font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {isPositive ? "+" : ""}
                    {item.change.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
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
    <div className="flex items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
      >
        {slices.map((slice, idx) => (
          <path
            key={idx}
            d={slice.d}
            fill={slice.color}
            stroke="#1e293b"
            strokeWidth="1"
            opacity="0.92"
          />
        ))}
      </svg>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {slices.map((slice, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-xs text-slate-300 truncate flex-1">
              {slice.label}
            </span>
            <span className="text-xs font-semibold text-white shrink-0">
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
  const values = data.sparkline.values;
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 200;
  const height = 60;
  const pad = 4;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
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
      className="rounded"
    >
      <path d={fillPath} fill={`${color}18`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={pts[pts.length - 1].split(",")[0]}
        cy={pts[pts.length - 1].split(",")[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
}

export default function InlineChart({ raw }: { raw: string }) {
  let data: ChartData;
  try {
    data = JSON.parse(raw.trim()) as ChartData;
  } catch {
    return (
      <pre className="text-xs text-red-400 bg-slate-900/50 p-2 rounded">
        {raw}
      </pre>
    );
  }

  return (
    <div className="my-3 bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 shadow-lg">
      {data.title && (
        <p className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
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
