import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { chatRoutes } from '@/server/routes/chat';

// Prismaをモック
vi.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// Mastraエージェントをモック
vi.mock('@/mastra/agents/codeAssistant', () => ({
  codeAssistantAgent: {
    stream: vi.fn(),
  },
}));

import { prisma } from '@/lib/prisma';
import { codeAssistantAgent } from '@/mastra/agents/codeAssistant';

describe('Chat API Routes', () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route('/chat', chatRoutes);
  });

  describe('GET /chat/history', () => {
    it('会話履歴一覧を取得できる', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          title: 'Test Conversation',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          _count: { messages: 5 },
        },
      ];

      vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce(mockConversations);

      const res = await app.request('/chat/history');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.conversations).toHaveLength(1);
      expect(data.conversations[0].id).toBe('conv-1');
      expect(data.conversations[0].messageCount).toBe(5);
    });

    it('会話がない場合は空配列を返す', async () => {
      vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([]);

      const res = await app.request('/chat/history');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.conversations).toEqual([]);
    });
  });

  describe('GET /chat/:conversationId', () => {
    it('会話詳細を取得できる', async () => {
      const mockConversation = {
        id: 'conv-1',
        title: 'Test Conversation',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Hi there!',
            createdAt: new Date('2024-01-01'),
          },
        ],
      };

      vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(mockConversation);

      const res = await app.request('/chat/conv-1');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe('conv-1');
      expect(data.messages).toHaveLength(2);
    });

    it('存在しない会話IDの場合は404を返す', async () => {
      vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(null);

      const res = await app.request('/chat/non-existent');

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /chat/:conversationId', () => {
    it('会話を削除できる', async () => {
      const mockConversation = {
        id: 'conv-1',
        title: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(mockConversation);
      vi.mocked(prisma.conversation.delete).mockResolvedValueOnce(mockConversation);

      const res = await app.request('/chat/conv-1', {
        method: 'DELETE',
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.deleted).toBe(true);
      expect(data.id).toBe('conv-1');
    });

    it('存在しない会話を削除しようとすると404を返す', async () => {
      vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(null);

      const res = await app.request('/chat/non-existent', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /chat', () => {
    it('空のメッセージでは400を返す', async () => {
      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      });

      expect(res.status).toBe(400);
    });

    it('空白のみのメッセージでは400を返す', async () => {
      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '   ' }),
      });

      expect(res.status).toBe(400);
    });

    it('存在しないconversationIdを指定すると404を返す', async () => {
      vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(null);

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello',
          conversationId: 'non-existent',
        }),
      });

      expect(res.status).toBe(404);
    });

    it('新規会話を作成してメッセージを送信できる', async () => {
      const mockConversation = {
        id: 'new-conv-1',
        title: 'Hello',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      vi.mocked(prisma.conversation.create).mockResolvedValueOnce(mockConversation);
      vi.mocked(prisma.message.create).mockResolvedValue({
        id: 'msg-1',
        conversationId: 'new-conv-1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date(),
      });
      vi.mocked(prisma.message.findMany).mockResolvedValueOnce([
        {
          id: 'msg-1',
          conversationId: 'new-conv-1',
          role: 'user',
          content: 'Hello',
          createdAt: new Date(),
        },
      ]);

      // ストリーミングレスポンスをモック
      const mockTextStream = (async function* () {
        yield 'Hello! ';
        yield 'How can I help you?';
      })();

      vi.mocked(codeAssistantAgent.stream).mockResolvedValueOnce({
        textStream: mockTextStream,
      } as never);

      const res = await app.request('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });

      expect(res.status).toBe(200);
      expect(prisma.conversation.create).toHaveBeenCalled();
    });
  });
});
