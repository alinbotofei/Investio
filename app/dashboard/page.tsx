"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StockCard from "@/app/components/dashboard/StockCard";
import NewsFeed from "@/app/components/dashboard/NewsFeed";
import SimpleChart from "@/app/components/dashboard/SimpleChart";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import Icon from "@/app/components/ui/Icon";

const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "TSLA",
  "META",
  "JPM",
];

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
  const searchParams = useSearchParams();
  const tickerFromUrl = searchParams.get("ticker");
  const [selectedStock, setSelectedStock] = useState<string>(
    tickerFromUrl || "AAPL"
  );
  const [chatInput, setChatInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [metrics, setMetrics] = useState<StockMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

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
    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const [quoteRes, metricsRes] = await Promise.all([
          fetch(`/api/stocks/quote?symbol=${selectedStock}`),
          fetch(`/api/stocks/metrics?symbol=${selectedStock}`),
        ]);

        const quoteData = await quoteRes.json();
        const metricsData = await metricsRes.json();

        const formatNumber = (num: number, suffix = "") => {
          if (!num) return "N/A";
          if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T${suffix}`;
          if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B${suffix}`;
          if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M${suffix}`;
          return `${num.toFixed(2)}${suffix}`;
        };

        setMetrics({
          marketCap: formatNumber(
            metricsData.metric?.marketCapitalization || 0
          ),
          pe: metricsData.metric?.peBasicExclExtraTTM?.toFixed(2) || "N/A",
          high52w: metricsData.metric?.["52WeekHigh"]
            ? `$${metricsData.metric["52WeekHigh"].toFixed(2)}`
            : "N/A",
          low52w: metricsData.metric?.["52WeekLow"]
            ? `$${metricsData.metric["52WeekLow"].toFixed(2)}`
            : "N/A",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    router.push(`/dashboard?ticker=${symbol}`, { scroll: false });
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      const contextMessage = `[Stock: ${selectedStock}] ${chatInput}`;
      router.push(`/chat?context=${encodeURIComponent(contextMessage)}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Market Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Real-time stock data for {selectedStock}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-4 sticky top-4">
              <h2 className="text-lg font-bold text-white mb-4">Watchlist</h2>
              <div className="space-y-2">
                {POPULAR_STOCKS.map((symbol) => (
                  <StockCard
                    key={symbol}
                    symbol={symbol}
                    onClick={() => handleStockClick(symbol)}
                    isActive={selectedStock === symbol}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-6">
              <SimpleChart symbol={selectedStock} height={400} />
            </div>

            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                        <div className="text-lg font-bold text-white">
                          {metric.value}
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-lg font-bold text-white">
                  Ask Investio about {selectedStock}
                </h3>
              </div>

              <div className="relative">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={placeholders[placeholderIndex]}
                  className="w-full p-4 pr-12 border border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-900/50 text-white transition-all"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                />
                <button
                  onClick={handleChatSubmit}
                  className="absolute bottom-4 right-4 w-11 h-11 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
                  disabled={!chatInput.trim()}
                >
                  <Icon name="send" className="text-[20px]" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Should I buy?",
                  "Price target?",
                  "Earnings analysis",
                  "Competitor comparison",
                ].map((suggestion) => (
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

          <div className="lg:col-span-3">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-lg p-4 sticky top-4">
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
