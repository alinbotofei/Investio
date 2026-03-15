"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import { WatchlistManager } from "@/app/components/dashboard";
import MarketOverview from "./_components/MarketOverview";
import MarketNews from "./_components/MarketNews";
import Icon from "@/app/components/ui/Icon";
import AnimatedPlaceholder from "@/app/components/ui/AnimatedPlaceholder";
import { SEND_BUTTON } from "@/app/lib/constants";

function DashboardContent() {
  const router = useRouter();
  const [chatInput, setChatInput] = useState("");
  const [lastUpdated, setLastUpdated] = useState("--:--:--");

  useEffect(() => {
    const updateClock = () => setLastUpdated(new Date().toLocaleTimeString());
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const placeholders = [
    "What are the top performing stocks today?",
    "Compare Bitcoin vs Ethereum performance",
    "Analyze crypto market sentiment",
    "Should I invest in tech stocks?",
    "What's moving the market today?",
  ];

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      router.push(`/chat?context=${encodeURIComponent(chatInput)}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full h-full p-3 sm:p-4 md:p-5 lg:p-6 overflow-y-auto">
        <div className="mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                Investment Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Real-time market insights powered by AI
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-xs text-left text-slate-300 font-medium">
                  {lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr,1fr] gap-4 sm:gap-5 lg:gap-6 items-start">
          <div className="min-w-0 space-y-4 sm:space-y-5">
            <WatchlistManager />

            <MarketOverview />
          </div>

          <div className="min-w-0 xl:sticky xl:top-4 space-y-4 sm:space-y-5">
            <div className="bg-gradient-to-br from-blue-600/30 via-cyan-500/30 to-purple-600/30 border-2 border-cyan-400/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-400/20">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Icon
                    name="psychology"
                    className="text-white text-[18px] sm:text-[22px]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    AI Assistant
                  </h2>
                  <p className="text-xs text-cyan-200 truncate">
                    Ask anything about markets
                  </p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder=" "
                  className="w-full p-3 pr-11 sm:p-3.5 sm:pr-12 border border-cyan-500/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-900/60 backdrop-blur text-white transition-all text-sm sm:text-base peer"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                />
                {!chatInput && (
                  <div className="absolute left-3 sm:left-3.5 top-3 sm:top-3.5 right-14 pointer-events-none text-slate-400 text-sm sm:text-base leading-relaxed">
                    <AnimatedPlaceholder
                      placeholders={placeholders}
                      interval={3500}
                    />
                  </div>
                )}
                <button
                  onClick={handleChatSubmit}
                  className={`${SEND_BUTTON} w-8 h-8 sm:w-9 sm:h-9 absolute right-2.5 top-1/2 -translate-y-1/2 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={!chatInput.trim()}
                >
                  <Icon name="send" className="text-[14px] sm:text-[15px]" />
                </button>
              </div>
            </div>

            <MarketNews />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
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
      <DashboardContent />
    </Suspense>
  );
}
