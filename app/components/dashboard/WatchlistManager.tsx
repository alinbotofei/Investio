"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "../ui/Icon";
import { watchlistManager, assetHelpers } from "@/app/lib/utils/watchlist";
import { getAssetLogoUrl } from "@/app/lib/utils/stockLogos";
import { WatchlistItem, AssetCategory } from "@/lib/types/assets";

export default function WatchlistManager() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<AssetCategory | "all">("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

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

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const cardWidth = 130;
      const gap = 10;
      const scrollAmount = (cardWidth + gap) * 2;

      const currentScroll = containerRef.current.scrollLeft;
      const newPosition =
        direction === "left"
          ? Math.max(0, currentScroll - scrollAmount)
          : currentScroll + scrollAmount;

      containerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  const updateScrollButtons = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => updateScrollButtons();
    container.addEventListener("scroll", handleScroll);

    updateScrollButtons();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [filteredWatchlist]);

  const canScrollLeft = scrollPosition > 5;
  const canScrollRight =
    containerRef.current &&
    scrollPosition <
      containerRef.current.scrollWidth - containerRef.current.clientWidth - 5;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between cursor-pointer p-3 sm:p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon name="bookmarks" className="text-cyan-400 text-[20px]" />
          <h3 className="text-base font-bold text-white">My Watchlist</h3>
          <span className="text-xs text-slate-400">({watchlist.length})</span>
        </div>
        <Icon
          name={isExpanded ? "expand_less" : "expand_more"}
          className="text-slate-400 text-[24px] transition-transform"
        />
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 overflow-hidden">
          {watchlist.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
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
              {(["stock", "crypto"] as AssetCategory[]).map((cat) => (
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

          {filteredWatchlist.length === 0 ? (
            <div className="text-center py-6">
              <Icon
                name="bookmark_border"
                className="text-slate-600 text-[32px] mx-auto mb-2"
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
            <div className="relative h-[110px]">
              {filteredWatchlist.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll("left");
                  }}
                  disabled={!canScrollLeft}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-200 ${
                    canScrollLeft
                      ? "bg-gradient-to-r from-slate-900 to-slate-800/90 hover:from-slate-800 hover:to-slate-700 hover:scale-110 border-slate-600 cursor-pointer"
                      : "bg-slate-800/30 border-slate-700/20 opacity-30 pointer-events-none"
                  }`}
                  aria-label="Scroll left"
                >
                  <Icon
                    name="chevron_left"
                    className={`text-[22px] ${
                      canScrollLeft ? "text-white" : "text-slate-500"
                    }`}
                  />
                </button>
              )}
              {filteredWatchlist.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll("right");
                  }}
                  disabled={!canScrollRight}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-200 ${
                    canScrollRight
                      ? "bg-gradient-to-l from-slate-900 to-slate-800/90 hover:from-slate-800 hover:to-slate-700 hover:scale-110 border-slate-600 cursor-pointer"
                      : "bg-slate-800/30 border-slate-700/20 opacity-30 pointer-events-none"
                  }`}
                  aria-label="Scroll right"
                >
                  <Icon
                    name="chevron_right"
                    className={`text-[22px] ${
                      canScrollRight ? "text-white" : "text-slate-500"
                    }`}
                  />
                </button>
              )}
              <div
                ref={containerRef}
                className="h-full flex gap-2.5 overflow-x-auto overflow-y-hidden scrollbar-hide px-1"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {filteredWatchlist.map((item) => {
                  const logoInfo = getAssetLogoUrl(item.symbol, item.category);
                  return (
                    <Link
                      key={item.symbol}
                      href={`/ticker/${item.symbol}`}
                      prefetch={true}
                      className="group/card relative bg-slate-700/30 hover:bg-slate-700/50 rounded-lg p-2 transition-all cursor-pointer flex-shrink-0 w-[130px] h-[95px] border border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg"
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-1.5">
                          <div
                            className={`w-8 h-8 rounded-lg ${
                              logoInfo.type === "url" && !imageErrors[item.symbol]
                                ? "bg-white/95"
                                : `bg-gradient-to-br ${assetHelpers.getCategoryColor(
                                    item.category
                                  )}`
                            } flex items-center justify-center flex-shrink-0 shadow-md p-1`}
                          >
                            {logoInfo.type === "url" && !imageErrors[item.symbol] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={logoInfo.value}
                                alt={item.symbol}
                                onError={() =>
                                  setImageErrors((prev) => ({
                                    ...prev,
                                    [item.symbol]: true,
                                  }))
                                }
                                className="w-full h-full object-contain rounded"
                              />
                            ) : (
                              <Icon
                                name={logoInfo.value}
                                className="text-white text-[16px]"
                              />
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleRemove(item.symbol);
                            }}
                            className="opacity-0 group-hover/card:opacity-100 transition-all duration-200 w-6 h-6 flex items-center justify-center hover:bg-red-500/30 hover:scale-110 rounded-md flex-shrink-0"
                            aria-label="Remove from watchlist"
                          >
                            <Icon
                              name="close"
                              className="text-red-400 hover:text-red-300 text-[15px] transition-colors"
                            />
                          </button>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white truncate mb-0.5">
                            {assetHelpers.formatSymbol(item.symbol)}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate capitalize">
                            {item.category}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
