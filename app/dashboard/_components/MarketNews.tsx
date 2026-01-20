"use client";

import { useState, useEffect } from "react";
import Icon from "../../components/ui/Icon";

interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  url: string;
  category: string;
  image?: string;
}

export default function MarketNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await fetch("/api/news/general");
      if (response.ok) {
        const data = await response.json();
        setNews(data.slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to load news:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-rose-500/20 border-2 border-purple-400/40 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
            <Icon name="article" className="text-white text-[26px]" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">Market News</h3>
            <p className="text-sm text-purple-200">Loading...</p>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-700/30 rounded-lg p-3.5 animate-pulse h-20"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-rose-500/20 border-2 border-purple-400/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl shadow-purple-500/10 ring-1 ring-purple-400/10">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
          <Icon
            name="article"
            className="text-white text-[22px] sm:text-[26px]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-white truncate">
            Market News
          </h3>
          <p className="text-xs sm:text-sm text-purple-200 truncate">
            Latest financial news
          </p>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
        {news.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/40 hover:border-purple-400/40 rounded-lg p-3 sm:p-3.5 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-1.5 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {article.headline}
                </h4>
                <p className="text-slate-400 text-[11px] sm:text-xs line-clamp-2 mb-1.5 sm:mb-2">
                  {article.summary}
                </p>
                <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Icon
                      name="source"
                      className="text-[12px] sm:text-[13px] flex-shrink-0"
                    />
                    <span className="truncate">{article.source}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon
                      name="schedule"
                      className="text-[12px] sm:text-[13px] flex-shrink-0"
                    />
                    {formatTimeAgo(article.datetime)}
                  </span>
                  {article.category && (
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[9px] sm:text-[10px] font-medium">
                      {article.category}
                    </span>
                  )}
                </div>
              </div>
              <Icon
                name="arrow_outward"
                className="text-slate-500 group-hover:text-cyan-400 text-[18px] flex-shrink-0 transition-colors"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
