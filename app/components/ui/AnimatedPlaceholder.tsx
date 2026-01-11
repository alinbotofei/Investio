"use client";

import { useState, useEffect } from "react";

interface AnimatedPlaceholderProps {
  placeholders: string[];
  interval?: number;
  className?: string;
}

export default function AnimatedPlaceholder({
  placeholders,
  interval = 3000,
  className = "",
}: AnimatedPlaceholderProps) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % placeholders.length);
        setIsAnimating(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [placeholders.length, interval]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${
        isAnimating ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
      } ${className}`}
    >
      {placeholders[index]}
    </span>
  );
}
