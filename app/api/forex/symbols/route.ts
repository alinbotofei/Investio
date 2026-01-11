import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

const POPULAR_FOREX_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "EUR/GBP",
  "EUR/JPY",
  "GBP/JPY",
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
      `${BASE_URL}/forex/symbol?exchange=oanda&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    const filtered = data.filter((item: any) => {
      const pair = item.description.split("/").join("/");
      return POPULAR_FOREX_PAIRS.includes(pair);
    });

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Error fetching forex symbols:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch forex symbols" },
      { status: 500 }
    );
  }
}
