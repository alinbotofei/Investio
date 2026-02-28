import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { conversationService } from "@/lib/services/conversationService";
import { getUserIdFromEmail } from "@/lib/services/userService";

const API_CONFIG = {
  OPENAI_MODEL: "gpt-4-turbo-preview",
  MAX_TOKENS: 1500,
  TEMPERATURE: 0.6,
} as const;

const INVESTIO_PROMPT = `You are Investio, an expert investment assistant specializing in financial markets, stocks, cryptocurrencies, and portfolio management.

Core principles:
- Provide clear, actionable financial insights
- Use data-driven analysis when discussing specific assets
- Structure responses with markdown (bold, lists, tables)
- Be concise and professional
- Acknowledge limitations and uncertainties
- Never guarantee returns or provide financial advice as a licensed advisor
- Focus on education and information

Response guidelines:
- For stocks/crypto: provide market context, recent trends, key metrics
- For portfolio discussions: discuss diversification, risk management, asset allocation
- For general questions: educate on investment concepts
- Keep responses focused and under 300 words unless detailed analysis is requested

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
    const systemContext = stockSymbol
      ? `${INVESTIO_PROMPT}\n\nUser: ${userName}\nContext: User is asking about ${stockSymbol}. Provide specific insights about this asset.`
      : `${INVESTIO_PROMPT}\n\nUser: ${userName}`;

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemContext },
    ];

    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      recentHistory.forEach((msg: { role: string; text: string }) => {
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
