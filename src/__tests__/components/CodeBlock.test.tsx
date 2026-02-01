import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CodeBlock } from '@/components/code/CodeBlock';

describe('CodeBlock', () => {
  beforeEach(() => {
    // クリップボードAPIをモック
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  describe('レンダリング', () => {
    it('コードが表示される', () => {
      render(<CodeBlock code="const x = 1;" language="javascript" />);

      expect(screen.getByText(/const/)).toBeInTheDocument();
    });

    it('言語ラベルが表示される', () => {
      render(<CodeBlock code="print('hello')" language="python" />);

      expect(screen.getByText('python')).toBeInTheDocument();
    });

    it('デフォルト言語はtext', () => {
      render(<CodeBlock code="plain text" />);

      expect(screen.getByText('text')).toBeInTheDocument();
    });

    it('コピーボタンが表示される', () => {
      render(<CodeBlock code="test" language="javascript" />);

      expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();
    });
  });

  describe('コード表示', () => {
    it('複数行のコードが表示される', () => {
      const code = `function hello() {
  console.log('Hello');
}`;
      render(<CodeBlock code={code} language="javascript" />);

      expect(screen.getByText(/function/)).toBeInTheDocument();
      expect(screen.getByText(/console/)).toBeInTheDocument();
    });

    it('末尾の改行が削除される', () => {
      render(<CodeBlock code="test\n" language="javascript" />);

      const preElement = document.querySelector('pre');
      expect(preElement?.textContent).not.toMatch(/\n$/);
    });

    it('空のコードでもエラーにならない', () => {
      expect(() => render(<CodeBlock code="" language="javascript" />)).not.toThrow();
    });
  });

  describe('行番号', () => {
    it('デフォルトでは行番号が表示されない', () => {
      const { container } = render(
        <CodeBlock code="hello world" language="text" />
      );

      const preElement = container.querySelector('pre');
      const fullText = preElement?.textContent || '';

      // コード内容に数字がないため、数字があれば行番号
      // デフォルトでは行番号なしなので、"1"は含まれない
      expect(fullText).not.toMatch(/^\d/);
      expect(fullText).toBe('hello world');
    });

    it('showLineNumbers=trueで行番号が表示される', () => {
      const { container } = render(
        <CodeBlock
          code="hello world"
          language="text"
          showLineNumbers={true}
        />
      );

      const preElement = container.querySelector('pre');
      const fullText = preElement?.textContent || '';

      // showLineNumbers=trueの場合、行番号"1"がテキストの先頭に含まれる
      expect(fullText).toMatch(/^1/);
      expect(fullText).toContain('hello world');
    });
  });

  describe('シンタックスハイライト', () => {
    it('JavaScriptコードがハイライトされる', () => {
      render(<CodeBlock code="const x = 'hello';" language="javascript" />);

      const codeElement = document.querySelector('pre');
      expect(codeElement?.querySelectorAll('span').length).toBeGreaterThan(0);
    });

    it('TypeScriptコードがハイライトされる', () => {
      render(<CodeBlock code="const x: string = 'hello';" language="typescript" />);

      const codeElement = document.querySelector('pre');
      expect(codeElement?.querySelectorAll('span').length).toBeGreaterThan(0);
    });

    it('Pythonコードがハイライトされる', () => {
      render(<CodeBlock code="def hello():\n    print('hello')" language="python" />);

      const codeElement = document.querySelector('pre');
      expect(codeElement?.querySelectorAll('span').length).toBeGreaterThan(0);
    });
  });
});
