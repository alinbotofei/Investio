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

    const inferCategory = (sym: string): "stock" | "crypto" | "forex" => {
      if (sym.includes("BINANCE:")) return "crypto";
      if (sym.includes("OANDA:") || sym.includes("_")) return "forex";
      return "stock";
    };

    const category = inferCategory(symbol);

    const [quote, metrics, recommendations, sentiment, news] =
      await Promise.all([
        category === "stock"
          ? fetch(
              `${request.nextUrl.origin}/api/stocks/quote?symbol=${symbol}`
            ).then((r) => (r.ok ? r.json() : null))
          : category === "crypto"
          ? fetch(
              `${request.nextUrl.origin}/api/crypto/quote?symbol=${symbol}`
            ).then((r) => (r.ok ? r.json() : null))
          : fetch(
              `${request.nextUrl.origin}/api/forex/quote?symbol=${symbol}`
            ).then((r) => (r.ok ? r.json() : null)),

        category === "stock"
          ? fetch(
              `${request.nextUrl.origin}/api/stocks/metrics?symbol=${symbol}`
            ).then((r) => (r.ok ? r.json() : null))
          : null,

        category === "stock"
          ? fetch(
              `${request.nextUrl.origin}/api/stocks/recommendations?symbol=${symbol}`
            ).then((r) => (r.ok ? r.json() : null))
          : null,

        category === "stock"
          ? fetch(
              `${request.nextUrl.origin}/api/stocks/insider-sentiment?symbol=${symbol}`
            ).then((r) => (r.ok ? r.json() : null))
          : null,

        category === "stock"
          ? fetch(
              `${request.nextUrl.origin}/api/stocks/news?symbol=${symbol}`
            ).then((r) => (r.ok ? r.json() : null))
          : null,
      ]);

    return NextResponse.json({
      symbol,
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
