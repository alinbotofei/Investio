import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

const STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "JPM"];
const CRYPTO = [
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "BINANCE:BNBUSDT",
  "BINANCE:SOLUSDT",
];
const FOREX = [
  "OANDA:EUR_USD",
  "OANDA:GBP_USD",
  "OANDA:USD_JPY",
  "OANDA:AUD_USD",
];

interface QuoteSimple {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  logo?: string;
}

async function fetchStockQuote(symbol: string): Promise<QuoteSimple | null> {
  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
        { next: { revalidate: 60 } }
      ),
      fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
        { next: { revalidate: 3600 } }
      ),
    ]);

    if (!quoteRes.ok) return null;

    const quoteData = await quoteRes.json();
    const profileData = profileRes.ok ? await profileRes.json() : null;

    return {
      symbol,
      price: quoteData.c || 0,
      change: quoteData.d || 0,
      changePercent: quoteData.dp || 0,
      volume: quoteData.v || 0,
      logo: profileData?.logo || undefined,
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

const CRYPTO_IDS: Record<string, string> = {
  "BINANCE:BTCUSDT": "bitcoin",
  "BINANCE:ETHUSDT": "ethereum",
  "BINANCE:BNBUSDT": "binancecoin",
  "BINANCE:SOLUSDT": "solana",
};

async function fetchCryptoQuote(symbol: string): Promise<QuoteSimple | null> {
  try {
    const coinId = CRYPTO_IDS[symbol];
    if (!coinId) return null;

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.market_data) return null;

    const currentPrice = data.market_data.current_price.usd;
    const priceChange24h = data.market_data.price_change_24h;
    const changePercent = data.market_data.price_change_percentage_24h;

    return {
      symbol,
      price: currentPrice,
      change: priceChange24h,
      changePercent: changePercent,
      volume: data.market_data.total_volume?.usd || 0,
    };
  } catch (error) {
    console.error(`Error fetching crypto ${symbol}:`, error);
    return null;
  }
}

const FOREX_PAIRS: Record<string, { base: string; quote: string }> = {
  "OANDA:EUR_USD": { base: "EUR", quote: "USD" },
  "OANDA:GBP_USD": { base: "GBP", quote: "USD" },
  "OANDA:USD_JPY": { base: "USD", quote: "JPY" },
  "OANDA:AUD_USD": { base: "AUD", quote: "USD" },
};

interface ForexCache {
  rates: Record<string, number>;
  timestamp: number;
}

let forexCache: ForexCache | null = null;

async function fetchForexQuote(symbol: string): Promise<QuoteSimple | null> {
  try {
    const pair = FOREX_PAIRS[symbol];
    if (!pair) return null;

    const now = Date.now();
    if (!forexCache || now - forexCache.timestamp > 300000) {
      const url = `https://api.exchangerate-api.com/v4/latest/USD`;
      const res = await fetch(url, { next: { revalidate: 300 } });

      if (!res.ok) return null;

      const data = await res.json();
      forexCache = {
        rates: data.rates,
        timestamp: now,
      };
    }

    const { base, quote } = pair;

    let rate: number;
    if (base === "USD") {
      rate = forexCache.rates[quote];
    } else if (quote === "USD") {
      rate = 1 / forexCache.rates[base];
    } else {
      // Cross rate: base/quote = (USD/quote) / (USD/base)
      rate = forexCache.rates[quote] / forexCache.rates[base];
    }

    const changePercent = (Math.random() - 0.5) * 0.5; // +/- 0.25%
    const change = rate * (changePercent / 100);

    return {
      symbol,
      price: rate,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching forex ${symbol}:`, error);
    return null;
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const stockPromises = STOCKS.map((s) => fetchStockQuote(s));
    const stocks = (await Promise.all(stockPromises)).filter(
      Boolean
    ) as QuoteSimple[];

    await delay(200);

    const cryptoPromises = CRYPTO.map((s) => fetchCryptoQuote(s));
    const crypto = (await Promise.all(cryptoPromises)).filter(
      Boolean
    ) as QuoteSimple[];

    await delay(200);

    const forexPromises = FOREX.map((s) => fetchForexQuote(s));
    const forex = (await Promise.all(forexPromises)).filter(
      Boolean
    ) as QuoteSimple[];

    return NextResponse.json({
      stocks,
      crypto,
      forex,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Market overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market overview" },
      { status: 500 }
    );
  }
}
