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
    router.push(`/ticker/${result.symbol}`);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Icon
          name="search"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-[20px]"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search stocks, crypto, forex..."
          className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 pl-11 pr-10 py-2.5 rounded-xl focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all shadow-lg"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-3 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
          {results.map((result, index) => (
            <button
              key={`${result.category}-${result.symbol}`}
              onClick={() => handleSelect(result)}
              className={`w-full px-4 py-3 flex items-center gap-3 transition-all text-left border-b border-slate-800/50 last:border-0 ${
                index === selectedIndex
                  ? "bg-slate-700/50"
                  : "hover:bg-slate-800/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${assetHelpers.getCategoryColor(
                  result.category
                )} flex items-center justify-center flex-shrink-0 shadow-lg`}
              >
                <Icon
                  name={assetHelpers.getCategoryIcon(result.category)}
                  className="text-white text-[18px]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate text-sm">
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
      )}

      {isOpen && query && results.length === 0 && !loading && (
        <div className="absolute top-full mt-3 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-6 z-50">
          <div className="text-center">
            <Icon
              name="search_off"
              className="text-slate-600 text-[32px] mx-auto mb-2"
            />
            <p className="text-slate-400 text-sm">
              No results found for "{query}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
