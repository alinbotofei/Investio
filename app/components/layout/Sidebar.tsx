"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../ui/Icon";
import { NavItem } from "../../lib/types";

interface SidebarProps {
  items: NavItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const iconFor = (label: string) => {
    if (label.toLowerCase().includes("dash")) return "dashboard";
    if (label.toLowerCase().includes("chat")) return "chat";
    return "circle";
  };

  return (
    <aside
      className="group w-full h-full bg-transparent flex flex-col transition-all duration-200"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="px-3 py-5 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            I
          </div>
          <div
            className={`transition-all duration-200 overflow-hidden ${
              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            <div className="text-white font-semibold whitespace-nowrap">
              Investio
            </div>
            <div className="text-xs text-white/60 whitespace-nowrap">
              Investment Assistant
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-100 relative group/item overflow-hidden ${
              item.active
                ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-white"
                : "text-white/80 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-cyan-500/10"
            }`}
            title={!isExpanded ? item.label : undefined}
          >
            <Icon
              name={iconFor(item.label)}
              className="text-[20px] text-white/70 flex-shrink-0"
            />
            <span
              className={`text-sm whitespace-nowrap transition-all duration-200 overflow-hidden ${
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
