"use client";

import Link from "next/link";
import Icon from "../atoms/Icon";
import GlobalSearch from "../molecules/GlobalSearch";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useConversationsCtx } from "@/app/contexts/ConversationsContext";
import { formatTimeAgo } from "@/app/lib/utils/format";

export default function Header() {
  return (
    <Suspense fallback={
      <header className="w-full shadow-sm sticky top-0 z-20 bg-[radial-gradient(130%_170%_at_12%_0%,rgba(59,130,246,0.16)_0%,rgba(59,130,246,0)_46%),linear-gradient(112deg,#0b1220_0%,#11253a_34%,#205983_100%)]" style={{ boxShadow: "0 16px 30px -20px rgba(14,165,233,0.26)" }}>
        <div className="h-12" />
      </header>
    }>
      <HeaderInner />
    </Suspense>
  );
}

function HeaderInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeConvId = searchParams.get("id");
  const { conversations, loading: convsLoading, deleteConversation } = useConversationsCtx();

  useEffect(() => {
    router.prefetch("/chat");
    router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    if (sidebarOpen) return;

    const timeout = setTimeout(() => setSidebarVisible(false), 150);
    return () => clearTimeout(timeout);
  }, [sidebarOpen]);

  const handleChatClick = () => {
    setSidebarOpen(false);
    router.push("/chat");
  };

  const handleSelectConversation = (id: string) => {
    setSidebarOpen(false);
    router.push(`/chat?id=${id}`);
  };

  const handleDeleteConversation = async () => {
    if (!toDeleteId) return;
    await deleteConversation(toDeleteId);
    if (activeConvId === toDeleteId) router.push("/chat");
    setShowDeleteModal(false);
    setToDeleteId(null);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const openSidebar = () => {
    setSidebarVisible(true);
    requestAnimationFrame(() => setSidebarOpen(true));
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <header
        className="w-full shadow-sm sticky top-0 z-20 bg-[radial-gradient(130%_170%_at_12%_0%,rgba(59,130,246,0.16)_0%,rgba(59,130,246,0)_46%),radial-gradient(100%_130%_at_100%_0%,rgba(56,189,248,0.09)_0%,rgba(56,189,248,0)_42%),linear-gradient(112deg,#0b1220_0%,#11253a_34%,#173954_66%,#205983_100%)]"
        style={{
          boxShadow: "0 16px 30px -20px rgba(14,165,233,0.26)",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 md:px-6 md:py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all shadow-sm flex-shrink-0"
              aria-label="Open sidebar"
              onClick={openSidebar}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="5" cy="6" r="1.5" fill="white" />
                <circle cx="12" cy="6" r="1.5" fill="white" />
                <circle cx="19" cy="6" r="1.5" fill="white" />
                <circle cx="5" cy="12" r="1.5" fill="white" />
                <circle cx="12" cy="12" r="1.5" fill="white" />
                <circle cx="19" cy="12" r="1.5" fill="white" />
                <circle cx="5" cy="18" r="1.5" fill="white" />
                <circle cx="12" cy="18" r="1.5" fill="white" />
                <circle cx="19" cy="18" r="1.5" fill="white" />
              </svg>
            </button>

            <div className="flex-1 min-w-0 md:max-w-[18rem] lg:max-w-[21rem]">
              <GlobalSearch />
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="hidden md:inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 font-semibold text-sm shadow-[0_10px_22px_rgba(2,8,23,0.34)]"
          >
            <Icon name="logout" className="text-[16px] text-white/90" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {sidebarVisible && (
        <div
          className={`fixed inset-0 z-50 backdrop-blur-[1px] transition-all duration-150 ${sidebarOpen ? "bg-black/45 opacity-100" : "bg-black/0 opacity-0"}`}
          onClick={closeSidebar}
        >
          <aside
            className={`fixed left-0 top-0 h-dvh w-72 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl transform-gpu will-change-transform transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto overscroll-contain">
              <div className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-sm p-6 border-b border-white/5 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Icon name="insights" />
                    </div>
                    <div className="text-base font-extrabold text-white tracking-wide font-['Plus Jakarta Sans','Inter','system-ui','sans-serif']">
                      Investio
                    </div>
                  </div>
                  <button
                    className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                    aria-label="Close sidebar"
                    onClick={closeSidebar}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="mt-4">
                  <GlobalSearch />
                </div>
              </div>

              <nav className="p-4 space-y-2">
                <Link
                  href="/dashboard"
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 text-white rounded-lg transition ${
                    pathname === "/" || pathname === "/dashboard"
                      ? "bg-white/10"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Icon name="dashboard" />
                  <span className="font-semibold">Dashboard</span>
                </Link>
                <button
                  onClick={handleChatClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg transition ${
                    pathname === "/chat"
                      ? "bg-white/10"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Icon name="chat" />
                  <span className="font-semibold">Chat</span>
                </button>

                <div className="pt-2">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="chat_bubble_outline" className="text-slate-400 text-[14px]" />
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recent Chats</span>
                    </div>
                    <button
                      onClick={handleChatClick}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[11px] font-semibold transition-all"
                    >
                      <Icon name="add" className="text-[13px]" />
                      New
                    </button>
                  </div>
                  <div className="space-y-0.5 max-h-[45vh] overflow-y-auto">
                    {convsLoading ? (
                      <div className="flex flex-col gap-2 px-1 pt-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : conversations.length === 0 ? (
                      <p className="text-xs text-slate-500 px-2 py-3">No conversations yet</p>
                    ) : (
                      conversations.map((conv) => {
                        const isActive = conv.id === activeConvId;
                        const timeAgo = conv.updatedAt ? formatTimeAgo(new Date(conv.updatedAt)) : "";
                        return (
                          <div key={conv.id} className="group flex items-center gap-1">
                            <button
                              onClick={() => handleSelectConversation(conv.id)}
                              className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-lg transition-colors ${
                                isActive ? "bg-blue-500/15 border border-blue-500/25" : "hover:bg-white/8"
                              }`}
                            >
                              <p className={`text-[12px] font-medium truncate ${
                                isActive ? "text-white" : "text-slate-300"
                              }`}>
                                {conv.title || "New Chat"}
                              </p>
                              {timeAgo && (
                                <span className="text-[10px] text-slate-500 block mt-0.5">{timeAgo}</span>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setToDeleteId(conv.id);
                                setShowDeleteModal(true);
                              }}
                              className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Icon name="delete_outline" className="text-[14px]" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-2">
                  <button
                    onClick={() => { closeSidebar(); handleSignOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all shadow-[0_10px_24px_rgba(2,8,23,0.34)]"
                  >
                    <Icon name="logout" />
                    <span className="font-semibold">Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>
        </div>
      )}

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
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium border border-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
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

