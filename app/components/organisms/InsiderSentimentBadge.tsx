"use client";

import Icon from "../atoms/Icon";

export interface InsiderSentimentData {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number;
}

interface InsiderSentimentBadgeProps {
  data: InsiderSentimentData[];
  loading?: boolean;
}

export default function InsiderSentimentBadge({
  data,
  loading = false,
}: InsiderSentimentBadgeProps) {
  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-slate-700 rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const recentData = data.slice(0, 3);
  const avgMspr =
    recentData.reduce((sum, item) => sum + item.mspr, 0) / recentData.length;
  const avgChange =
    recentData.reduce((sum, item) => sum + item.change, 0) / recentData.length;

  const sentiment =
    avgMspr > 0
      ? { label: "Bullish", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-400/20", icon: "trending_up" }
      : avgMspr < 0
      ? { label: "Bearish", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-400/20", icon: "trending_down" }
      : { label: "Neutral", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-400/20", icon: "trending_flat" };

  return (
    <div className={`${sentiment.bg} border ${sentiment.border} rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon name="account_balance" className={`${sentiment.color} text-[16px]`} />
        <span className="text-xs font-semibold text-white">
          Insider Sentiment
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Icon name={sentiment.icon} className={`${sentiment.color} text-[20px]`} />
        <div className="flex-1">
          <div className={`text-sm font-bold ${sentiment.color}`}>
            {sentiment.label}
          </div>
          <div className="text-xs text-slate-400">
            MSPR: {avgMspr.toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-medium ${avgChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {avgChange > 0 ? '+' : ''}{(avgChange / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-slate-500">shares</div>
        </div>
      </div>
    </div>
  );
}
