"use client";

import Link from "next/link";
import Icon from "../ui/Icon";
import GlobalSearch from "../ui/GlobalSearch";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/chat");
    router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    if (sidebarOpen) return;

    const timeout = setTimeout(() => setSidebarVisible(false), 240);
    return () => clearTimeout(timeout);
  }, [sidebarOpen]);

  const handleChatClick = () => {
    setSidebarOpen(false);
    if (pathname === "/chat") {
      router.push("/chat");
    } else {
      router.push("/chat");
    }
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
          className={`fixed inset-0 z-50 backdrop-blur-[1px] transition-all duration-250 ${sidebarOpen ? "bg-black/45 opacity-100" : "bg-black/0 opacity-0"}`}
          onClick={closeSidebar}
        >
          <aside
            className={`fixed left-0 top-0 h-dvh w-72 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl transform-gpu will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto overscroll-contain">
              <div className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-sm p-6 border-b border-white/5 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg">
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

              <nav className="p-6 space-y-2">
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

                <div className="border-t border-white/10 pt-4 mt-4">
                  <button
                    onClick={() => {
                      closeSidebar();
                      handleSignOut();
                    }}
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
    </>
  );
}
