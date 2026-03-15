import { AssetCategory } from "@/lib/types/assets";
import { Stock } from "@/lib/types/stocks";

export interface FetchConfig {
  revalidate?: number;
  cache?: RequestCache;
}

export class DataFetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = "DataFetchError";
  }
}

export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit & { retries?: number; retryDelay?: number }
): Promise<T> {
  const { retries = 2, retryDelay = 1000, ...fetchOptions } = options || {};
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new DataFetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          url
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError || new Error("Failed to fetch data");
}

export async function fetchQuote(symbol: string): Promise<Stock> {
  return fetchWithRetry<Stock>(`/api/stocks/quote?symbol=${symbol}`);
}

export async function fetchStockData(symbol: string) {
  const [quote, recommendations, insiderSentiment, metrics] =
    await Promise.allSettled([
      fetchQuote(symbol),
      fetchWithRetry(`/api/stocks/recommendations?symbol=${symbol}`),
      fetchWithRetry(`/api/stocks/insider-sentiment?symbol=${symbol}`),
      fetchWithRetry(`/api/stocks/metrics?symbol=${symbol}`),
    ]);

  return {
    quote: quote.status === "fulfilled" ? quote.value : null,
    recommendations:
      recommendations.status === "fulfilled" ? recommendations.value : [],
    insiderSentiment:
      insiderSentiment.status === "fulfilled"
        ? (insiderSentiment.value as { data?: unknown[] })?.data ?? []
        : [],
    metrics:
      metrics.status === "fulfilled"
        ? (metrics.value as { metric?: Record<string, number> })?.metric ?? {}
        : {},
  };
}

export async function fetchTickerData(symbol: string, category: AssetCategory) {
  if (category === "stock") {
    return fetchStockData(symbol);
  }

  const quote = await fetchQuote(symbol);
  return {
    quote,
    recommendations: [],
    insiderSentiment: [],
    metrics: {},
  };
}

export function createAbortController(timeoutMs: number = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    controller,
    cleanup: () => clearTimeout(timeout),
  };
}
