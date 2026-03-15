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

const CRYPTO_GRADIENTS: Record<
  string,
  { from: string; to: string; text: string; icon: string }
> = {
  BTC: { from: "#F7931A", to: "#E07B0A", text: "#FFFFFF", icon: "currency_bitcoin" },
  ETH: { from: "#627EEA", to: "#4B5FA7", text: "#FFFFFF", icon: "currency_exchange" },
  BNB: { from: "#F3BA2F", to: "#D9A31D", text: "#FFFFFF", icon: "auto_awesome" },
  SOL: { from: "#00FFA3", to: "#DC1FFF", text: "#FFFFFF", icon: "speed" },
  XRP: { from: "#23292F", to: "#1A1F24", text: "#FFFFFF", icon: "account_balance" },
  ADA: { from: "#0033AD", to: "#001F66", text: "#FFFFFF", icon: "cached" },
  DOGE: { from: "#C2A633", to: "#8A7623", text: "#FFFFFF", icon: "pets" },
  AVAX: { from: "#E84142", to: "#B32C2D", text: "#FFFFFF", icon: "ac_unit" },
  DOT: { from: "#E6007A", to: "#B8005E", text: "#FFFFFF", icon: "hub" },
  MATIC: { from: "#8247E5", to: "#6635B8", text: "#FFFFFF", icon: "polyline" },
  LINK: { from: "#2A5ADA", to: "#1E4299", text: "#FFFFFF", icon: "link" },
  LTC: { from: "#345D9D", to: "#264575", text: "#FFFFFF", icon: "flash_on" },
  UNI: { from: "#FF007A", to: "#CC0062", text: "#FFFFFF", icon: "swap_horiz" },
  SHIB: { from: "#FFA409", to: "#CC8307", text: "#FFFFFF", icon: "toll" },
  TON: { from: "#0088CC", to: "#0066A3", text: "#FFFFFF", icon: "diamond" },
  TRX: { from: "#FF0013", to: "#CC000F", text: "#FFFFFF", icon: "track_changes" },
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
  "BINANCE:BTCUSDT": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  BTCUSDT: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  
  "BINANCE:ETHUSDT": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  ETHUSDT: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  
  "BINANCE:BNBUSDT": "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  BNBUSDT: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  
  "BINANCE:SOLUSDT": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  SOLUSDT: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  
  "BINANCE:XRPUSDT": "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  XRPUSDT: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  
  "BINANCE:ADAUSDT": "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  ADAUSDT: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  
  "BINANCE:DOGEUSDT": "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  DOGEUSDT: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  
  "BINANCE:AVAXUSDT": "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  AVAXUSDT: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  
  "BINANCE:DOTUSDT": "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  DOT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  DOTUSDT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  
  "BINANCE:MATICUSDT": "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  MATICUSDT: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  
  "BINANCE:LINKUSDT": "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  LINKUSDT: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  
  "BINANCE:LTCUSDT": "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  LTC: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  LTCUSDT: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  
  "BINANCE:UNIUSDT": "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
  UNI: "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
  UNIUSDT: "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
  
  "BINANCE:SHIBUSDT": "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  SHIBUSDT: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  
  "BINANCE:TONUSDT": "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  TON: "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  TONUSDT: "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  
  "BINANCE:TRXUSDT": "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  TRX: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  TRXUSDT: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
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
    if (CRYPTO_LOGOS[symbol]) {
      return { type: "url", value: CRYPTO_LOGOS[symbol] };
    }
    
    const withoutExchange = symbol.replace("BINANCE:", "");
    if (CRYPTO_LOGOS[withoutExchange]) {
      return { type: "url", value: CRYPTO_LOGOS[withoutExchange] };
    }
    
    const baseSymbol = withoutExchange.replace(/USDT|BUSD|USD|EUR|BTC|ETH$/i, "");
    if (CRYPTO_LOGOS[baseSymbol]) {
      return { type: "url", value: CRYPTO_LOGOS[baseSymbol] };
    }
    
    const cryptoGradient = CRYPTO_GRADIENTS[baseSymbol];
    if (cryptoGradient) {
      return { type: "icon", value: cryptoGradient.icon };
    }
    
    return { type: "icon", value: "currency_bitcoin" };
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

  if (category === "crypto") return { type: "icon", value: "currency_bitcoin" };
  if (category === "forex") return { type: "icon", value: "currency_exchange" };
  if (category === "stock") return { type: "icon", value: "show_chart" };
  return { type: "icon", value: "show_chart" };
}

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

export function getCryptoGradient(symbol: string) {
  const baseSymbol = symbol
    .replace("BINANCE:", "")
    .replace(/USDT|BUSD|USD|EUR|BTC|ETH$/i, "");
  
  return (
    CRYPTO_GRADIENTS[baseSymbol] || {
      from: "#F7931A",
      to: "#E07B0A",
      text: "#FFFFFF",
      icon: "currency_bitcoin",
    }
  );
}
