"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Icon from "../ui/Icon";
import { Message } from "@/app/lib/types";
import {
  CHAT_BUBBLE_USER,
  CHAT_BUBBLE_ASSISTANT,
  TEXTAREA_BASE,
  SEND_BUTTON,
} from "@/app/lib/constants";
import { smoothScrollToBottom } from "@/app/lib/utils/scroll";
import { markdownComponents } from "@/app/lib/utils/markdown";

interface ChatWidgetProps {
  context?: string;
  placeholder?: string;
  compact?: boolean;
}

export default function ChatWidget({
  context,
  placeholder,
  compact = false,
}: ChatWidgetProps) {
  const tickerSymbol =
    context?.split(",")[0]?.split(":")[1]?.trim() || context || "this asset";
  const dynamicPlaceholder =
    placeholder || `What would you like to know about ${tickerSymbol}?`;
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const userScrolledRef = useRef(false);

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
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(120, ta.scrollHeight)}px`;
  }, [value]);

  async function handleSend() {
    const textToSend = value.trim();
    if (!textToSend) return;

    userScrolledRef.current = false;

    const messageWithContext = context
      ? `Context: ${context}\n\nQuestion: ${textToSend}`
      : textToSend;

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
        body: JSON.stringify({ 
          message: messageWithContext,
          conversationId: conversationId,
          history: messages.filter(m => m.text).map(m => ({ role: m.role, text: m.text }))
        }),
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
              if (json.conversationId && !conversationId) {
                setConversationId(json.conversationId);
              }
              if (json.error) {
                throw new Error(json.error);
              }
            } catch (e) {}
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
    <div
      className={`flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden ${
        compact ? "h-[500px] xl:h-[600px] 2xl:h-[700px]" : "h-full"
      }`}
    >
      <div className="p-3 sm:p-4 xl:p-5 border-b border-slate-700/50 flex-shrink-0">
        <h3 className="text-sm sm:text-base xl:text-lg font-bold text-white flex items-center gap-2">
          <Icon
            name="chat"
            className="text-cyan-400 text-[18px] sm:text-[20px] xl:text-[24px]"
          />
          AI Assistant
        </h3>
      </div>

      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 xl:p-6 space-y-3 sm:space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#475569 transparent",
        }}
      >
        {messages.length === 0 && (
          <div className="text-center py-6 sm:py-8 xl:py-12">
            <Icon
              name="psychology"
              className="text-4xl sm:text-5xl xl:text-6xl mb-2 sm:mb-3 xl:mb-4 text-cyan-500/20"
            />
            <p className="text-slate-300 font-medium mb-1 text-sm sm:text-base xl:text-lg">
              Ask me about {tickerSymbol}
            </p>
            <p className="text-slate-500 text-xs xl:text-sm">
              Get insights, analysis, and answers
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={
                msg.role === "user" ? CHAT_BUBBLE_USER : CHAT_BUBBLE_ASSISTANT
              }
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  {msg.text ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 sm:p-4 xl:p-5 border-t border-slate-700/50 flex-shrink-0">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dynamicPlaceholder}
            className={`${TEXTAREA_BASE} w-full pr-14 sm:pr-16 xl:pr-20 min-h-[108px] max-h-[120px] xl:min-h-[120px] xl:max-h-[140px] text-base sm:text-lg xl:text-xl resize-none`}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !value.trim()}
            aria-label="Send message"
            className={`${SEND_BUTTON} absolute right-2.5 sm:right-3 xl:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 xl:w-14 xl:h-14`}
          >
            {loading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon name="send" className="text-[20px] sm:text-[22px] xl:text-[26px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
