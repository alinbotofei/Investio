"use client";

import { useState, useEffect } from "react";
import Icon from "../ui/Icon";
import { AssetCategory } from "@/lib/types/assets";
import { assetHelpers } from "@/app/lib/utils/watchlist";
import { useWatchlist } from "@/app/contexts/WatchlistContext";
import { POPULAR_CRYPTO } from "@/app/lib/constants";

interface AssetSuggestion {
  symbol: string;
  name: string;
  category: AssetCategory;
}

const STOCK_SUGGESTIONS: AssetSuggestion[] = [
  { symbol: "AAPL", name: "Apple Inc.", category: "stock" },
  { symbol: "MSFT", name: "Microsoft Corp.", category: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc.", category: "stock" },
  { symbol: "TSLA", name: "Tesla Inc.", category: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corp.", category: "stock" },
];

export default function AssetExplorer() {
  const [category, setCategory] = useState<AssetCategory>("stock");
  const [suggestions, setSuggestions] = useState<AssetSuggestion[]>([]);
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    if (category === "stock") {
      setSuggestions(STOCK_SUGGESTIONS);
    } else if (category === "crypto") {
      setSuggestions(
        POPULAR_CRYPTO.map((symbol) => ({
          symbol,
          name: symbol.replace("BINANCE:", ""),
          category: "crypto" as const,
        }))
      );
    }
  }, [category]);

  const handleAdd = async (suggestion: AssetSuggestion) => {
    await addToWatchlist(suggestion.symbol, suggestion.category);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Explore Assets</h3>
        <Icon name="explore" className="text-cyan-400 text-[18px]" />
      </div>

      <div className="flex gap-2">
        {(["stock", "crypto"] as AssetCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              category === cat
                ? `bg-gradient-to-r ${assetHelpers.getCategoryColor(
                    cat
                  )} text-white shadow-lg`
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {assetHelpers.getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {suggestions.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center gap-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-2.5 transition"
          >
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${assetHelpers.getCategoryColor(
                item.category
              )} flex items-center justify-center flex-shrink-0`}
            >
              <Icon
                name={assetHelpers.getCategoryIcon(item.category)}
                className="text-white text-[14px]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {assetHelpers.formatSymbol(item.symbol)}
              </div>
              <div className="text-xs text-slate-400 truncate">{item.name}</div>
            </div>
            <button
              onClick={() => handleAdd(item)}
              disabled={isInWatchlist(item.symbol)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${
                isInWatchlist(item.symbol)
                  ? "bg-gradient-to-r from-cyan-500/85 to-blue-600/85 border-cyan-400/60 text-white shadow-sm shadow-cyan-500/25 cursor-not-allowed"
                  : "bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:text-cyan-300"
              }`}
            >
              <Icon
                name={
                  isInWatchlist(item.symbol) ? "bookmark" : "bookmark_add"
                }
                className="text-[16px]"
              />
              <span>{isInWatchlist(item.symbol) ? "Saved" : "Save"}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
