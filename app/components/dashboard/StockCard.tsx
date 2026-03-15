"use client";

import { useEffect, useState } from "react";
import { Stock } from "@/lib/types/stocks";
import { getStockGradient } from "@/app/lib/utils/stockLogos";
import { isPositive, formatPercent } from "@/app/lib/utils/format";

interface StockCardProps {
  symbol: string;
  onClick?: () => void;
  isActive?: boolean;
}

export default function StockCard({ symbol, onClick, isActive }: StockCardProps) {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await fetch(`/api/stocks/quote?symbol=${symbol}`);
        if (!response.ok) throw new Error("Failed to fetch quote");
        const data = await response.json();
        setStock(data);
      } catch (err) {
        console.error("Error fetching quote:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
    const interval = setInterval(fetchQuote, 60_000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="animate-pulse p-4 rounded-xl border border-slate-700/50 bg-slate-800/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-700/60" />
          <div className="flex-1">
            <div className="h-4 bg-slate-700/60 rounded w-20 mb-1.5" />
            <div className="h-3 bg-slate-700/40 rounded w-32" />
          </div>
        </div>
        <div className="h-7 bg-slate-700/60 rounded w-28 mb-2" />
        <div className="h-4 bg-slate-700/40 rounded w-20" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 text-center text-slate-500 text-sm">
        Failed to load {symbol}
      </div>
    );
  }

  const positive = isPositive(stock.change);
  const gradient = getStockGradient(symbol);

  return (
    <button
      onClick={onClick}
      className={[
        "w-full p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-lg",
        isActive
          ? "border-cyan-500/40 bg-cyan-500/10 shadow-md"
          : "border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-600/60",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        {!logoError && stock.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stock.logo}
            alt=""
            aria-hidden="true"
            onError={() => setLogoError(true)}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg object-contain bg-white/95 p-0.5 flex-shrink-0"
          />
        ) : (
          <div
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex-shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-base sm:text-lg text-white truncate leading-tight">
            {stock.symbol}
          </div>
          <div className="text-xs text-slate-400 truncate">{stock.name}</div>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xl sm:text-2xl font-bold text-white">
          ${stock.price.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
        <span className={positive ? "text-emerald-400" : "text-red-400"}>
          {positive ? "▲" : "▼"} ${Math.abs(stock.change).toFixed(2)}
        </span>
        <span className={positive ? "text-emerald-400/80" : "text-red-400/80"}>
          ({formatPercent(stock.changePercent)})
        </span>
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-slate-500 mb-0.5">High</div>
          <div className="font-semibold text-slate-200">${stock.high.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-0.5">Low</div>
          <div className="font-semibold text-slate-200">${stock.low.toFixed(2)}</div>
        </div>
      </div>
    </button>
  );
}
