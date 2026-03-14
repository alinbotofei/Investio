import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { watchlistService } from "@/lib/services/watchlistService";
import { getUserIdFromEmail } from "@/lib/services/userService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdFromEmail(session.user.email);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const watchlist = await watchlistService.getUserWatchlist(userId);
  return NextResponse.json(watchlist);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdFromEmail(session.user.email);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { symbol, category } = await request.json();
  if (!symbol || !category) {
    return NextResponse.json(
      { error: "Missing symbol or category" },
      { status: 400 }
    );
  }

  const normalizedSymbol = String(symbol).trim().toUpperCase();
  const normalizedCategory = String(category).trim().toLowerCase();

  const exists = await watchlistService.isInWatchlist(userId, normalizedSymbol);
  if (exists) {
    return NextResponse.json({ symbol: normalizedSymbol, category: normalizedCategory, alreadyExists: true });
  }

  const item = await watchlistService.addToWatchlist(
    userId,
    normalizedSymbol,
    normalizedCategory
  );

  if (!item) {
    const existsAfterCreate = await watchlistService.isInWatchlist(userId, normalizedSymbol);
    if (existsAfterCreate) {
      return NextResponse.json({ symbol: normalizedSymbol, category: normalizedCategory, alreadyExists: true });
    }
    return NextResponse.json(
      { error: "Item already exists or limit reached" },
      { status: 400 }
    );
  }

  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdFromEmail(session.user.email);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  await watchlistService.removeFromWatchlist(userId, symbol.trim().toUpperCase());
  return NextResponse.json({ success: true });
}
