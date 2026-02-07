'use client';

import { useState, useCallback } from 'react';
import type { Message, ConversationDetail, MessageImage } from '@/types/chat';

interface ImageAttachment {
  data: string; // Base64
  mimeType: string;
}

interface UseChatOptions {
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, images?: ImageAttachment[]) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId, onConversationCreated } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    conversationId ?? null
  );

  const loadConversation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/chat/${id}`);
      if (!response.ok) {
        throw new Error('会話の読み込みに失敗しました');
      }
      const data: ConversationDetail = await response.json();
      setMessages(data.messages);
      setCurrentConversationId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, images?: ImageAttachment[]) => {
      try {
        setIsLoading(true);
        setError(null);

        // ユーザーメッセージを即座に表示
        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          role: 'user',
          content,
          images: images?.map((img, index) => ({
            id: `temp-img-${Date.now()}-${index}`,
            data: img.data,
            mimeType: img.mimeType,
            createdAt: new Date().toISOString(),
          })),
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // アシスタントメッセージのプレースホルダーを追加
        const assistantMessageId = `temp-assistant-${Date.now()}`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // ストリーミングリクエスト
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            conversationId: currentConversationId,
            images: images,
          }),
        });

        if (!response.ok) {
          throw new Error('メッセージの送信に失敗しました');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ストリームの読み取りに失敗しました');
        }

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          // CONVERSATION_IDを抽出
          const conversationIdMatch = fullContent.match(/\[CONVERSATION_ID:([^\]]+)\]/);
          const displayContent = fullContent.replace(/\n\n\[CONVERSATION_ID:[^\]]+\]$/, '');

          // アシスタントメッセージを更新
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: displayContent } : msg
            )
          );

          // 新しい会話IDを検出したら通知
          if (conversationIdMatch && !currentConversationId) {
            const newConversationId = conversationIdMatch[1];
            setCurrentConversationId(newConversationId);
            onConversationCreated?.(newConversationId);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        // エラー時はアシスタントメッセージを削除
        setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-assistant-')));
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, onConversationCreated]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    clearMessages,
  };
}
