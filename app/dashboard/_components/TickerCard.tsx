"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@/app/components/ui/Icon";
import { getAssetLogoUrl } from "@/app/lib/utils/stockLogos";
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
  const router = useRouter();

  const getCategoryColor = (cat: AssetCategory) => {
    switch (cat) {
      case "stock":
        return "from-blue-600 to-cyan-500";
      case "crypto":
        return "from-orange-500 to-yellow-500";
      case "forex":
        return "from-green-600 to-emerald-500";
    }
  };

  const formatSymbol = (sym: string) => {
    if (sym.includes(":")) {
      return sym.split(":")[1].replace("USDT", "").replace("_", "/");
    }
    return sym;
  };

  const getIcon = () => {
    return getAssetLogoUrl(quote.symbol, category, quote.logo);
  };

  const handleClick = () => {
    router.push(`/ticker/${quote.symbol}`);
  };

  const handleMouseEnter = () => {
    router.prefetch(`/ticker/${quote.symbol}`);
  };

  const isPositive = quote.change >= 0;
  const logoInfo = getIcon();

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 sm:p-4 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(
          category
        )} opacity-0 group-hover:opacity-5 transition-opacity`}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg ${
                logoInfo.type === "url"
                  ? "bg-white/95"
                  : `bg-gradient-to-br ${getCategoryColor(category)}`
              } flex items-center justify-center flex-shrink-0 shadow-md p-1.5`}
            >
              {logoInfo.type === "url" ? (
                <Image
                  src={logoInfo.value}
                  alt={quote.symbol}
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded"
                  unoptimized
                />
              ) : (
                <Icon
                  name={logoInfo.value}
                  className="text-white text-[18px] sm:text-[20px]"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm sm:text-base truncate">
                {formatSymbol(quote.symbol)}
              </h3>
              <span className="text-[10px] sm:text-xs text-slate-400 capitalize hidden sm:inline">
                {category}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist();
            }}
            className="p-1 sm:p-1.5 hover:bg-slate-600/40 rounded-lg transition-colors flex-shrink-0"
          >
            <Icon
              name={inWatchlist ? "bookmark" : "bookmark_border"}
              className={`text-[16px] sm:text-[18px] transition-colors ${
                inWatchlist
                  ? "text-cyan-400"
                  : "text-slate-400 group-hover:text-slate-300"
              }`}
            />
          </button>
        </div>

        <div className="mb-2">
          <div className="text-xl sm:text-2xl font-bold text-white">
            ${quote.price.toFixed(category === "forex" ? 4 : 2)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex-1 sm:flex-none ${
              isPositive ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            <Icon
              name={isPositive ? "trending_up" : "trending_down"}
              className={`text-[12px] sm:text-[14px] flex-shrink-0 ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            />
            <span
              className={`text-xs sm:text-sm font-semibold truncate ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {quote.change.toFixed(2)}
            </span>
          </div>
          <div
            className={`text-xs sm:text-sm font-medium flex-shrink-0 ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {quote.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}
