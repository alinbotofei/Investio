/**
 * Static market-related constants: symbols, placeholders, quick actions.
 * Kept separate from UI constants so each file has one reason to change.
 */

export const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "TSLA",
  "META",
  "JPM",
] as const;

export const POPULAR_CRYPTO = [
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "BINANCE:BNBUSDT",
  "BINANCE:SOLUSDT",
  "BINANCE:ADAUSDT",
] as const;

export const CATEGORY_COLORS = {
  stock: "from-blue-600 to-cyan-500",
  crypto: "from-cyan-600 to-blue-500",
} as const;

export const CHAT_PLACEHOLDERS = [
  "stocks and market trends",
  "crypto and DeFi",
  "building your portfolio",
  "diversification strategies",
  "technical analysis",
  "fundamental valuation",
] as const;

export const DASHBOARD_QUICK_ACTIONS = [
  "Should I buy?",
  "Price target?",
  "Earnings analysis",
  "Competitor comparison",
] as const;

export const CHAT_SUGGESTIONS = [
  {
    icon: "trending_up",
    label: "Top tech stocks",
    desc: "Performance charts & comparison",
    prompt: "Show me the top technology stocks right now with a performance comparison chart.",
  },
  {
    icon: "currency_bitcoin",
    label: "Crypto market",
    desc: "BTC, ETH & altcoin analysis",
    prompt: "Analyze the current crypto market — show BTC, ETH, and top altcoins with charts.",
  },
  {
    icon: "pie_chart",
    label: "Build a portfolio",
    desc: "Personalized $10k allocation",
    prompt: "Create an optimal $10,000 portfolio for moderate risk with an allocation chart.",
  },
  {
    icon: "compare_arrows",
    label: "AAPL vs MSFT",
    desc: "Head-to-head performance",
    prompt: "Compare AAPL and MSFT — show performance charts and key financial metrics.",
  },
  {
    icon: "bar_chart",
    label: "Sector leaders",
    desc: "Best performing sectors YTD",
    prompt: "Which market sectors are outperforming this quarter? Show a ranked chart.",
  },
  {
    icon: "savings",
    label: "Dividend stocks",
    desc: "High-yield plays & payout data",
    prompt: "Show me the best dividend stocks right now with yield comparison charts.",
  },
] as const;
