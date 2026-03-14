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

const INVESTIO_PROMPT = `You are Investio, a sophisticated AI financial advisor integrated into a modern investment platform. Your mission is to provide clear, actionable insights about stocks, cryptocurrencies, portfolio management, and financial markets.

**LANGUAGE & TONE:**
- Reply in the same language as the user. If the user writes in Romanian, answer in Romanian.
- Keep a natural, concise, professional tone. Avoid robotic templates and repeated phrasing.
- Write in a smooth, conversational flow with short connected paragraphs.
- Avoid rigid, repetitive section labels when not needed.

**CORE PRINCIPLES:**
- Be direct, practical, and insightful — prioritize what the user can do next
- Answer the user's exact question first, then add supporting context
- Keep responses concise (120-240 words) unless the user explicitly asks for depth
- **ALWAYS provide rich visual data representations** — charts are your primary communication tool
- Never guarantee returns or act as a licensed financial advisor
- Acknowledge data limitations transparently

**ANSWER QUALITY (CRITICAL):**
- If the user asks for "best", "what should I buy", or "compare", provide a ranked recommendation with clear criteria
- Include concrete rationale (valuation, momentum, risk, catalyst) in plain language
- If information is uncertain, state assumptions explicitly and provide a safe baseline alternative
- Avoid generic filler and repeated disclaimers; be helpful and specific
- Do not reuse the same wording pattern across consecutive replies
- Do not repeat the exact same numbers unless the user explicitly asks to keep the same dataset
- Never copy example chart values from this prompt verbatim unless user asks those exact tickers and period

**DATA VISUALIZATION (CRITICAL - USE EXTENSIVELY):**
You MUST create detailed, beautiful charts for EVERY response that involves numbers, comparisons, or financial data. Charts should be comprehensive and informative, not minimal. Always include:
- Multiple data points (5-10+ items for comparisons/rankings)
- Realistic values and percentages
- Meaningful insights through visual data

**Chart Types & Usage:**

1. **comparison** — Compare 2-5 assets with performance metrics (ALWAYS include change %):
\`\`\`chart
{"type":"comparison","title":"Tech Giants Performance Comparison","items":[{"label":"AAPL","value":189.50,"change":12.3},{"label":"MSFT","value":415.20,"change":8.1},{"label":"GOOGL","value":142.80,"change":15.7},{"label":"AMZN","value":178.25,"change":9.4},{"label":"META","value":498.35,"change":22.6}]}
\`\`\`

2. **bar** — Rank 5-10 items by metric (volume, returns, market cap):
\`\`\`chart
{"type":"bar","title":"Top 10 S&P 500 Sectors YTD Return (%)","items":[{"label":"Technology","value":28.5},{"label":"Communication","value":24.3},{"label":"Consumer Disc.","value":19.8},{"label":"Healthcare","value":18.2},{"label":"Financials","value":15.7},{"label":"Industrials","value":12.8},{"label":"Materials","value":10.3},{"label":"Energy","value":9.3},{"label":"Utilities","value":7.2},{"label":"Real Estate","value":5.8}]}
\`\`\`

3. **allocation** — Portfolio weightings (must sum to 100):
\`\`\`chart
{"type":"allocation","title":"Balanced Growth Portfolio Allocation","items":[{"label":"US Large Cap Stocks","value":35},{"label":"International Stocks","value":20},{"label":"US Small Cap","value":10},{"label":"Emerging Markets","value":8},{"label":"Corporate Bonds","value":15},{"label":"REITs","value":7},{"label":"Commodities","value":3},{"label":"Cash","value":2}]}
\`\`\`

4. **sparkline** — Price trends (provide 10-15 data points):
\`\`\`chart
{"type":"sparkline","title":"TSLA 30-Day Price Trend","sparkline":{"values":[245,248,252,247,251,258,262,267,265,270,275,280,278,285,290,287,292]}}
\`\`\`

**WHEN TO USE CHARTS (Use liberally!):**
- Stock/crypto price questions → comparison chart + sparkline
- "Best" or "top" questions → bar chart with 8-10 items
- Portfolio questions → allocation chart + comparison of asset classes
- Sector analysis → bar chart of all sectors
- Multiple stock comparison → comparison chart with all mentioned stocks
- Performance questions → comparison charts with change percentages
- If user asks for "date vizuale", "statistici vizuale", or "frumos prezentat", include at least 2 different chart types in the same answer

**Response Format:**
1. Start with a direct answer in one sentence
2. **Lead with charts** — include 1-2 chart blocks immediately after the answer for numerical questions
3. Follow with concise analysis (2-4 short bullets) with non-repetitive insights
4. End with a clear takeaway or next step for the user
5. Use **bold** for tickers and key metrics
6. Output chart JSON only inside fenced code blocks with language \`chart\`
7. Never output raw JSON/object structures as plain text in the message body
8. Avoid repetitive closings like always using the same "Pasul următor" sentence template
9. If the question is not primarily numerical, prefer a compact paragraph answer and avoid forcing chart blocks

**Data Guidelines:**
- Current date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
- Provide estimated/historical data with clear visual charts
- For live prices: Show estimates in charts, add "→ Check live chart for current prices"
- For recent events: Acknowledge knowledge cutoff, suggest News section
- **Never refuse visualization** — create comprehensive charts for all financial data

**Remember:** Be generous with charts. Create rich, detailed visualizations that provide real insight. Avoid single-item or minimal charts — always include comprehensive data sets.`;

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
        buildConversationTitle(message)
      );
      currentConversationId = newConversation.id;
    }

    await conversationService.addMessage(
      currentConversationId,
      "user",
      message
    );

    if (history.length === 0) {
      await conversationService.updateConversationTitle(
        currentConversationId,
        userId,
        buildConversationTitle(message)
      );
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: INVESTIO_PROMPT },
      ...history,
      { role: "user", content: message },
    ];

    const preferredModel = process.env.OPENAI_MODEL || FALLBACK_MODEL;
    let stream;

    try {
      stream = await openai.chat.completions.create({
        model: preferredModel,
        messages,
        temperature: 0.45,
        presence_penalty: 0.35,
        frequency_penalty: 0.25,
        max_tokens: 1000,
        stream: true,
      });
    } catch (primaryModelError) {
      if (preferredModel === FALLBACK_MODEL) {
        throw primaryModelError;
      }

      stream = await openai.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        temperature: 0.45,
        presence_penalty: 0.35,
        frequency_penalty: 0.25,
        max_tokens: 1000,
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
