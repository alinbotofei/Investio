/**
 * Finnhub API client for stock data, news, and market information
 * Free tier includes: Quote, Company News, Market News, Stock Symbols
 */

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface NewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface BasicFinancials {
  metric: {
    '52WeekHigh': number;
    '52WeekLow': number;
    '52WeekPriceReturnDaily': number;
    beta: number;
    marketCapitalization: number;
    peBasicExclExtraTTM: number;
    epsBasicExclExtraAnnual: number;
  };
  series: Record<string, unknown>;
}

class FinnhubAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('token', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get real-time quote data for a stock
   */
  async getQuote(symbol: string): Promise<StockQuote> {
    return this.fetch<StockQuote>('/quote', { symbol: symbol.toUpperCase() });
  }

  /**
   * Get company profile information
   */
  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    return this.fetch<CompanyProfile>('/stock/profile2', { symbol: symbol.toUpperCase() });
  }

  /**
   * Get company news for a specific stock
   * @param symbol Stock symbol
   * @param from Start date (YYYY-MM-DD)
   * @param to End date (YYYY-MM-DD)
   */
  async getCompanyNews(symbol: string, from: string, to: string): Promise<NewsArticle[]> {
    return this.fetch<NewsArticle[]>('/company-news', {
      symbol: symbol.toUpperCase(),
      from,
      to
    });
  }

  /**
   * Get general market news
   * @param category News category: general, forex, crypto, merger
   */
  async getMarketNews(category: string = 'general'): Promise<NewsArticle[]> {
    return this.fetch<NewsArticle[]>('/news', { category });
  }

  /**
   * Get basic financials (free tier metrics)
   */
  async getBasicFinancials(symbol: string): Promise<BasicFinancials> {
    return this.fetch<BasicFinancials>('/stock/metric', {
      symbol: symbol.toUpperCase(),
      metric: 'all'
    });
  }

  /**
   * Search for stocks by name or symbol
   */
  async searchSymbol(query: string): Promise<{
    count: number;
    result: Array<{
      description: string;
      displaySymbol: string;
      symbol: string;
      type: string;
    }>;
  }> {
    return this.fetch('/search', { q: query });
  }

  /**
   * Get recommendation trends (free tier)
   */
  async getRecommendationTrends(symbol: string): Promise<Array<{
    buy: number;
    hold: number;
    period: string;
    sell: number;
    strongBuy: number;
    strongSell: number;
    symbol: string;
  }>> {
    return this.fetch('/stock/recommendation', { symbol: symbol.toUpperCase() });
  }
}

export const finnhubClient = new FinnhubAPI(FINNHUB_API_KEY);
