"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import Icon from "@/app/components/ui/Icon";
import AnimatedPlaceholder from "@/app/components/ui/AnimatedPlaceholder";
import {
  NewsFeed,
  SimpleChart,
  WatchlistManager,
  RecommendationsWidget,
  InsiderSentimentBadge,
} from "@/app/components/dashboard";
import { POPULAR_STOCKS, SEND_BUTTON } from "@/app/lib/constants";
import { formatNumber, formatPrice } from "@/app/lib/utils/format";
import { watchlistManager } from "@/app/lib/utils/watchlist";
import type { AssetCategory } from "@/lib/types/assets";

interface KeyMetric {
  label: string;
  value: string;
  icon: string;
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tickerFromUrl = searchParams.get("ticker");

  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    tickerFromUrl || "AAPL"
  );
  const [category, setCategory] = useState<AssetCategory>("stock");
  const [chatInput, setChatInput] = useState("");
  const [metrics, setMetrics] = useState<KeyMetric[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [insiderSentiment, setInsiderSentiment] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const placeholders = [
    `What's driving ${selectedSymbol}'s performance?`,
    `Analyze ${selectedSymbol}'s key metrics`,
    `Latest news about ${selectedSymbol}`,
    `Should I invest in ${selectedSymbol}?`,
  ];

  useEffect(() => {
    if (tickerFromUrl && POPULAR_STOCKS.includes(tickerFromUrl)) {
      setSelectedSymbol(tickerFromUrl);
    }
  }, [tickerFromUrl]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        if (category === "stock") {
          const [quoteRes, metricsRes, recsRes, sentimentRes] =
            await Promise.all([
              fetch(`/api/stocks/quote?symbol=${selectedSymbol}`),
              fetch(`/api/stocks/metrics?symbol=${selectedSymbol}`),
              fetch(`/api/stocks/recommendations?symbol=${selectedSymbol}`),
              fetch(`/api/stocks/insider-sentiment?symbol=${selectedSymbol}`),
            ]);

          const [quote, metricsData, recs, sentiment] = await Promise.all([
            quoteRes.ok ? quoteRes.json() : {},
            metricsRes.ok ? metricsRes.json() : {},
            recsRes.ok ? recsRes.json() : [],
            sentimentRes.ok ? sentimentRes.json() : { data: [] },
          ]);

          setMetrics([
            {
              label: "Market Cap",
              value: formatNumber(
                metricsData.metric?.marketCapitalization || 0
              ),
              icon: "analytics",
            },
            {
              label: "P/E Ratio",
              value:
                metricsData.metric?.peBasicExclExtraTTM?.toFixed(2) || "N/A",
              icon: "percent",
            },
            {
              label: "52W High",
              value: formatPrice(metricsData.metric?.["52WeekHigh"]),
              icon: "trending_up",
            },
            {
              label: "52W Low",
              value: formatPrice(metricsData.metric?.["52WeekLow"]),
              icon: "trending_down",
            },
            {
              label: "Volume",
              value: formatNumber(quote.volume || 0, ""),
              icon: "swap_horiz",
            },
            {
              label: "Beta",
              value: metricsData.metric?.beta?.toFixed(2) || "N/A",
              icon: "show_chart",
            },
          ]);

          setRecommendations(recs);
          setInsiderSentiment(sentiment.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedSymbol, category]);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    router.push(`/dashboard?ticker=${symbol}`, { scroll: false });
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      const contextMessage = `[${category.toUpperCase()}: ${selectedSymbol}] ${chatInput}`;
      router.push(`/chat?context=${encodeURIComponent(contextMessage)}`);
    }
  };

  const handleViewDetails = () => {
    router.push(`/ticker/${selectedSymbol}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Market Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Track and analyze your investments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 lg:sticky lg:top-24">
              <WatchlistManager />
            </div>
          </aside>

          <main className="lg:col-span-9 space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Icon
                      name="candlestick_chart"
                      className="text-white text-[24px]"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedSymbol}
                    </h2>
                    <p className="text-sm text-slate-400">Stock</p>
                  </div>
                </div>
                <button
                  onClick={handleViewDetails}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-medium transition-colors"
                >
                  <span>View Details</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              </div>

              <SimpleChart symbol={selectedSymbol} height={320} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingData
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 animate-pulse"
                    >
                      <div className="h-4 bg-slate-700 rounded w-20 mb-2" />
                      <div className="h-6 bg-slate-700 rounded w-24" />
                    </div>
                  ))
                : metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          name={metric.icon}
                          className="text-cyan-400 text-[16px]"
                        />
                        <span className="text-xs text-slate-400">
                          {metric.label}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {metric.value}
                      </div>
                    </div>
                  ))}
            </div>

            {category === "stock" && (
              <>
                <RecommendationsWidget
                  data={recommendations}
                  loading={loadingData}
                />
                <InsiderSentimentBadge
                  data={insiderSentiment}
                  loading={loadingData}
                />
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="text-lg font-bold text-white">
                    Ask about {selectedSymbol}
                  </h3>
                </div>

                <div className="relative mb-4">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder=" "
                    className="w-full p-4 pr-12 border border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-900/50 text-white transition-all text-sm peer"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                  />
                  {!chatInput && (
                    <div className="absolute left-4 top-4 pointer-events-none text-slate-400 text-sm">
                      <AnimatedPlaceholder
                        placeholders={placeholders}
                        interval={3500}
                      />
                    </div>
                  )}
                  <button
                    onClick={handleChatSubmit}
                    className={`${SEND_BUTTON} w-10 h-10 absolute bottom-4 right-4 shadow-lg active:scale-95`}
                    disabled={!chatInput.trim()}
                  >
                    <Icon name="send" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <NewsFeed symbol={selectedSymbol} limit={5} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="w-8 h-8">
              <svg
                className="animate-spin text-cyan-500"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="rgba(34,211,238,0.2)"
                  strokeWidth="4"
                ></circle>
                <path
                  d="M22 12a10 10 0 0 0-10-10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                ></path>
              </svg>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
