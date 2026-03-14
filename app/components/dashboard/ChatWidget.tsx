"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../ui/Icon";
import AnimatedPlaceholder from "../ui/AnimatedPlaceholder";
import {
  TEXTAREA_BASE,
  SEND_BUTTON,
} from "@/app/lib/constants";

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(120, ta.scrollHeight)}px`;
  }, [value]);

  function handleSend() {
    const textToSend = value.trim();
    if (!textToSend) return;

    const messageWithContext = context
      ? `Context: ${context}\n\nQuestion: ${textToSend}`
      : textToSend;

    router.push(`/chat?context=${encodeURIComponent(messageWithContext)}`);
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

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 xl:p-8 text-center">
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
            disabled={!value.trim()}
            aria-label="Send message"
            className={`${SEND_BUTTON} absolute right-3 inset-y-0 my-auto w-9 h-9 flex items-center justify-center`}
          >
            <Icon name="send" className="text-[14px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
