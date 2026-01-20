"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import Icon from "@/app/components/ui/Icon";
import {
  SimpleChart,
  NewsFeed,
  RecommendationsWidget,
  InsiderSentimentBadge,
  ChatWidget,
} from "@/app/components/dashboard";
import { watchlistManager, assetHelpers } from "@/app/lib/utils/watchlist";
import { AssetCategory } from "@/lib/types/assets";
import { formatNumber, formatPrice } from "@/app/lib/utils/format";
import { fetchTickerData } from "@/app/lib/utils/dataFetching";
import { emitWatchlistUpdate } from "@/app/lib/utils/events";

export default function TickerPage() {
  const params = useParams();
  const router = useRouter();
  const encodedSymbol = params.symbol as string;
  const symbol = decodeURIComponent(encodedSymbol);

  const [category, setCategory] = useState<AssetCategory>("stock");
  const [inWatchlist, setInWatchlist] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [insiderSentiment, setInsiderSentiment] = useState<any[]>([]);
  const [watchlistFeedback, setWatchlistFeedback] = useState<string | null>(
    null
  );

  useEffect(() => {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol.includes("BINANCE:") || upperSymbol.includes("USDT")) {
      setCategory("crypto");
    } else if (upperSymbol.includes("OANDA:") || upperSymbol.includes("/")) {
      setCategory("forex");
    } else {
      setCategory("stock");
    }
  }, [symbol]);

  useEffect(() => {
    setInWatchlist(watchlistManager.isInWatchlist(symbol));
  }, [symbol]);

  const loadData = useCallback(async () => {
    if (!category || !symbol) return;

    const upperSymbol = symbol.toUpperCase();
    const isValidCrypto =
      category === "crypto" &&
      (upperSymbol.includes("BINANCE:") || upperSymbol.includes("USDT"));
    const isValidForex =
      category === "forex" &&
      (upperSymbol.includes("OANDA:") || upperSymbol.includes("/"));
    const isValidStock =
      category === "stock" &&
      !upperSymbol.includes("BINANCE:") &&
      !upperSymbol.includes("OANDA:");

    if (!isValidCrypto && !isValidForex && !isValidStock) {
      setError(`Invalid ${category} symbol format`);
      setInitialLoading(false);
      return;
    }

    const isFirstLoad = !quote;
    if (isFirstLoad) {
      setInitialLoading(true);
    }
    setError(null);

    try {
      const data = await fetchTickerData(symbol, category);

      setQuote(data.quote);
      setRecommendations(
        Array.isArray(data.recommendations) ? data.recommendations : []
      );
      setInsiderSentiment(
        Array.isArray(data.insiderSentiment) ? data.insiderSentiment : []
      );
      setMetrics(data.metrics);
    } catch (err) {
      console.error("Error loading ticker data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  }, [symbol, category, quote]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setInWatchlist(watchlistManager.isInWatchlist(symbol));
  }, [symbol]);

  const toggleWatchlist = () => {
    const newInWatchlist = !inWatchlist;
    setInWatchlist(newInWatchlist);

    if (!newInWatchlist) {
      watchlistManager.removeFromWatchlist(symbol);
      setWatchlistFeedback(`Removed from watchlist`);
    } else {
      watchlistManager.addToWatchlist({
        symbol,
        name: quote?.name || symbol,
        category,
      });
      setWatchlistFeedback(`Added to watchlist`);
    }

    emitWatchlistUpdate();
    setTimeout(() => setWatchlistFeedback(null), 2000);
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Loading {symbol} data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <Icon name="error_outline" className="text-red-400 text-5xl mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Error Loading Data
            </h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-cyan-500/20 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Watchlist Feedback Toast */}
      {watchlistFeedback && (
        <div className="fixed top-24 right-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-[slideInRight_0.3s_ease-out] flex items-center gap-2">
          <Icon name="check_circle" className="text-[20px]" />
          <span className="font-medium">{watchlistFeedback}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition-all group"
        >
          <Icon
            name="arrow_back"
            className="text-[18px] sm:text-[20px] group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-xs sm:text-sm font-medium">
            Back to Dashboard
          </span>
        </button>

        <div
          className={`bg-gradient-to-br ${assetHelpers.getCategoryColor(
            category
          )} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 shadow-2xl border border-white/10`}
        >
          <div className="flex items-start justify-between flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon
                  name={assetHelpers.getCategoryIcon(category)}
                  className="text-white text-[24px] sm:text-[28px] md:text-[32px]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1 truncate">
                  {assetHelpers.formatSymbol(symbol)}
                </h1>
                <p className="text-white/80 text-xs sm:text-sm truncate">
                  {quote?.name || symbol}
                </p>
                <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur rounded-full text-white text-[10px] sm:text-xs font-medium mt-1 sm:mt-2">
                  {assetHelpers.getCategoryLabel(category)}
                </span>
              </div>
            </div>
            <button
              onClick={toggleWatchlist}
              className={`p-3 rounded-xl transition-all backdrop-blur group flex-shrink-0 border ${
                inWatchlist
                  ? "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/30 hover:border-cyan-400/50"
                  : "bg-white/10 hover:bg-white/20 border-white/10 hover:border-white/20"
              }`}
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <Icon
                name={inWatchlist ? "bookmark" : "bookmark_border"}
                className={`text-[22px] sm:text-[26px] group-hover:scale-110 transition-transform ${
                  inWatchlist ? "text-cyan-300" : "text-white"
                }`}
              />
            </button>
          </div>

          <div className="mt-4 sm:mt-6 flex items-baseline gap-3 sm:gap-4 flex-wrap">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              ${quote?.price?.toFixed(2) || "N/A"}
            </div>
            <div
              className={`flex items-center gap-1.5 sm:gap-2 ${
                quote?.change >= 0 ? "text-green-300" : "text-red-300"
              }`}
            >
              <Icon
                name={quote?.change >= 0 ? "trending_up" : "trending_down"}
                className="text-[16px] sm:text-[18px] md:text-[20px]"
              />
              <span className="text-base sm:text-lg font-semibold">
                {quote?.change >= 0 ? "+" : ""}
                {quote?.change?.toFixed(2)} ({quote?.changePercent?.toFixed(2)}
                %)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-4 sm:gap-6">
          {/* Left Column - Chart + Widgets */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
                Price Chart
              </h3>
              <SimpleChart symbol={symbol} height={400} />
            </div>

            {category === "stock" && (
              <>
                <RecommendationsWidget
                  data={recommendations}
                  loading={initialLoading}
                />
                <InsiderSentimentBadge
                  data={insiderSentiment}
                  loading={initialLoading}
                />
              </>
            )}

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <ChatWidget
                context={`Ticker: ${symbol}, Current Price: $${quote?.price?.toFixed(
                  2
                )}, Category: ${category}`}
                placeholder={`Ask me anything about ${
                  quote?.name || assetHelpers.formatSymbol(symbol)
                }...`}
                compact
              />
            </div>
          </div>

          <div className="xl:sticky xl:top-6 space-y-4 sm:space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Icon
                  name="analytics"
                  className="text-cyan-400 text-[18px] sm:text-[20px]"
                />
                Key Metrics
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                <MetricRow
                  label="Open"
                  value={`$${quote?.open?.toFixed(2) || "N/A"}`}
                />
                <MetricRow
                  label="High"
                  value={`$${quote?.high?.toFixed(2) || "N/A"}`}
                />
                <MetricRow
                  label="Low"
                  value={`$${quote?.low?.toFixed(2) || "N/A"}`}
                />
                <MetricRow
                  label="Prev. Close"
                  value={`$${quote?.previousClose?.toFixed(2) || "N/A"}`}
                />
                {category === "stock" && metrics && (
                  <>
                    <div className="border-t border-slate-700/50 my-3 pt-3" />
                    <MetricRow
                      label="Market Cap"
                      value={formatNumber(metrics.marketCapitalization || 0)}
                    />
                    <MetricRow
                      label="P/E Ratio"
                      value={metrics.peBasicExclExtraTTM?.toFixed(2) || "N/A"}
                    />
                    <MetricRow
                      label="Beta"
                      value={metrics.beta?.toFixed(2) || "N/A"}
                    />
                    <MetricRow
                      label="52W High"
                      value={formatPrice(metrics["52WeekHigh"])}
                    />
                    <MetricRow
                      label="52W Low"
                      value={formatPrice(metrics["52WeekLow"])}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-5">
              <NewsFeed symbol={symbol} limit={8} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-slate-400 text-xs sm:text-sm">{label}</span>
      <span className="text-white font-semibold text-xs sm:text-sm truncate">
        {value}
      </span>
    </div>
  );
}
