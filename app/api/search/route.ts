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
    const [stocksRes, cryptoRes] = await Promise.all([
      fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(
          query
        )}&token=${FINNHUB_API_KEY}`
      ),
      fetch(
        `${BASE_URL}/crypto/symbol?exchange=binance&token=${FINNHUB_API_KEY}`
      ),
    ]);

    const [stocks, cryptoAll] = await Promise.all([
      stocksRes.ok ? stocksRes.json() : { result: [] },
      cryptoRes.ok ? cryptoRes.json() : [],
    ]);

    const results = [];

    interface FinnhubStockResult { symbol: string; description: string; type: string; }
    interface FinnhubCryptoItem { symbol: string; description: string; }

    if (stocks.result) {
      results.push(
        ...(stocks.result as FinnhubStockResult[]).slice(0, 5).map((item) => ({
          symbol: item.symbol,
          name: item.description,
          category: "stock" as const,
          type: item.type,
        }))
      );
    }

    const cryptoFiltered = (cryptoAll as FinnhubCryptoItem[])
      .filter(
        (item) =>
          item.symbol.toLowerCase().includes(query.toLowerCase()) &&
          item.symbol.includes("USDT")
      )
      .slice(0, 5);
    results.push(
      ...cryptoFiltered.map((item) => ({
        symbol: item.symbol,
        name: item.description,
        category: "crypto" as const,
      }))
    );

    return NextResponse.json({ results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed";
    console.error("Search error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
