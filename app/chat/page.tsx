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

  function formatTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-2 ${
          toast.startsWith('✓')
            ? 'bg-gradient-to-r from-green-600 to-emerald-500'
            : 'bg-gradient-to-r from-red-600 to-pink-500'
        } text-white text-sm font-medium animate-[slideInRight_0.25s_ease-out]`}>
          <Icon name={toast.startsWith('✓') ? "check_circle" : "error"} className="text-[18px]" />
          <span>{toast.substring(2)}</span>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Icon name="delete_forever" className="text-red-400 text-[20px]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Delete Conversation</h3>
                {conversationToDelete && (
                  <p className="text-xs text-cyan-400/80 italic mb-2">
                    &quot;{conversations.find(c => c.id === conversationToDelete)?.title || 'Untitled'}&quot;
                  </p>
                )}
                <p className="text-sm text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => { setShowDeleteModal(false); setConversationToDelete(null); }}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-sm font-medium border border-slate-700/50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all text-sm font-semibold shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-page layout ── */}
      <div className="flex h-full overflow-hidden relative">

        {/* Mobile overlay */}
        {showConversations && (
          <div
            className="fixed inset-0 z-20 bg-black/60 md:hidden"
            onClick={() => setShowConversations(false)}
          />
        )}

        {/* ── LEFT SIDEBAR: Conversations ── */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-30 md:z-auto
          w-64 flex flex-col flex-shrink-0
          bg-slate-950 md:bg-slate-900/30
          border-r border-slate-700/30
          transform transition-transform duration-200 md:translate-x-0
          ${showConversations ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Sidebar header */}
          <div className="px-4 py-3.5 border-b border-slate-700/30 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Icon name="forum" className="text-cyan-400 text-[17px]" />
              <span className="text-sm font-semibold text-white tracking-tight">Chats</span>
              {conversations.length > 0 && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-medium">
                  {conversations.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowConversations(false)}
              className="md:hidden text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-all"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>

          {/* New Chat button */}
          <div className="px-3 py-2.5 border-b border-slate-700/20 flex-shrink-0">
            <button
              onClick={startNewConversation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              <Icon name="add" className="text-[16px]" />
              New Conversation
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-2 custom-scrollbar min-h-0">
            {conversationsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-slate-600">
                <div className="w-5 h-5 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : conversationsError ? (
              <div className="px-4 py-10 text-center">
                <Icon name="wifi_off" className="text-slate-700 text-[28px] mb-2 mx-auto" />
                <p className="text-xs text-slate-500 mb-2">{conversationsError}</p>
                <button onClick={loadConversations} className="text-xs text-cyan-400 hover:underline">
                  Retry
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Icon name="chat_bubble_outline" className="text-slate-700 text-[36px] mb-3 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">No conversations yet</p>
                <p className="text-[11px] text-slate-700 mt-1">Start a new chat above</p>
              </div>
            ) : (
              <div className="px-2 space-y-0.5">
                {conversations.map((conv) => {
                  const isActive = conv.id === currentConversationId;
                  const lastMsg = conv.messages?.[0];
                  const timeAgo = conv.updatedAt ? formatTimeAgo(new Date(conv.updatedAt)) : '';
                  return (
                    <div key={conv.id} className="relative group">
                      <button
                        onClick={() => { loadConversation(conv.id); setShowConversations(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex flex-col gap-0.5 ${
                          isActive
                            ? 'bg-cyan-500/10 border border-cyan-500/25 shadow-sm'
                            : 'border border-transparent hover:bg-slate-800/70 hover:border-slate-700/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-5">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-cyan-400' : 'bg-slate-600 group-hover:bg-slate-500'}`} />
                          <p className="text-[12px] font-semibold text-white truncate">{conv.title || 'Untitled Conversation'}</p>
                        </div>
                        {lastMsg && (
                          <p className="text-[11px] text-slate-500 truncate pl-3.5 leading-relaxed">{lastMsg.text}</p>
                        )}
                        {timeAgo && (
                          <span className="text-[10px] text-slate-700 pl-3.5">{timeAgo}</span>
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConversationToDelete(conv.id); setShowDeleteModal(true); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 transition-all"
                        title="Delete"
                      >
                        <Icon name="delete" className="text-[12px] text-red-400/60 hover:text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {messages.length === 0 ? (

            /* ── LANDING VIEW ── */
            <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-8 overflow-y-auto custom-scrollbar">

              {/* Mobile: toggle sidebar */}
              <div className="self-stretch flex justify-start mb-8 md:hidden">
                <button
                  onClick={() => setShowConversations((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 rounded-xl border border-slate-700/40 transition-all"
                >
                  <Icon name="history" className="text-[15px]" />
                  <span>History</span>
                  {conversations.length > 0 && (
                    <span className="bg-slate-700 text-slate-400 text-[10px] px-1.5 rounded-full">{conversations.length}</span>
                  )}
                </button>
              </div>

              <div className="max-w-xl w-full flex flex-col items-center">
                {/* App icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-5 flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight text-center">
                  Your AI Investment Partner
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mb-8 text-center leading-relaxed max-w-md">
                  Ask me anything about markets, stocks, crypto&nbsp;or portfolio strategy.
                </p>

                {/* Textarea */}
                <div className="relative w-full">
                  <textarea
                    ref={landingTextareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder=" "
                    className="w-full bg-slate-800/70 border border-slate-600/40 text-white p-4 pr-14 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500/30 text-base shadow-xl backdrop-blur-sm transition-all hover:bg-slate-800/90 min-h-[120px] max-h-[280px] leading-relaxed input-focus"
                    rows={4}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  {!value && (
                    <div className="absolute left-4 top-4 right-16 pointer-events-none text-slate-500 text-base">
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
                    className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
                  >
                    <Icon name="send" className="text-[19px]" />
                  </button>
                </div>

                {/* Suggestion chips */}
                <div className="mt-3 w-full grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {([
                    { icon: 'trending_up',       label: 'Top tech stocks',     prompt: 'What are the top technology stocks to watch?' },
                    { icon: 'currency_bitcoin',  label: 'Crypto summary',      prompt: 'Summarize the latest Bitcoin market drivers.' },
                    { icon: 'pie_chart',         label: 'Portfolio allocation', prompt: 'How should I allocate a $10,000 portfolio for moderate risk?' },
                    { icon: 'compare_arrows',    label: 'Compare tickers',     prompt: 'Compare AAPL and MSFT performance over the last year.' },
                    { icon: 'list',              label: 'Build watchlist',     prompt: 'Generate a watchlist for fintech stocks with strong earnings momentum.' },
                    { icon: 'bar_chart',         label: 'Sector analysis',     prompt: 'Which sectors are outperforming the market this quarter?' },
                  ] as { icon: string; label: string; prompt: string }[]).map(({ icon, label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => setValue(prompt)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/40 hover:border-slate-600/60 text-slate-300 hover:text-white text-xs font-medium transition-all text-left group"
                    >
                      <Icon name={icon} className="text-[15px] text-cyan-400/80 group-hover:text-cyan-400 flex-shrink-0 transition-colors" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          ) : (

            /* ── ACTIVE CHAT VIEW ── */
            <>
              {/* Chat toolbar */}
              <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-700/30 bg-slate-900/30 backdrop-blur-sm flex items-center gap-2.5">
                <button
                  onClick={() => setShowConversations((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all text-xs border border-slate-700/30 hover:border-slate-600/50"
                >
                  <Icon name="menu" className="text-[15px]" />
                  <span className="hidden sm:inline">History</span>
                  {conversations.length > 0 && (
                    <span className="text-slate-500 text-[10px] hidden sm:inline">({conversations.length})</span>
                  )}
                </button>
                <div className="flex-1 min-w-0 px-1">
                  <p className="text-xs text-slate-500 truncate">
                    {conversations.find(c => c.id === currentConversationId)?.title || (currentConversationId ? 'Conversation' : 'New Conversation')}
                  </p>
                </div>
                <button
                  onClick={startNewConversation}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <Icon name="add" className="text-[14px]" />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Messages */}
              <div
                ref={messagesRef}
                className="flex-1 overflow-y-auto px-4 md:px-8 py-5 space-y-4 custom-scrollbar min-h-0"
              >
                {messages.map((m, i) => (
                  <div
                    key={m.id ?? i}
                    className={`flex items-end gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role !== 'user' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0 mb-0.5">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    )}
                    <div className={m.role === 'user' ? CHAT_BUBBLE_USER : CHAT_BUBBLE_ASSISTANT}>
                      {m.role === 'user' ? (
                        m.text
                      ) : m.text ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{m.text}</ReactMarkdown>
                      ) : (
                        <div className="typing-dots"><span /><span /><span /></div>
                      )}
                    </div>
                    {m.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-[10px] shadow-md flex-shrink-0 mb-0.5">
                        U
                      </div>
                    )}
                  </div>
                ))}
                {loading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex items-end gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0 mb-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-slate-800/80 border border-slate-700/40 animate-fade-in">
                      <div className="typing-dots"><span /><span /><span /></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="flex-shrink-0 px-4 md:px-6 py-3.5 border-t border-slate-700/30 bg-slate-900/20">
                <div className="relative max-w-3xl mx-auto">
                  <textarea
                    ref={chatTextareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ask another question…"
                    className={`${TEXTAREA_BASE} min-h-[52px] max-h-[180px] text-sm pr-12`}
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
                    aria-label="Send message"
                    className={`${SEND_BUTTON} absolute right-2.5 bottom-2.5 w-8 h-8`}
                  >
                    {loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Icon name="send" className="text-[14px]" />
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
