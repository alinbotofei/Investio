"use client";

import { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  placement?: "top" | "bottom";
}

export default function Tooltip({
  content,
  children,
  className = "",
  placement = "top",
}: TooltipProps) {
  const positionClass =
    placement === "bottom"
      ? "top-full mt-2"
      : "bottom-full mb-2";

  return (
    <span className={`relative inline-flex group/tooltip ${className}`}>
      {children}
      <span
        className={`pointer-events-none absolute z-[80] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-cyan-200/20 bg-slate-950/95 px-2.5 py-1.5 text-[11px] font-medium text-slate-100 opacity-0 shadow-xl shadow-cyan-900/25 backdrop-blur-md transition-all duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${positionClass}`}
      >
        {content}
      </span>
    </span>
  );
}
