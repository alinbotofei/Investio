"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems?: Array<{ label: string; href: string; active?: boolean }>;
}

export default function DashboardLayout({
  children,
  sidebarItems = [
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "Chat", href: "/chat" },
  ],
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen h-screen">
      <aside className="w-16 md:hover:w-64 header hidden md:block sticky top-0 h-screen overflow-y-auto transition-all duration-300 flex-shrink-0">
        <Sidebar items={sidebarItems} />
      </aside>
      <div className="flex-1 flex flex-col main-area min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
