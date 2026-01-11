"use client";

import { useEffect, useState } from "react";
import { Stock } from "@/lib/types/stocks";
import { getStockGradient } from "@/app/lib/utils/stockLogos";

interface StockCardProps {
  symbol: string;
  onClick?: () => void;
  isActive?: boolean;
}

export default function StockCard({
  symbol,
  onClick,
  isActive,
}: StockCardProps) {
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
    // Refresh every minute
    const interval = setInterval(fetchQuote, 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500">
        Failed to load {symbol}
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const gradient = getStockGradient(symbol);

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 sm:p-4 border rounded-lg text-left transition-all hover:shadow-md ${
        isActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {!logoError && stock.logo ? (
            <img
              src={stock.logo}
              alt={stock.name}
              onError={() => setLogoError(true)}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg object-contain flex-shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex-shrink-0 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
              }}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-base sm:text-lg truncate">
              {stock.symbol}
            </div>
            <div className="text-xs text-gray-500 truncate">{stock.name}</div>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xl sm:text-2xl font-bold">
          ${stock.price.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <span className={isPositive ? "text-green-600" : "text-red-600"}>
          {isPositive ? "▲" : "▼"} ${Math.abs(stock.change).toFixed(2)}
        </span>
        <span className={isPositive ? "text-green-600" : "text-red-600"}>
          ({isPositive ? "+" : ""}
          {stock.changePercent.toFixed(2)}%)
        </span>
      </div>

      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500">High</div>
          <div className="font-semibold">${stock.high.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500">Low</div>
          <div className="font-semibold">${stock.low.toFixed(2)}</div>
        </div>
      </div>
    </button>
  );
}
