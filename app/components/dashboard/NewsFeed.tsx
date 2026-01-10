'use client';

import { useEffect, useState } from 'react';
import { NewsItem } from '@/lib/types/stocks';

interface NewsCardProps {
  article: NewsItem;
}

function NewsCard({ article }: NewsCardProps) {
  const formattedDate = new Date(article.datetime * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 border border-slate-700/50 rounded-lg hover:bg-slate-700/30 transition-colors"
    >
      <div className="flex-1">
        <h3 className="font-semibold text-sm text-white line-clamp-2 mb-1">
          {article.headline}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
          {article.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{formattedDate}</span>
        </div>
      </div>
    </a>
  );
}

interface NewsFeedProps {
  symbol?: string;
  category?: string;
}

export default function NewsFeed({ symbol, category = 'general' }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (symbol) params.append('symbol', symbol);
        if (category) params.append('category', category);

        const response = await fetch(`/api/stocks/news?${params}`);
        if (!response.ok) throw new Error('Failed to fetch news');

        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol, category]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No news available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {symbol ? `${symbol} News` : 'Market News'}
        </h2>
        <span className="text-xs text-slate-400">Live updates</span>
      </div>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {news.map(article => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
