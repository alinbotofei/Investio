"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import StockCard from "@/app/components/dashboard/StockCard";
import NewsFeed from "@/app/components/dashboard/NewsFeed";
import SimpleChart from "@/app/components/dashboard/SimpleChart";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import Icon from "@/app/components/ui/Icon";
import AnimatedPlaceholder from "@/app/components/ui/AnimatedPlaceholder";
import {
  POPULAR_STOCKS,
  DASHBOARD_QUICK_ACTIONS,
  SEND_BUTTON,
} from "@/app/lib/constants";
import { formatNumber, formatPrice } from "@/app/lib/utils/format";
import { getStockGradient } from "@/app/lib/utils/stockLogos";

interface StockMetrics {
  marketCap: string;
  pe: string;
  high52w: string;
  low52w: string;
  volume: string;
  avgVolume: string;
  beta: string;
  eps: string;
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tickerFromUrl = searchParams.get("ticker");
  const [selectedStock, setSelectedStock] = useState<string>(
    tickerFromUrl || "AAPL"
  );
  const [chatInput, setChatInput] = useState("");
  const [metrics, setMetrics] = useState<StockMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [stockLogos, setStockLogos] = useState<Record<string, string>>({});

  const placeholders = [
    `What's driving ${selectedStock}'s price today?`,
    `Should I buy ${selectedStock} now?`,
    `Analyze ${selectedStock}'s fundamentals`,
    `Compare ${selectedStock} with its competitors`,
    `What are analysts saying about ${selectedStock}?`,
  ];

  useEffect(() => {
    if (tickerFromUrl && POPULAR_STOCKS.includes(tickerFromUrl)) {
      setSelectedStock(tickerFromUrl);
    }
  }, [tickerFromUrl]);

  useEffect(() => {
    const fetchLogos = async () => {
      const logos: Record<string, string> = {};
      await Promise.all(
        POPULAR_STOCKS.map(async (symbol) => {
          try {
            const res = await fetch(`/api/stocks/quote?symbol=${symbol}`);
            const data = await res.json();
            if (data.logo) {
              logos[symbol] = data.logo;
            }
          } catch (err) {
            console.error(`Failed to fetch logo for ${symbol}`);
          }
        })
      );
      setStockLogos(logos);
    };
    fetchLogos();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const [quoteRes, metricsRes] = await Promise.all([
          fetch(`/api/stocks/quote?symbol=${selectedStock}`),
          fetch(`/api/stocks/metrics?symbol=${selectedStock}`),
        ]);

        const quoteData = await quoteRes.json();
        const metricsData = await metricsRes.json();

        setMetrics({
          marketCap: formatNumber(
            metricsData.metric?.marketCapitalization || 0
          ),
          pe: metricsData.metric?.peBasicExclExtraTTM?.toFixed(2) || "N/A",
          high52w: formatPrice(metricsData.metric?.["52WeekHigh"]),
          low52w: formatPrice(metricsData.metric?.["52WeekLow"]),
          volume: formatNumber(quoteData.volume || 0, ""),
          avgVolume: "N/A",
          beta: metricsData.metric?.beta?.toFixed(2) || "N/A",
          eps:
            metricsData.metric?.epsBasicExclExtraAnnual?.toFixed(2) ||
            metricsData.metric?.epsTTM?.toFixed(2) ||
            "N/A",
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [selectedStock]);

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    router.push(`/dashboard?ticker=${symbol}`, { scroll: false });
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      const contextMessage = `[Stock: ${selectedStock}] ${chatInput}`;
      const targetPath = `/chat?context=${encodeURIComponent(contextMessage)}`;

      if (pathname === "/chat") {
        window.location.href = targetPath;
      } else {
        router.push(targetPath);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Market Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Real-time stock data for {selectedStock}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          <div className="xl:col-span-3 order-1">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-4 xl:sticky xl:top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Watchlist</h2>
                <button
                  onClick={() => setWatchlistOpen(!watchlistOpen)}
                  className="xl:hidden text-white/70 hover:text-white transition"
                >
                  <Icon
                    name={watchlistOpen ? "expand_less" : "expand_more"}
                    className="text-[24px]"
                  />
                </button>
              </div>

              <div className="xl:hidden mb-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {POPULAR_STOCKS.map((symbol) => {
                    const gradient = getStockGradient(symbol);
                    const hasLogo = stockLogos[symbol];
                    return (
                      <button
                        key={symbol}
                        onClick={() => {
                          handleStockClick(symbol);
                          setWatchlistOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap font-semibold transition-all flex-shrink-0 ${
                          selectedStock === symbol
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105"
                            : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {hasLogo ? (
                          <img
                            src={stockLogos[symbol]}
                            alt={symbol}
                            className="w-5 h-5 rounded object-contain flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="w-5 h-5 rounded flex-shrink-0"
                            style={{
                              background:
                                selectedStock === symbol
                                  ? "rgba(255, 255, 255, 0.25)"
                                  : `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                            }}
                          />
                        )}
                        <span className="text-sm">{symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out xl:block ${
                  watchlistOpen
                    ? "max-h-[2000px] opacity-100"
                    : "max-h-0 opacity-0 xl:max-h-[2000px] xl:opacity-100"
                }`}
              >
                <div className="space-y-2 pt-2 xl:pt-0">
                  {POPULAR_STOCKS.map((symbol) => (
                    <StockCard
                      key={symbol}
                      symbol={symbol}
                      onClick={() => {
                        handleStockClick(symbol);
                        setWatchlistOpen(false);
                      }}
                      isActive={selectedStock === symbol}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-6 order-2 space-y-4 sm:space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-4 sm:p-6">
              <SimpleChart symbol={selectedStock} height={400} />
            </div>

            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-bold text-white mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {loadingMetrics
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-700/50 rounded-lg animate-pulse"
                      >
                        <div className="h-3 bg-slate-600 rounded w-16 mb-2" />
                        <div className="h-5 bg-slate-600 rounded w-20" />
                      </div>
                    ))
                  : metrics
                  ? [
                      { label: "Market Cap", value: metrics.marketCap },
                      { label: "P/E Ratio", value: metrics.pe },
                      { label: "52W High", value: metrics.high52w },
                      { label: "52W Low", value: metrics.low52w },
                      { label: "Volume", value: metrics.volume },
                      { label: "Avg Volume", value: metrics.avgVolume },
                      { label: "Beta", value: metrics.beta },
                      { label: "EPS", value: metrics.eps },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="p-3 bg-slate-700/50 rounded-lg transition-all hover:bg-slate-700"
                      >
                        <div className="text-xs text-slate-400 mb-1">
                          {metric.label}
                        </div>
                        <div className="text-base sm:text-lg font-bold text-white truncate">
                          {metric.value}
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Ask Investio about {selectedStock}
                </h3>
              </div>

              <div className="relative">
                <div className="relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder=" "
                    className="w-full p-4 pr-12 border border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-900/50 text-white transition-all text-sm sm:text-base peer"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                  />
                  {!chatInput && (
                    <div className="absolute left-4 top-4 pointer-events-none text-slate-400 text-sm sm:text-base">
                      <AnimatedPlaceholder
                        placeholders={placeholders}
                        interval={3500}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleChatSubmit}
                  className={`${SEND_BUTTON} w-11 h-11 absolute bottom-4 right-4 shadow-2xl active:scale-95`}
                  disabled={!chatInput.trim()}
                >
                  <Icon name="send" className="text-[20px]" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {DASHBOARD_QUICK_ACTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setChatInput(suggestion);
                    }}
                    className="px-3 py-1 text-xs border border-slate-700 rounded-full hover:bg-slate-700 transition-colors text-slate-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 order-3">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-4 xl:sticky xl:top-4">
              <NewsFeed symbol={selectedStock} />
            </div>
          </div>
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
