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
