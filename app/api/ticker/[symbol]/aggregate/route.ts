import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const decodedSymbol = decodeURIComponent(symbol);
    const upperSymbol = decodedSymbol.toUpperCase();

    const inferCategory = (sym: string): "stock" | "crypto" | "forex" => {
      if (sym.includes("BINANCE:") || sym.includes("USDT")) return "crypto";
      if (sym.includes("OANDA:") || sym.includes("/")) return "forex";
      return "stock";
    };

    const category = inferCategory(upperSymbol);

    const [quote, metrics, recommendations, sentiment, news] =
      await Promise.all([
        category === "stock"
          ? fetch(
              `${
                request.nextUrl.origin
              }/api/stocks/quote?symbol=${encodeURIComponent(decodedSymbol)}`
            ).then((r) => (r.ok ? r.json() : null))
          : category === "crypto"
          ? fetch(
              `${
                request.nextUrl.origin
              }/api/crypto/quote?symbol=${encodeURIComponent(decodedSymbol)}`
            ).then((r) => (r.ok ? r.json() : null))
          : fetch(
              `${
                request.nextUrl.origin
              }/api/forex/quote?symbol=${encodeURIComponent(decodedSymbol)}`
            ).then((r) => (r.ok ? r.json() : null)),

        category === "stock"
          ? fetch(
              `${
                request.nextUrl.origin
              }/api/stocks/metrics?symbol=${encodeURIComponent(decodedSymbol)}`
            ).then((r) => (r.ok ? r.json() : null))
          : null,

        category === "stock"
          ? fetch(
              `${
                request.nextUrl.origin
              }/api/stocks/recommendations?symbol=${encodeURIComponent(
                decodedSymbol
              )}`
            ).then((r) => (r.ok ? r.json() : null))
          : null,

        category === "stock"
          ? fetch(
              `${
                request.nextUrl.origin
              }/api/stocks/insider-sentiment?symbol=${encodeURIComponent(
                decodedSymbol
              )}`
            ).then((r) => (r.ok ? r.json() : null))
          : null,

        category === "stock"
          ? fetch(
              `${
                request.nextUrl.origin
              }/api/stocks/news?symbol=${encodeURIComponent(decodedSymbol)}`
            ).then((r) => (r.ok ? r.json() : null))
          : null,
      ]);

    if (!quote || (quote && Object.keys(quote).length === 0)) {
      return NextResponse.json(
        { error: "Symbol not found or invalid" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      symbol: decodedSymbol,
      category,
      quote,
      metrics,
      recommendations,
      sentiment,
      news,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Ticker aggregate error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker data" },
      { status: 500 }
    );
  }
}
