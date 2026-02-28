const STOCK_GRADIENTS: Record<
  string,
  { from: string; to: string; text: string }
> = {
  AAPL: { from: "#000000", to: "#434343", text: "#FFFFFF" },
  MSFT: { from: "#00A4EF", to: "#0078D4", text: "#FFFFFF" },
  GOOGL: { from: "#4285F4", to: "#34A853", text: "#FFFFFF" },
  AMZN: { from: "#FF9900", to: "#146EB4", text: "#FFFFFF" },
  NVDA: { from: "#76B900", to: "#00873C", text: "#FFFFFF" },
  TSLA: { from: "#E82127", to: "#CC0000", text: "#FFFFFF" },
  META: { from: "#0866FF", to: "#0081FB", text: "#FFFFFF" },
  JPM: { from: "#0070CD", to: "#004A8F", text: "#FFFFFF" },
};

const STOCK_LOGO_CACHE: Record<string, string> = {};

const STOCK_FALLBACK_ICONS: Record<string, string> = {
  AAPL: "phone_iphone",
  MSFT: "computer",
  GOOGL: "search",
  AMZN: "shopping_cart",
  NVDA: "memory",
  TSLA: "electric_car",
  META: "groups",
  JPM: "account_balance",
};

const CRYPTO_LOGOS: Record<string, string> = {
  "BINANCE:BTCUSDT":
    "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  "BINANCE:ETHUSDT":
    "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  "BINANCE:BNBUSDT":
    "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  "BINANCE:SOLUSDT":
    "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

const FOREX_ICONS: Record<string, string> = {
  "EUR/USD": "currency_exchange",
  "GBP/USD": "currency_exchange",
  "USD/JPY": "currency_exchange",
  "USD/CHF": "currency_exchange",
};

export interface AssetLogoResult {
  type: "url" | "icon";
  value: string;
}

export function getAssetLogoUrl(
  symbol: string,
  category?: string,
  logoUrl?: string
): AssetLogoResult {
  if (symbol.includes("BINANCE:") || category === "crypto") {
    const cryptoLogo =
      CRYPTO_LOGOS[symbol] ||
      CRYPTO_LOGOS[symbol.replace("BINANCE:", "").replace("USDT", "")];
    if (cryptoLogo) return { type: "url", value: cryptoLogo };
  }

  if (category === "stock" || (!category && !symbol.includes(":"))) {
    if (logoUrl) {
      STOCK_LOGO_CACHE[symbol] = logoUrl;
      return { type: "url", value: logoUrl };
    }
    if (STOCK_LOGO_CACHE[symbol]) {
      return { type: "url", value: STOCK_LOGO_CACHE[symbol] };
    }
    if (STOCK_FALLBACK_ICONS[symbol]) {
      return { type: "icon", value: STOCK_FALLBACK_ICONS[symbol] };
    }
  }

  if (symbol.includes("OANDA:") || category === "forex") {
    const forexIcon =
      FOREX_ICONS[symbol] || FOREX_ICONS[symbol.replace("OANDA:", "")];
    if (forexIcon) return { type: "icon", value: forexIcon };
  }

  // Default fallback based on category
  if (category === "crypto") return { type: "icon", value: "currency_bitcoin" };
  if (category === "forex") return { type: "icon", value: "currency_exchange" };
  if (category === "stock") return { type: "icon", value: "show_chart" };
  return { type: "icon", value: "show_chart" };
}

// Backward compatibility
export function getAssetLogo(symbol: string, category?: string): string {
  const result = getAssetLogoUrl(symbol, category);
  return result.type === "icon" ? result.value : "show_chart";
}

export function getStockLogo(symbol: string): string | null {
  return STOCK_LOGO_CACHE[symbol] || STOCK_FALLBACK_ICONS[symbol] || null;
}

export function setStockLogo(symbol: string, logoUrl: string): void {
  if (logoUrl) {
    STOCK_LOGO_CACHE[symbol] = logoUrl;
  }
}

export function getStockGradient(symbol: string) {
  return (
    STOCK_GRADIENTS[symbol] || {
      from: "#6366f1",
      to: "#8b5cf6",
      text: "#FFFFFF",
    }
  );
}
