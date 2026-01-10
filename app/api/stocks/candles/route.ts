import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const resolution = searchParams.get('resolution') || 'D';
    const timeframe = searchParams.get('timeframe') || '1D';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    let from = now;
    
    switch (timeframe) {
      case '1D':
        from = now - 86400;
        break;
      case '1W':
        from = now - 604800;
        break;
      case '1M':
        from = now - 2592000;
        break;
      case '1Y':
        from = now - 31536000;
        break;
    }

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol.toUpperCase()}&resolution=${resolution}&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 }
    });

    const data = await response.json();

    if (!response.ok || data.s === 'no_data') {
      console.error('Finnhub candles error:', data);
      return NextResponse.json(
        { c: [], s: 'no_data' },
        { status: 200 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching candle data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candle data' },
      { status: 500 }
    );
  }
}
