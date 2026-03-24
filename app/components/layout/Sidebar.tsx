"use client";

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Icon from "../ui/Icon";
import { NavItem } from "../../lib/types";
import { emitChatReset } from "../../lib/utils/events";
import { useConversationsCtx } from "@/app/contexts/ConversationsContext";
import { formatTimeAgo } from "@/app/lib/utils/format";


interface SidebarProps {
  items: NavItem[];
}

function iconFor(label: string) {
  if (label.toLowerCase().includes("dash")) return "dashboard";
  if (label.toLowerCase().includes("chat")) return "chat";
  return "circle";
}

const SIDEBAR_STORAGE_KEY = "sidebar_open";

function SidebarInner({ items }: SidebarProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useState<boolean>(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeConvId = searchParams.get("id");
  const { conversations, loading: convsLoading, deleteConversation } = useConversationsCtx();
  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;


  useIsomorphicLayoutEffect(() => {
    try {
      const v = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      const pinned = v === null ? true : v === "true";
      setIsPinned(pinned);
      setIsOpen(pinned);
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 160);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isPinned;
    setIsPinned(next);
    if (!next) {
      closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 160);
    }
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch {}
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setIsOpen(true);
      setIsPinned(true);
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, "true"); } catch {}
    }
  };

  const handleDelete = async () => {
    if (!toDeleteId) return;
    await deleteConversation(toDeleteId);
    if (activeConvId === toDeleteId) router.push("/chat");
    setShowDeleteModal(false);
    setToDeleteId(null);
  };

  const fadeStyle: React.CSSProperties = {
    opacity: isOpen ? 1 : 0,
    transition: isOpen ? "opacity 180ms ease 80ms" : "opacity 80ms ease 0ms",
  };

  const labelStyle: React.CSSProperties = {
    opacity: isOpen ? 1 : 0,
    maxWidth: isOpen ? "200px" : "0px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    transition: isOpen
      ? "opacity 180ms ease 60ms, max-width 220ms cubic-bezier(0.4,0,0.2,1)"
      : "opacity 60ms ease 0ms, max-width 150ms cubic-bezier(0.4,0,1,1)",
  };

  return (
    <>
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex flex-col flex-shrink-0 h-full overflow-hidden border-r border-white/[0.055] bg-[#080d14] ${
          isOpen ? "w-64" : "w-14"
        }`}
        style={{ transition: isOpen ? "width 220ms cubic-bezier(0.4,0,0.2,1)" : "width 150ms cubic-bezier(0.4,0,1,1)" }}
      >
        <div className="flex items-center h-12 px-3 flex-shrink-0 border-b border-white/[0.05]">
          <button
            onClick={handleLogoClick}
            className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-[13px] shadow-[0_4px_12px_rgba(59,130,246,0.28)] hover:shadow-[0_4px_18px_rgba(59,130,246,0.44)] transition-shadow"
            aria-label="Investio"
          >
            I
          </button>

          <span
            className="flex-1 mx-2.5 text-white font-semibold text-[14px]"
            style={labelStyle}
          >
            Investio
          </span>

          <button
            onClick={handlePin}
            className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors duration-200 ${
              isPinned
                ? "text-slate-600 hover:text-slate-300 hover:bg-white/[0.06]"
                : "text-blue-400/60 hover:text-blue-300"
            }`}
            style={{
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              transition: isOpen ? "opacity 180ms ease 80ms" : "opacity 80ms ease 0ms",
            }}
          >
            {isPinned ? (
              <Icon name="chevron_left" className="text-[20px]" />
            ) : (
              <Icon name="push_pin" className="text-[14px]" />
            )}
          </button>
        </div>

        <nav className="px-2 pt-3 space-y-1 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); router.push("/chat"); }}
            className={`flex items-center rounded-xl text-[13px] font-semibold transition-all duration-150 ease-out border border-blue-500/30 bg-blue-500/[0.08] text-blue-300 hover:bg-blue-500/[0.15] hover:text-blue-200 hover:border-blue-400/40 active:scale-[0.97] ${
              isOpen
                ? "w-full gap-2.5 px-3 py-2"
                : "w-9 h-9 mx-auto justify-center"
            }`}
          >
            <Icon name="add" className="text-[17px] flex-shrink-0" />
            <span style={labelStyle}>New Chat</span>
          </button>

          <div className="h-1.5" />

          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch
              onClick={(e) => {
                e.stopPropagation();
                if (item.href === "/chat" && pathname === "/chat") {
                  e.preventDefault();
                  emitChatReset();
                }
              }}
              className={`flex items-center rounded-xl text-[13px] font-medium transition-all duration-150 ease-out ${
                item.active
                  ? "bg-white/[0.09] text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
              } ${
                isOpen
                  ? "w-full gap-2.5 px-3 py-2"
                  : "w-9 h-9 mx-auto justify-center"
              }`}
            >
              <Icon
                name={iconFor(item.label)}
                className={`text-[18px] flex-shrink-0 ${item.active ? "text-blue-400" : ""}`}
              />
              <span style={labelStyle}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div
          className="mx-3 my-4 border-t border-white/[0.04] flex-shrink-0"
          style={fadeStyle}
        />

        <div
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
            transition: isOpen ? "opacity 100ms ease 80ms" : "opacity 50ms ease 0ms",
          }}
        >
          <div className="px-4 mb-2 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
              Recents
            </span>
            {!convsLoading && conversations.length > 0 && (
              <span className="text-[10px] text-slate-600 font-mono tabular-nums">
                {conversations.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-2 pb-3">
            {convsLoading ? (
              <div className="flex flex-col gap-0.5 px-2 pt-1">
                {[68, 82, 55, 74, 48].map((w, i) => (
                  <div key={i} className="flex items-center py-2.5">
                    <div
                      className="h-2.5 bg-white/[0.05] rounded-full animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${i * 90}ms` }}
                    />
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 px-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  <Icon name="chat_bubble_outline" className="text-slate-700 text-[17px]" />
                </div>
                <p className="text-[11.5px] text-slate-600 text-center leading-relaxed">
                  No conversations yet.
                  <br />
                  <button
                    onClick={() => router.push("/chat")}
                    className="text-blue-500/70 hover:text-blue-400 underline underline-offset-2 transition-colors mt-0.5 inline-block"
                  >
                    Start one now
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const timeAgo = conv.updatedAt ? formatTimeAgo(new Date(conv.updatedAt)) : "";
                  return (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center rounded-xl transition-all duration-150 ease-out ${
                        isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
                      }`}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/chat?id=${conv.id}`); }}
                        className="flex-1 min-w-0 text-left px-3 py-2.5"
                      >
                        <p className={`text-[12.5px] font-medium truncate leading-snug transition-colors ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        }`}>
                          {conv.title || "New Chat"}
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
                        className="flex-shrink-0 w-6 h-6 mx-1.5 rounded flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/[0.12] opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out"
                        title="Delete"
                      >
                        <Icon name="delete_outline" className="text-[13px]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
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
                onClick={(e) => { e.stopPropagation(); setShowDeleteModal(false); setToDeleteId(null); }}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium border border-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
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
        <aside className="hidden md:flex w-14 flex-shrink-0 bg-[#080d14] border-r border-white/[0.055] flex-col items-center py-4">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-[13px] shadow-[0_4px_14px_rgba(59,130,246,0.30)]">
            I
          </div>
        </aside>
      }
    >
      <SidebarInner items={items} />
    </Suspense>
  );
}
