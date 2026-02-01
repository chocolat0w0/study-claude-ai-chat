import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopyButton } from '@/components/code/CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('コピーボタンが表示される', () => {
      render(<CopyButton text="test" />);

      expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();
    });

    it('初期状態ではコピーアイコンが表示される', () => {
      render(<CopyButton text="test" />);

      expect(screen.getByTestId('ContentCopyIcon')).toBeInTheDocument();
    });
  });

  describe('コピー機能', () => {
    it('コピー成功後にチェックアイコンが表示される', async () => {
      // クリップボードAPIをモック
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      render(<CopyButton text="test" />);
      const button = screen.getByRole('button');

      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
      });

      expect(mockWriteText).toHaveBeenCalledWith('test');
    });

    it('コピー成功後にaria-labelが変更される', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      render(<CopyButton text="test" />);
      const button = screen.getByRole('button');

      button.click();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'コピーしました' })).toBeInTheDocument();
      });
    });
  });
});
