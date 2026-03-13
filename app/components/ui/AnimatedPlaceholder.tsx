"use client";

import { useState, useEffect, useRef } from "react";

interface AnimatedPlaceholderProps {
  placeholders: string[];
  /** Legacy prop — treated as pauseAfterTyping when pauseAfterTyping is not set */
  interval?: number;
  /** ms per character while typing (default: 52) */
  typingSpeed?: number;
  /** ms per character while deleting (default: 26) */
  deletingSpeed?: number;
  /** ms to pause after the phrase is fully typed (default: 2000) */
  pauseAfterTyping?: number;
  /** ms gap before typing the next phrase (default: 320) */
  pauseAfterDeleting?: number;
  className?: string;
}

export default function AnimatedPlaceholder({
  placeholders,
  interval = 2000,
  typingSpeed = 52,
  deletingSpeed = 26,
  pauseAfterTyping,
  pauseAfterDeleting = 320,
  className = "",
}: AnimatedPlaceholderProps) {
  const pause = pauseAfterTyping ?? interval;

  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentPhrase = placeholders[phraseIndex] ?? "";

    const schedule = (fn: () => void, delay: number) => {
      timerRef.current = setTimeout(fn, delay);
    };

    if (phase === "typing") {
      if (displayText.length < currentPhrase.length) {
        schedule(
          () => setDisplayText(currentPhrase.slice(0, displayText.length + 1)),
          typingSpeed
        );
      } else {
        schedule(() => setPhase("pausing"), pause);
      }
    } else if (phase === "pausing") {
      setPhase("deleting");
    } else if (phase === "deleting") {
      if (displayText.length > 0) {
        schedule(() => setDisplayText((prev) => prev.slice(0, -1)), deletingSpeed);
      } else {
        schedule(() => {
          setPhraseIndex((prev) => (prev + 1) % placeholders.length);
          setPhase("typing");
        }, pauseAfterDeleting);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayText, phase, phraseIndex, placeholders, typingSpeed, deletingSpeed, pause, pauseAfterDeleting]);

  return (
    <span className={`inline-block ${className}`}>
      {displayText}
      <span className="typewriter-cursor select-none" aria-hidden="true">|</span>
    </span>
  );
}
