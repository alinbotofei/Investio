import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol parameter is required" },
      { status: 400 }
    );
  }

  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 300; // Last 5 minutes for current price
    
    const url = `https://finnhub.io/api/v1/crypto/candle?symbol=${symbol}&resolution=1&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(url, {
      next: { revalidate: 15 },
    });

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.s !== 'ok' || !data.c || data.c.length === 0) {
      return NextResponse.json(
        { error: "No data available for this symbol" },
        { status: 404 }
      );
    }

    const currentPrice = data.c[data.c.length - 1];
    const openPrice = data.o[0];
    const highPrice = Math.max(...data.h);
    const lowPrice = Math.min(...data.l);
    const volume = data.v ? data.v.reduce((a: number, b: number) => a + b, 0) : 0;
    const change = currentPrice - openPrice;
    const changePercent = (change / openPrice) * 100;

    return NextResponse.json({
      symbol,
      c: currentPrice,
      o: openPrice,
      h: highPrice,
      l: lowPrice,
      d: change,
      dp: changePercent,
      v: volume,
      t: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching crypto quote:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto quote" },
      { status: 500 }
    );
  }
}
