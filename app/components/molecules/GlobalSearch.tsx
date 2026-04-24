"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Icon from "../atoms/Icon";
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
    }, 250);

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
      <div className="relative group">
        <div className="pointer-events-none absolute -inset-1 rounded-[14px] bg-gradient-to-r from-blue-400/0 via-blue-300/0 to-blue-500/0 opacity-0 blur-xl transition-opacity duration-300 ease-out md:group-focus-within:from-blue-400/10 md:group-focus-within:via-blue-300/6 md:group-focus-within:to-blue-500/10 md:group-focus-within:opacity-100" />
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/[0.02] opacity-0 blur-sm transition-opacity duration-300 ease-out md:group-focus-within:opacity-100" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search tickers, crypto, ETFs..."
          className="relative w-full h-10 appearance-none [color-scheme:dark] bg-[rgba(12,18,30,0.74)] border border-slate-700/70 text-slate-100 placeholder:text-slate-400/86 placeholder:font-medium pl-3.5 pr-[46px] rounded-xl focus:outline-none focus:border-blue-300/22 focus:ring-1 focus:ring-blue-300/8 transition-[border-color,box-shadow,background-color] duration-250 ease-out hover:border-slate-600/80 text-[16px] md:text-sm font-medium backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_8px_20px_rgba(2,8,23,0.24)] [-webkit-text-fill-color:rgb(241_245_249)] [&:-webkit-autofill]:[-webkit-text-fill-color:rgb(241_245_249)] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_rgb(12_18_30)_inset]"
        />
        {!query && !loading && (
          <div className="absolute z-10 right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900/78 border border-slate-700/70 shadow-sm">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-300"
            >
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path d="M16.2 16.2L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {loading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-3.5 h-3.5 border-2 border-slate-500/40 border-t-slate-200 rounded-full animate-spin" />
          </div>
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md hover:bg-white/6 transition-all group flex items-center justify-center"
            aria-label="Clear search"
          >
            <Icon
              name="close"
              className="text-slate-200/80 group-hover:text-white text-[15px] transition-colors"
            />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2.5 w-full bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 animate-in fade-in duration-150 p-1.5">
          <div className="overflow-y-auto max-h-[21.5rem] rounded-[18px] pr-1.5 py-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {results.map((result, index) => (
              <button
                key={`${result.category}-${result.symbol}`}
                onClick={() => handleSelect(result)}
                className={`w-full rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all duration-150 text-left group ${
                  index === selectedIndex
                    ? "bg-gradient-to-r from-cyan-500/18 to-blue-500/18 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.08)]"
                    : "hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${assetHelpers.getCategoryColor(
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
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {result.name}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gradient-to-r ${assetHelpers.getCategoryColor(
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
        <div className="absolute left-0 right-0 top-full mt-2.5 w-full bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-8 z-50 animate-in fade-in duration-150">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
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
