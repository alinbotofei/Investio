"use client";

import { useState, useEffect, memo } from "react";
import Icon from "../../components/atoms/Icon";
import TickerCard from "./TickerCard";
import { useWatchlist } from "@/app/contexts/WatchlistContext";
import {
  marketService,
  type MarketOverviewData,
  type QuoteSimple,
} from "@/lib/services/marketService";
import type { AssetCategory } from "@/lib/types/assets";

function MarketOverview() {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlistFeedback, setWatchlistFeedback] = useState<string | null>(
    null
  );
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const [expandedSections, setExpandedSections] = useState({
    topMovers: true,
    stocks: true,
    crypto: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!data) {
        setLoading(true);
      }
      const overview = await marketService.getMarketOverview();
      if (overview) {
        setData(overview);
      }
      setLoading(false);
    };

    fetchData();

    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToWatchlist = async (symbol: string, category: AssetCategory) => {
    const inWatchlist = isInWatchlist(symbol);
    let success = false;
    
    if (inWatchlist) {
      success = await removeFromWatchlist(symbol);
      if (success) {
        setWatchlistFeedback(`${symbol} removed from watchlist`);
      }
    } else {
      success = await addToWatchlist(symbol, category);
      if (success) {
        setWatchlistFeedback(`${symbol} added to watchlist`);
      }
    }

    if (success) {
      setTimeout(() => setWatchlistFeedback(null), 2000);
    }
  };


  const getTopMovers = (quotes: QuoteSimple[], limit: number = 6) => {
    return [...quotes]
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, limit);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderTopMovers = () => {
    if (loading) return (
      <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5">
        <div className="h-10 w-56 bg-slate-700/60 rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
    if (!data) return null;

    const allQuotes = [
      ...(data.stocks || []),
      ...(data.crypto || []),
    ];
    const topMovers = getTopMovers(allQuotes, 6);

    return (
      <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5">
        <div
          className="flex items-center justify-between mb-3 sm:mb-4 cursor-pointer"
          onClick={() => toggleSection("topMovers")}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
              <Icon
                name="local_fire_department"
                className="text-white text-[20px] sm:text-[22px]"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Top Movers
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Biggest changes across all markets
              </p>
            </div>
          </div>
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Icon
              name={expandedSections.topMovers ? "expand_less" : "expand_more"}
              className="text-white text-[22px]"
            />
          </button>
        </div>
        <div
          className={`grid gap-3 transition-all duration-150 ease-in-out overflow-hidden ${
            expandedSections.topMovers
              ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 opacity-100 max-h-[3000px]"
              : "grid-cols-1 opacity-0 max-h-0"
          }`}
        >
          {topMovers.map((quote) => {
            const category = quote.symbol.includes("BINANCE:")
              ? "crypto"
              : "stock";
            return (
              <TickerCard
                key={quote.symbol}
                quote={quote}
                category={category as AssetCategory}
                onAddToWatchlist={() =>
                  handleAddToWatchlist(quote.symbol, category as AssetCategory)
                }
                inWatchlist={isInWatchlist(quote.symbol)}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    icon: string,
    gradient: string,
    quotes: QuoteSimple[],
    category: AssetCategory,
    sectionKey: "stocks" | "crypto"
  ) => (
    <section className="mb-4 sm:mb-5">
      <div
        className="flex items-center justify-between mb-3 sm:mb-4 cursor-pointer group"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
          >
            <Icon
              name={icon}
              className="text-white text-[18px] sm:text-[20px]"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {quotes.length} assets tracked
            </p>
          </div>
        </div>
        <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Icon
            name={expandedSections[sectionKey] ? "expand_less" : "expand_more"}
            className="text-slate-400 group-hover:text-white text-[22px] transition-colors"
          />
        </button>
      </div>
      <div
        className={`grid gap-3 transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSections[sectionKey]
            ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 opacity-100 max-h-[5000px]"
            : "grid-cols-1 opacity-0 max-h-0"
        }`}
      >
        {loading
          ? Array.from({ length: category === "stock" ? 8 : 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 animate-pulse h-28"
              />
            ))
          : quotes.map((quote) => (
              <TickerCard
                key={quote.symbol}
                quote={quote}
                category={category}
                onAddToWatchlist={() =>
                  handleAddToWatchlist(quote.symbol, category)
                }
                inWatchlist={isInWatchlist(quote.symbol)}
              />
            ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      {watchlistFeedback && (
        <div className="fixed top-24 right-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-[slideInRight_0.3s_ease-out] flex items-center gap-2">
          <Icon name="check_circle" className="text-[20px]" />
          <span className="font-medium">{watchlistFeedback}</span>
        </div>
      )}

      {renderTopMovers()}

      {data?.stocks &&
        data.stocks.length > 0 &&
        renderSection(
          "Stocks",
          "show_chart",
          "from-blue-600 to-cyan-500",
          data.stocks,
          "stock",
          "stocks"
        )}

      {data?.crypto &&
        data.crypto.length > 0 &&
        renderSection(
          "Cryptocurrency",
          "currency_bitcoin",
          "from-orange-500 to-yellow-500",
          data.crypto,
          "crypto",
          "crypto"
        )}
    </div>
  );
}

export default memo(MarketOverview);
