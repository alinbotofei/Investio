"use client";

import { useEffect, useState } from "react";
import { NewsItem } from "@/lib/types/stocks";
import { formatDate } from "@/app/lib/utils/format";

interface NewsCardProps {
  article: NewsItem;
}

function NewsCard({ article }: NewsCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 border border-slate-700/50 rounded-lg hover:bg-slate-700/30 transition-colors group"
    >
      <h3 className="font-semibold text-sm text-white line-clamp-2 mb-1 group-hover:text-cyan-300 transition-colors">
        {article.headline}
      </h3>
      <p className="text-xs text-slate-400 line-clamp-2 mb-2">
        {article.summary}
      </p>
      <span className="text-xs text-slate-500">{formatDate(article.datetime)}</span>
    </a>
  );
}

interface NewsFeedProps {
  symbol?: string;
  category?: string;
  limit?: number;
}

export default function NewsFeed({
  symbol,
  category = "general",
  limit,
}: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (symbol) params.append("symbol", symbol);
        if (category) params.append("category", category);

        const response = await fetch(`/api/stocks/news?${params}`);
        if (!response.ok) throw new Error("Failed to fetch news");

        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60_000);
    return () => clearInterval(interval);
  }, [symbol, category]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-24 rounded-lg bg-slate-800/60 border border-slate-700/40" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400 text-sm">
        <p>{error}</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        <p>No news available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {symbol ? `${symbol} News` : "Market News"}
        </h2>
        <span className="text-xs text-slate-400">Live updates</span>
      </div>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {(limit ? news.slice(0, limit) : news).map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
