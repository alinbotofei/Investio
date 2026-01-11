"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import Icon from "@/app/components/ui/Icon";
import { watchlistManager, assetHelpers } from "@/app/lib/utils/watchlist";
import { AssetCategory } from "@/lib/types/assets";

export default function TickerPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;

  const [category, setCategory] = useState<AssetCategory>("stock");
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [insiderSentiment, setInsiderSentiment] = useState<any[]>([]);

  useEffect(() => {
    if (symbol.includes("BINANCE:")) {
      setCategory("crypto");
    } else if (symbol.includes("OANDA:")) {
      setCategory("forex");
    } else {
      setCategory("stock");
    }
  }, [symbol]);

  useEffect(() => {
    setInWatchlist(watchlistManager.isInWatchlist(symbol));
  }, [symbol]);

  useEffect(() => {
    if (!category) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const quoteRes = await fetch(`/api/stocks/quote?symbol=${symbol}`);
        const quoteData = await quoteRes.json();
        setQuote(quoteData);

        if (category === "stock") {
          const [recsRes, sentimentRes] = await Promise.all([
            fetch(`/api/stocks/recommendations?symbol=${symbol}`),
            fetch(`/api/stocks/insider-sentiment?symbol=${symbol}`),
          ]);

          if (recsRes.ok) {
            const recsData = await recsRes.json();
            setRecommendations(recsData);
          }

          if (sentimentRes.ok) {
            const sentimentData = await sentimentRes.json();
            setInsiderSentiment(sentimentData.data || []);
          }
        }
      } catch (error) {
        console.error("Error loading ticker data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [symbol, category]);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      watchlistManager.removeFromWatchlist(symbol);
      setInWatchlist(false);
    } else {
      watchlistManager.addToWatchlist({
        symbol,
        name: quote?.name || symbol,
        category,
      });
      setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const changeColor = quote?.change >= 0 ? "text-green-400" : "text-red-400";

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 overflow-y-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <Icon name="arrow_back" className="text-[20px]" />
          <span className="text-sm">Back</span>
        </button>

        <div
          className={`bg-gradient-to-br ${assetHelpers.getCategoryColor(
            category
          )} rounded-2xl p-6 mb-6 shadow-2xl`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Icon
                  name={assetHelpers.getCategoryIcon(category)}
                  className="text-white text-[32px]"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {assetHelpers.formatSymbol(symbol)}
                </h1>
                <p className="text-white/80">{quote?.name || symbol}</p>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-xs font-medium mt-2">
                  {assetHelpers.getCategoryLabel(category)}
                </span>
              </div>
            </div>
            <button
              onClick={toggleWatchlist}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition backdrop-blur"
            >
              <Icon
                name={inWatchlist ? "bookmark" : "bookmark_border"}
                className="text-white text-[24px]"
              />
            </button>
          </div>
        </div>

        <div className="mb-6 bg-slate-800/90 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-baseline gap-4 mb-4">
            <div className="text-4xl font-bold text-white">
              ${quote?.price?.toFixed(2) || "N/A"}
            </div>
            <div className={`flex items-center gap-2 ${changeColor}`}>
              <Icon
                name={quote?.change >= 0 ? "trending_up" : "trending_down"}
                className="text-[20px]"
              />
              <span className="text-lg font-semibold">
                {quote?.change >= 0 ? "+" : ""}
                {quote?.change?.toFixed(2)} ({quote?.changePercent?.toFixed(2)}
                %)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Price Chart</h3>
              <div className="h-64 flex items-center justify-center text-slate-500">
                Chart placeholder - TradingView or custom implementation
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Analyst Recommendations
                </h3>
                {recommendations.slice(0, 3).map((rec, idx) => {
                  const total =
                    rec.strongBuy +
                    rec.buy +
                    rec.hold +
                    rec.sell +
                    rec.strongSell;
                  return (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>{rec.period}</span>
                        <span>{total} analysts</span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-green-600"
                          style={{ width: `${(rec.strongBuy / total) * 100}%` }}
                          title={`Strong Buy: ${rec.strongBuy}`}
                        />
                        <div
                          className="bg-green-400"
                          style={{ width: `${(rec.buy / total) * 100}%` }}
                          title={`Buy: ${rec.buy}`}
                        />
                        <div
                          className="bg-yellow-500"
                          style={{ width: `${(rec.hold / total) * 100}%` }}
                          title={`Hold: ${rec.hold}`}
                        />
                        <div
                          className="bg-orange-400"
                          style={{ width: `${(rec.sell / total) * 100}%` }}
                          title={`Sell: ${rec.sell}`}
                        />
                        <div
                          className="bg-red-600"
                          style={{
                            width: `${(rec.strongSell / total) * 100}%`,
                          }}
                          title={`Strong Sell: ${rec.strongSell}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Key Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Open</span>
                  <span className="text-white font-semibold">
                    ${quote?.open?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">High</span>
                  <span className="text-white font-semibold">
                    ${quote?.high?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Low</span>
                  <span className="text-white font-semibold">
                    ${quote?.low?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Prev. Close</span>
                  <span className="text-white font-semibold">
                    ${quote?.previousClose?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {insiderSentiment.length > 0 && (
              <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Insider Sentiment
                </h3>
                <div className="space-y-2">
                  {insiderSentiment.slice(0, 6).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center"
                    >
                      <span className="text-slate-400 text-sm">
                        {item.year}-{String(item.month).padStart(2, "0")}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.mspr > 0
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {item.mspr > 0 ? "Bullish" : "Bearish"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
