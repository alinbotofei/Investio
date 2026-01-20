"use client";

import { useState, useEffect } from "react";
import Icon from "../../components/ui/Icon";
import TickerCard from "./TickerCard";
import { watchlistManager } from "@/app/lib/utils/watchlist";
import { emitWatchlistUpdate } from "@/app/lib/utils/events";
import {
  marketService,
  type MarketOverviewData,
  type QuoteSimple,
} from "@/lib/services/marketService";
import type { AssetCategory } from "@/lib/types/assets";

export default function MarketOverview() {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [watchlistFeedback, setWatchlistFeedback] = useState<string | null>(
    null
  );

  const [expandedSections, setExpandedSections] = useState({
    topMovers: true,
    stocks: true,
    crypto: true,
    forex: true,
  });

  useEffect(() => {
    loadData();
    setWatchlist(watchlistManager.getWatchlist());

    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    if (!data) {
      setLoading(true);
    }
    const overview = await marketService.getMarketOverview();
    if (overview) {
      setData(overview);
    }
    setLoading(false);
  };

  const handleAddToWatchlist = (symbol: string, category: AssetCategory) => {
    const existing = watchlist.find((w) => w.symbol === symbol);
    if (existing) {
      watchlistManager.removeFromWatchlist(symbol);
      setWatchlistFeedback(`${symbol} removed from watchlist`);
    } else {
      watchlistManager.addToWatchlist({
        symbol,
        name: symbol,
        category,
      });
      setWatchlistFeedback(`${symbol} added to watchlist`);
    }
    setWatchlist(watchlistManager.getWatchlist());

    emitWatchlistUpdate();

    setTimeout(() => setWatchlistFeedback(null), 2000);
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some((w) => w.symbol === symbol);
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
    if (!data || loading) return null;

    const allQuotes = [
      ...(data.stocks || []),
      ...(data.crypto || []),
      ...(data.forex || []),
    ];
    const topMovers = getTopMovers(allQuotes, 6);

    return (
      <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/20 rounded-2xl p-4 sm:p-6 mb-6">
        <div
          className="flex items-center justify-between mb-5 cursor-pointer"
          onClick={() => toggleSection("topMovers")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <Icon
                name="local_fire_department"
                className="text-white text-[22px] sm:text-[26px]"
              />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Top Movers
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Biggest changes across all markets
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Icon
              name={expandedSections.topMovers ? "expand_less" : "expand_more"}
              className="text-white text-[24px]"
            />
          </button>
        </div>
        <div
          className={`grid gap-4 sm:gap-5 transition-all duration-300 ease-in-out overflow-hidden ${
            expandedSections.topMovers
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 opacity-100 max-h-[3000px]"
              : "grid-cols-1 opacity-0 max-h-0"
          }`}
        >
          {topMovers.map((quote) => {
            const category = quote.symbol.includes("BINANCE:")
              ? "crypto"
              : quote.symbol.includes("OANDA:")
              ? "forex"
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
    sectionKey: "stocks" | "crypto" | "forex"
  ) => (
    <section className="mb-6">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer group"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
          >
            <Icon
              name={icon}
              className="text-white text-[20px] sm:text-[24px]"
            />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {quotes.length} assets tracked
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Icon
            name={expandedSections[sectionKey] ? "expand_less" : "expand_more"}
            className="text-slate-400 group-hover:text-white text-[24px] transition-colors"
          />
        </button>
      </div>
      <div
        className={`grid gap-4 sm:gap-5 transition-all duration-300 ease-in-out overflow-hidden ${
          expandedSections[sectionKey]
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-100 max-h-[5000px]"
            : "grid-cols-1 opacity-0 max-h-0"
        }`}
      >
        {loading
          ? Array.from({ length: category === "stock" ? 8 : 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 animate-pulse h-32 sm:h-36"
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
      {/* Watchlist Feedback Toast */}
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

      {data?.forex &&
        data.forex.length > 0 &&
        renderSection(
          "Forex",
          "currency_exchange",
          "from-green-600 to-emerald-500",
          data.forex,
          "forex",
          "forex"
        )}
    </div>
  );
}
