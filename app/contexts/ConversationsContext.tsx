"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Conversation } from "@/lib/types/conversation";

interface ConversationsContextType {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  loadConversations: () => Promise<void>;
  deleteConversation: (id: string) => Promise<boolean>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const hasLoadedOnce = useRef(false);

  const loadConversations = useCallback(async () => {
    if (status !== "authenticated") return;
    if (!hasLoadedOnce.current) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      } else {
        setError("Failed to load");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, [status]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadConversations();
    } else if (status === "unauthenticated") {
      setConversations([]);
      setLoading(false);
    }
  }, [status, loadConversations]);

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        loading,
        error,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        loadConversations,
        deleteConversation,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversationsCtx() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error("useConversationsCtx must be used within ConversationsProvider");
  return ctx;
}
