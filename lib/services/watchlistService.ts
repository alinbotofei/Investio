import { prisma } from "@/lib/prisma";

export async function addToWatchlist(userId: string, symbol: string, category: string) {
  try {
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId,
        symbol,
        category,
      },
    });
    return watchlistItem;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return null;
  }
}

export async function removeFromWatchlist(userId: string, symbol: string) {
  try {
    await prisma.watchlist.delete({
      where: {
        userId_symbol: {
          userId,
          symbol,
        },
      },
    });
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
}

export async function getUserWatchlist(userId: string) {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });
    return watchlist;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
}

export async function isInWatchlist(userId: string, symbol: string) {
  try {
    const item = await prisma.watchlist.findUnique({
      where: {
        userId_symbol: {
          userId,
          symbol,
        },
      },
    });
    return !!item;
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
}
