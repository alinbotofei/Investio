import { AssetCategory } from "@/lib/types/assets";

export const assetHelpers = {
  getCategoryLabel: (category: AssetCategory): string => {
    const labels = { stock: "Stock", crypto: "Crypto", forex: "Forex" };
    return labels[category];
  },

  getCategoryColor: (category: AssetCategory): string => {
    const colors = {
      stock: "from-blue-600 to-cyan-500",
      crypto: "from-cyan-600 to-blue-500",
      forex: "from-green-600 to-emerald-500",
    };
    return colors[category];
  },

  getCategoryIcon: (category: AssetCategory): string => {
    const icons = {
      stock: "trending_up",
      crypto: "currency_bitcoin",
      forex: "currency_exchange",
    };
    return icons[category];
  },

  formatSymbol: (symbol: string): string => {
    return symbol
      .replace("BINANCE:", "")
      .replace("OANDA:", "")
      .replace("_", "/");
  },
};
