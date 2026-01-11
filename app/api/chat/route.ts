import { NextRequest } from "next/server";

const API_CONFIG = {
  OPENAI_MODEL: "gpt-4-turbo-preview",
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
} as const;

const INVESTIO_PROMPT = `You are Investio, a friendly and knowledgeable financial assistant.

Personality:
- Clear and professional, but warm and conversational  
- Helpful without being pushy
- Honest about uncertainties
- Concise and to the point

Guidelines:
- Use markdown for better readability (**bold**, lists, tables, code blocks)
- Structure responses clearly
- Provide balanced insights
- Be transparent about data limitations
- Never guarantee returns

Keep it focused and helpful.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

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

    const systemContext = stockSymbol
      ? `${INVESTIO_PROMPT}\n\nContext: User is asking about ${stockSymbol}. Provide specific insights.`
      : INVESTIO_PROMPT;

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
                messages: [
                  { role: "system", content: systemContext },
                  { role: "user", content: userMessage },
                ],
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
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
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
