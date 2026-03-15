"use client";

import { useEffect, useRef, useState, Suspense, memo } from "react";
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

const MarkdownMessage = memo(function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {text}
    </ReactMarkdown>
  );
});

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

const CHAT_DRAFT_STORAGE_KEY = "chat_input_draft";

const SEARCH_STEPS = [
  "Searching the web",
  "Reading sources",
  "Analyzing data",
  "Preparing answer",
] as const;

function ReferencesPanel({ refs }: { refs: Array<{ title: string; url: string }> }) {
  const [open, setOpen] = useState(false);
  if (!refs.length) return null;
  return (
    <div className="mt-3 pt-2.5 border-t border-slate-700/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11.5px] text-slate-500 hover:text-slate-300 transition-colors duration-150"
      >
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6a3 3 0 0 1 6 0M6 3V1M6 9v2M9 6h2M1 6h2" />
        </svg>
        <span>{refs.length} source{refs.length > 1 ? "s" : ""} referenced</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1">
          {refs.map((ref, i) => {
            const hostname = (() => {
              try { return new URL(ref.url).hostname.replace(/^www\./, ""); } catch { return ref.url; }
            })();
            return (
              <a
                key={`${ref.url}-${i}`}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 text-[12px] text-slate-400 hover:text-cyan-400 transition-colors duration-150 group"
              >
                <span className="text-[10px] w-4 text-center text-slate-600 font-mono tabular-nums flex-shrink-0">{i + 1}</span>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=16`}
                  alt=""
                  width={14}
                  height={14}
                  className="rounded-sm flex-shrink-0 opacity-70"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <span className="truncate max-w-[300px] group-hover:underline underline-offset-2 decoration-cyan-400/40">
                  {ref.title}
                </span>
                <svg className="w-2.5 h-2.5 flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1 9L9 1M9 1H4M9 1v5" />
                </svg>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contextFromUrl = searchParams.get("context");
  const convIdFromUrl = searchParams.get("id");
  const { data: session, status: sessionStatus } = useSession();
  const isSessionReady = sessionStatus !== "loading";
  const rawFirstName = isSessionReady ? session?.user?.name?.split(" ")[0] || "" : "";
  const userFirstName =
    rawFirstName.toLowerCase() === "you" ? "Investor" : rawFirstName || "Investor";
  const { loadConversations } = useConversationsCtx();

  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return sessionStorage.getItem(CHAT_DRAFT_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
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
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [searchFading, setSearchFading] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [messageReferences, setMessageReferences] = useState<Record<string, Array<{ title: string; url: string }>>>({});

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const landingTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasSubmittedRef = useRef(false);
  const userScrolledRef = useRef(false);
  const forceScrollRef = useRef(false);
  const prevConvIdRef = useRef<string | null | undefined>(undefined);
  const activeStreamRef = useRef<string | null>(null);
  const streamingAssistantIdRef = useRef<string | null>(null);
  const pendingContentRef = useRef("");
  const flushRafRef = useRef<number | null>(null);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSearchingRef = useRef(false);
  const holdFlushRef = useRef(false);
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
      try {
        sessionStorage.removeItem(CHAT_DRAFT_STORAGE_KEY);
      } catch {}
      handleSend(contextFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextFromUrl]);

  useEffect(() => {
    try {
      const trimmed = value.trim();
      if (trimmed) {
        sessionStorage.setItem(CHAT_DRAFT_STORAGE_KEY, value);
      } else {
        sessionStorage.removeItem(CHAT_DRAFT_STORAGE_KEY);
      }
    } catch {}
  }, [value]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      userScrolledRef.current = !isNearBottom;
      setShowScrollBtn(!isNearBottom);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container || messages.length === 0) return;

    if (forceScrollRef.current) {
      forceScrollRef.current = false;
      container.scrollTop = container.scrollHeight;
      setShowScrollBtn(false);
      return;
    }

    // Only auto-scroll if already near bottom — respects manual scroll-up during streaming
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= 200) {
      container.scrollTop = container.scrollHeight;
      setShowScrollBtn(false);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (flushRafRef.current !== null) cancelAnimationFrame(flushRafRef.current);
      if (flushTimeoutRef.current !== null) clearTimeout(flushTimeoutRef.current);
      if (searchIndicatorTimerRef.current !== null) clearTimeout(searchIndicatorTimerRef.current);
      if (searchFadeTimerRef.current !== null) clearTimeout(searchFadeTimerRef.current);
      stepTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const ta = landingTextareaRef.current || chatTextareaRef.current;
    if (!ta) return;
    ta.style.height = "1px";
    ta.style.height = `${Math.min(190, Math.max(60, ta.scrollHeight))}px`;
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
        const loadedMessages: Message[] = conversation.messages.map(
          (msg: { id: string; role: "user" | "assistant"; text: string; createdAt: string }) => ({
            id: msg.id,
            role: msg.role,
            text: msg.text,
            time: new Date(msg.createdAt).getTime(),
          })
        );
        forceScrollRef.current = true;
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

  const setDraftValue = (nextValue: string) => {
    setValue(nextValue);
    try {
      const trimmed = nextValue.trim();
      if (trimmed) {
        sessionStorage.setItem(CHAT_DRAFT_STORAGE_KEY, nextValue);
      } else {
        sessionStorage.removeItem(CHAT_DRAFT_STORAGE_KEY);
      }
    } catch {}
  };

  async function handleSend(messageText?: string) {
    const textToSend = messageText || value.trim();
    if (!textToSend) return;
    userScrolledRef.current = false;
    forceScrollRef.current = true;

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
    try {
      sessionStorage.removeItem(CHAT_DRAFT_STORAGE_KEY);
    } catch {}
    setLoading(true);

    const flushAssistantText = () => {
      if (holdFlushRef.current) return;
      if (flushTimeoutRef.current !== null) return;
      flushTimeoutRef.current = setTimeout(() => {
        flushTimeoutRef.current = null;
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
      }, 80);
    };

    let accumulatedText = "";
    let shouldRefreshConversations = false;
    let streamedFirstChunk = false;

    // Show "Searching..." indicator if first token doesn't arrive within 1.5s
    if (searchIndicatorTimerRef.current) clearTimeout(searchIndicatorTimerRef.current);
    searchIndicatorTimerRef.current = setTimeout(() => {
      if (!streamedFirstChunk) {
        isSearchingRef.current = true;
        setIsWebSearching(true);
      }
    }, 1500);

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
        } catch {}
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
          let json: {
            content?: string;
            conversationId?: string;
            error?: string;
            searchStarted?: boolean;
            references?: Array<{ title: string; url: string }>;
          } | null = null;
          try {
            json = JSON.parse(data);
          } catch {
            continue;
          }
          if (!json) continue;

          if (json.searchStarted) {
            stepTimersRef.current.forEach(clearTimeout);
            setSearchStep(0);
            const t1 = setTimeout(() => setSearchStep(1), 2500);
            const t2 = setTimeout(() => setSearchStep(2), 5200);
            const t3 = setTimeout(() => setSearchStep(3), 8500);
            stepTimersRef.current = [t1, t2, t3];
          }

          if (json.references && json.references.length > 0) {
            setMessageReferences((prev) => ({ ...prev, [assistantId]: json!.references! }));
          }

          if (json.content) {
            accumulatedText += json.content;
            pendingContentRef.current = accumulatedText;
            if (!streamedFirstChunk) {
              streamedFirstChunk = true;              stepTimersRef.current.forEach(clearTimeout);
              stepTimersRef.current = [];              if (searchIndicatorTimerRef.current) {
                clearTimeout(searchIndicatorTimerRef.current);
                searchIndicatorTimerRef.current = null;
              }
              if (isSearchingRef.current) {
                // Hold text flush while searching indicator fades out (420ms crossfade)
                holdFlushRef.current = true;
                setSearchFading(true);
                searchFadeTimerRef.current = setTimeout(() => {
                  searchFadeTimerRef.current = null;
                  holdFlushRef.current = false;
                  setSearchFading(false);
                  setIsWebSearching(false);
                  isSearchingRef.current = false;
                  setMessages((m) =>
                    m.map((msg) =>
                      msg.id === assistantId ? { ...msg, text: pendingContentRef.current } : msg
                    )
                  );
                }, 420);
              } else {
                setMessages((m) =>
                  m.map((msg) =>
                    msg.id === assistantId ? { ...msg, text: pendingContentRef.current } : msg
                  )
                );
              }
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
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Failed to send message";
      console.error("Chat error:", error);
      showToast("\u2717 Failed to send message");
      if (searchIndicatorTimerRef.current) {
        clearTimeout(searchIndicatorTimerRef.current);
        searchIndicatorTimerRef.current = null;
      }
      if (searchFadeTimerRef.current !== null) {
        clearTimeout(searchFadeTimerRef.current);
        searchFadeTimerRef.current = null;
      }
      stepTimersRef.current.forEach(clearTimeout);
      stepTimersRef.current = [];
      holdFlushRef.current = false;
      isSearchingRef.current = false;
      setSearchFading(false);
      setIsWebSearching(false);
      if (flushRafRef.current !== null) {
        cancelAnimationFrame(flushRafRef.current);
        flushRafRef.current = null;
      }
      if (flushTimeoutRef.current !== null) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      setMessages((m) =>
        m.map((msg) => (msg.id === assistantId ? { ...msg, text: `Error: ${errMessage}` } : msg))
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
      if (searchIndicatorTimerRef.current !== null) {
        clearTimeout(searchIndicatorTimerRef.current);
        searchIndicatorTimerRef.current = null;
      }
      if (searchFadeTimerRef.current !== null) {
        clearTimeout(searchFadeTimerRef.current);
        searchFadeTimerRef.current = null;
      }
      stepTimersRef.current.forEach(clearTimeout);
      stepTimersRef.current = [];
      holdFlushRef.current = false;
      isSearchingRef.current = false;
      setSearchFading(false);
      setIsWebSearching(false);
      setSearchStep(0);
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

  const AssistantLoader = ({ searching, fading, stepIndex = 0 }: { searching?: boolean; fading?: boolean; stepIndex?: number }) => (
    <div className="py-0.5">
      {searching ? (
        <div
          className={`transition-all duration-[420ms] ease-out will-change-[opacity,transform] ${
            fading ? "opacity-0 -translate-y-1 scale-[0.97]" : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          <div className="flex flex-col gap-1.5">
            {SEARCH_STEPS.slice(0, stepIndex + 1).map((label, i) => {
              const isDone = i < stepIndex;
              const isCurrent = i === stepIndex;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2 transition-all duration-500 ${isDone ? "opacity-50" : "opacity-100"}`}
                >
                  {isDone ? (
                    <div className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center">
                      <svg className="w-2 h-2 text-emerald-400" fill="none" viewBox="0 0 8 8">
                        <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    <div className="relative flex-shrink-0 w-3.5 h-3.5">
                      <div className="absolute inset-0 rounded-full border border-sky-500/30" />
                      <div
                        className="absolute inset-0 rounded-full border border-transparent border-t-sky-400 animate-spin"
                        style={{ animationDuration: "0.75s" }}
                      />
                    </div>
                  )}
                  <span className={`text-[12px] font-medium ${isDone ? "text-slate-500" : isCurrent ? "text-slate-200" : "text-slate-500"}`}>
                    {label}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-[3px] ml-3 align-middle">
                        {[0, 200, 400].map((delay) => (
                          <span
                            key={delay}
                            className="inline-block w-[3px] h-[3px] rounded-full bg-sky-400/80"
                            style={{ animation: `typingDot 1.4s ease-in-out ${delay}ms infinite` }}
                          />
                        ))}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="relative w-[16px] h-[16px]">
          <div className="absolute inset-0 rounded-full border-[1.5px] border-cyan-400/20" />
          <div className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-cyan-300 animate-spin" />
        </div>
      )}
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
              <div className="flex-1 w-full min-h-0">
                <div className="h-full w-full overflow-y-auto flex items-start justify-center px-4 sm:px-8 lg:px-12 py-6 sm:py-8 bg-gradient-to-b from-slate-950/35 via-slate-900/20 to-slate-950/35">

                  <div className="w-full max-w-[72rem] h-full p-2 sm:p-4 lg:p-6 flex flex-col items-center justify-start gap-4 sm:gap-7 pt-3 sm:pt-6 lg:pt-7">

                  <div className="flex flex-col items-center gap-2 sm:gap-3.5 mb-1 sm:mb-4">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.035] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_22px_rgba(2,8,23,0.08)]">
                      <div className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-[14px] bg-gradient-to-br from-blue-500 via-blue-500 to-sky-400 flex items-center justify-center shadow-[0_8px_18px_rgba(59,130,246,0.2)] flex-shrink-0">
                        <svg className="w-4 h-4 sm:w-[17px] sm:h-[17px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-slate-50 font-semibold text-[19px] sm:text-[23px] tracking-tight leading-none whitespace-nowrap">Investio</span>
                    </div>
                    <div className="min-h-[30px] sm:min-h-[38px] flex items-center justify-center">
                      {isSessionReady ? (
                        <p className="text-slate-100 text-[20px] sm:text-[26px] font-medium tracking-tight text-center leading-tight">
                          <span className="text-slate-100/95">Welcome, </span>
                          <span className="text-slate-50">{userFirstName}</span>
                          <span className="text-slate-200/85">!</span>
                        </p>
                      ) : (
                        <div className="h-6 sm:h-7 w-44 sm:w-56 rounded-full bg-slate-700/35 animate-pulse" />
                      )}
                    </div>
                    <div className="h-px w-44 sm:w-52 bg-gradient-to-r from-transparent via-blue-300/90 to-transparent" />
                  </div>

                    <h1 className="mt-0 text-[24px] sm:text-[40px] lg:text-[46px] font-bold text-center leading-[1.1] tracking-tight max-w-3xl [text-wrap:balance] px-2">
                    <span className="text-slate-100">How can I help you </span>
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-300 bg-clip-text text-transparent">today?</span>
                  </h1>

                    <div className="hidden sm:flex flex-wrap justify-center gap-2.5 max-w-2xl">
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
                      onChange={(e) => setDraftValue(e.target.value)}
                      onFocus={() => setLandingFocused(true)}
                      onBlur={() => setLandingFocused(false)}
                      className="relative w-full bg-slate-800/80 border border-slate-600/35 text-white py-4 pl-6 pr-[60px] rounded-[26px] resize-none focus:outline-none hover:bg-slate-800/88 hover:border-slate-500/42 focus:bg-slate-800/90 focus:shadow-[0_0_0_1px_rgba(147,197,253,0.22),0_0_32px_rgba(59,130,246,0.12),0_8px_24px_rgba(2,8,23,0.18)] shadow-[0_4px_18px_rgba(2,8,23,0.16)] text-[15px] sm:text-[16px] backdrop-blur-sm transition-[background-color,box-shadow,border-color] duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[76px] sm:min-h-[60px] max-h-[190px] leading-relaxed hide-scrollbar"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                      }}
                    />
                    {!value && !landingFocused && (
                      <div className="absolute inset-x-0 inset-y-0 pointer-events-none px-6 pr-16 py-4 text-slate-300/70 text-[14px] sm:text-[15px] leading-relaxed overflow-hidden whitespace-nowrap">
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
                      className="absolute right-3 inset-y-0 my-auto w-[34px] h-[34px] sm:w-[34px] sm:h-[34px] xl:w-[34px] xl:h-[34px] flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-500 to-sky-500 hover:from-blue-400 hover:via-blue-500 hover:to-sky-400 text-white rounded-full shadow-[0_4px_12px_rgba(2,8,23,0.28)] transition-all duration-200 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Icon name="send" className="text-[13px] sm:text-[13px] xl:text-[13px]" />
                    </button>
                  </div>

                  <div className="w-full max-w-4xl">
                    <div className="sm:hidden grid grid-cols-2 gap-2.5 pt-1">
                      {([
                        { icon: "trending_up",     label: "Top tech stocks",   prompt: "Show me the top technology stocks right now with a performance comparison chart." },
                        { icon: "currency_bitcoin", label: "Crypto market",    prompt: "Analyze the current crypto market — show BTC, ETH, and top altcoins with charts." },
                        { icon: "pie_chart",       label: "Build a portfolio", prompt: "Create an optimal $10,000 portfolio for moderate risk with an allocation chart." },
                        { icon: "compare_arrows",  label: "AAPL vs MSFT",      prompt: "Compare AAPL and MSFT — show performance charts and key financial metrics." },
                        { icon: "bar_chart",       label: "Sector leaders",    prompt: "Which market sectors are outperforming this quarter? Show a ranked chart." },
                        { icon: "savings",         label: "Dividend stocks",   prompt: "Show me the best dividend stocks right now with yield comparison charts." },
                      ] as { icon: string; label: string; prompt: string }[]).map(({ icon, label, prompt }) => (
                        <button
                          key={label}
                          onClick={() => { setDraftValue(prompt); setTimeout(() => landingTextareaRef.current?.focus(), 0); }}
                          className="flex min-h-[64px] items-center gap-2.5 rounded-2xl bg-slate-800/62 border border-slate-700/40 px-3 py-3 text-left active:bg-slate-700/80 active:border-cyan-400/25 transition-all duration-150"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-700/40 border border-slate-600/25 flex-shrink-0">
                            <Icon name={icon} className="text-[14px] text-blue-300 flex-shrink-0" />
                          </div>
                          <span className="text-slate-100 text-[12.5px] font-medium leading-snug [text-wrap:balance]">{label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-1">
                      {([
                        { icon: "trending_up",     label: "Top tech stocks",   desc: "Performance charts & comparison", prompt: "Show me the top technology stocks right now with a performance comparison chart." },
                        { icon: "currency_bitcoin", label: "Crypto market",    desc: "BTC, ETH & altcoin analysis",     prompt: "Analyze the current crypto market — show BTC, ETH, and top altcoins with charts." },
                        { icon: "pie_chart",       label: "Build a portfolio", desc: "Personalized $10k allocation",    prompt: "Create an optimal $10,000 portfolio for moderate risk with an allocation chart." },
                        { icon: "compare_arrows",  label: "AAPL vs MSFT",      desc: "Head-to-head performance",        prompt: "Compare AAPL and MSFT — show performance charts and key financial metrics." },
                        { icon: "bar_chart",       label: "Sector leaders",   desc: "Best performing sectors YTD",     prompt: "Which market sectors are outperforming this quarter? Show a ranked chart." },
                        { icon: "savings",         label: "Dividend stocks",  desc: "High-yield plays & payout data",  prompt: "Show me the best dividend stocks right now with yield comparison charts." },
                      ] as { icon: string; label: string; desc: string; prompt: string }[]).map(({ icon, label, desc, prompt }) => (
                        <button
                          key={label}
                          onClick={() => { setDraftValue(prompt); setTimeout(() => landingTextareaRef.current?.focus(), 0); }}
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
                              <AssistantLoader searching={isWebSearching} fading={searchFading} stepIndex={searchStep} />
                            ) : isStreaming && !streamingHasRenderableChart ? (
                              <MarkdownMessage text={streamingPreview} />
                            ) : (
                              <>
                                <MarkdownMessage text={m.text} />
                                {m.id && messageReferences[m.id] && (
                                  <ReferencesPanel refs={messageReferences[m.id]} />
                                )}
                              </>
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
                          <AssistantLoader searching={isWebSearching} fading={searchFading} stepIndex={searchStep} />
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
                      onChange={(e) => setDraftValue(e.target.value)}
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
                      className="absolute right-3 inset-y-0 my-auto w-[34px] h-[34px] flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-500 to-sky-500 hover:from-blue-400 hover:via-blue-500 hover:to-sky-400 text-white rounded-full shadow-[0_4px_12px_rgba(2,8,23,0.28)] transition-all duration-200 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Icon name="send" className="text-[13px]" />
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