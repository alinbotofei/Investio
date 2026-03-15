"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import { getAssetLogoUrl } from "@/app/lib/utils/stockLogos";
import { assetHelpers } from "@/app/lib/utils/watchlist";
import { isPositive, formatPercent } from "@/app/lib/utils/format";
import type { AssetCategory } from "@/lib/types/assets";

interface QuoteSimple {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  logo?: string;
}

interface TickerCardProps {
  quote: QuoteSimple;
  category: AssetCategory;
  onAddToWatchlist: () => void;
  inWatchlist: boolean;
}

export default function TickerCard({
  quote,
  category,
  onAddToWatchlist,
  inWatchlist,
}: TickerCardProps) {
  const [imageError, setImageError] = useState(false);

  const positive = isPositive(quote.change);
  const logoInfo = imageError
    ? { type: "icon" as const, value: "image" }
    : getAssetLogoUrl(quote.symbol, category, quote.logo);
  const categoryColor = assetHelpers.getCategoryColor(category);
  const displaySymbol = assetHelpers.formatSymbol(quote.symbol);

  return (
    <Link
      href={`/ticker/${quote.symbol}`}
      prefetch={true}
      className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5 sm:p-3 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all cursor-pointer group relative overflow-hidden min-w-0 block"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-0 group-hover:opacity-5 transition-opacity`}
      />

      <div className="relative min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex-shrink-0 ${
                logoInfo.type === "url" && !imageError
                  ? "bg-white/95"
                  : `bg-gradient-to-br ${categoryColor}`
              } flex items-center justify-center shadow-md p-1.5`}
            >
              {logoInfo.type === "url" && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoInfo.value}
                  alt={displaySymbol}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <Icon
                  name={logoInfo.value}
                  className="text-white text-[16px] sm:text-[18px]"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm sm:text-base leading-tight break-words line-clamp-2">
                {displaySymbol}
              </h3>
              <span className="text-[10px] sm:text-xs text-slate-400 capitalize leading-tight block mt-0.5">
                {category}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onAddToWatchlist();
            }}
            className="p-1.5 hover:bg-slate-600/50 hover:scale-110 rounded-lg transition-all duration-200 flex-shrink-0"
            title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            <Icon
              name={inWatchlist ? "bookmark" : "bookmark_border"}
              className={`text-[18px] sm:text-[19px] transition-colors ${
                inWatchlist
                  ? "text-cyan-400"
                  : "text-slate-400 group-hover:text-slate-300"
              }`}
            />
          </button>
        </div>

        <div className="mb-2">
          <div className="text-base sm:text-lg font-bold text-white leading-tight break-words">
            ${quote.price.toFixed(category === "crypto" ? 4 : 2)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg flex-shrink-0 ${
              positive ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            <Icon
              name={positive ? "trending_up" : "trending_down"}
              className={`text-[13px] flex-shrink-0 ${
                positive ? "text-green-400" : "text-red-400"
              }`}
            />
            <span
              className={`text-xs sm:text-sm font-semibold whitespace-nowrap leading-tight ${
                positive ? "text-green-400" : "text-red-400"
              }`}
            >
              {positive ? "+" : ""}
              {quote.change.toFixed(2)}
            </span>
          </div>
          <div
            className={`text-xs sm:text-sm font-bold leading-tight whitespace-nowrap ${
              positive ? "text-green-400" : "text-red-400"
            }`}
          >
            {formatPercent(quote.changePercent)}
          </div>
        </div>
      </div>
    </Link>
  );
}
