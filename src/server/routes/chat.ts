import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '@/lib/prisma';
import { codeAssistantAgent } from '@/mastra/agents/codeAssistant';

// Prisma型定義
type Message = {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: Date;
};

type ConversationWithCount = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { messages: number };
};

export const chatRoutes = new Hono();

interface ImageAttachment {
  data: string; // Base64
  mimeType: string;
}

// POST /api/chat - メッセージ送信 (ストリーミング)
chatRoutes.post('/', async (c) => {
  const body = await c.req.json<{
    message: string;
    conversationId?: string;
    images?: ImageAttachment[];
  }>();

  if (!body.message?.trim() && (!body.images || body.images.length === 0)) {
    throw new HTTPException(400, { message: 'Message or images are required' });
  }

  // 会話を取得または作成
  let conversation;
  if (body.conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: body.conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      throw new HTTPException(404, { message: 'Conversation not found' });
    }
  } else {
    // 新規会話作成（タイトルはメッセージの最初の50文字）
    conversation = await prisma.conversation.create({
      data: {
        title: body.message.slice(0, 50) + (body.message.length > 50 ? '...' : ''),
      },
      include: { messages: true },
    });
  }

  // ユーザーメッセージを保存（画像付き）
  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: body.message,
      images: body.images
        ? {
            create: body.images.map((img) => ({
              data: img.data,
              mimeType: img.mimeType,
            })),
          }
        : undefined,
    },
  });

  // 過去のメッセージを取得してコンテキストを構築
  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
    include: { images: true },
  });

  // 会話履歴をコンテキスト文字列として構築
  const conversationContext = messages
    .slice(0, -1) // 最新のユーザーメッセージ以外
    .map((m) => {
      let text = `${m.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${m.content}`;
      if (m.images && m.images.length > 0) {
        text += ` [画像${m.images.length}枚添付]`;
      }
      return text;
    })
    .join('\n\n');

  // 画像がある場合のメッセージ構築
  let currentMessage = body.message;
  if (conversationContext.length > 0) {
    currentMessage = `以下は会話の履歴です:\n\n${conversationContext}\n\n---\n\nユーザーの新しい質問: ${body.message}`;
  }

  // 画像がある場合の注釈を追加
  if (body.images && body.images.length > 0) {
    currentMessage += `\n\n[ユーザーが${body.images.length}枚の画像を添付しました。画像の内容を確認して質問に答えてください。]`;
  }

  // ストリーミングレスポンス
  return stream(c, async (streamWriter) => {
    let fullResponse = '';

    try {
      // Mastra Agent stream API with multimodal support
      // Note: Mastra's Agent.stream() might not directly support vision yet
      // For now, we inform the agent about images in text
      // Future enhancement: Use Anthropic SDK directly for vision support
      const response = await codeAssistantAgent.stream(currentMessage);

      for await (const chunk of response.textStream) {
        fullResponse += chunk;
        await streamWriter.write(chunk);
      }

      // アシスタントの応答を保存
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: fullResponse,
        },
      });

      // 会話IDを最後に送信
      await streamWriter.write(`\n\n[CONVERSATION_ID:${conversation.id}]`);
    } catch (error) {
      console.error('Streaming error:', error);
      await streamWriter.write('\n\n[ERROR: Failed to generate response]');
    }
  });
});

// GET /api/chat/history - 会話履歴一覧取得
chatRoutes.get('/history', async (c) => {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { messages: true },
      },
    },
  });

  return c.json({
    conversations: conversations.map((conv: ConversationWithCount) => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv._count.messages,
    })),
  });
});

// GET /api/chat/:conversationId - 会話詳細取得
chatRoutes.get('/:conversationId', async (c) => {
  const conversationId = c.req.param('conversationId');

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { images: true },
      },
    },
  });

  if (!conversation) {
    throw new HTTPException(404, { message: 'Conversation not found' });
  }

  return c.json({
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      images: m.images?.map((img) => ({
        id: img.id,
        data: img.data,
        mimeType: img.mimeType,
        createdAt: img.createdAt,
      })),
      createdAt: m.createdAt,
    })),
  });
});

// DELETE /api/chat/:conversationId - 会話削除
chatRoutes.delete('/:conversationId', async (c) => {
  const conversationId = c.req.param('conversationId');

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new HTTPException(404, { message: 'Conversation not found' });
  }

  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  return c.json({ deleted: true, id: conversationId });
});
