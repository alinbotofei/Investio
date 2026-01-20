interface CacheItem<T> {
  data: T;
  expires: number;
}

export const CACHE_TTL = {
  MARKET_OVERVIEW: 300, // 5 min - date generale dashboard (redus refresh)
  TICKER_QUOTE: 30, // 30 sec - prețuri live (redus refresh)
  TICKER_METRICS: 3600, // 1 oră - metrici
  NEWS: 600, // 10 min - știri (redus refresh)
  RECOMMENDATIONS: 86400, // 24 ore - recomandări
  INSIDER_SENTIMENT: 86400, // 24 ore - insider sentiment
  SYMBOLS: 604800, // 7 zile - liste de simboluri
} as const;

class CacheService {
  private isClient = typeof window !== "undefined";

  get<T>(key: string): T | null {
    if (!this.isClient) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cached: CacheItem<T> = JSON.parse(item);

      if (Date.now() > cached.expires) {
        localStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  set<T>(key: string, data: T, ttl: number): void {
    if (!this.isClient) return;

    try {
      const item: CacheItem<T> = {
        data,
        expires: Date.now() + ttl * 1000,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error("Cache set error:", error);
      if (error instanceof Error && error.name === "QuotaExceededError") {
        this.clearExpired();
      }
    }
  }

  remove(key: string): void {
    if (!this.isClient) return;
    localStorage.removeItem(key);
  }

  clearExpired(): void {
    if (!this.isClient) return;

    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith("investio:")) {
          const item = localStorage.getItem(key);
          if (item) {
            const cached = JSON.parse(item);
            if (cached.expires && now > cached.expires) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  clearAll(): void {
    if (!this.isClient) return;
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith("investio:")
    );
    keys.forEach((key) => localStorage.removeItem(key));
  }
}

export const cache = new CacheService();
