"use client";

import { useState, useEffect } from "react";
import Icon from "../ui/Icon";
import { AssetCategory } from "@/lib/types/assets";
import { assetHelpers, watchlistManager } from "@/app/lib/utils/watchlist";
import { POPULAR_CRYPTO, POPULAR_FOREX } from "@/app/lib/constants";

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
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const wl = watchlistManager.getWatchlist();
    setWatchlist(wl.map((item) => item.symbol));
  }, []);

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
    } else {
      setSuggestions(
        POPULAR_FOREX.map((symbol) => ({
          symbol,
          name: symbol.replace("OANDA:", "").replace("_", "/"),
          category: "forex" as const,
        }))
      );
    }
  }, [category]);

  const handleAdd = (suggestion: AssetSuggestion) => {
    watchlistManager.addToWatchlist(suggestion);
    const wl = watchlistManager.getWatchlist();
    setWatchlist(wl.map((item) => item.symbol));
  };

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Explore Assets</h3>
        <Icon name="explore" className="text-cyan-400 text-[18px]" />
      </div>

      <div className="flex gap-2">
        {(["stock", "crypto", "forex"] as AssetCategory[]).map((cat) => (
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
              className={`p-1.5 rounded transition ${
                isInWatchlist(item.symbol)
                  ? "text-cyan-400 cursor-not-allowed"
                  : "text-slate-400 hover:text-cyan-400 hover:bg-slate-700"
              }`}
            >
              <Icon
                name={
                  isInWatchlist(item.symbol) ? "bookmark" : "bookmark_border"
                }
                className="text-[18px]"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
