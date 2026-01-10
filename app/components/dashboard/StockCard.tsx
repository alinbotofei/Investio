'use client';

import { useEffect, useState } from 'react';
import { Stock } from '@/lib/types/stocks';

interface StockCardProps {
  symbol: string;
  onClick?: () => void;
  isActive?: boolean;
}

export default function StockCard({ symbol, onClick, isActive }: StockCardProps) {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await fetch(`/api/stocks/quote?symbol=${symbol}`);
        if (!response.ok) throw new Error('Failed to fetch quote');
        const data = await response.json();
        setStock(data);
      } catch (err) {
        console.error('Error fetching quote:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
    // Refresh every minute
    const interval = setInterval(fetchQuote, 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500">
        Failed to load {symbol}
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 border rounded-lg text-left transition-all hover:shadow-md ${
        isActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-bold text-lg">{stock.symbol}</div>
          <div className="text-xs text-gray-500 truncate max-w-[120px]">
            {stock.name}
          </div>
        </div>
        {stock.logo && (
          <img
            src={stock.logo}
            alt={stock.name}
            className="w-10 h-10 rounded-full object-contain"
          />
        )}
      </div>

      <div className="mb-2">
        <div className="text-2xl font-bold">
          ${stock.price.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? '▲' : '▼'} ${Math.abs(stock.change).toFixed(2)}
        </span>
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500">High</div>
          <div className="font-semibold">${stock.high.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500">Low</div>
          <div className="font-semibold">${stock.low.toFixed(2)}</div>
        </div>
      </div>
    </button>
  );
}
