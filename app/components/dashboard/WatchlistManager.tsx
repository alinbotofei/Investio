"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "../ui/Icon";
import { watchlistManager, assetHelpers } from "@/app/lib/utils/watchlist";
import { WatchlistItem, AssetCategory } from "@/lib/types/assets";

export default function WatchlistManager() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<AssetCategory | "all">("all");
  const router = useRouter();

  useEffect(() => {
    setWatchlist(watchlistManager.getWatchlist());
  }, []);

  const filteredWatchlist =
    filter === "all"
      ? watchlist
      : watchlist.filter((item) => item.category === filter);

  const handleRemove = (symbol: string) => {
    watchlistManager.removeFromWatchlist(symbol);
    setWatchlist(watchlistManager.getWatchlist());
  };

  const handleClick = (symbol: string) => {
    router.push(`/ticker/${symbol}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">My Watchlist</h3>
        <Icon name="bookmarks" className="text-cyan-400 text-[18px]" />
      </div>

      {watchlist.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              filter === "all"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
            }`}
          >
            All
          </button>
          {(["stock", "crypto", "forex"] as AssetCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                filter === cat
                  ? `bg-gradient-to-r ${assetHelpers.getCategoryColor(
                      cat
                    )} text-white`
                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {assetHelpers.getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-6">
            <Icon
              name="bookmark_border"
              className="text-slate-600 text-[32px] mx-auto mb-2"
            />
            <p className="text-slate-500 text-xs">
              {filter === "all" ? "No items yet" : `No ${filter} items`}
            </p>
          </div>
        ) : (
          filteredWatchlist.map((item) => (
            <div
              key={item.symbol}
              className="group relative bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-2.5 transition cursor-pointer"
              onClick={() => handleClick(item.symbol)}
            >
              <div className="flex items-center gap-2.5">
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
                  <div className="text-xs text-slate-400 truncate">
                    {item.name}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.symbol);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/20 rounded"
                >
                  <Icon name="close" className="text-red-400 text-[16px]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
