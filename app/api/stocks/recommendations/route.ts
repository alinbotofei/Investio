import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
