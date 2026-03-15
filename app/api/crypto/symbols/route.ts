import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

const POPULAR_CRYPTO_SYMBOLS = [
  "BTC",
  "ETH",
  "BNB",
  "SOL",
  "ADA",
  "XRP",
  "DOGE",
  "DOT",
  "MATIC",
  "LTC",
];

export async function GET() {
  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/crypto/symbol?exchange=binance&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    const filtered = (data as { symbol: string; description: string }[]).filter((item) => {
      const base = item.symbol.replace("BINANCE:", "").split("USDT")[0];
      return POPULAR_CRYPTO_SYMBOLS.includes(base) && item.symbol.includes("USDT");
    });

    return NextResponse.json(filtered);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch crypto symbols";
    console.error("Error fetching crypto symbols:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
