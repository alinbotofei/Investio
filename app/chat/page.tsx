"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DashboardLayout from "../components/layout/DashboardLayout";
import Icon from "../components/ui/Icon";
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
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
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
        {showConversations && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setShowConversations(false)}
          />
        )}

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
        
        <aside
          className={`fixed md:relative top-0 left-0 h-full md:h-full w-80 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl flex-shrink-0 ${
            showConversations ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-5 border-b border-slate-700/30 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-cyan-500/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Icon name="chat_bubble" className="text-cyan-400 text-[22px]" />
              <h2 className="text-lg font-bold text-white">Chat History</h2>
            </div>
            <button
              onClick={() => setShowConversations(false)}
              className="md:hidden text-slate-400 hover:text-white transition"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
          
          <button
            onClick={startNewConversation}
            className="m-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:scale-[1.02] transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2 font-semibold flex-shrink-0"
          >
            <Icon name="add_circle" className="text-[22px]" />
            New Conversation
          </button>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar min-h-0">
            {conversationsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="animate-spin w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full mb-3"></div>
                <p className="text-sm text-slate-400">Loading conversations...</p>
              </div>
            ) : conversationsError ? (
              <div className="text-center py-8 px-4">
                <Icon name="error_outline" className="text-red-400 text-[40px] mx-auto mb-3" />
                <p className="text-sm text-red-400 mb-2">{conversationsError}</p>
                <button
                  onClick={loadConversations}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  Try again
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Icon name="chat_bubble_outline" className="text-slate-600 text-[40px] mx-auto mb-3" />
                <p className="text-sm text-slate-500">No conversations yet</p>
                <p className="text-xs text-slate-600 mt-1">Start chatting to create your first conversation</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const lastMessage = conv.messages?.[0];
                const preview = lastMessage?.text.slice(0, 60) || "New conversation";
                const isActive = conv.id === currentConversationId;
                
                return (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => loadConversation(conv.id)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                          : "bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-600/50"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Icon name="chat" className={`text-[16px] mt-0.5 ${
                          isActive ? "text-cyan-400" : "text-slate-500"
                        }`} />
                        <h3 className="text-sm font-semibold text-white truncate flex-1">
                          {conv.title || "Untitled Conversation"}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">{preview}...</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {new Date(conv.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        {isActive && (
                          <span className="text-xs text-cyan-400 font-medium">Active</span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversationToDelete(conv.id);
                        setShowDeleteModal(true);
                      }}
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/50 rounded-lg"
                      title="Delete conversation"
                    >
                      <Icon name="delete" className="text-red-400 hover:text-red-300 text-[16px]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden h-full min-w-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 overflow-y-auto custom-scrollbar">
              <div className="max-w-3xl w-full text-center">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 md:mb-4 leading-tight bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                  Your AI Investment Partner
                </h1>
                <p className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl mb-4 md:mb-6">
                  Ask me anything about markets, stocks, crypto, or investment strategies.
                </p>
                
                <div className="mb-6 md:hidden">
                  <button
                    onClick={() => setShowConversations(true)}
                    className="mx-auto px-5 py-3 bg-slate-800/95 hover:bg-slate-700/95 text-white rounded-xl transition-all flex items-center gap-2.5 shadow-lg border border-slate-600/60 font-medium backdrop-blur-md"
                  >
                    <Icon name="history" className="text-[20px]" />
                    View History
                  </button>
                </div>

                <div className="mt-6 md:mt-10 flex items-center justify-center">{" "}
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
                      <div className="absolute left-5 md:left-8 top-5 md:top-8 right-5 md:right-8 pointer-events-none text-white/60 text-base md:text-lg text-left leading-relaxed">
                        <span>Ask anything about </span>
                        <span
                          key={placeholderIndex}
                          className="inline-block"
                          style={{
                            animation:
                              "placeholderFade 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                          }}
                        >
                          {CHAT_PLACEHOLDERS[placeholderIndex]}...
                        </span>
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
          <>
            <div className="p-3 md:p-4 border-b border-slate-700/30 flex items-center gap-3 bg-gradient-to-r from-slate-900/50 to-slate-800/30 backdrop-blur-sm flex-shrink-0">
              <button
                onClick={() => setShowConversations(true)}
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-all"
                title="View conversations"
              >
                <Icon name="menu" className="text-white text-[20px]" />
              </button>
              <div className="flex-1" />
              <button
                onClick={startNewConversation}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/60 rounded-lg transition-all text-cyan-400 hover:text-cyan-300"
                title="New conversation"
              >
                <Icon name="add_circle" className="text-[20px]" />
                <span className="text-sm font-medium hidden sm:inline">New Chat</span>
              </button>
            </div>
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar"
              style={{
                scrollBehavior: "smooth",
              }}
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
