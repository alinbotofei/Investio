import { useState, useEffect } from "react";
import { Conversation } from "@/lib/types/conversation";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        setError("Failed to load conversations");
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setError("Network error loading conversations");
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      return false;
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return {
    conversations,
    loading,
    error,
    loadConversations,
    deleteConversation,
  };
}
