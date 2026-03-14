"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Icon from "../ui/Icon";
import { NavItem } from "../../lib/types";
import { emitChatReset } from "../../lib/utils/events";
import { useConversationsCtx } from "@/app/contexts/ConversationsContext";

interface SidebarProps {
  items: NavItem[];
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function iconFor(label: string) {
  if (label.toLowerCase().includes("dash")) return "dashboard";
  if (label.toLowerCase().includes("chat")) return "chat";
  return "circle";
}

function SidebarInner({ items }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isChat = pathname === "/chat" || pathname.startsWith("/chat/") || pathname.startsWith("/chat?");
  const activeConvId = searchParams.get("id");
  const { conversations, loading: convsLoading, deleteConversation } = useConversationsCtx();

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 190);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPinned) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPinned]);

  const handleDelete = async () => {
    if (!toDeleteId) return;

    await deleteConversation(toDeleteId);
    if (activeConvId === toDeleteId) {
      router.push("/chat");
    }
    setShowDeleteModal(false);
    setToDeleteId(null);
  };

  return (
    <>
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex flex-col flex-shrink-0 h-full overflow-hidden bg-slate-950 border-r border-slate-800/60 transition-[width] duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width] ${
          isOpen ? "w-72" : "w-14"
        }`}
      >
        <div
          className={`flex items-center py-5 flex-shrink-0 transition-all duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? "px-3 gap-3" : "px-0 justify-center"
          }`}
        >
          <button
            onClick={(event) => {
              event.stopPropagation();
              if (!isOpen) {
                setIsOpen(true);
                setIsPinned(true);
              }
            }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md text-sm"
            title={!isOpen ? "Open and pin sidebar" : undefined}
            aria-label={!isOpen ? "Open and pin sidebar" : "Investio"}
          >
            I
          </button>
          {isOpen && (
            <>
              <div className={`text-left overflow-hidden flex-1 min-w-0 transition-all duration-200 ease-out ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}>
                <div className="text-white font-semibold text-sm whitespace-nowrap">
                  Investio
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  Investment AI
                </div>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  if (isPinned) {
                    setIsPinned(false);
                    setIsOpen(false);
                  } else {
                    setIsPinned(true);
                  }
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isPinned
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/70"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/70"
                }`}
                aria-label={isPinned ? "Close sidebar" : "Keep sidebar open"}

              >
                {isPinned
                  ? <Icon name="first_page" className="text-[20px]" />
                  : <Icon name="keep" className="text-[15px]" />
                }
              </button>
            </>
          )}
        </div>

        <nav className={`py-2 space-y-1 flex-shrink-0 ${isOpen ? "px-2" : "px-1"}`}>
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              onClick={(event) => {
                if (item.href === "/chat" && pathname === "/chat") {
                  event.preventDefault();
                  emitChatReset();
                }
              }}
              className={`flex items-center py-2.5 rounded-xl transition-all duration-200 ease-out ${
                isOpen ? "gap-3 px-3 justify-start" : "justify-center w-10 h-10 mx-auto"
              } ${
                item.active
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon
                name={iconFor(item.label)}
                className={`text-[20px] flex-shrink-0 ${item.active ? "text-cyan-400" : "text-current"}`}
              />
              {isOpen && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ease-out">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {isOpen && isChat ? (
          <>
            <div className="mx-3 border-t border-slate-800/60 my-1 flex-shrink-0" />

            <div className="px-3 py-2 flex-shrink-0">
              <button
                onClick={() => router.push("/chat")}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                <Icon name="add" className="text-[16px]" />
                <span>New Conversation</span>
              </button>
            </div>

            <div className="px-4 py-1 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Icon name="chat_bubble_outline" className="text-slate-500 text-[13px]" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  History
                </span>
              </div>
              {conversations.length > 0 && (
                <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
                  {conversations.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-2 pb-2">
              {convsLoading ? (
                <div className="flex flex-col gap-2 px-1 pt-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-10 bg-slate-800/40 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-600">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {conversations.map((conversation) => {
                    const isActive = conversation.id === activeConvId;
                    const timeAgo = conversation.updatedAt
                      ? formatTimeAgo(new Date(conversation.updatedAt))
                      : "";

                    return (
                      <div
                        key={conversation.id}
                        className={`group flex items-center gap-1.5 px-1.5 py-1.5 rounded-xl transition-colors ${
                          isActive ? "bg-cyan-500/10 border border-cyan-500/20" : "hover:bg-slate-800/35"
                        }`}
                      >
                        <button
                          onClick={() => router.push(`/chat?id=${conversation.id}`)}
                          className="flex-1 min-w-0 text-left px-2 py-2 rounded-lg"
                        >
                          <p
                            className={`text-[12px] font-medium leading-snug truncate ${
                              isActive ? "text-white" : "text-slate-300"
                            }`}
                          >
                            {conversation.title || "New Chat"}
                          </p>
                          {timeAgo && (
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {timeAgo}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setToDeleteId(conversation.id);
                            setShowDeleteModal(true);
                          }}
                          className={`flex-shrink-0 w-7 h-7 rounded-md border inline-flex items-center justify-center leading-none transition-all ${
                            isActive
                              ? "border-red-400/25 text-red-300/85 hover:text-red-200 hover:bg-red-500/12"
                              : "border-slate-700/60 text-slate-500 hover:text-red-300 hover:border-red-400/25 hover:bg-red-500/10"
                          }`}
                          title="Delete"
                        >
                          <Icon name="delete_outline" className="text-[14px]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
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
                onClick={() => {
                  setShowDeleteModal(false);
                  setToDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium border border-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors"
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

export default function Sidebar({ items }: SidebarProps) {
  return (
    <Suspense
      fallback={
        <aside className="hidden md:flex w-14 flex-shrink-0 bg-slate-950 border-r border-slate-800/60 flex-col items-center pt-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            I
          </div>
        </aside>
      }
    >
      <SidebarInner items={items} />
    </Suspense>
  );
}
