"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = useCallback(async () => {
    try {
      const response = await fetch("/api/watchlist");
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map((item: any) => ({
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
  }, []);

  const addToWatchlist = useCallback(async (symbol: string, category: string) => {
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, category }),
      });

      if (response.ok) {
        // Reload to get complete data from DB
        await loadWatchlist();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      return false;
    }
  }, [loadWatchlist]);

  const removeFromWatchlist = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      return false;
    }
  }, []);

  const isInWatchlist = useCallback((symbol: string) => {
    return watchlist.some((item) => item.symbol === symbol);
  }, [watchlist]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

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
