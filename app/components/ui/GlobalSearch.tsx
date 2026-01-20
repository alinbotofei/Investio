"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { assetHelpers } from "@/app/lib/utils/watchlist";
import { AssetCategory } from "@/lib/types/assets";

interface SearchResult {
  symbol: string;
  name: string;
  category: AssetCategory;
  type?: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setIsOpen(true);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleSelect = (result: SearchResult) => {
    const encodedSymbol = encodeURIComponent(result.symbol);
    router.push(`/ticker/${encodedSymbol}`);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search for stocks, crypto, or forex..."
          className="w-full bg-slate-900/40 border border-slate-700/40 text-white placeholder-slate-200/50 px-4 py-2.5 rounded-xl focus:outline-none focus:bg-slate-900/60 focus:border-cyan-500/30 transition-all duration-200 hover:border-slate-600/50 text-sm"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-700/40 transition-colors group"
            aria-label="Clear search"
          >
            <Icon
              name="close"
              className="text-slate-500 group-hover:text-slate-300 text-[16px] transition-colors"
            />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-900/98 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl max-h-96 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="overflow-y-auto max-h-96">
            {results.map((result, index) => (
              <button
                key={`${result.category}-${result.symbol}`}
                onClick={() => handleSelect(result)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-all text-left border-b border-slate-800/50 last:border-0 group ${
                  index === selectedIndex
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-l-2 border-l-cyan-400"
                    : "hover:bg-slate-800/40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${assetHelpers.getCategoryColor(
                    result.category
                  )} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon
                    name={assetHelpers.getCategoryIcon(result.category)}
                    className="text-white text-[18px]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate text-sm group-hover:text-cyan-300 transition-colors">
                    {assetHelpers.formatSymbol(result.symbol)}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {result.name}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r ${assetHelpers.getCategoryColor(
                    result.category
                  )} text-white flex-shrink-0 shadow-sm`}
                >
                  {assetHelpers.getCategoryLabel(result.category)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-slate-900/98 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Icon name="search_off" className="text-slate-500 text-[32px]" />
            </div>
            <p className="text-slate-300 font-medium mb-1">No results found</p>
            <p className="text-slate-500 text-sm">
              Try searching for a different ticker or keyword
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
