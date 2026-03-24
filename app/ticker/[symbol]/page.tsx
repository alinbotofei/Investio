"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import Icon from "@/app/components/ui/Icon";
import TradingChart from "@/app/components/dashboard/TradingChart";
import {
  NewsFeed,
  RecommendationsWidget,
  InsiderSentimentBadge,
  ChatWidget,
} from "@/app/components/dashboard";
import { assetHelpers } from "@/app/lib/utils/watchlist";
import { AssetCategory } from "@/lib/types/assets";
import { Stock } from "@/lib/types/stocks";
import type { RecommendationData } from "@/app/components/dashboard/RecommendationsWidget";
import type { InsiderSentimentData } from "@/app/components/dashboard/InsiderSentimentBadge";
import { formatNumber, formatPrice } from "@/app/lib/utils/format";
import { fetchTickerData } from "@/app/lib/utils/dataFetching";
import { useWatchlist } from "@/app/contexts/WatchlistContext";
import { getAssetLogoUrl } from "@/app/lib/utils/stockLogos";

export default function TickerPage() {
  const params = useParams();
  const router = useRouter();
  const encodedSymbol = params.symbol as string;
  const symbol = decodeURIComponent(encodedSymbol);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [category, setCategory] = useState<AssetCategory>("stock");
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Stock | null>(null);
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [insiderSentiment, setInsiderSentiment] = useState<InsiderSentimentData[]>([]);
  const [chartLastClose, setChartLastClose] = useState<number | null>(null);
  const [watchlistFeedback, setWatchlistFeedback] = useState<string | null>(
    null
  );
  const [watchlistPending, setWatchlistPending] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const inWatchlist = isInWatchlist(symbol);
  const logoInfo = getAssetLogoUrl(symbol, category, quote?.logo);

  useEffect(() => {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol.includes("BINANCE:") || upperSymbol.includes("USDT")) {
      setCategory("crypto");
    } else {
      setCategory("stock");
    }
  }, [symbol]);

  const loadData = useCallback(async () => {
    if (!category || !symbol) return;

    const upperSymbol = symbol.toUpperCase();
    const isValidCrypto =
      category === "crypto" &&
      (upperSymbol.includes("BINANCE:") || upperSymbol.includes("USDT"));
    const isValidStock =
      category === "stock" &&
      !upperSymbol.includes("BINANCE:") &&
      !upperSymbol.includes("USDT");

    if (!isValidCrypto && !isValidStock) {
      setError(`Invalid ${category} symbol format`);
      setInitialLoading(false);
      return;
    }

    setInitialLoading(true);
    setError(null);

    try {
      const data = await fetchTickerData(symbol, category);

      setQuote(data.quote);
      setRecommendations(
        Array.isArray(data.recommendations) ? data.recommendations : []
      );
      setInsiderSentiment(
        Array.isArray(data.insiderSentiment) ? (data.insiderSentiment as InsiderSentimentData[]) : []
      );
      setMetrics(data.metrics);
    } catch (err) {
      console.error("Error loading ticker data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  }, [symbol, category]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleWatchlist = async () => {
    if (watchlistPending) return;
    setWatchlistPending(true);
    let success = false;

    try {
      if (inWatchlist) {
        success = await removeFromWatchlist(symbol);
        if (success) {
          setWatchlistFeedback(`✓ Removed from watchlist`);
        } else {
          setWatchlistFeedback(`✗ Failed to remove from watchlist`);
        }
      } else {
        success = await addToWatchlist(symbol, category);
        if (success) {
          setWatchlistFeedback(`✓ Added to watchlist`);
        } else {
          setWatchlistFeedback(`✗ Failed to add to watchlist`);
        }
      }
    } finally {
      setTimeout(() => setWatchlistFeedback(null), 2500);
      setWatchlistPending(false);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="mb-4 sm:mb-6 h-9 w-36 bg-slate-800/60 rounded-lg animate-pulse" />

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-700/60 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-7 bg-slate-700/60 rounded-lg w-1/3 mb-2" />
                    <div className="h-4 bg-slate-700/40 rounded w-1/4 mb-3" />
                    <div className="h-5 bg-slate-700/40 rounded-full w-20" />
                  </div>
                  <div className="h-9 w-20 bg-slate-700/40 rounded-xl flex-shrink-0" />
                </div>
                <div className="mt-5 flex items-baseline gap-4">
                  <div className="h-10 bg-slate-700/60 rounded-lg w-32" />
                  <div className="h-6 bg-slate-700/40 rounded-lg w-28" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] xl:grid-cols-[1fr,600px] 2xl:grid-cols-[1fr,700px] gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-pulse">
                    <div className="h-5 bg-slate-700/60 rounded w-24 mb-5" />
                    <div className="h-[432px] bg-slate-700/30 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent skeleton-shimmer" />
                    </div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-pulse">
                    <div className="h-5 bg-slate-700/60 rounded w-28 mb-5" />
                    <div className="space-y-3">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-slate-700/20 last:border-0">
                          <div className="h-4 bg-slate-700/40 rounded w-24" />
                          <div className="h-4 bg-slate-700/60 rounded w-20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6 animate-pulse">
                    <div className="h-5 bg-slate-700/60 rounded w-20 mb-5" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="py-3 border-b border-slate-700/30 last:border-0">
                        <div className="h-4 bg-slate-700/40 rounded w-full mb-2" />
                        <div className="h-3 bg-slate-700/30 rounded w-3/4 mb-1.5" />
                        <div className="h-3 bg-slate-700/20 rounded w-1/3" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl h-80 animate-pulse">
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="h-5 bg-slate-700/60 rounded w-28" />
                    </div>
                    <div className="flex items-center justify-center h-48">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-700/40 mx-auto mb-3" />
                        <div className="h-4 bg-slate-700/30 rounded w-32 mx-auto mb-2" />
                        <div className="h-3 bg-slate-700/20 rounded w-24 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
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
      {watchlistFeedback && (
        <div className={`fixed top-24 right-6 px-6 py-3 rounded-lg shadow-2xl z-50 animate-[slideInRight_0.3s_ease-out] flex items-center gap-2 ${
          watchlistFeedback.startsWith('✓')
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-red-500 to-pink-500'
        } text-white`}>
          <Icon 
            name={watchlistFeedback.startsWith('✓') ? "check_circle" : "error"} 
            className="text-[20px]" 
          />
          <span className="font-medium">{watchlistFeedback.substring(2)}</span>
        </div>
      )}

      <div className="flex flex-col h-full min-h-0 overflow-x-hidden">
        <div className="flex-1 overflow-y-auto min-h-0 overflow-x-hidden">
          <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
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
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                logoInfo.type === "url" && !logoError
                  ? "bg-white/95 backdrop-blur p-2"
                  : "bg-white/20 backdrop-blur"
              }`}>
                {logoInfo.type === "url" && !logoError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoInfo.value}
                    alt=""
                    aria-hidden="true"
                    onError={() => setLogoError(true)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Icon
                    name={logoInfo.type === "icon" ? logoInfo.value : assetHelpers.getCategoryIcon(category)}
                    className="text-white text-[24px] sm:text-[28px] md:text-[32px]"
                  />
                )}
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
                disabled={watchlistPending}
                className={`group/watch relative px-3 py-2 rounded-xl transition-all duration-150 flex-shrink-0 border flex items-center gap-2 ${
                  inWatchlist
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400/60 shadow-[0_0_0_2px_rgba(6,182,212,0.25),0_6px_18px_-4px_rgba(37,99,235,0.45)] hover:shadow-[0_0_0_3px_rgba(6,182,212,0.35),0_8px_24px_-4px_rgba(37,99,235,0.6)] hover:scale-105"
                    : "bg-slate-800/90 border-slate-500/70 hover:border-cyan-400/50 hover:bg-slate-700/80 hover:scale-105"
                } ${watchlistPending ? "opacity-70 cursor-not-allowed hover:scale-100" : ""}`}
              >
                <Icon
                  name={inWatchlist ? "bookmark" : "bookmark_add"}
                  className={`text-[20px] sm:text-[22px] leading-none transition-all duration-150 ${
                    inWatchlist ? "text-white" : "text-slate-300 group-hover/watch:text-cyan-400"
                  }`}
                />
                <span className={`text-xs font-semibold hidden sm:inline transition-colors ${
                  inWatchlist ? "text-white" : "text-slate-300"
                }`}>
                  {inWatchlist ? "Saved" : "Save"}
                </span>
              </button>
          </div>

          <div className="mt-4 sm:mt-6 flex items-baseline gap-3 sm:gap-4 flex-wrap">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              ${(chartLastClose ?? quote?.price)?.toFixed(2) || "N/A"}
            </div>
            <div
              className={`flex items-center gap-1.5 sm:gap-2 ${
                (quote?.change ?? 0) >= 0 ? "text-green-300" : "text-red-300"
              }`}
            >
              <Icon
                name={(quote?.change ?? 0) >= 0 ? "trending_up" : "trending_down"}
                className="text-[16px] sm:text-[18px] md:text-[20px]"
              />
              <span className="text-base sm:text-lg font-semibold">
                {(quote?.change ?? 0) >= 0 ? "+" : ""}
                {quote?.change?.toFixed(2)} ({quote?.changePercent?.toFixed(2)}
                %)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] xl:grid-cols-[1fr,600px] 2xl:grid-cols-[1fr,700px] gap-4 sm:gap-6 lg:gap-8">
          <div className="space-y-4 sm:space-y-6 min-w-0 order-2 lg:order-1">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6 xl:p-8 backdrop-blur-sm">
              <h3 className="text-base sm:text-lg xl:text-xl font-bold text-white mb-3 sm:mb-4 xl:mb-6 flex items-center gap-2">
                <Icon name="show_chart" className="text-cyan-400 text-[20px] xl:text-[24px]" />
                Price Chart
              </h3>
              <TradingChart
                symbol={symbol}
                category={category}
                height={400}
                onLastClose={setChartLastClose}
              />
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

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-5 xl:p-6 backdrop-blur-sm">
              <h3 className="text-base sm:text-lg xl:text-xl font-bold text-white mb-3 sm:mb-4 xl:mb-6 flex items-center gap-2">
                <Icon
                  name="analytics"
                  className="text-cyan-400 text-[18px] sm:text-[20px] xl:text-[24px]"
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

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-5 xl:p-6 backdrop-blur-sm">
              <NewsFeed symbol={symbol} limit={8} />
            </div>
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start lg:h-[calc(100dvh-200px)] order-1 lg:order-2">
            <div className="relative bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-2 border-cyan-500/30 rounded-2xl p-1 backdrop-blur-sm shadow-2xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-300 lg:h-full lg:flex lg:flex-col">
              <div className="bg-slate-900/80 rounded-xl overflow-hidden backdrop-blur-xl border border-slate-700/50 lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-4 xl:px-6 py-3 xl:py-4 border-b border-cyan-500/20 flex-shrink-0">
                  <h3 className="text-lg xl:text-xl font-bold text-white flex items-center gap-2">
                    <Icon name="psychology" className="text-cyan-400 text-[22px] xl:text-[26px]" />
                    Ask About {quote?.name || assetHelpers.formatSymbol(symbol)}
                  </h3>
                  <p className="text-xs xl:text-sm text-slate-300 mt-1">Get instant AI-powered insights and analysis</p>
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  <ChatWidget
                    context={`Ticker: ${symbol}, Current Price: $${quote?.price?.toFixed(
                      2
                    )}, Category: ${category}`}
                    placeholder={`Ask me anything about ${
                      quote?.name || assetHelpers.formatSymbol(symbol)
                    }...`}
                    compact
                    navigateOnSend={false}
                  />
                </div>
              </div>
            </div>
          </div>
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
