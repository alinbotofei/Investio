"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../ui/Icon";
import AnimatedPlaceholder from "../ui/AnimatedPlaceholder";
import {
  TEXTAREA_BASE,
  SEND_BUTTON,
} from "@/app/lib/constants";
import { Message } from "@/app/lib/types";

interface ChatWidgetProps {
  context?: string;
  placeholder?: string;
  compact?: boolean;
  navigateOnSend?: boolean;
}

export default function ChatWidget({
  context,
  placeholder,
  compact = false,
  navigateOnSend = true,
}: ChatWidgetProps) {
  const tickerSymbol =
    context?.split(",")[0]?.split(":")[1]?.trim() || context || "this asset";

  const widgetPlaceholders = placeholder
    ? [placeholder]
    : [
        `What's the outlook for ${tickerSymbol}?`,
        `Analyze ${tickerSymbol} recent performance`,
        `Key risks for ${tickerSymbol}?`,
        `Compare ${tickerSymbol} to industry peers`,
        `What are analysts saying about ${tickerSymbol}?`,
      ];
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(120, ta.scrollHeight)}px`;
  }, [value]);

  async function handleSend() {
    const textToSend = value.trim();
    if (!textToSend) return;

    const messageWithContext = context
      ? `Context: ${context}\n\nQuestion: ${textToSend}`
      : textToSend;

    if (navigateOnSend) {
      router.push(`/chat?context=${encodeURIComponent(messageWithContext)}`);
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    setMessages((current) => [
      ...current,
      { id: userMsgId, role: "user", text: textToSend, time: Date.now() },
      { id: assistantMsgId, role: "assistant", text: "", time: Date.now() },
    ]);
    setValue("");
    setLoading(true);

    let accumulatedText = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageWithContext,
          conversationId,
          history: messages
            .filter((m) => m.text)
            .map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let sseBuffer = "";

      while (true) {
        const { done, value: chunkValue } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(chunkValue, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;

          let parsed: unknown;
          try {
            parsed = JSON.parse(data);
          } catch {
            continue;
          }

          if (!parsed || typeof parsed !== "object") continue;
          const event = parsed as {
            content?: string;
            conversationId?: string;
            error?: string;
          };

          if (event.content) {
            accumulatedText += event.content;
            setMessages((current) =>
              current.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, text: accumulatedText } : msg
              )
            );
          }

          if (event.conversationId && !conversationId) {
            setConversationId(event.conversationId);
          }

          if (event.error) {
            throw new Error(event.error);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      setMessages((current) =>
        current.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, text: `Error: ${errorMessage}` } : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden ${
        compact ? "h-[480px] lg:h-full" : "h-full"
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

      <div ref={messagesRef} className="flex-1 overflow-y-auto p-3 sm:p-4 xl:p-5 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 xl:p-8 text-center">
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
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white"
                    : "bg-slate-800/90 border border-slate-700/60 text-slate-100"
                }`}
              >
                {msg.text || (
                  <div className="flex items-center py-0.5">
                    <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-300 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 sm:p-4 xl:p-5 border-t border-slate-700/50 flex-shrink-0">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder=""
            className={`${TEXTAREA_BASE} w-full pr-[58px] pl-4 min-h-[82px] max-h-[150px] text-[15px] rounded-[22px] resize-none focus:ring-2 focus:ring-cyan-300/18 focus:border-cyan-400/45 transition-all duration-300 ease-out`}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          {!value && !focused && (
            <div className="absolute left-4 sm:left-4 top-[18px] right-16 pointer-events-none text-slate-400/70 text-sm overflow-hidden">
              <AnimatedPlaceholder placeholders={widgetPlaceholders} typingSpeed={48} deletingSpeed={24} pauseAfterTyping={1800} />
            </div>
          )}
          <button
            onClick={handleSend}
            disabled={!value.trim() || loading}
            aria-label="Send message"
            className={`${SEND_BUTTON} absolute right-3 inset-y-0 my-auto w-9 h-9 flex items-center justify-center`}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon name="send" className="text-[14px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
