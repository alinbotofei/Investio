"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DashboardLayout from "../components/layout/DashboardLayout";
import Icon from "../components/ui/Icon";
import { Message } from "../lib/types";
import {
  SUGGESTION_BTN_PRIMARY,
  SUGGESTION_BTN_SECONDARY,
  CHAT_PLACEHOLDERS,
  CHAT_BUBBLE_USER,
  CHAT_BUBBLE_ASSISTANT,
  TEXTAREA_BASE,
  SEND_BUTTON,
} from "../lib/constants";
import { smoothScrollToBottom } from "../lib/utils/scroll";
import { markdownComponents } from "../lib/utils/markdown";

function ChatContent() {
  const searchParams = useSearchParams();
  const contextFromUrl = searchParams.get("context");
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const landingTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasSubmittedRef = useRef(false);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    if (contextFromUrl && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      setValue(contextFromUrl);
      setTimeout(() => {
        handleSend(contextFromUrl);
      }, 100);
    }
  }, [contextFromUrl]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        150;
      userScrolledRef.current = !isNearBottom;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!userScrolledRef.current) {
      smoothScrollToBottom(messagesRef.current, true);
    }
  }, [messages]);

  useEffect(() => {
    const ta = landingTextareaRef.current || chatTextareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(140, ta.scrollHeight)}px`;
  }, [value]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % CHAT_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      landingTextareaRef.current?.focus();
    } else {
      chatTextareaRef.current?.focus();
    }
  }, [messages.length]);

  async function handleSend(messageText?: string) {
    const textToSend = messageText || value.trim();
    if (!textToSend) return;

    userScrolledRef.current = false;

    const id = String(Date.now());
    const userMsg: Message = {
      id,
      role: "user",
      text: textToSend,
      time: Date.now(),
      fresh: true,
    };
    setMessages((m) => [...m, userMsg]);
    setValue("");
    setLoading(true);

    const assistantId = String(Date.now() + 1);
    setMessages((m) => [
      ...m,
      { id: assistantId, role: "assistant", text: "", time: Date.now() },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const json = JSON.parse(data);
              if (json.content) {
                accumulatedText += json.content;
                setMessages((m) =>
                  m.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, text: accumulatedText }
                      : msg
                  )
                );
              }
              if (json.error) {
                throw new Error(json.error);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setTimeout(() => {
        setMessages((current) =>
          current.map((x) => (x.id === id ? { ...x, fresh: false } : x))
        );
      }, 300);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? { ...msg, text: `Error: ${error.message}` }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 md:py-0">
            <div className="max-w-3xl w-full text-center">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 md:mb-4 leading-tight bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                Your AI Investment Partner
              </h1>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8">
                Let&apos;s chat about your investments, explore market insights,
                and build your financial future together.
              </p>

              <div className="mt-6 md:mt-10 flex items-center justify-center">
                <div className="relative w-full md:mx-auto md:max-w-3xl">
                  <div className="relative">
                    <textarea
                      ref={landingTextareaRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder=" "
                      className="w-full bg-slate-800/60 border border-slate-600/40 border-[0.8px] text-white placeholder:text-white/60 p-5 md:p-8 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-base md:text-lg shadow-xl backdrop-blur-sm transition-all hover:bg-slate-800/70 min-h-[180px] md:min-h-[240px] max-h-[400px] md:max-h-[520px] input-focus input-hoverable"
                      rows={5}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    {!value && (
                      <div className="absolute left-5 md:left-8 top-5 md:top-8 pointer-events-none text-white/60 text-base md:text-lg">
                        <span>Ask anything about </span>
                        <span
                          key={placeholderIndex}
                          className="inline-block"
                          style={{
                            animation:
                              "fadeScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                          }}
                        >
                          {CHAT_PLACEHOLDERS[placeholderIndex]}
                        </span>
                        <span>...</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSend()}
                    disabled={loading}
                    aria-label="Send message"
                    className="absolute right-3 bottom-3 md:right-4 md:bottom-4 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-6 h-6">
                        <svg
                          className="animate-spin text-white"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="rgba(255,255,255,0.18)"
                            strokeWidth="4"
                          ></circle>
                          <path
                            d="M22 12a10 10 0 0 0-10-10"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      <Icon name="send" className="text-[20px]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <button
                  className={SUGGESTION_BTN_PRIMARY}
                  onClick={() =>
                    setValue("What are the top technology stocks to watch?")
                  }
                >
                  <Icon name="trending_up" className="text-[18px]" />
                  <span className="text-sm">Top tech stocks</span>
                </button>

                <button
                  className={SUGGESTION_BTN_SECONDARY}
                  onClick={() =>
                    setValue("Summarize the latest Bitcoin market drivers.")
                  }
                >
                  <Icon name="currency_bitcoin" className="text-[18px]" />
                  <span className="text-sm">Crypto market summary</span>
                </button>

                <button
                  className={SUGGESTION_BTN_SECONDARY}
                  onClick={() =>
                    setValue(
                      "How should I allocate a $10,000 portfolio for moderate risk?"
                    )
                  }
                >
                  <Icon name="pie_chart" className="text-[18px]" />
                  <span className="text-sm">Portfolio allocation</span>
                </button>

                <button
                  className={SUGGESTION_BTN_SECONDARY}
                  onClick={() =>
                    setValue(
                      "Compare AAPL and MSFT performance over the last year."
                    )
                  }
                >
                  <Icon name="compare_arrows" className="text-[18px]" />
                  <span className="text-sm">Compare tickers</span>
                </button>

                <button
                  className={SUGGESTION_BTN_SECONDARY}
                  onClick={() =>
                    setValue(
                      "Generate a watchlist for fintech stocks with strong earnings momentum."
                    )
                  }
                >
                  <Icon name="list" className="text-[18px]" />
                  <span className="text-sm">Build watchlist</span>
                </button>

                <button
                  className={SUGGESTION_BTN_SECONDARY}
                  onClick={() =>
                    setValue(
                      "Explain how recent CPI data could affect equity markets."
                    )
                  }
                >
                  <Icon name="insights" className="text-[18px]" />
                  <span className="text-sm">Explain macro impact</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            <div
              ref={messagesRef}
              className="flex-1 overflow-auto px-6 py-8 space-y-6 scroll-smooth"
            >
              {messages.map((m, i) => (
                <div
                  key={m.id ?? i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  } items-start gap-3`}
                >
                  {m.role === "user" && (
                    <>
                      <div className={CHAT_BUBBLE_USER}>{m.text}</div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                        U
                      </div>
                    </>
                  )}
                  {m.role !== "user" && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div className={CHAT_BUBBLE_ASSISTANT}>
                        {m.text ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {m.text}
                          </ReactMarkdown>
                        ) : (
                          <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {loading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex items-start justify-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-slate-800/95 to-slate-900/95 text-white shadow-xl animate-fade-in border border-slate-700/50">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="px-6 py-6 border-t border-slate-700 bg-gradient-to-t from-transparent to-black/5">
              <div className="relative flex items-end gap-3">
                <textarea
                  ref={chatTextareaRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ask another question..."
                  className={`${TEXTAREA_BASE} min-h-[88px] max-h-[300px] text-base`}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={loading}
                  aria-label="Send message"
                  className={`${SEND_BUTTON} w-10 h-10 self-end mb-4`}
                >
                  {loading ? (
                    <div className="w-5 h-5">
                      <svg
                        className="animate-spin text-white"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="4"
                        ></circle>
                        <path
                          d="M22 12a10 10 0 0 0-10-10"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    <Icon name="send" className="text-[20px]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="w-8 h-8">
              <svg
                className="animate-spin text-cyan-500"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="rgba(34,211,238,0.2)"
                  strokeWidth="4"
                ></circle>
                <path
                  d="M22 12a10 10 0 0 0-10-10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                ></path>
              </svg>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
