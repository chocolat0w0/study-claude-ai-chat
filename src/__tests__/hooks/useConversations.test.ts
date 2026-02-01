import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConversations } from '@/hooks/useConversations';

// fetchをモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockConversations = [
  {
    id: 'conv-1',
    title: 'First conversation',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    messageCount: 5,
  },
  {
    id: 'conv-2',
    title: 'Second conversation',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    messageCount: 3,
  },
];

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期読み込み', () => {
    it('マウント時に会話履歴を自動取得する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      });

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.conversations).toEqual(mockConversations);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/chat/history');
    });

    it('取得失敗時にエラーを設定する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.error).toBe('会話履歴の取得に失敗しました');
      });

      expect(result.current.conversations).toEqual([]);
    });

    it('読み込み中はisLoadingがtrueになる', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: async () => ({ conversations: [] }),
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('fetchConversations', () => {
    it('手動で会話履歴を再取得できる', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ conversations: mockConversations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            conversations: [...mockConversations, { id: 'conv-3', title: 'New', messageCount: 1 }],
          }),
        });

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });

      await act(async () => {
        await result.current.fetchConversations();
      });

      expect(result.current.conversations).toHaveLength(3);
    });
  });

  describe('deleteConversation', () => {
    it('会話を正常に削除できる', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ conversations: mockConversations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ deleted: true }),
        });

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteConversation('conv-1');
      });

      expect(result.current.conversations).toHaveLength(1);
      expect(result.current.conversations[0].id).toBe('conv-2');
      expect(mockFetch).toHaveBeenCalledWith('/api/chat/conv-1', { method: 'DELETE' });
    });

    it('削除失敗時にエラーを設定する', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ conversations: mockConversations }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteConversation('conv-1');
      });

      expect(result.current.error).toBe('会話の削除に失敗しました');
      // 削除失敗時は会話リストは変更されない
      expect(result.current.conversations).toHaveLength(2);
    });

    it('存在しないIDを削除しようとしても会話リストは変わらない', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ conversations: mockConversations }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ deleted: true }),
        });

      const { result } = renderHook(() => useConversations());

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteConversation('non-existent');
      });

      expect(result.current.conversations).toHaveLength(2);
    });
  });
});
