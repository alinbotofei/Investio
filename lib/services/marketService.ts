export interface QuoteSimple {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export interface MarketOverviewData {
  stocks: QuoteSimple[];
  crypto: QuoteSimple[];
  timestamp: number;
}

class MarketService {
  private readonly DELAY_BETWEEN_BATCHES = 200; // 200ms pentru rate limiting

  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async batchFetch<T>(urls: string[], maxConcurrent: number = 5): Promise<T[]> {
    const chunks = this.chunkArray(urls, maxConcurrent);
    const results: T[] = [];

    for (const chunk of chunks) {
      const promises = chunk.map((url) =>
        fetch(url)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      );

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults.filter(Boolean));

      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(this.DELAY_BETWEEN_BATCHES);
      }
    }

    return results;
  }

  async getMarketOverview(): Promise<MarketOverviewData | null> {
    try {
      const response = await fetch("/api/market/overview");
      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Market overview fetch error:", error);
      return null;
    }
  }

  async getTickerAggregate(symbol: string) {
    try {
      const response = await fetch(`/api/ticker/${symbol}/aggregate`);
      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Ticker aggregate fetch error:", error);
      return null;
    }
  }

  calculateTopMovers(quotes: QuoteSimple[], limit: number = 6): QuoteSimple[] {
    return [...quotes]
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, limit);
  }
}

export const marketService = new MarketService();
