"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DashboardLayout from "../components/layout/DashboardLayout";
import Icon from "../components/ui/Icon";
import AnimatedPlaceholder from "../components/ui/AnimatedPlaceholder";
import { Message } from "../lib/types";
import { useConversations } from "../hooks/useConversations";
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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { conversations, loading: conversationsLoading, error: conversationsError, loadConversations, deleteConversation } = useConversations();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!userScrolledRef.current && messages.length > 0) {
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
    if (messages.length === 0) {
      landingTextareaRef.current?.focus();
    } else {
      chatTextareaRef.current?.focus();
    }
  }, [messages.length]);

  const loadConversation = async (conversationId: string) => {
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
        setShowConversations(false);
        showToast('✓ Conversation loaded');
      } else {
        showToast('✗ Failed to load conversation');
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
      showToast('✗ Error loading conversation');
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowConversations(false);
    showToast('✓ Started new conversation');
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const confirmDelete = async () => {
    if (conversationToDelete) {
      const success = await deleteConversation(conversationToDelete);
      if (success) {
        showToast('✓ Conversation deleted successfully');
        if (conversationToDelete === currentConversationId) {
          setMessages([]);
          setCurrentConversationId(null);
        }
      } else {
        showToast('✗ Failed to delete conversation');
      }
      setShowDeleteModal(false);
      setConversationToDelete(null);
    }
  };

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
        body: JSON.stringify({ 
          message: textToSend,
          conversationId: currentConversationId,
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
              if (json.conversationId && !currentConversationId) {
                setCurrentConversationId(json.conversationId);
                loadConversations();
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
      showToast('✗ Failed to send message');
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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-6 px-6 py-3 rounded-lg shadow-2xl z-50 animate-[slideInRight_0.3s_ease-out] flex items-center gap-2 ${
          toast.startsWith('✓')
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-red-500 to-pink-500'
        } text-white`}>
          <Icon 
            name={toast.startsWith('✓') ? "check_circle" : "error"} 
            className="text-[20px]" 
          />
          <span className="font-medium">{toast.substring(2)}</span>
        </div>
      )}

      <div className="w-full h-full flex bg-transparent overflow-hidden relative">


        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="error_outline" className="text-red-400 text-[24px]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Delete Conversation</h3>
                  {conversationToDelete && (
                    <p className="text-sm text-cyan-400/90 mb-3 italic">
                      &quot;{conversations.find(c => c.id === conversationToDelete)?.title || 'Untitled Conversation'}&quot;
                    </p>
                  )}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Are you sure you want to delete this conversation? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConversationToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all font-medium border border-slate-600/50 hover:border-slate-500"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-red-500/30"
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showConversations && (
          <div
            className="fixed inset-0 z-40 flex items-start justify-end pt-14"
            onClick={() => setShowConversations(false)}
          >
            <div
              className="relative mr-2 mt-1 w-72 max-h-[calc(100dvh-80px)] bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40">
                <div className="flex items-center gap-2">
                  <Icon name="history" className="text-cyan-400 text-[18px]" />
                  <span className="text-sm font-semibold text-white">History</span>
                  {conversations.length > 0 && (
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">{conversations.length}</span>
                  )}
                </div>
                <button
                  onClick={startNewConversation}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1.5 rounded-lg transition"
                >
                  <Icon name="add" className="text-[14px]" />
                  New
                </button>
              </div>
              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 custom-scrollbar">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-sm">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : conversationsError ? (
                  <div className="text-center py-6 px-3">
                    <p className="text-xs text-red-400 mb-2">{conversationsError}</p>
                    <button onClick={loadConversations} className="text-xs text-cyan-400 hover:underline">Retry</button>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 px-3">
                    <Icon name="chat_bubble_outline" className="text-slate-600 text-[32px] mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const preview = conv.messages?.[0]?.text.slice(0, 50) || "New conversation";
                    const isActive = conv.id === currentConversationId;
                    return (
                      <div key={conv.id} className="relative group">
                        <button
                          onClick={() => { loadConversation(conv.id); setShowConversations(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                            isActive
                              ? "bg-cyan-500/15 border border-cyan-500/40"
                              : "hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50"
                          }`}
                        >
                          <p className="text-xs font-medium text-white truncate">{conv.title || "Untitled"}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{preview}...</p>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConversationToDelete(conv.id); setShowDeleteModal(true); }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/30 rounded-lg transition"
                        >
                          <Icon name="delete" className="text-red-400 text-[14px]" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden h-full min-w-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-start sm:items-center justify-start sm:justify-center px-4 sm:px-6 md:px-8 py-4 sm:py-6 overflow-y-auto custom-scrollbar min-h-0">
              <div className="max-w-3xl w-full text-center pt-8 sm:pt-0 flex-shrink-0">
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold text-white mb-2 sm:mb-3 leading-tight bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                  Your AI Investment Partner
                </h1>
                <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-5">
                  Ask me anything about markets, stocks, crypto, or investment strategies.
                </p>
                
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => setShowConversations(true)}
                    className="mx-auto px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 shadow-md border border-slate-700/50 text-sm font-medium backdrop-blur-md"
                  >
                    <Icon name="history" className="text-[18px] text-slate-400" />
                    History
                    {conversations.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-slate-700 rounded-md text-xs text-slate-300">{conversations.length}</span>
                    )}
                  </button>
                </div>

                <div className="mt-3 sm:mt-4 md:mt-6 flex items-center justify-center">{" "}
                <div className="relative w-full md:mx-auto md:max-w-3xl">
                  <div className="relative">
                    <textarea
                      ref={landingTextareaRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder=" "
                      className="w-full bg-slate-800/60 border border-slate-600/40 text-white placeholder:text-white/60 p-4 md:p-6 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-base shadow-xl backdrop-blur-sm transition-all hover:bg-slate-800/70 min-h-[120px] md:min-h-[160px] max-h-[280px] md:max-h-[360px] input-focus input-hoverable"
                      rows={5}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    {!value && (
                      <div className="absolute left-4 md:left-6 top-4 md:top-6 right-16 pointer-events-none text-white/60 text-base text-left">
                        <AnimatedPlaceholder
                          placeholders={CHAT_PLACEHOLDERS.map((p) => `Ask anything about ${p}...`)}
                          typingSpeed={50}
                          deletingSpeed={25}
                          pauseAfterTyping={2200}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSend()}
                    disabled={loading}
                    aria-label="Send message"
                    className="absolute right-3 bottom-3 md:right-3 md:bottom-3 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
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

              <div className="mt-4 md:mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
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
          <>
            <div className="px-4 py-2.5 border-b border-slate-700/30 flex items-center gap-2 bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur-sm flex-shrink-0">
              <button
                onClick={() => setShowConversations(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all text-xs font-medium border border-slate-700/40 hover:border-slate-600/60"
              >
                <Icon name="history" className="text-[16px]" />
                <span className="hidden sm:inline">History</span>
                {conversations.length > 0 && <span className="text-[10px] text-slate-500">({conversations.length})</span>}
              </button>
              <div className="flex-1" />
              <button
                onClick={startNewConversation}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg transition-all text-xs font-semibold shadow-sm"
              >
                <Icon name="add" className="text-[16px]" />
                <span>New Chat</span>
              </button>
            </div>
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 custom-scrollbar min-h-0"
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

            <div className="px-6 py-6 border-t border-slate-700 bg-gradient-to-t from-transparent to-black/5 flex-shrink-0">
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
