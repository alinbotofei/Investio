import { NextRequest, NextResponse } from "next/server";

type Timeframe = "1D" | "1W" | "1M" | "1Y";

const TIMEFRAME_PARAMS: Record<
  Timeframe,
  { range: string; interval: string }
> = {
  "1D": { range: "5d",  interval: "60m" },
  "1W": { range: "1mo", interval: "1d"  },
  "1M": { range: "3mo", interval: "1d"  },
  "1Y": { range: "1y",  interval: "1wk" },
};

function toYahooSymbol(symbol: string, category: string): string {
  const isCrypto =
    category === "crypto" ||
    symbol.includes("BINANCE:") ||
    symbol.toUpperCase().includes("USDT");

  if (isCrypto) {
    const base = symbol
      .replace(/^BINANCE:/i, "")
      .replace(/USDT$/i, "")
      .replace(/USD$/i, "");
    return `${base.toUpperCase()}-USD`;
  }

  return symbol.toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol   = searchParams.get("symbol");
    const timeframe = (searchParams.get("timeframe") ?? "1M") as Timeframe;
    const category  = searchParams.get("category") ?? "stock";

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is required" },
        { status: 400 }
      );
    }

    const params = TIMEFRAME_PARAMS[timeframe] ?? TIMEFRAME_PARAMS["1M"];
    const yahooSymbol = toYahooSymbol(symbol, category);

    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}` +
      `?interval=${params.interval}&range=${params.range}&includePrePost=false`;

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`Yahoo Finance error ${response.status} for ${yahooSymbol}`);
      return NextResponse.json({ c: [], s: "no_data" }, { status: 200 });
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json({ c: [], s: "no_data" }, { status: 200 });
    }

    const timestamps: number[]     = result.timestamp ?? [];
    const quote                    = result.indicators?.quote?.[0] ?? {};
    const opens: number[]          = quote.open   ?? [];
    const highs: number[]          = quote.high   ?? [];
    const lows: number[]           = quote.low    ?? [];
    const closes: number[]         = quote.close  ?? [];
    const volumes: number[]        = quote.volume ?? [];

    if (!timestamps.length || !closes.length) {
      return NextResponse.json({ c: [], s: "no_data" }, { status: 200 });
    }

    const valid: number[] = [];
    timestamps.forEach((_, i) => {
      if (
        closes[i] != null &&
        isFinite(closes[i]) &&
        opens[i]  != null &&
        isFinite(opens[i])
      ) {
        valid.push(i);
      }
    });

    if (!valid.length) {
      return NextResponse.json({ c: [], s: "no_data" }, { status: 200 });
    }

    return NextResponse.json(
      {
        t: valid.map((i) => timestamps[i]),
        o: valid.map((i) => opens[i]),
        h: valid.map((i) => highs[i]),
        l: valid.map((i) => lows[i]),
        c: valid.map((i) => closes[i]),
        v: valid.map((i) => volumes[i] ?? 0),
        s: "ok",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Candles route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candle data" },
      { status: 500 }
    );
  }
}
