import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const [stocksRes, cryptoRes, forexRes] = await Promise.all([
      fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(
          query
        )}&token=${FINNHUB_API_KEY}`
      ),
      fetch(
        `${BASE_URL}/crypto/symbol?exchange=binance&token=${FINNHUB_API_KEY}`
      ),
      fetch(`${BASE_URL}/forex/symbol?exchange=oanda&token=${FINNHUB_API_KEY}`),
    ]);

    const [stocks, cryptoAll, forexAll] = await Promise.all([
      stocksRes.ok ? stocksRes.json() : { result: [] },
      cryptoRes.ok ? cryptoRes.json() : [],
      forexRes.ok ? forexRes.json() : [],
    ]);

    const results = [];

    if (stocks.result) {
      results.push(
        ...stocks.result.slice(0, 5).map((item: any) => ({
          symbol: item.symbol,
          name: item.description,
          category: "stock" as const,
          type: item.type,
        }))
      );
    }

    const cryptoFiltered = cryptoAll
      .filter(
        (item: any) =>
          item.symbol.toLowerCase().includes(query.toLowerCase()) &&
          item.symbol.includes("USDT")
      )
      .slice(0, 5);
    results.push(
      ...cryptoFiltered.map((item: any) => ({
        symbol: item.symbol,
        name: item.description,
        category: "crypto" as const,
      }))
    );

    const forexFiltered = forexAll
      .filter((item: any) =>
        item.description.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
    results.push(
      ...forexFiltered.map((item: any) => ({
        symbol: item.displaySymbol,
        name: item.description,
        category: "forex" as const,
      }))
    );

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}
