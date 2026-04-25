"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "../atoms/Icon";
import { useConversationsCtx } from "@/app/contexts/ConversationsContext";

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  if (diff < 604800000) return Math.floor(diff / 86400000) + "d ago";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ConversationsSidebarInner() {
  const {
    conversations,
    loading,
    error,
    loadConversations,
    deleteConversation,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useConversationsCtx();

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    router.push(`/chat?id=${id}`);
    setMobileSidebarOpen(false);
  };

  const handleNew = () => {
    router.push("/chat");
    setMobileSidebarOpen(false);
  };

  const handleDelete = async () => {
    if (!toDeleteId) return;
    const success = await deleteConversation(toDeleteId);
    if (success && activeId === toDeleteId) {
      router.push("/chat");
    }
    setShowDeleteModal(false);
    setToDeleteId(null);
  };

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30 md:z-auto
          w-64 flex flex-col flex-shrink-0 overflow-hidden h-screen md:h-full
          bg-slate-950 md:bg-slate-900/30
          border-r border-slate-700/30
          transform transition-transform duration-200 ease-in-out
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="forum" className="text-cyan-400 text-[16px]" />
            <span className="text-sm font-semibold text-white tracking-tight">Chats</span>
            {conversations.length > 0 && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-medium">
                {conversations.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-all"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="px-3 py-2.5 border-b border-slate-700/20 flex-shrink-0">
          <button
            onClick={handleNew}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-blue-500/20"
          >
            <Icon name="add" className="text-[16px]" />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-slate-600">
              <div className="w-5 h-5 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : error ? (
            <div className="px-4 py-10 text-center">
              <Icon name="wifi_off" className="text-slate-700 text-[28px] mb-2 mx-auto" />
              <p className="text-xs text-slate-500 mb-2">{error}</p>
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
                const isActive = conv.id === activeId;
                const timeAgo = conv.updatedAt ? formatTimeAgo(new Date(conv.updatedAt)) : "";
                return (
                  <div key={conv.id} className="group">
                    <div
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "bg-cyan-500/10 border border-cyan-500/25 shadow-sm"
                          : "border border-transparent hover:bg-slate-800/50 hover:border-slate-700/30"
                      }`}
                    >
                      <button
                        onClick={() => handleSelect(conv.id)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className={`text-[12px] font-medium leading-snug truncate ${isActive ? "text-white" : "text-slate-300"}`}>
                          {conv.title || "Untitled Conversation"}
                        </p>
                        {timeAgo && (
                          <span className="text-[10px] text-slate-600 block mt-0.5">{timeAgo}</span>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setToDeleteId(conv.id);
                          setShowDeleteModal(true);
                        }}
                        className="flex-shrink-0 p-1 rounded-md text-slate-700 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all duration-150"
                        title="Delete"
                      >
                        <Icon name="delete_outline" className="text-[14px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Icon name="delete_forever" className="text-red-400 text-[20px]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Delete Conversation</h3>
                <p className="text-sm text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => { setShowDeleteModal(false); setToDeleteId(null); }}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-sm font-medium border border-slate-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all text-sm font-semibold shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ConversationsSidebar() {
  return (
    <Suspense fallback={<div className="w-64 flex-shrink-0 bg-slate-900/30 border-r border-slate-700/30 hidden md:block" />}>
      <ConversationsSidebarInner />
    </Suspense>
  );
}
