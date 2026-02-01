import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChat } from '@/hooks/useChat';

// fetchをモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態では空のメッセージ配列を返す', () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('loadConversation', () => {
    it('会話を正常に読み込める', async () => {
      const mockConversation = {
        id: 'conv-1',
        title: 'Test Conversation',
        messages: [
          { id: 'msg-1', role: 'user', content: 'Hello', createdAt: '2024-01-01T00:00:00Z' },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Hi there!',
            createdAt: '2024-01-01T00:00:01Z',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversation,
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.loadConversation('conv-1');
      });

      expect(result.current.messages).toEqual(mockConversation.messages);
      expect(result.current.isLoading).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith('/api/chat/conv-1');
    });

    it('読み込み失敗時にエラーを設定する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.loadConversation('invalid-id');
      });

      expect(result.current.error).toBe('会話の読み込みに失敗しました');
      expect(result.current.isLoading).toBe(false);
    });

    it('読み込み中はisLoadingがtrueになる', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.loadConversation('conv-1');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ messages: [] }),
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('sendMessage', () => {
    it('メッセージ送信時にユーザーメッセージが即座に追加される', async () => {
      // ストリーミングレスポンスをモック
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('Hello!'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('\n\n[CONVERSATION_ID:new-conv-1]'),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      const onConversationCreated = vi.fn();
      const { result } = renderHook(() => useChat({ onConversationCreated }));

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      // ユーザーメッセージが追加されている
      expect(result.current.messages.some((m) => m.role === 'user' && m.content === 'Test message'))
        .toBe(true);
      // アシスタントメッセージも追加されている
      expect(result.current.messages.some((m) => m.role === 'assistant')).toBe(true);
    });

    it('送信失敗時にエラーを設定しアシスタントメッセージを削除する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      expect(result.current.error).toBe('メッセージの送信に失敗しました');
      // アシスタントメッセージは削除されている
      expect(result.current.messages.filter((m) => m.id.startsWith('temp-assistant-'))).toHaveLength(
        0
      );
    });

    it('新しい会話IDが検出されたらコールバックが呼ばれる', async () => {
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('Response\n\n[CONVERSATION_ID:new-conv-123]'),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      const onConversationCreated = vi.fn();
      const { result } = renderHook(() => useChat({ onConversationCreated }));

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(onConversationCreated).toHaveBeenCalledWith('new-conv-123');
    });
  });

  describe('clearMessages', () => {
    it('メッセージとエラーをクリアする', async () => {
      const mockConversation = {
        messages: [{ id: 'msg-1', role: 'user', content: 'Hello', createdAt: '2024-01-01T00:00:00Z' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversation,
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.loadConversation('conv-1');
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });
});
