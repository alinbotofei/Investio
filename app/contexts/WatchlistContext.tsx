"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { WatchlistItem, AssetCategory } from "@/lib/types/assets";

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  loading: boolean;
  addToWatchlist: (symbol: string, category: string) => Promise<boolean>;
  removeFromWatchlist: (symbol: string) => Promise<boolean>;
  isInWatchlist: (symbol: string) => boolean;
  loadWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const response = await fetch("/api/watchlist");
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map((item: { symbol: string; category: string; addedAt: string }) => ({
          symbol: item.symbol,
          category: item.category as AssetCategory,
          addedAt: new Date(item.addedAt).getTime(),
        }));
        setWatchlist(formatted);
      }
    } catch (error) {
      console.error("Failed to load watchlist:", error);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const addToWatchlist = useCallback(async (symbol: string, category: string) => {
    const normalizedSymbol = symbol.trim().toUpperCase();
    const normalizedCategory = category.trim().toLowerCase();

    if (watchlist.some((item) => item.symbol === normalizedSymbol)) {
      return true;
    }

    const optimisticItem: WatchlistItem = {
      symbol: normalizedSymbol,
      category: normalizedCategory as AssetCategory,
      addedAt: Date.now(),
    };
    setWatchlist((prev) => [...prev, optimisticItem]);

    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: normalizedSymbol, category: normalizedCategory }),
      });

      if (response.ok) {
        setWatchlist((prev) => {
          const deduped = prev.filter(
            (item, index, arr) =>
              arr.findIndex((x) => x.symbol === item.symbol) === index
          );
          return deduped;
        });
        return true;
      } else {
        setWatchlist((prev) => prev.filter((i) => i.symbol !== normalizedSymbol));
        return false;
      }
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      setWatchlist((prev) => prev.filter((i) => i.symbol !== normalizedSymbol));
      return false;
    }
  }, [watchlist]);

  const removeFromWatchlist = useCallback(async (symbol: string) => {
    const normalizedSymbol = symbol.trim().toUpperCase();
    const previous = watchlist;
    setWatchlist((prev) => prev.filter((item) => item.symbol !== normalizedSymbol));

    try {
      const response = await fetch(`/api/watchlist?symbol=${encodeURIComponent(normalizedSymbol)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        return true;
      }
      setWatchlist(previous);
      return false;
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      setWatchlist(previous);
      return false;
    }
  }, [watchlist]);

  const isInWatchlist = useCallback((symbol: string) => {
    return watchlist.some((item) => item.symbol === symbol.trim().toUpperCase());
  }, [watchlist]);

  useEffect(() => {
    if (status === "authenticated") {
      loadWatchlist();
    } else if (status === "unauthenticated") {
      setWatchlist([]);
      setLoading(false);
    }
  }, [status, loadWatchlist]);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        loadWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
