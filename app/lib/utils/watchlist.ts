import { WatchlistItem, AssetCategory } from "@/lib/types/assets";

const WATCHLIST_KEY = "investio_watchlist";
const MAX_WATCHLIST_ITEMS = 50;

export const watchlistManager = {
  getWatchlist: (): WatchlistItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(WATCHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToWatchlist: (item: Omit<WatchlistItem, "addedAt">): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const watchlist = watchlistManager.getWatchlist();
      
      if (watchlist.some((w) => w.symbol === item.symbol)) {
        return false;
      }
      
      if (watchlist.length >= MAX_WATCHLIST_ITEMS) {
        return false;
      }

      const newItem: WatchlistItem = {
        ...item,
        addedAt: Date.now(),
      };

      const updated = [newItem, ...watchlist];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  removeFromWatchlist: (symbol: string): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const watchlist = watchlistManager.getWatchlist();
      const updated = watchlist.filter((item) => item.symbol !== symbol);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  isInWatchlist: (symbol: string): boolean => {
    const watchlist = watchlistManager.getWatchlist();
    return watchlist.some((item) => item.symbol === symbol);
  },

  getByCategory: (category: AssetCategory): WatchlistItem[] => {
    const watchlist = watchlistManager.getWatchlist();
    return watchlist.filter((item) => item.category === category);
  },
};

export const assetHelpers = {
  getCategoryLabel: (category: AssetCategory): string => {
    const labels = { stock: "Stock", crypto: "Crypto", forex: "Forex" };
    return labels[category];
  },

  getCategoryColor: (category: AssetCategory): string => {
    const colors = {
      stock: "from-blue-600 to-cyan-500",
      crypto: "from-orange-500 to-yellow-500",
      forex: "from-green-600 to-emerald-500",
    };
    return colors[category];
  },

  getCategoryIcon: (category: AssetCategory): string => {
    const icons = {
      stock: "trending_up",
      crypto: "currency_bitcoin",
      forex: "currency_exchange",
    };
    return icons[category];
  },

  formatSymbol: (symbol: string): string => {
    return symbol.replace("BINANCE:", "").replace("OANDA:", "").replace("_", "/");
  },
};
