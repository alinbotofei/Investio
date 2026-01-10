import { NextRequest, NextResponse } from 'next/server';
import { finnhubClient } from '@/lib/api/finnhub';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const data = await finnhubClient.getBasicFinancials(symbol);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching stock metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock metrics' },
      { status: 500 }
    );
  }
}
