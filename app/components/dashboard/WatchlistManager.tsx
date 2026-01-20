"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "../ui/Icon";
import { watchlistManager, assetHelpers } from "@/app/lib/utils/watchlist";
import { getAssetLogoUrl } from "@/app/lib/utils/stockLogos";
import { WatchlistItem, AssetCategory } from "@/lib/types/assets";

export default function WatchlistManager() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<AssetCategory | "all">("all");
  const router = useRouter();

  useEffect(() => {
    setWatchlist(watchlistManager.getWatchlist());

    const handleWatchlistUpdate = () => {
      setWatchlist(watchlistManager.getWatchlist());
    };

    window.addEventListener("watchlist-updated", handleWatchlistUpdate);
    return () =>
      window.removeEventListener("watchlist-updated", handleWatchlistUpdate);
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
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Icon name="bookmarks" className="text-cyan-400 text-[20px]" />
          <h3 className="text-base font-bold text-white">My Watchlist</h3>
          <span className="text-xs text-slate-400">({watchlist.length})</span>
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
      </div>

      {filteredWatchlist.length === 0 ? (
        <div className="text-center py-8">
          <Icon
            name="bookmark_border"
            className="text-slate-600 text-[40px] mx-auto mb-2"
          />
          <p className="text-slate-500 text-sm">
            {filter === "all"
              ? "No items in watchlist yet"
              : `No ${filter} items`}
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Click bookmark on any asset to add
          </p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          {filteredWatchlist.map((item) => {
            const logoInfo = getAssetLogoUrl(item.symbol, item.category);
            return (
              <div
                key={item.symbol}
                className="group relative bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-3 transition cursor-pointer flex-shrink-0 w-40 border border-slate-600/30 hover:border-slate-500/50"
                onClick={() => handleClick(item.symbol)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-lg ${
                        logoInfo.type === "url"
                          ? "bg-white/95"
                          : `bg-gradient-to-br ${assetHelpers.getCategoryColor(
                              item.category
                            )}`
                      } flex items-center justify-center flex-shrink-0 shadow-md p-1`}
                    >
                      {logoInfo.type === "url" ? (
                        <Image
                          src={logoInfo.value}
                          alt={item.symbol}
                          width={32}
                          height={32}
                          className="w-full h-full object-contain rounded"
                          unoptimized
                        />
                      ) : (
                        <Icon
                          name={logoInfo.value}
                          className="text-white text-[18px]"
                        />
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/20 rounded"
                    >
                      <Icon name="close" className="text-red-400 text-[14px]" />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {assetHelpers.formatSymbol(item.symbol)}
                  </div>
                  <div className="text-xs text-slate-400 truncate capitalize">
                    {item.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
