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

export default function RecommendationsWidget({
  data,
  loading = false,
}: RecommendationsWidgetProps) {
  const latest = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data[0];
  }, [data]);

  const sentiment = useMemo(() => {
    if (!latest) return { label: "N/A", color: "text-slate-400", icon: "help" };

    const total =
      latest.strongBuy +
      latest.buy +
      latest.hold +
      latest.sell +
      latest.strongSell;
    const bullish = latest.strongBuy + latest.buy;
    const bullishPercent = (bullish / total) * 100;

    if (bullishPercent >= 60) {
      return {
        label: "Strong Buy",
        color: "text-green-400",
        icon: "trending_up",
      };
    } else if (bullishPercent >= 40) {
      return { label: "Buy", color: "text-green-500", icon: "arrow_upward" };
    } else if (bullishPercent >= 30) {
      return {
        label: "Hold",
        color: "text-yellow-400",
        icon: "trending_flat",
      };
    } else {
      return { label: "Sell", color: "text-red-400", icon: "trending_down" };
    }
  }, [latest]);

  const distribution = useMemo(() => {
    if (!latest) return [];

    const total =
      latest.strongBuy +
      latest.buy +
      latest.hold +
      latest.sell +
      latest.strongSell;

    return [
      {
        label: "Strong Buy",
        count: latest.strongBuy,
        percent: (latest.strongBuy / total) * 100,
        color: "bg-green-500",
      },
      {
        label: "Buy",
        count: latest.buy,
        percent: (latest.buy / total) * 100,
        color: "bg-green-400",
      },
      {
        label: "Hold",
        count: latest.hold,
        percent: (latest.hold / total) * 100,
        color: "bg-yellow-400",
      },
      {
        label: "Sell",
        count: latest.sell,
        percent: (latest.sell / total) * 100,
        color: "bg-red-400",
      },
      {
        label: "Strong Sell",
        count: latest.strongSell,
        percent: (latest.strongSell / total) * 100,
        color: "bg-red-500",
      },
    ];
  }, [latest]);

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
