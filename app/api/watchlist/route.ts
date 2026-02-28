import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { watchlistService } from "@/lib/services/watchlistService";
import { getUserIdFromEmail } from "@/lib/services/userService";

export async function GET() {
  const session = await getServerSession();
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
  const session = await getServerSession();
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

  const item = await watchlistService.addToWatchlist(
    userId,
    symbol,
    category
  );

  if (!item) {
    return NextResponse.json(
      { error: "Item already exists or limit reached" },
      { status: 400 }
    );
  }

  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
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

  await watchlistService.removeFromWatchlist(userId, symbol);
  return NextResponse.json({ success: true });
}
