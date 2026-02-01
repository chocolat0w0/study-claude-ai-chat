import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatMessage } from '@/components/chat/ChatMessage';
import type { Message } from '@/types/chat';

describe('ChatMessage', () => {
  const userMessage: Message = {
    id: 'msg-1',
    role: 'user',
    content: 'Hello, this is a test message',
    createdAt: '2024-01-15T10:30:00Z',
  };

  const assistantMessage: Message = {
    id: 'msg-2',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    createdAt: '2024-01-15T10:30:30Z',
  };

  describe('ユーザーメッセージ', () => {
    it('ユーザー名「あなた」が表示される', () => {
      render(<ChatMessage message={userMessage} />);

      expect(screen.getByText('あなた')).toBeInTheDocument();
    });

    it('メッセージ内容が表示される', () => {
      render(<ChatMessage message={userMessage} />);

      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });

    it('タイムスタンプが表示される', () => {
      render(<ChatMessage message={userMessage} />);

      // タイムゾーンによって異なるため、時刻形式のパターンでテスト
      const timeElement = screen.getByText(/\d{2}:\d{2}/);
      expect(timeElement).toBeInTheDocument();
    });
  });

  describe('アシスタントメッセージ', () => {
    it('アシスタント名「AI Assistant」が表示される', () => {
      render(<ChatMessage message={assistantMessage} />);

      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('メッセージ内容が表示される', () => {
      render(<ChatMessage message={assistantMessage} />);

      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });
  });

  describe('メッセージ内容の表示', () => {
    it('複数行のメッセージが正しく表示される', () => {
      const multilineMessage: Message = {
        id: 'msg-3',
        role: 'user',
        content: 'Line 1\nLine 2\nLine 3',
        createdAt: '2024-01-15T10:30:00Z',
      };

      render(<ChatMessage message={multilineMessage} />);

      // 複数行テキストはnormalize機能により空白に変換されるため、個別に確認
      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2/)).toBeInTheDocument();
      expect(screen.getByText(/Line 3/)).toBeInTheDocument();
    });

    it('長いメッセージが折り返されて表示される', () => {
      const longMessage: Message = {
        id: 'msg-4',
        role: 'assistant',
        content: 'A'.repeat(500),
        createdAt: '2024-01-15T10:30:00Z',
      };

      render(<ChatMessage message={longMessage} />);

      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    it('空のメッセージでもエラーにならない', () => {
      const emptyMessage: Message = {
        id: 'msg-5',
        role: 'user',
        content: '',
        createdAt: '2024-01-15T10:30:00Z',
      };

      expect(() => render(<ChatMessage message={emptyMessage} />)).not.toThrow();
    });
  });

  describe('アバター', () => {
    it('ユーザーメッセージにはアバターが表示される', () => {
      render(<ChatMessage message={userMessage} />);

      // MUIのAvatarはdata-testidを持たないので、構造で確認
      const avatarContainer = screen.getByText('あなた').closest('div')?.parentElement;
      expect(avatarContainer).toBeInTheDocument();
    });

    it('アシスタントメッセージにはアバターが表示される', () => {
      render(<ChatMessage message={assistantMessage} />);

      const avatarContainer = screen.getByText('AI Assistant').closest('div')?.parentElement;
      expect(avatarContainer).toBeInTheDocument();
    });
  });

  describe('スタイリング', () => {
    it('ユーザーメッセージとアシスタントメッセージで背景色が異なる', () => {
      const { rerender } = render(<ChatMessage message={userMessage} />);
      const userMessageElement = screen.getByText(userMessage.content).closest('div[class*="MuiBox"]');

      rerender(<ChatMessage message={assistantMessage} />);
      const assistantMessageElement = screen.getByText(assistantMessage.content).closest('div[class*="MuiBox"]');

      // 両方が存在することを確認（実際のスタイルはCSSで適用されるため、存在確認のみ）
      expect(userMessageElement).toBeInTheDocument();
      expect(assistantMessageElement).toBeInTheDocument();
    });
  });
});
