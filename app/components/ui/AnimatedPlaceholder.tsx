"use client";

import { useState, useEffect } from "react";

interface AnimatedPlaceholderProps {
  placeholders: string[];
  interval?: number;
  className?: string;
}

export default function AnimatedPlaceholder({
  placeholders,
  interval = 3600,
  className = "",
}: AnimatedPlaceholderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, interval);
    return () => clearInterval(timer);
  }, [placeholders.length, interval]);

  return (
    <span
      key={index}
      className={`inline-block placeholder-animated ${className}`}
      style={{ animation: "placeholderFade 3.4s cubic-bezier(0.4, 0, 0.2, 1) forwards" }}
    >
      {placeholders[index]}
    </span>
  );
}
