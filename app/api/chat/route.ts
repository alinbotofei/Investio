import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { conversationService } from "@/lib/services/conversationService";
import { getUserIdFromEmail } from "@/lib/services/userService";

const API_CONFIG = {
  OPENAI_MODEL: "gpt-4-turbo-preview",
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.6,
} as const;

const INVESTIO_PROMPT = `You are Investio, an expert investment assistant specializing in financial markets, stocks, cryptocurrencies, and portfolio management.

Core principles:
- Provide clear, actionable financial insights
- Be concise and professional — keep responses focused and under 250 words unless the user explicitly asks for detail
- Never guarantee returns or provide financial advice as a licensed advisor
- Acknowledge when data may be time-sensitive

Formatting rules (always apply):
- Use **bold** for key terms, tickers, and important numbers
- Use bullet lists for multi-point analysis
- Use headings (##) only for long detailed responses
- Keep text explanations concise, let charts carry data visually when possible

Data visualization — use chart code blocks for visual data:
When presenting comparisons, allocations, or rankings, output an inline chart:

\`\`\`chart
{"type":"comparison","title":"AAPL vs MSFT","items":[{"label":"AAPL","value":189.50,"change":12.3},{"label":"MSFT","value":375.20,"change":8.1}]}
\`\`\`

Available types:
- "comparison": compare 2-5 assets (items with label, value, optional change %)
- "bar": rank by a single metric (items with label, value)
- "allocation": portfolio % breakdown (values are percentages summing to 100)
- "sparkline": price trend (sparkline.values = array of 5-12 numbers)
Place chart blocks BEFORE or AFTER text. Only use for genuine numerical/comparative data.

Data guidelines:
- Your training data has a knowledge cutoff. The current date is provided in the system context.
- For real-time prices or "today's" moves, clearly state: "Live data — check current prices via the chart on this platform."
- For general trends, macro analysis, historical data, and fundamental analysis you can provide detailed responses.
- When asked about recent news or events post your cutoff, say you cannot access it and suggest checking the News section of the app.

You help users make informed investment decisions through education and analysis.`;


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return new Response("User not found", { status: 404 });
    }

    const { message, conversationId, history } = await request.json();

    if (!message) {
      return new Response("Missing message", { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return new Response("OpenAI API key not configured", { status: 500 });
    }

    const stockMatch = message.match(/\[Stock: ([A-Z]+)\]/);
    const stockSymbol = stockMatch ? stockMatch[1] : null;
    const userMessage = stockSymbol
      ? message.replace(/\[Stock: [A-Z]+\]\s*/, "")
      : message;

    const userName = session.user.name || "there";
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const systemContext = stockSymbol
      ? `${INVESTIO_PROMPT}\n\nCurrent date: ${today}\nUser: ${userName}\nContext: User is asking about ${stockSymbol}. Provide specific insights about this asset.`
      : `${INVESTIO_PROMPT}\n\nCurrent date: ${today}\nUser: ${userName}`;

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemContext },
    ];

    if (history && Array.isArray(history) && history.length > 0) {
      history.forEach((msg: { role: string; text: string }) => {
        messages.push({ role: msg.role, content: msg.text });
      });
    }

    messages.push({ role: "user", content: userMessage });

    let fullResponse = "";
    let currentConversationId = conversationId;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
              },
              body: JSON.stringify({
                model: API_CONFIG.OPENAI_MODEL,
                messages,
                max_tokens: API_CONFIG.MAX_TOKENS,
                temperature: API_CONFIG.TEMPERATURE,
                stream: true,
              }),
            }
          );

          if (!response.ok) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: "Failed to get AI response",
                })}\n\n`
              )
            );
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            controller.close();
            return;
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content;

                  if (content) {
                    fullResponse += content;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch (e) {
                  
                }
              }
            }
          }

          if (fullResponse) {
            if (!currentConversationId) {
              const firstWords = userMessage.split(" ").slice(0, 6).join(" ");
              const title = firstWords.length > 30 ? firstWords.slice(0, 30) + "..." : firstWords;
              const newConversation = await conversationService.createConversation(
                userId,
                title
              );
              currentConversationId = newConversation.id;

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ conversationId: currentConversationId })}\n\n`
                )
              );
            }

            await conversationService.addMessage(
              currentConversationId,
              "user",
              userMessage
            );
            await conversationService.addMessage(
              currentConversationId,
              "assistant",
              fullResponse
            );
          }

          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: String(error) })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
