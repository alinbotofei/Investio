import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const symbol = searchParams.get("symbol");

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    let url = `${BASE_URL}/calendar/earnings?token=${FINNHUB_API_KEY}`;

    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    if (symbol) url += `&symbol=${symbol}`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch earnings calendar";
    console.error("Earnings calendar error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
