"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ConversationsSidebar from "./ConversationsSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems?: Array<{ label: string; href: string; active?: boolean }>;
}

export default function DashboardLayout({
  children,
  sidebarItems,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const isChat = pathname === "/chat" || pathname.startsWith("/chat?") || pathname.startsWith("/chat/");

  const resolvedItems = sidebarItems ?? [
    {
      label: "Chat",
      href: "/chat",
      active: pathname === "/" || pathname === "/chat" || pathname.startsWith("/chat/"),
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
  ];

  return (
    <div className="flex min-h-screen h-screen">
      <Sidebar items={resolvedItems} />
      <div className="md:hidden">{isChat && <ConversationsSidebar />}</div>
      <div className="flex-1 flex flex-col main-area min-w-0">
        <Header />
        <main className={`flex-1 ${isChat ? "overflow-hidden" : "overflow-y-auto"}`}>{children}</main>
      </div>
    </div>
  );
}
