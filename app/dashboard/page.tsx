'use client';

import { useState } from 'react';
import StockCard from '@/app/components/dashboard/StockCard';
import NewsFeed from '@/app/components/dashboard/NewsFeed';
import SimpleChart from '@/app/components/dashboard/SimpleChart';
import Link from 'next/link';

// Popular stocks to track
const POPULAR_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'JPM'];

export default function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [chatInput, setChatInput] = useState('');

  const placeholders = [
    `What's driving ${selectedStock}'s price today?`,
    `Should I buy ${selectedStock} now?`,
    `Analyze ${selectedStock}'s fundamentals`,
    `Compare ${selectedStock} with its competitors`,
    `What are analysts saying about ${selectedStock}?`
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotate placeholder every 3 seconds
  useState(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Stock Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time market data & AI insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/chat"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                AI Chat →
              </Link>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Stock List */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Watchlist</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {POPULAR_STOCKS.map(symbol => (
                  <StockCard
                    key={symbol}
                    symbol={symbol}
                    onClick={() => setSelectedStock(symbol)}
                    isActive={selectedStock === symbol}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Chart & Details */}
          <div className="lg:col-span-6 space-y-6">
            {/* Stock Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <SimpleChart symbol={selectedStock} height={400} />
            </div>

            {/* Stock Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Market Cap', value: '$2.8T' },
                  { label: 'P/E Ratio', value: '28.5' },
                  { label: '52W High', value: '$198.23' },
                  { label: '52W Low', value: '$164.08' },
                  { label: 'Volume', value: '52.3M' },
                  { label: 'Avg Volume', value: '58.1M' },
                  { label: 'Beta', value: '1.29' },
                  { label: 'EPS', value: '$6.42' }
                ].map(metric => (
                  <div key={metric.label} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                    <div className="text-lg font-bold">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Chat Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-lg font-bold">Ask AI about {selectedStock}</h3>
              </div>
              
              <div className="relative">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={placeholders[placeholderIndex]}
                  className="w-full p-4 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 transition-all"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // Handle send
                      console.log('Send:', chatInput);
                    }
                  }}
                />
                <button
                  className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={!chatInput.trim()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'Should I buy?',
                  'Price target?',
                  'Earnings analysis',
                  'Competitor comparison'
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setChatInput(suggestion)}
                    className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - News Feed */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-4">
              <NewsFeed symbol={selectedStock} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
