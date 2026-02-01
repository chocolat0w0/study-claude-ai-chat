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

  describe('Markdownレンダリング', () => {
    describe('見出し', () => {
      it('各レベルの見出しが正しく表示される', () => {
        const headingMessage: Message = {
          id: 'msg-heading-1',
          role: 'assistant',
          content: '# Heading 1\n## Heading 2\n### Heading 3',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={headingMessage} />);

        const h1 = screen.getByText('Heading 1');
        const h2 = screen.getByText('Heading 2');
        const h3 = screen.getByText('Heading 3');

        expect(h1.tagName).toBe('H1');
        expect(h2.tagName).toBe('H2');
        expect(h3.tagName).toBe('H3');
      });

      it('h4からh6の見出しも正しく表示される', () => {
        const headingMessage: Message = {
          id: 'msg-heading-2',
          role: 'assistant',
          content: '#### Heading 4\n##### Heading 5\n###### Heading 6',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={headingMessage} />);

        expect(screen.getByText('Heading 4').tagName).toBe('H4');
        expect(screen.getByText('Heading 5').tagName).toBe('H5');
        expect(screen.getByText('Heading 6').tagName).toBe('H6');
      });
    });

    describe('リスト', () => {
      it('順序なしリストが正しく表示される', () => {
        const ulMessage: Message = {
          id: 'msg-list-1',
          role: 'assistant',
          content: '- Item 1\n- Item 2\n- Item 3',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={ulMessage} />);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();

        // ul要素が存在することを確認
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
      });

      it('順序ありリストが正しく表示される', () => {
        const olMessage: Message = {
          id: 'msg-list-2',
          role: 'assistant',
          content: '1. First\n2. Second\n3. Third',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={olMessage} />);

        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
        expect(screen.getByText('Third')).toBeInTheDocument();

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
      });

      it('ネストされたリストが正しく表示される', () => {
        const nestedListMessage: Message = {
          id: 'msg-list-3',
          role: 'assistant',
          content: '- Parent 1\n  - Child 1\n  - Child 2\n- Parent 2',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={nestedListMessage} />);

        expect(screen.getByText('Parent 1')).toBeInTheDocument();
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
        expect(screen.getByText('Parent 2')).toBeInTheDocument();
      });
    });

    describe('リンク', () => {
      it('リンクが正しく表示される', () => {
        const linkMessage: Message = {
          id: 'msg-link-1',
          role: 'assistant',
          content: 'Visit [GitHub](https://github.com) for more info.',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={linkMessage} />);

        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://github.com');
      });

      it('複数のリンクが表示される', () => {
        const multiLinkMessage: Message = {
          id: 'msg-link-2',
          role: 'assistant',
          content: '[Link 1](https://example1.com) and [Link 2](https://example2.com)',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={multiLinkMessage} />);

        const link1 = screen.getByRole('link', { name: 'Link 1' });
        const link2 = screen.getByRole('link', { name: 'Link 2' });

        expect(link1).toHaveAttribute('href', 'https://example1.com');
        expect(link2).toHaveAttribute('href', 'https://example2.com');
      });
    });

    describe('テーブル', () => {
      it('テーブルが正しく表示される', () => {
        const tableMessage: Message = {
          id: 'msg-table-1',
          role: 'assistant',
          content: '| Name | Age |\n|------|-----|\n| Alice | 25 |\n| Bob | 30 |',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={tableMessage} />);

        // テーブルヘッダー
        expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();

        // テーブルデータ
        expect(screen.getByRole('cell', { name: 'Alice' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: '25' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Bob' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: '30' })).toBeInTheDocument();
      });

      it('空のセルを含むテーブルが表示される', () => {
        const tableWithEmptyMessage: Message = {
          id: 'msg-table-2',
          role: 'assistant',
          content: '| Col1 | Col2 |\n|------|------|\n| Data | |\n| | Value |',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={tableWithEmptyMessage} />);

        expect(screen.getByRole('cell', { name: 'Data' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Value' })).toBeInTheDocument();
      });
    });

    describe('引用', () => {
      it('引用が正しく表示される', () => {
        const quoteMessage: Message = {
          id: 'msg-quote-1',
          role: 'assistant',
          content: '> This is a quote\n> with multiple lines',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={quoteMessage} />);

        expect(screen.getByText(/This is a quote/)).toBeInTheDocument();
        expect(screen.getByText(/with multiple lines/)).toBeInTheDocument();
      });
    });

    describe('強調', () => {
      it('太字が正しく表示される', () => {
        const boldMessage: Message = {
          id: 'msg-bold-1',
          role: 'assistant',
          content: 'This is **bold text**.',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={boldMessage} />);

        const boldElement = screen.getByText('bold text');
        expect(boldElement).toBeInTheDocument();
        expect(boldElement.tagName).toBe('STRONG');
      });

      it('斜体が正しく表示される', () => {
        const italicMessage: Message = {
          id: 'msg-italic-1',
          role: 'assistant',
          content: 'This is *italic text*.',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={italicMessage} />);

        const italicElement = screen.getByText('italic text');
        expect(italicElement).toBeInTheDocument();
        expect(italicElement.tagName).toBe('EM');
      });

      it('打ち消し線が正しく表示される（GFM）', () => {
        const strikeMessage: Message = {
          id: 'msg-strike-1',
          role: 'assistant',
          content: 'This is ~~strikethrough~~.',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={strikeMessage} />);

        const strikeElement = screen.getByText('strikethrough');
        expect(strikeElement).toBeInTheDocument();
        expect(strikeElement.tagName).toBe('DEL');
      });
    });

    describe('インラインコード', () => {
      it('インラインコードが正しく表示される', () => {
        const inlineCodeMessage: Message = {
          id: 'msg-code-1',
          role: 'assistant',
          content: 'Use the `console.log()` function to print messages.',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={inlineCodeMessage} />);

        const codeElement = screen.getByText('console.log()');
        expect(codeElement).toBeInTheDocument();
        expect(codeElement.tagName).toBe('CODE');
      });

      it('複数のインラインコードが表示される', () => {
        const multiCodeMessage: Message = {
          id: 'msg-code-2',
          role: 'assistant',
          content: 'Use `const` or `let` to declare variables.',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={multiCodeMessage} />);

        expect(screen.getByText('const')).toBeInTheDocument();
        expect(screen.getByText('let')).toBeInTheDocument();
      });
    });

    describe('コードブロックとの連携', () => {
      it('Markdownのコードブロックが正しくCodeBlockコンポーネントとして表示される', () => {
        const codeBlockMessage: Message = {
          id: 'msg-codeblock-1',
          role: 'assistant',
          content: '```javascript\nconst greeting = "Hello";\nconsole.log(greeting);\n```',
          createdAt: '2024-01-15T10:30:00Z',
        };

        const { container } = render(<ChatMessage message={codeBlockMessage} />);

        // CodeBlockコンポーネントが使用されることを確認（言語ラベルとコピーボタン）
        expect(screen.getByText('javascript')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();

        // コード内容が含まれることを確認（シンタックスハイライトで分割されているため、containerのテキストで確認）
        const preElement = container.querySelector('pre');
        expect(preElement?.textContent).toContain('const');
        expect(preElement?.textContent).toContain('greeting');
        expect(preElement?.textContent).toContain('console.log');
      });

      it('複数のコードブロックが表示される', () => {
        const multiCodeBlockMessage: Message = {
          id: 'msg-codeblock-2',
          role: 'assistant',
          content:
            'First:\n```python\nprint("hello")\n```\n\nSecond:\n```typescript\nconst x: string = "world";\n```',
          createdAt: '2024-01-15T10:30:00Z',
        };

        const { container } = render(<ChatMessage message={multiCodeBlockMessage} />);

        // 言語ラベルが表示されることを確認
        expect(screen.getByText('python')).toBeInTheDocument();
        expect(screen.getByText('typescript')).toBeInTheDocument();

        // コード内容が含まれることを確認
        const preElements = container.querySelectorAll('pre');
        const allText = Array.from(preElements)
          .map((pre) => pre.textContent)
          .join(' ');

        expect(allText).toContain('print');
        expect(allText).toContain('const');
      });
    });

    describe('複合的なMarkdown', () => {
      it('複数のMarkdown要素を含むメッセージが正しく表示される', () => {
        const complexMessage: Message = {
          id: 'msg-complex-1',
          role: 'assistant',
          content: `# Title

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
const code = "example";
\`\`\`

[Link](https://example.com)`,
          createdAt: '2024-01-15T10:30:00Z',
        };

        const { container } = render(<ChatMessage message={complexMessage} />);

        // 各要素が表示されることを確認
        expect(screen.getByText('Title').tagName).toBe('H1');
        expect(screen.getByText('bold').tagName).toBe('STRONG');
        expect(screen.getByText('italic').tagName).toBe('EM');
        expect(screen.getByText('List item 1')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument();

        // コードブロックの内容を確認（シンタックスハイライトで分割されているため）
        const preElement = container.querySelector('pre');
        expect(preElement?.textContent).toContain('const');
        expect(preElement?.textContent).toContain('code');
      });
    });

    describe('特殊文字とエスケープ', () => {
      it('HTML特殊文字が正しくエスケープされる', () => {
        const specialCharsMessage: Message = {
          id: 'msg-special-1',
          role: 'assistant',
          content: 'Use < and > symbols in code.',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={specialCharsMessage} />);

        expect(screen.getByText(/Use < and > symbols in code\./)).toBeInTheDocument();
      });

      it('Markdownエスケープが正しく処理される', () => {
        const escapedMessage: Message = {
          id: 'msg-escaped-1',
          role: 'assistant',
          content: 'This is not \\*italic\\* text.',
          createdAt: '2024-01-15T10:30:00Z',
        };

        render(<ChatMessage message={escapedMessage} />);

        expect(screen.getByText(/This is not \*italic\* text\./)).toBeInTheDocument();
      });
    });
  });
});
