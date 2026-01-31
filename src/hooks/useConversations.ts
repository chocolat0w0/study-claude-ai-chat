'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Conversation } from '@/types/chat';

interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/chat/history');
      if (!response.ok) {
        throw new Error('会話履歴の取得に失敗しました');
      }
      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/chat/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('会話の削除に失敗しました');
      }
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    }
  }, []);

  // 初回マウント時に会話履歴を取得
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    deleteConversation,
  };
}
