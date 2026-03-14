export const SUGGESTION_BTN_BASE =
  "flex items-center justify-center gap-3 px-5 py-3 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none";
export const SUGGESTION_BTN_SECONDARY = `${SUGGESTION_BTN_BASE} bg-slate-800 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-slate-600`;
export const SUGGESTION_BTN_PRIMARY = `${SUGGESTION_BTN_BASE} bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow focus:ring-2 focus:ring-cyan-400`;

export const API_CONFIG = {
  OPENAI_MODEL: "gpt-4o-mini",
  MAX_OUTPUT_TOKENS: [1024, 2048, 4096, 8192, 16384],
  MAX_MESSAGE_LENGTH: 4000,
} as const;

export const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "TSLA",
  "META",
  "JPM",
];

export const POPULAR_CRYPTO = [
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "BINANCE:BNBUSDT",
  "BINANCE:SOLUSDT",
  "BINANCE:ADAUSDT",
];

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
];

export const DASHBOARD_QUICK_ACTIONS = [
  "Should I buy?",
  "Price target?",
  "Earnings analysis",
  "Competitor comparison",
];

export const CHAT_BUBBLE_USER =
  "rounded-2xl px-4 py-2.5 max-w-[72%] bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-sm leading-relaxed shadow-md animate-fade-in border border-blue-400/20 break-words";

export const CHAT_BUBBLE_ASSISTANT =
  "rounded-2xl px-4 py-3 max-w-[78%] bg-slate-800/80 text-slate-100 text-sm animate-fade-in break-words border border-slate-700/40 shadow-sm";

export const TEXTAREA_BASE =
  "w-full bg-slate-800/60 border border-slate-600/40 border-[0.8px] text-white px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-300 hover:bg-slate-800/80 shadow-inner input-focus input-hoverable";

export const SEND_BUTTON =
  "flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-md hover:scale-105 transition-transform disabled:opacity-60";
