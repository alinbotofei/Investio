export const chatBubble = {
  user: "rounded-2xl px-4 py-2.5 max-w-[72%] bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-sm leading-relaxed shadow-md border border-blue-400/20 break-words",
  assistant: "rounded-2xl px-4 py-3 max-w-[78%] bg-slate-800/80 text-slate-100 text-sm break-words border border-slate-700/40 shadow-sm",
} as const;

export const textarea = {
  base: "w-full bg-slate-800/60 border border-slate-600/40 border-[0.8px] text-white px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-colors duration-300 hover:bg-slate-800/80 shadow-inner",
} as const;

export const sendButton = {
  base: "flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-md hover:scale-105 transition-transform disabled:opacity-60",
} as const;

export const suggestionButton = {
  base: "flex items-center justify-center gap-3 px-5 py-3 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none",
  primary: "flex items-center justify-center gap-3 px-5 py-3 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow focus:ring-2 focus:ring-cyan-400",
  secondary: "flex items-center justify-center gap-3 px-5 py-3 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none bg-slate-800 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-slate-600",
} as const;

export const card = {
  base: "rounded-2xl bg-slate-900/60 border border-slate-700/50 shadow-sm",
  elevated: "rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-md",
} as const;

export const badge = {
  stock: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/20",
  crypto: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/20",
  positive: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
  negative: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/20",
  neutral: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/60 text-slate-300 border border-slate-600/40",
} as const;
