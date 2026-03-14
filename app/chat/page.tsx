"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DashboardLayout from "../components/layout/DashboardLayout";
import Icon from "../components/ui/Icon";
import AnimatedPlaceholder from "../components/ui/AnimatedPlaceholder";
import { Message } from "../lib/types";
import { useConversationsCtx } from "../contexts/ConversationsContext";
import {
  CHAT_PLACEHOLDERS,
  CHAT_BUBBLE_USER,
  CHAT_BUBBLE_ASSISTANT,
} from "../lib/constants";
import { smoothScrollToBottom } from "../lib/utils/scroll";
import { markdownComponents } from "../lib/utils/markdown";
import { onChatReset } from "../lib/utils/events";

function hasCompleteChartFence(text: string) {
  return /```chart[\s\S]*?```/i.test(text);
}

function getStreamingSafePreview(text: string) {
  const start = text.lastIndexOf("```chart");
  if (start === -1) return text;

  const closing = text.indexOf("```", start + 8);
  if (closing !== -1) return text;

  const before = text.slice(0, start).trimEnd();
  return before;
}

function getGreetingLabel() {
  return "Welcome";
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contextFromUrl = searchParams.get("context");
  const convIdFromUrl = searchParams.get("id");
  const { data: session, status: sessionStatus } = useSession();
  const rawFirstName = session?.user?.name?.split(" ")[0] || "";
  const userFirstName =
    rawFirstName.toLowerCase() === "you" ? "Investor" : rawFirstName || "Investor";
  const greetingLabel = getGreetingLabel();
  const { loadConversations, setMobileSidebarOpen } = useConversationsCtx();

  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (contextFromUrl) {
      return [{ id: "ctx-init", role: "user" as const, text: contextFromUrl, time: Date.now(), fresh: true }];
    }
    return [];
  });
  const [loading, setLoading] = useState(() => !!contextFromUrl);
  const [loadingConversation, setLoadingConversation] = useState(() => !!convIdFromUrl);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [landingFocused, setLandingFocused] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const landingTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasSubmittedRef = useRef(false);
  const userScrolledRef = useRef(false);
  const prevConvIdRef = useRef<string | null | undefined>(undefined);
  const activeStreamRef = useRef<string | null>(null);
  const streamingAssistantIdRef = useRef<string | null>(null);
  const pendingContentRef = useRef("");
  const flushRafRef = useRef<number | null>(null);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevConvIdRef.current === convIdFromUrl) return;
    const prev = prevConvIdRef.current;
    prevConvIdRef.current = convIdFromUrl;
    if (convIdFromUrl) {
      if (activeStreamRef.current === convIdFromUrl) return;
      loadConversation(convIdFromUrl);
    } else if (prev !== undefined) {
      setMessages([]);
      setCurrentConversationId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convIdFromUrl]);

  useEffect(() => {
    if (contextFromUrl && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      setValue("");
      handleSend(contextFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextFromUrl]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      userScrolledRef.current = !isNearBottom;
      setShowScrollBtn(!isNearBottom);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (flushRafRef.current !== null) {
        cancelAnimationFrame(flushRafRef.current);
      }
      if (flushTimeoutRef.current !== null) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!userScrolledRef.current && messages.length > 0) {
      smoothScrollToBottom(messagesRef.current, true, !loading);
      setShowScrollBtn(false);
    }
  }, [messages, loading]);

  useEffect(() => {
    const ta = landingTextareaRef.current || chatTextareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(140, ta.scrollHeight)}px`;
  }, [value]);

  useEffect(() => {
    if (messages.length === 0 && !loading) {
      landingTextareaRef.current?.focus();
    } else if (messages.length > 0) {
      chatTextareaRef.current?.focus();
    }
  }, [messages.length, loading]);

  useEffect(() => {
    return onChatReset(() => router.push("/chat"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConversation = async (conversationId: string) => {
    setLoadingConversation(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const conversation = await response.json();
        const loadedMessages: Message[] = conversation.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          text: msg.text,
          time: new Date(msg.createdAt).getTime(),
        }));
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
      } else {
        router.push("/chat");
        showToast("\u2717 Failed to load conversation");
      }
    } catch {
      router.push("/chat");
    } finally {
      setLoadingConversation(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  async function handleSend(messageText?: string) {
    const textToSend = messageText || value.trim();
    if (!textToSend) return;
    userScrolledRef.current = false;

    const userMsgId = String(Date.now());
    const assistantId = `asst-${Date.now()}`;
    streamingAssistantIdRef.current = assistantId;
    pendingContentRef.current = "";
    setMessages((m) => {
      const filtered = m.filter((msg) => msg.id !== "ctx-init");
      return [
        ...filtered,
        { id: userMsgId, role: "user", text: textToSend, time: Date.now(), fresh: true },
        { id: assistantId, role: "assistant", text: "", time: Date.now() },
      ];
    });
    setValue("");
    setLoading(true);

    const flushAssistantText = () => {
      if (flushRafRef.current !== null) return;
      flushRafRef.current = requestAnimationFrame(() => {
        flushRafRef.current = null;
        const nextText = pendingContentRef.current;
        setMessages((m) => {
          let changed = false;
          const next = m.map((msg) => {
            if (msg.id === assistantId && msg.text !== nextText) {
              changed = true;
              return { ...msg, text: nextText };
            }
            return msg;
          });
          return changed ? next : m;
        });
      });
    };

    let accumulatedText = "";
    let shouldRefreshConversations = false;
    let streamedFirstChunk = false;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          conversationId: currentConversationId,
          history: messages.filter((m) => m.text && m.id !== "ctx-init").map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        let detail = `API error: ${response.status}`;
        try {
          const errorPayload = await response.json();
          if (typeof errorPayload?.error === "string") {
            detail = errorPayload.error;
          }
          if (typeof errorPayload?.detail === "string") {
            detail = `${detail} (${errorPayload.detail})`;
          }
        } catch {
          // ignore parse errors and use status fallback
        }
        throw new Error(detail);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let sseBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          let json: any;
          try {
            json = JSON.parse(data);
          } catch {
            continue;
          }

          if (json.content) {
            accumulatedText += json.content;
            pendingContentRef.current = accumulatedText;
            if (!streamedFirstChunk) {
              streamedFirstChunk = true;
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === assistantId ? { ...msg, text: pendingContentRef.current } : msg
                )
              );
            } else {
              flushAssistantText();
            }
          }
          if (json.conversationId && !currentConversationId) {
            activeStreamRef.current = json.conversationId;
            setCurrentConversationId(json.conversationId);
            router.replace(`/chat?id=${json.conversationId}`);
            shouldRefreshConversations = true;
          }
          if (json.error) {
            throw new Error(json.error);
          }
        }
      }

      setTimeout(() => {
        setMessages((current) =>
          current.map((x) => (x.id === userMsgId ? { ...x, fresh: false } : x))
        );
      }, 300);

      if (shouldRefreshConversations) {
        await loadConversations();
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      showToast("\u2717 Failed to send message");
      if (flushRafRef.current !== null) {
        cancelAnimationFrame(flushRafRef.current);
        flushRafRef.current = null;
      }
      if (flushTimeoutRef.current !== null) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      setMessages((m) =>
        m.map((msg) => (msg.id === assistantId ? { ...msg, text: `Error: ${error.message}` } : msg))
      );
    } finally {
      if (flushRafRef.current !== null) {
        cancelAnimationFrame(flushRafRef.current);
        flushRafRef.current = null;
      }
      if (flushTimeoutRef.current !== null) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      if (pendingContentRef.current !== accumulatedText) {
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, text: accumulatedText } : msg))
        );
      }
      streamingAssistantIdRef.current = null;
      setLoading(false);
      setTimeout(() => { activeStreamRef.current = null; }, 600);
    }
  }

  const AiAvatar = () => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-900/30 self-start mt-1 border border-cyan-300/20 flex items-center justify-center">
      <span className="text-white text-[13px] font-bold">I</span>
    </div>
  );

  const UserAvatar = () => (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700/90 border border-slate-500/40 flex items-center justify-center self-start mt-1 text-[13px] font-semibold text-white shadow-sm">
      {userFirstName[0]?.toUpperCase()}
    </div>
  );

  const AssistantLoader = () => (
    <div className="flex items-center text-cyan-200/90 py-0.5">
      <div className="relative w-[16px] h-[16px]">
        <div className="absolute inset-0 rounded-full border-[1.5px] border-cyan-400/20" />
        <div className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-cyan-300 animate-spin" />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {toast && (
        <div
          className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-2 ${
            toast.startsWith("\u2713")
              ? "bg-gradient-to-r from-green-600 to-emerald-500"
              : "bg-gradient-to-r from-red-600 to-pink-500"
          } text-white text-sm font-medium`}
        >
          <Icon name={toast.startsWith("\u2713") ? "check_circle" : "error"} className="text-[18px]" />
          <span>{toast.substring(2)}</span>
        </div>
      )}

      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {loadingConversation ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 h-14 px-4 border-b border-slate-700/20 bg-slate-950/40 backdrop-blur-xl flex items-center gap-3">
                <div className="flex-1 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto px-10 space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex items-start gap-3 ${i % 2 === 1 ? "justify-end" : "justify-start"}`}>
                      {i % 2 === 0 && (
                        <div className="w-16 h-7 rounded-full bg-slate-800 animate-pulse flex-shrink-0" />
                      )}
                      <div
                        className={`h-10 rounded-2xl animate-pulse ${i % 2 === 1 ? "bg-blue-900/40 w-48" : "bg-slate-800/60 w-72"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <>
              <div className="flex-shrink-0 h-14 px-4 border-b border-slate-700/20 bg-slate-950/40 backdrop-blur-xl flex items-center gap-3 md:hidden">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-xl transition-all"
                  title="Conversations"
                >
                  <Icon name="menu" className="text-[20px]" />
                </button>
                <div className="flex-1 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="w-9" />
              </div>

              <div className="flex-1 w-full min-h-0">
                <div className="h-full w-full overflow-y-auto flex items-start justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-8 bg-gradient-to-b from-slate-950/35 via-slate-900/20 to-slate-950/35">
                  <div className="w-full max-w-[72rem] h-full p-2 sm:p-4 lg:p-6 flex flex-col items-center justify-start gap-7 pt-3 sm:pt-6 lg:pt-7">

                  <div className="flex flex-col items-center gap-3.5 mb-4 sm:mb-5">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.035] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_22px_rgba(2,8,23,0.08)]">
                      <div className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-[14px] bg-gradient-to-br from-blue-500 via-blue-500 to-sky-400 flex items-center justify-center shadow-[0_8px_18px_rgba(59,130,246,0.2)] flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-[17px] sm:h-[17px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-slate-50 font-semibold text-[21px] sm:text-[23px] tracking-tight leading-none whitespace-nowrap">Investio</span>
                    </div>
                    <p className="text-slate-100 text-[23px] sm:text-[26px] font-medium tracking-tight text-center leading-tight">
                      {sessionStatus === "loading" ? (
                        <span className="text-slate-400 text-[18px]">...</span>
                      ) : (
                        <>
                          <span className="text-slate-100/95">{greetingLabel}, </span>
                          <span className="text-slate-50">{userFirstName}</span>
                          <span className="text-slate-200/85">!</span>
                        </>
                      )}
                    </p>
                    <div className="h-px w-44 sm:w-52 bg-gradient-to-r from-transparent via-blue-300/90 to-transparent" />
                  </div>

                  <h1 className="mt-1 text-[32px] sm:text-[40px] lg:text-[46px] font-bold text-center leading-[1.08] tracking-tight max-w-3xl [text-wrap:balance] px-2">
                    <span className="text-slate-100">How can I help you </span>
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-300 bg-clip-text text-transparent">today?</span>
                  </h1>

                  <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl">
                    {[
                      { icon: "query_stats",      text: "Market Edge" },
                      { icon: "candlestick_chart", text: "Smart Entries" },
                      { icon: "analytics",         text: "Clear Signals" },
                      { icon: "monitoring",        text: "Macro Pulse" },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/68 border border-slate-600/45 text-[13px] text-slate-100 backdrop-blur-sm">
                        <Icon name={icon} className="text-blue-300 text-[13px]" />
                        {text}
                      </div>
                    ))}
                  </div>

                  <div className="relative w-full max-w-[42rem]">
                    <textarea
                      ref={landingTextareaRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onFocus={() => setLandingFocused(true)}
                      onBlur={() => setLandingFocused(false)}
                      className="relative w-full bg-slate-800/80 border border-slate-600/35 text-white py-4 pl-6 pr-[60px] rounded-[26px] resize-none focus:outline-none hover:bg-slate-800/88 hover:border-slate-500/42 focus:bg-slate-800/90 focus:shadow-[0_0_0_1px_rgba(147,197,253,0.22),0_0_32px_rgba(59,130,246,0.12),0_8px_24px_rgba(2,8,23,0.18)] shadow-[0_4px_18px_rgba(2,8,23,0.16)] text-[16px] backdrop-blur-sm transition-[background-color,box-shadow,border-color] duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[60px] max-h-[190px] leading-relaxed hide-scrollbar"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                      }}
                    />
                    {!value && !landingFocused && (
                      <div className="absolute left-6 top-[17px] right-16 pointer-events-none text-slate-300/70 text-[15px] leading-relaxed">
                        <AnimatedPlaceholder
                          placeholders={CHAT_PLACEHOLDERS.map((p) => `Ask anything about ${p}...`)}
                          typingSpeed={50}
                          deletingSpeed={25}
                          pauseAfterTyping={2200}
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleSend()}
                      disabled={loading || !value.trim()}
                      aria-label="Send message"
                      className="absolute right-3 inset-y-0 my-auto w-9 h-9 sm:w-9 sm:h-9 xl:w-9 xl:h-9 flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-500 to-sky-500 hover:from-blue-400 hover:via-blue-500 hover:to-sky-400 text-white rounded-full shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Icon name="send" className="text-[14px] sm:text-[14px] xl:text-[14px]" />
                    </button>
                  </div>

                  {/* Suggestion cards — compact horizontal layout */}
                  <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-1">
                    {([
                      { icon: "trending_up",    label: "Top tech stocks",  desc: "Performance charts & comparison", prompt: "Show me the top technology stocks right now with a performance comparison chart." },
                      { icon: "currency_bitcoin", label: "Crypto market",  desc: "BTC, ETH & altcoin analysis",     prompt: "Analyze the current crypto market — show BTC, ETH, and top altcoins with charts." },
                      { icon: "pie_chart",      label: "Build a portfolio", desc: "Personalized $10k allocation",    prompt: "Create an optimal $10,000 portfolio for moderate risk with an allocation chart." },
                      { icon: "compare_arrows", label: "AAPL vs MSFT",     desc: "Head-to-head performance",        prompt: "Compare AAPL and MSFT — show performance charts and key financial metrics." },
                      { icon: "bar_chart",      label: "Sector leaders",   desc: "Best performing sectors YTD",     prompt: "Which market sectors are outperforming this quarter? Show a ranked chart." },
                      { icon: "savings",        label: "Dividend stocks",  desc: "High-yield plays & payout data",  prompt: "Show me the best dividend stocks right now with yield comparison charts." },
                    ] as { icon: string; label: string; desc: string; prompt: string }[]).map(({ icon, label, desc, prompt }) => (
                      <button
                        key={label}
                        onClick={() => { setValue(prompt); setTimeout(() => landingTextareaRef.current?.focus(), 0); }}
                        className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-800/58 hover:bg-slate-800/74 border border-slate-700/40 hover:border-cyan-400/20 text-left transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-700/42 group-hover:bg-cyan-500/10 flex items-center justify-center flex-shrink-0 border border-slate-600/20 group-hover:border-cyan-400/18 transition-colors duration-200">
                          <Icon name={icon} className="text-[15px] text-slate-400 group-hover:text-cyan-300 transition-colors duration-200" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-semibold leading-tight group-hover:text-cyan-50 transition-colors duration-200">{label}</p>
                          <p className="text-slate-500 text-xs leading-snug mt-1 group-hover:text-slate-400 transition-colors duration-200">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-hidden min-h-0 relative">
                <div ref={messagesRef} className="h-full overflow-y-auto py-8 custom-scrollbar">
                  <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-6 md:px-10 xl:px-16 space-y-6">
                    {messages.map((m, i) => {
                      const isTyping = m.role === "assistant" && !m.text;
                      const isStreaming = m.role === "assistant" && streamingAssistantIdRef.current === m.id;
                      const streamingHasRenderableChart =
                        isStreaming && hasCompleteChartFence(m.text);
                      const streamingPreview =
                        isStreaming && !streamingHasRenderableChart
                          ? getStreamingSafePreview(m.text)
                          : m.text;
                      return (
                        <div
                          key={m.id ?? i}
                          className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {m.role !== "user" && <AiAvatar />}
                          <div
                            className={
                              m.role === "user"
                                ? CHAT_BUBBLE_USER
                                : isTyping
                                ? "rounded-2xl px-4 py-3 bg-slate-800/80 border border-slate-700/40 shadow-sm"
                                : CHAT_BUBBLE_ASSISTANT
                            }
                          >
                            {m.role === "user" ? (
                              m.text
                            ) : isTyping ? (
                              <AssistantLoader />
                            ) : isStreaming && !streamingHasRenderableChart ? (
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {streamingPreview}
                              </ReactMarkdown>
                            ) : (
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {m.text}
                              </ReactMarkdown>
                            )}
                          </div>
                          {m.role === "user" && <UserAvatar />}
                        </div>
                      );
                    })}
                    {loading && messages[messages.length - 1]?.role !== "assistant" && (
                      <div className="flex items-start gap-3 justify-start">
                        <AiAvatar />
                        <div className="rounded-2xl px-4 py-3 bg-slate-800/80 border border-slate-700/40 animate-fade-in">
                          <AssistantLoader />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {showScrollBtn && (
                  <button
                    onClick={() => {
                      userScrolledRef.current = false;
                      smoothScrollToBottom(messagesRef.current, false);
                      setShowScrollBtn(false);
                    }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-800/95 border border-slate-600/50 hover:border-cyan-500/40 text-slate-300 hover:text-white rounded-full shadow-2xl text-xs font-medium transition-all hover:bg-slate-700/90 backdrop-blur-sm"
                  >
                    <Icon name="keyboard_arrow_down" className="text-[16px]" />
                    <span>Latest message</span>
                  </button>
                )}
              </div>

              <div className="flex-shrink-0 py-3 border-t border-slate-700/20">
                <div className="w-full max-w-4xl mx-auto px-3 sm:px-6">
                  <div className="relative w-full">
                    <textarea
                      ref={chatTextareaRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full bg-slate-800/80 border border-slate-600/35 text-white text-[16px] py-4 pl-5 pr-[58px] rounded-[24px] resize-none focus:outline-none hover:bg-slate-800/90 hover:border-slate-500/40 focus:bg-slate-800/90 focus:shadow-[0_0_0_1px_rgba(147,197,253,0.15),0_0_28px_rgba(59,130,246,0.07)] transition-[background-color,box-shadow,border-color] duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[60px] max-h-[190px] leading-relaxed hide-scrollbar shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
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
                      disabled={loading || !value.trim()}
                      aria-label="Send"
                      className="absolute right-3 inset-y-0 my-auto w-9 h-9 flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-500 to-sky-500 hover:from-blue-400 hover:via-blue-500 hover:to-sky-400 text-white rounded-full shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Icon name="send" className="text-[14px]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
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
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500/40 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-xs text-slate-600">Loading chat...</span>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <ChatContent />
    </Suspense>
  );
}