import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from '@/components/chat/ChatInput';

describe('ChatInput', () => {
  describe('レンダリング', () => {
    it('テキストフィールドとボタンが表示される', () => {
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      expect(
        screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)')
      ).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('loading時にCircularProgressが表示される', () => {
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} loading={true} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('メッセージ入力', () => {
    it('テキストを入力できる', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, 'Hello, World!');

      expect(input).toHaveValue('Hello, World!');
    });

    it('disabled時は入力できない', () => {
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} disabled={true} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      expect(input).toBeDisabled();
    });

    it('loading時は入力できない', () => {
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} loading={true} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      expect(input).toBeDisabled();
    });
  });

  describe('送信ボタン', () => {
    it('メッセージがあるとき送信ボタンが有効になる', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, 'Test message');

      expect(button).not.toBeDisabled();
    });

    it('空白のみのメッセージでは送信ボタンが無効', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, '   ');

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('送信ボタンクリックでonSendMessageが呼ばれる', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, 'Test message');

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('送信後にテキストフィールドがクリアされる', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, 'Test message');
      await user.click(screen.getByRole('button'));

      expect(input).toHaveValue('');
    });

    it('disabled時は送信ボタンが無効', async () => {
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('キーボードショートカット', () => {
    it('Ctrl+Enterでメッセージが送信される', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, 'Test message');

      fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('Cmd+Enterでメッセージが送信される', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, 'Test message');

      fireEvent.keyDown(input, { key: 'Enter', metaKey: true });

      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('Enterのみでは送信されない', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, 'Test message');

      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('トリム処理', () => {
    it('前後の空白がトリムされて送信される', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInput onSendMessage={onSendMessage} />);

      const input = screen.getByPlaceholderText('メッセージを入力... (Cmd/Ctrl + Enter で送信)');
      await user.type(input, '  Hello World  ');
      await user.click(screen.getByRole('button'));

      expect(onSendMessage).toHaveBeenCalledWith('Hello World');
    });
  });
});
