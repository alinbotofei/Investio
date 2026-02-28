import { prisma } from "@/lib/prisma";

export async function addToWatchlist(userId: string, symbol: string, category: string) {
  return await prisma.watchlist.upsert({
    where: {
      userId_symbol: {
        userId,
        symbol,
      },
    },
    update: {
      addedAt: new Date(),
    },
    create: {
      userId,
      symbol,
      category,
    },
  });
}

export async function removeFromWatchlist(userId: string, symbol: string) {
  return await prisma.watchlist.delete({
    where: {
      userId_symbol: {
        userId,
        symbol,
      },
    },
  });
}

export async function getUserWatchlist(userId: string) {
  return await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { addedAt: "desc" },
  });
}

export async function isInWatchlist(userId: string, symbol: string) {
  const item = await prisma.watchlist.findUnique({
    where: {
      userId_symbol: {
        userId,
        symbol,
      },
    },
  });
  return !!item;
}
