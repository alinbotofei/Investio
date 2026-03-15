import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { conversationService } from "@/lib/services/conversationService";
import { getUserIdFromEmail } from "@/lib/services/userService";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FALLBACK_MODEL = "gpt-4o-mini";
const MAX_LIVE_SYMBOLS = 3;
const MAX_LIVE_CRYPTOS = 5;
const MAX_MODEL_HISTORY_MESSAGES = 80;
const MAX_CONTEXT_FALLBACK_MESSAGES = 4;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";
const SYMBOL_STOPWORDS = new Set([
  "THE", "AND", "FOR", "WITH", "THIS", "THAT", "WILL", "FROM", "YOUR", "WHAT", "WHEN", "WHERE",
  "SHOW", "BEST", "BUY", "SELL", "RISK", "PLAN", "PORT", "YTD", "ETF", "USD", "AI", "ROI",
]);
const COMPANY_ALIASES: Record<string, string> = {
  google: "GOOGL",
  alphabet: "GOOGL",
  microsoft: "MSFT",
  apple: "AAPL",
  amazon: "AMZN",
  nvidia: "NVDA",
  tesla: "TSLA",
  meta: "META",
  facebook: "META",
  netflix: "NFLX",
};
const CRYPTO_ALIASES: Record<string, string> = {
  btc: "BINANCE:BTCUSDT",
  bitcoin: "BINANCE:BTCUSDT",
  eth: "BINANCE:ETHUSDT",
  ethereum: "BINANCE:ETHUSDT",
  bnb: "BINANCE:BNBUSDT",
  "binance coin": "BINANCE:BNBUSDT",
  ada: "BINANCE:ADAUSDT",
  cardano: "BINANCE:ADAUSDT",
  sol: "BINANCE:SOLUSDT",
  solana: "BINANCE:SOLUSDT",
  xrp: "BINANCE:XRPUSDT",
  ripple: "BINANCE:XRPUSDT",
  doge: "BINANCE:DOGEUSDT",
  dogecoin: "BINANCE:DOGEUSDT",
};
const CRYPTO_TICKERS = new Set(["BTC", "ETH", "BNB", "ADA", "SOL", "XRP", "DOGE"]);
const DEFAULT_CRYPTO_PRICE_PAIRS = [
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "BINANCE:SOLUSDT",
  "BINANCE:BNBUSDT",
  "BINANCE:ADAUSDT",
];
const DEFAULT_CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "ADA"];
const PRICE_KEYWORDS_REGEX = /(price|prices|quote|quotes|pret|preturi|pre(?:ț|t)uri|cotatii|cota(?:ț|t)ii)/i;
const LIVE_TIME_HINTS_REGEX = /(current|live|spot|acum|azi|in prezent|actual)/i;
const DIRECT_PRICE_QUESTION_REGEX = /(cat|c[aă]t|ce valoare|ce pret|ce pre(?:ț|t)|cat e|cat este|how much|what is)/i;
const DATE_QUESTION_REGEX = /(in ce data|ce data|what date|today'?s date|data de azi|ziua de azi)/i;
const MACRO_KEYWORDS_REGEX = /(fed|federal reserve|inflation|cpi|ppi|gdp|recession|interest rate|tariff|earnings season|market outlook|economic|macro|sector rotation|yield curve|central bank|jobs report|nonfarm)/i;

type NewsItem = {
  headline: string;
  source: string;
  datetime: number;
};

type LiveSnapshotEntry = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  ts: number;
  assetType: "stock" | "crypto";
};

type LiveSnapshot = {
  entries: LiveSnapshotEntry[];
  failedSymbols: string[];
  contextText: string;
};

function isMacroQuestion(text: string): boolean {
  return MACRO_KEYWORDS_REGEX.test(text);
}

async function buildNewsContext(stockSymbols: string[], macro: boolean): Promise<string> {
  if (!FINNHUB_API_KEY) return "";

  const newsLines: string[] = [];
  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const toDate = new Date().toISOString().split("T")[0];

  if (stockSymbols.length > 0) {
    await Promise.all(
      stockSymbols.slice(0, 2).map(async (symbol) => {
        try {
          const url = new URL("https://finnhub.io/api/v1/company-news");
          url.searchParams.set("symbol", symbol);
          url.searchParams.set("from", fromDate);
          url.searchParams.set("to", toDate);
          url.searchParams.set("token", FINNHUB_API_KEY);
          const res = await fetch(url.toString(), { cache: "no-store" });
          if (!res.ok) return;
          const news = (await res.json()) as NewsItem[];
          if (!Array.isArray(news)) return;
          news.slice(0, 3).forEach((item) => {
            if (item.headline) {
              const date = new Date(item.datetime * 1000).toLocaleDateString("en-US");
              newsLines.push(`[${symbol}] ${date}: ${item.headline}`);
            }
          });
        } catch {
          // ignore
        }
      })
    );
  } else if (macro) {
    try {
      const url = new URL("https://finnhub.io/api/v1/news");
      url.searchParams.set("category", "general");
      url.searchParams.set("token", FINNHUB_API_KEY);
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) return "";
      const news = (await res.json()) as NewsItem[];
      if (!Array.isArray(news)) return "";
      news.slice(0, 4).forEach((item) => {
        if (item.headline) {
          const date = new Date(item.datetime * 1000).toLocaleDateString("en-US");
          newsLines.push(`[Market] ${date}: ${item.headline}`);
        }
      });
    } catch {
      return "";
    }
  }

  if (newsLines.length === 0) return "";
  return "Recent news context:\n" + newsLines.join("\n");
}

function buildConversationTitle(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (!normalized) return "New Chat";
  return normalized.length > 72
    ? `${normalized.slice(0, 69).trimEnd()}...`
    : normalized;
}

function sanitizeHistory(history: unknown): OpenAI.ChatCompletionMessageParam[] {
  if (!Array.isArray(history)) return [];

  return history.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];

    const role = (entry as { role?: unknown }).role;
    const text = (entry as { text?: unknown }).text;

    if ((role !== "user" && role !== "assistant") || typeof text !== "string") {
      return [];
    }

    const trimmed = text.trim();
    if (!trimmed) return [];

    return [{ role, content: trimmed } satisfies OpenAI.ChatCompletionMessageParam];
  });
}

function extractCandidateSymbols(text: string): string[] {
  const explicit: string[] = [];
  const upperOnly = text.match(/\b[A-Z]{2,5}\b/g) || [];
  const dollar = [...text.matchAll(/\$([A-Za-z]{1,5})\b/g)].map((m) => m[1].toUpperCase());
  const paren = [...text.matchAll(/\(([A-Za-z]{1,5})\)/g)].map((m) => m[1].toUpperCase());
  const lowered = text.toLowerCase();

  Object.entries(COMPANY_ALIASES).forEach(([name, symbol]) => {
    if (new RegExp(`\\b${name}\\b`, "i").test(lowered)) {
      explicit.push(symbol);
    }
  });

  const matches = [...explicit, ...upperOnly, ...dollar, ...paren].map((s) => s.toUpperCase());
  const unique: string[] = [];

  for (const symbol of matches) {
    if (SYMBOL_STOPWORDS.has(symbol)) continue;
    if (!unique.includes(symbol)) unique.push(symbol);
    if (unique.length >= MAX_LIVE_SYMBOLS) break;
  }

  return unique;
}

function isLivePriceIntent(text: string): boolean {
  const q = text.toLowerCase();
  if (DATE_QUESTION_REGEX.test(q)) return false;

  const hasPriceKeywords = PRICE_KEYWORDS_REGEX.test(q);
  if (hasPriceKeywords) return true;

  const requestedAssets = extractRequestedAssets(text);
  const hasAssetMention = requestedAssets.stocks.length > 0 || requestedAssets.cryptoPairs.length > 0;

  return LIVE_TIME_HINTS_REGEX.test(q) && hasAssetMention && DIRECT_PRICE_QUESTION_REGEX.test(q);
}

function isSimpleLivePriceRequest(text: string): boolean {
  if (!isLivePriceIntent(text)) return false;
  const q = text.toLowerCase();
  if (DATE_QUESTION_REGEX.test(q)) return false;
  if (q.length > 220) return false;
  if (/(de ce|why|compare|compar|analiz|analysis|buy|sell|cumpar|vand|forecast|predict|target|strategy|strateg|allocation|portofol)/i.test(q)) {
    return false;
  }
  return true;
}

function isRomanianText(text: string): boolean {
  return /(\bcare\b|\bvrea[au]\b|\bpret\b|\bpreturi\b|\bpreturile\b|\bpre(?:ț|t)uri\b|\bacum\b|\bazi\b|\bsi\b|\bpentru\b|\bcotatii\b|\bactual\b|[ăâîșț])/i.test(text);
}

function isTopCryptoRequest(text: string): boolean {
  const q = text.toLowerCase();
  return /(top\s*(crypto|cript[o]?|coins?|monede)|cele mai mari crypto|blue[-\s]?chip crypto)/i.test(q);
}

function extractRequestedAssets(text: string): { stocks: string[]; cryptoPairs: string[] } {
  const stocks = extractCandidateSymbols(text);
  const cryptoPairs: string[] = [];
  const lowered = text.toLowerCase();

  Object.entries(CRYPTO_ALIASES).forEach(([alias, pair]) => {
    if (new RegExp(`\\b${alias}\\b`, "i").test(lowered) && !cryptoPairs.includes(pair)) {
      cryptoPairs.push(pair);
    }
  });

  const explicitPairs = [...text.matchAll(/\b([A-Z]+:[A-Z]{3,20})\b/g)].map((m) => m[1].toUpperCase());
  explicitPairs.forEach((pair) => {
    if (!cryptoPairs.includes(pair)) cryptoPairs.push(pair);
  });

  return { stocks, cryptoPairs };
}

function formatDeterministicLiveReply(message: string, snapshot: LiveSnapshot | null): string {
  const ro = isRomanianText(message);
  if (!snapshot || snapshot.entries.length === 0) {
    if (isTopCryptoRequest(message)) {
      return ro
        ? [
            "Nu am cotații live disponibile exact acum.",
            `Top crypto urmărite în mod standard: ${DEFAULT_CRYPTO_SYMBOLS.join(", ")}.`,
            "Dă-mi refresh în 10-20 secunde și îți trimit prețurile curente pentru ele.",
          ].join("\n")
        : [
            "I do not have live quotes available at this exact moment.",
            `Default top crypto watchlist: ${DEFAULT_CRYPTO_SYMBOLS.join(", ")}.`,
            "Ask for a refresh in 10-20 seconds and I will return current prices for them.",
          ].join("\n");
    }

    return ro
      ? "Nu am putut obține cotații live acum. Trimite tickerele (ex: BTC, ETH, BNB sau AAPL, MSFT) și reiau imediat verificarea."
      : "I could not fetch live quotes right now. Send the tickers (e.g., BTC, ETH, BNB or AAPL, MSFT) and I will retry immediately.";
  }

  const latestTs = Math.max(...snapshot.entries.map((entry) => entry.ts));
  const header = ro
    ? `Prețuri curente (snapshot live, ${new Date(latestTs * 1000).toISOString()}):`
    : `Current prices (live snapshot, ${new Date(latestTs * 1000).toISOString()}):`;

  const lines = snapshot.entries.map((entry) => {
    const decimals = entry.assetType === "crypto" ? 4 : 2;
    const signedChange = `${entry.change >= 0 ? "+" : ""}${entry.change.toFixed(decimals)}`;
    const signedPct = `${entry.changePercent >= 0 ? "+" : ""}${entry.changePercent.toFixed(2)}%`;
    return `- ${entry.symbol}: ${entry.price.toFixed(decimals)} (${signedChange}, ${signedPct})`;
  });

  const footer = ro
    ? "Spune-mi ce active vrei în continuare și îți dau comparație + niveluri de risc."
    : "Tell me which assets you want next and I will give you a comparison and risk levels.";

  const failedLine = snapshot.failedSymbols.length > 0
    ? ro
      ? `Nu am putut actualiza acum pentru: ${snapshot.failedSymbols.join(", ")}.`
      : `Could not refresh right now for: ${snapshot.failedSymbols.join(", ")}.`
    : "";

  return [header, ...lines, failedLine, "", footer].filter(Boolean).join("\n");
}

async function buildLiveSnapshotContext(message: string, recentContextText: string): Promise<LiveSnapshot | null> {
  const fromMessage = extractRequestedAssets(message);
  let symbols = [...fromMessage.stocks];
  let cryptoPairs = [...fromMessage.cryptoPairs];

  if (isLivePriceIntent(message) && symbols.length === 0 && cryptoPairs.length === 0 && recentContextText.trim()) {
    const fromContext = extractRequestedAssets(recentContextText);
    symbols = [...fromContext.stocks];
    cryptoPairs = [...fromContext.cryptoPairs];
  }

  if (isLivePriceIntent(message) && symbols.length === 0 && cryptoPairs.length === 0) {
    DEFAULT_CRYPTO_PRICE_PAIRS.forEach((pair) => cryptoPairs.push(pair));
  }
  const cappedCryptoPairs = cryptoPairs.slice(0, MAX_LIVE_CRYPTOS);
  const cryptoTickersFromPairs = new Set(
    cappedCryptoPairs
      .map((pair) => pair.match(/:([A-Z]+)USDT$/)?.[1])
      .filter((ticker): ticker is string => Boolean(ticker))
  );
  const filteredStockSymbols = symbols.filter(
    (symbol) => !CRYPTO_TICKERS.has(symbol) && !cryptoTickersFromPairs.has(symbol)
  );

  const requestedStocks = [...filteredStockSymbols];
  const requestedPairs = [...cappedCryptoPairs];

  if (filteredStockSymbols.length === 0 && cappedCryptoPairs.length === 0) return null;

  const stockResults = await Promise.all(
    filteredStockSymbols.map(async (symbol) => {
      try {
        if (!FINNHUB_API_KEY) return null;
        const url = new URL("https://finnhub.io/api/v1/quote");
        url.searchParams.set("symbol", symbol);
        url.searchParams.set("token", FINNHUB_API_KEY);
        const response = await fetch(url.toString(), { cache: "no-store" });
        if (!response.ok) return null;
        const quote = (await response.json()) as { c?: number; d?: number; dp?: number; t?: number };
        if (!quote || !quote.c) return null;
        return {
          symbol,
          price: quote.c,
          change: quote.d ?? 0,
          changePercent: quote.dp ?? 0,
          ts: quote.t ?? Math.floor(Date.now() / 1000),
        };
      } catch {
        return null;
      }
    })
  );

  const validStocks = stockResults.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const cryptoResults = await Promise.all(
    cappedCryptoPairs.map(async (pair) => {
      try {
        if (!FINNHUB_API_KEY) return null;
        const to = Math.floor(Date.now() / 1000);
        const from = to - 300;
        const url = new URL("https://finnhub.io/api/v1/crypto/candle");
        url.searchParams.set("symbol", pair);
        url.searchParams.set("resolution", "1");
        url.searchParams.set("from", String(from));
        url.searchParams.set("to", String(to));
        url.searchParams.set("token", FINNHUB_API_KEY);

        const response = await fetch(url.toString(), { cache: "no-store" });
        if (!response.ok) return null;
        const data = await response.json();
        if (data?.s !== "ok" || !Array.isArray(data?.c) || data.c.length === 0) return null;

        const currentPrice = data.c[data.c.length - 1];
        const openPrice = Array.isArray(data.o) && data.o.length > 0 ? data.o[0] : currentPrice;
        const change = currentPrice - openPrice;
        const changePercent = openPrice ? (change / openPrice) * 100 : 0;

        return {
          symbol: pair,
          price: Number(currentPrice),
          change: Number(change),
          changePercent: Number(changePercent),
          ts: to,
        };
      } catch {
        return null;
      }
    })
  );
  const validCrypto = cryptoResults.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  if (validStocks.length === 0 && validCrypto.length === 0) return null;

  const validStockSet = new Set(validStocks.map((entry) => entry.symbol));
  const validCryptoSet = new Set(validCrypto.map((entry) => entry.symbol));
  const failedSymbols = [
    ...requestedStocks.filter((symbol) => !validStockSet.has(symbol)),
    ...requestedPairs.filter((pair) => !validCryptoSet.has(pair)),
  ];

  const stockLines = validStocks.map(
    (entry) =>
      `${entry.symbol}: ${entry.price.toFixed(2)} (${entry.change >= 0 ? "+" : ""}${entry.change.toFixed(2)}, ${entry.changePercent >= 0 ? "+" : ""}${entry.changePercent.toFixed(2)}%), ts=${new Date(entry.ts * 1000).toISOString()}`
  );
  const cryptoLines = validCrypto.map(
    (entry) =>
      `${entry.symbol}: ${entry.price.toFixed(4)} (${entry.change >= 0 ? "+" : ""}${entry.change.toFixed(4)}, ${entry.changePercent >= 0 ? "+" : ""}${entry.changePercent.toFixed(2)}%), ts=${new Date(entry.ts * 1000).toISOString()}`
  );
  const lines = [...stockLines, ...cryptoLines];

  return {
    entries: [
      ...validStocks.map((entry) => ({ ...entry, assetType: "stock" as const })),
      ...validCrypto.map((entry) => ({ ...entry, assetType: "crypto" as const })),
    ],
    failedSymbols,
    contextText: [
      "Live market snapshot (latest available):",
      ...lines,
      failedSymbols.length > 0 ? `Failed to fetch now: ${failedSymbols.join(", ")}` : "",
    ].filter(Boolean).join("\n"),
  };
}

function streamSingleAssistantResponse(conversationId: string, content: string): NextResponse {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ conversationId })}\n\n`)
      );
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function buildModelHistoryFromConversation(
  conversation: { messages: Array<{ role: string; text: string }> },
  displayText: string,
  enrichedMessage: string
): OpenAI.ChatCompletionMessageParam[] {
  const normalized = conversation.messages
    .filter((msg) => (msg.role === "user" || msg.role === "assistant") && typeof msg.text === "string")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.text.trim(),
    }))
    .filter((msg) => msg.content.length > 0);

  if (normalized.length > 0) {
    const last = normalized[normalized.length - 1];
    if (last.role === "user" && last.content === displayText) {
      last.content = enrichedMessage;
    }
  }

  const start = Math.max(0, normalized.length - MAX_MODEL_HISTORY_MESSAGES);
  return normalized.slice(start).map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

const INVESTIO_PROMPT = `You are Investio — a sharp, direct investment specialist. You have a real point of view and you share it clearly. You are not a generic assistant and you never sound like one.

## Core behavior
- Reply in the same language as the user (Romanian or English, detect it).
- Be concise. Most answers fit in 3–5 bullets. Never ramble.
- Lead with your conclusion, then back it up. Never bury the answer.
- Be opinionated: say "I'd go with X because..." not "it depends on your risk tolerance."
- If you are uncertain, say so briefly and give your best read anyway. Never hide.
- Avoid filler: no "Great question!", no "Certainly!", no repeated summaries.

## When the user greets or asks something vague
Reply with one warm sentence, then immediately offer 3 concrete things you can help with right now (specific to investing, with numbers or tickers). Ask one short question to get started.

## Investment advice rules
- Always state a clear position: buy / hold / avoid, with a brief reason.
- Give concrete criteria: price level, entry zone, stop-loss, what to watch.
- If the user asks "what to buy" or "compare X vs Y", give a ranked answer with reasoning — do not dodge with "it depends".
- Recommendations must reference data from the live snapshot or news context if injected. If no live data is available, say which symbols failed and ask to retry.
- Never invent price data. If you don't have it, say so.
- End each recommendation with: **Entry**, **Risk**, **Watch** (one line each).
- Never guarantee returns. Frame all recommendations as your analysis, not financial advice.

## Current date and data awareness
- Today is ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
- You have access to real-time market data and recent news injected directly into each user message. Use it.
- NEVER say "my knowledge cutoff is 2023" or "I don't have data after..." or any variation. That is false — you have live prices and recent news in this conversation.
- If a live snapshot is injected, it IS current. Use it as the source of truth for prices.
- If no live data is injected for a specific asset, say "I couldn't fetch live data for X right now" and give your best read based on market context — do not cite a training cutoff.
- For macroeconomic questions (Fed, inflation, earnings), use the news context injected below the user message. If no news was injected, reason from the most recent market dynamics you're aware of and state that clearly.

## Live market data
- If a live snapshot is injected in the user message, use it. Never ask the user to "wait" for prices.
- Never output placeholders like [check live] or [current price].
- For price-only requests, output the snapshot data directly — no extra analysis unless asked.

## News context
- If news headlines are injected, factor them into your analysis naturally. Do not list them verbatim — synthesize what matters.

## Charts
- Use chart blocks for numerical, comparative, or allocation questions.
- Do not force charts for simple questions.
- Chart payload must be valid JSON inside a fenced \`\`\`chart block.
- Never output raw JSON outside chart blocks.

Chart format examples:
\`\`\`chart
{"type":"comparison","title":"AAPL vs MSFT","items":[{"label":"AAPL","value":189.5,"change":2.1},{"label":"MSFT","value":415.2,"change":1.4}]}
\`\`\`

\`\`\`chart
{"type":"allocation","title":"Balanced Portfolio","items":[{"label":"US Equity","value":45},{"label":"Intl Equity","value":20},{"label":"Bonds","value":25},{"label":"Cash","value":10}]}
\`\`\`

Current date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
If live data is uncertain, label values as estimates.`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const displayText = typeof body?.displayText === "string" ? body.displayText.trim() : message;
    const conversationId = typeof body?.conversationId === "string" ? body.conversationId : null;
    const history = sanitizeHistory(body?.history);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let currentConversationId = conversationId;

    if (currentConversationId) {
      const existingConversation = await conversationService.getConversationById(
        currentConversationId,
        userId
      );

      if (!existingConversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      const newConversation = await conversationService.createConversation(
        userId,
        buildConversationTitle(displayText)
      );
      currentConversationId = newConversation.id;
    }

    await conversationService.addMessage(
      currentConversationId,
      "user",
      displayText
    );

    if (history.length === 0) {
      await conversationService.updateConversationTitle(
        currentConversationId,
        userId,
        buildConversationTitle(displayText)
      );
    }

    const dbConversation = await conversationService.getConversationById(
      currentConversationId,
      userId
    );

    const recentContextText = dbConversation
      ? dbConversation.messages.slice(-MAX_CONTEXT_FALLBACK_MESSAGES).map((msg) => msg.text).join("\n")
      : "";
    const liveSnapshot = await buildLiveSnapshotContext(message, recentContextText);
    const detectedStockSymbols = extractCandidateSymbols(message).filter((s) => !CRYPTO_TICKERS.has(s));
    const [newsContext] = await Promise.all([
      buildNewsContext(detectedStockSymbols, isMacroQuestion(message)),
    ]);
    let enrichedMessage = message;
    if (liveSnapshot) enrichedMessage += `\n\n${liveSnapshot.contextText}`;
    if (newsContext) enrichedMessage += `\n\n${newsContext}`;

    if (isSimpleLivePriceRequest(displayText)) {
      const deterministicReply = formatDeterministicLiveReply(displayText, liveSnapshot);
      await conversationService.addMessage(
        currentConversationId,
        "assistant",
        deterministicReply
      );
      return streamSingleAssistantResponse(currentConversationId, deterministicReply);
    }

    const modelHistory = dbConversation
      ? buildModelHistoryFromConversation(dbConversation, displayText, enrichedMessage)
      : [...history, { role: "user", content: enrichedMessage } satisfies OpenAI.ChatCompletionMessageParam];

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: INVESTIO_PROMPT },
      ...modelHistory,
    ];

    const preferredModel = process.env.OPENAI_MODEL || FALLBACK_MODEL;
    let stream;

    try {
      stream = await openai.chat.completions.create({
        model: preferredModel,
        messages,
        temperature: 0.15,
        presence_penalty: 0.35,
        frequency_penalty: 0.25,
        max_tokens: 600,
        stream: true,
      });
    } catch (primaryModelError) {
      if (preferredModel === FALLBACK_MODEL) {
        throw primaryModelError;
      }

      stream = await openai.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        temperature: 0.15,
        presence_penalty: 0.35,
        frequency_penalty: 0.25,
        max_tokens: 600,
        stream: true,
      });
    }

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ conversationId: currentConversationId })}\n\n`
            )
          );

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          if (fullResponse) {
            await conversationService.addMessage(
              currentConversationId,
              "assistant",
              fullResponse
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const detail = error instanceof Error ? error.message : "Unknown stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Failed to stream assistant response", detail })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new NextResponse(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        detail,
      },
      { status: 500 }
    );
  }
}
