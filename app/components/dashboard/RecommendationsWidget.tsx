"use client";

import { useMemo } from "react";
import Icon from "../ui/Icon";

interface RecommendationData {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

interface RecommendationsWidgetProps {
  data: RecommendationData[];
  loading?: boolean;
}

interface Sentiment {
  label: string;
  color: string;
  icon: string;
}

function computeSentiment(rec: RecommendationData): Sentiment {
  const total = rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell;
  if (total === 0) return { label: "N/A", color: "text-slate-400", icon: "help" };

  const bullishPercent = ((rec.strongBuy + rec.buy) / total) * 100;

  if (bullishPercent >= 60) return { label: "Strong Buy", color: "text-green-400", icon: "trending_up" };
  if (bullishPercent >= 40) return { label: "Buy",        color: "text-green-500", icon: "arrow_upward" };
  if (bullishPercent >= 30) return { label: "Hold",       color: "text-yellow-400", icon: "trending_flat" };
  return                           { label: "Sell",       color: "text-red-400",   icon: "trending_down" };
}

function buildDistribution(rec: RecommendationData) {
  const total = rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  return [
    { label: "Strong Buy",  count: rec.strongBuy,  percent: pct(rec.strongBuy),  color: "bg-green-500" },
    { label: "Buy",         count: rec.buy,         percent: pct(rec.buy),         color: "bg-green-400" },
    { label: "Hold",        count: rec.hold,        percent: pct(rec.hold),        color: "bg-yellow-400" },
    { label: "Sell",        count: rec.sell,        percent: pct(rec.sell),        color: "bg-red-400" },
    { label: "Strong Sell", count: rec.strongSell,  percent: pct(rec.strongSell),  color: "bg-red-500" },
  ];
}

export default function RecommendationsWidget({
  data,
  loading = false,
}: RecommendationsWidgetProps) {
  const latest = useMemo(() => data?.[0] ?? null, [data]);
  const sentiment = useMemo(
    () => (latest ? computeSentiment(latest) : { label: "N/A", color: "text-slate-400", icon: "help" }),
    [latest]
  );
  const distribution = useMemo(() => (latest ? buildDistribution(latest) : []), [latest]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="analytics" className="text-slate-500 text-[18px]" />
          <span className="text-sm font-semibold text-slate-400">
            Analyst Ratings
          </span>
        </div>
        <div className="text-center py-6 text-slate-500 text-sm">
          No recommendations available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="analytics" className="text-cyan-400 text-[18px]" />
          <span className="text-sm font-semibold text-white">
            Analyst Ratings
          </span>
        </div>
        <div className={`flex items-center gap-1.5 ${sentiment.color}`}>
          <Icon name={sentiment.icon} className="text-[16px]" />
          <span className="text-xs font-bold">{sentiment.label}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {distribution.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-white font-medium">{item.count}</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} transition-all duration-500`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <div className="text-xs text-slate-500">
          Based on {latest.period} analyst recommendations
        </div>
      </div>
    </div>
  );
}
