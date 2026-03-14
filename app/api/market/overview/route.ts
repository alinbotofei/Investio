import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

const STOCKS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "TSLA"];
const CRYPTO = [
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "BINANCE:SOLUSDT",
];

const STOCK_LOGO_FALLBACKS: Record<string, string> = {
  AAPL: "https://logo.clearbit.com/apple.com",
  MSFT: "https://logo.clearbit.com/microsoft.com",
  NVDA: "https://logo.clearbit.com/nvidia.com",
  AMZN: "https://logo.clearbit.com/amazon.com",
  GOOGL: "https://logo.clearbit.com/google.com",
  TSLA: "https://logo.clearbit.com/tesla.com",
};

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
        { next: { revalidate: 86400 } }
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
      logo: profileData?.logo || STOCK_LOGO_FALLBACKS[symbol] || undefined,
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

export async function GET() {
  try {
    const stockPromises = STOCKS.map((s) => fetchStockQuote(s));
    const stocks = (await Promise.all(stockPromises)).filter(
      Boolean
    ) as QuoteSimple[];

    const cryptoPromises = CRYPTO.map((s) => fetchCryptoQuote(s));
    const crypto = (await Promise.all(cryptoPromises)).filter(
      Boolean
    ) as QuoteSimple[];

    return NextResponse.json({
      stocks,
      crypto,
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
