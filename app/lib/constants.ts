export const SUGGESTION_BTN_BASE =
  "flex items-center justify-center gap-3 px-5 py-3 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none";
export const SUGGESTION_BTN_SECONDARY = `${SUGGESTION_BTN_BASE} bg-slate-800 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-slate-600`;
export const SUGGESTION_BTN_PRIMARY = `${SUGGESTION_BTN_BASE} bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow focus:ring-2 focus:ring-cyan-400`;

export const API_CONFIG = {
  OPENAI_MODEL: "gpt-5-nano",
  MAX_OUTPUT_TOKENS: [1024, 2048, 4096, 8192, 16384],
  MAX_MESSAGE_LENGTH: 4000,
} as const;
