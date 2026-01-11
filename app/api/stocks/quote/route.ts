import { NextRequest, NextResponse } from "next/server";
import { finnhubClient } from "@/lib/api/finnhub";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is required" },
        { status: 400 }
      );
    }

    const [quote, profile] = await Promise.all([
      finnhubClient.getQuote(symbol),
      finnhubClient.getCompanyProfile(symbol).catch(() => null),
    ]);

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      name: profile?.name || symbol,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      high: quote.h,
      low: quote.l,
      open: quote.o,
      previousClose: quote.pc,
      marketCap: profile?.marketCapitalization || undefined,
      logo: profile?.logo || undefined,
      timestamp: quote.t,
    });
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock quote" },
      { status: 500 }
    );
  }
}
