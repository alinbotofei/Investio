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

    const filtered = data.filter((item: any) => {
      const base = item.symbol.replace("BINANCE:", "").split("USDT")[0];
      return (
        POPULAR_CRYPTO_SYMBOLS.includes(base) && item.symbol.includes("USDT")
      );
    });

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Error fetching crypto symbols:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch crypto symbols" },
      { status: 500 }
    );
  }
}
