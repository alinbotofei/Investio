import { prisma } from "@/lib/prisma";

export const watchlistService = {
  async getUserWatchlist(userId: string) {
    return await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
    });
  },

  async addToWatchlist(
    userId: string,
    symbol: string,
    category: string
  ) {
    try {
      return await prisma.watchlist.create({
        data: {
          userId,
          symbol,
          category,
        },
      });
    } catch (error) {
      return null;
    }
  },

  async removeFromWatchlist(userId: string, symbol: string) {
    return await prisma.watchlist.deleteMany({
      where: {
        userId,
        symbol,
      },
    });
  },

  async isInWatchlist(userId: string, symbol: string) {
    const item = await prisma.watchlist.findFirst({
      where: {
        userId,
        symbol,
      },
    });
    return !!item;
  },
};
