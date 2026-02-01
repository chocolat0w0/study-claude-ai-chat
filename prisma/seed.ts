import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // サンプル会話1: TypeScriptの基本
  const conversation1 = await prisma.conversation.create({
    data: {
      title: 'TypeScriptの基本',
      messages: {
        create: [
          {
            role: 'user',
            content: 'こんにちは！TypeScriptについて教えてください。',
          },
          {
            role: 'assistant',
            content:
              'こんにちは！TypeScriptはJavaScriptに静的型付けを追加した言語です。型安全性を保ちながら、大規模なアプリケーション開発を行うことができます。',
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });

  // サンプル会話2: Fibonacci関数の実装
  const conversation2 = await prisma.conversation.create({
    data: {
      title: 'Fibonacci関数の実装',
      messages: {
        create: [
          {
            role: 'user',
            content: 'TypeScriptでフィボナッチ数列を計算する関数を書いてください。',
          },
          {
            role: 'assistant',
            content: `TypeScriptでフィボナッチ数列を計算する関数を実装します。再帰的なアプローチで書いてみましょう。

\`\`\`typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 使用例
console.log(fibonacci(10)); // 55
\`\`\`

この関数は、以下のように動作します：
- n が 0 または 1 の場合、n をそのまま返します
- それ以外の場合、fibonacci(n-1) + fibonacci(n-2) を再帰的に計算します

フィボナッチ数列は、前の2つの数を足すことで次の数を得る数列です（0, 1, 1, 2, 3, 5, 8, 13...）。`,
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });

  // サンプル会話3: JavaScriptからTypeScriptへの変換
  const conversation3 = await prisma.conversation.create({
    data: {
      title: 'JavaScriptからTypeScriptへ',
      messages: {
        create: [
          {
            role: 'user',
            content: 'JavaScriptのコードをTypeScriptに変換する際のポイントを教えてください。',
          },
          {
            role: 'assistant',
            content: `JavaScriptからTypeScriptへの変換のポイントを、具体例で説明します。

以下は、JavaScriptからTypeScriptへの変換例です：

**変換前（JavaScript）:**
\`\`\`javascript
function greet(name) {
  console.log("Hello, " + name);
}
\`\`\`

**変換後（TypeScript）:**
\`\`\`typescript
function greet(name: string): void {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

主な変更点：
1. **型アノテーション**: パラメータに \`string\` 型を追加
2. **戻り値の型**: \`void\` を明示的に指定
3. **テンプレートリテラル**: 文字列連結の代わりにテンプレートリテラルを使用

これにより、型安全性が向上し、開発時にエラーを早期に発見できます。`,
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });

  // サンプル会話4: Markdown記法のデモ
  const conversation4 = await prisma.conversation.create({
    data: {
      title: 'Markdown記法のデモ',
      messages: {
        create: [
          {
            role: 'user',
            content: 'Markdownの基本的な記法を教えてください。',
          },
          {
            role: 'assistant',
            content: `Markdownの基本的な記法を紹介します。

# 見出し

見出しは \`#\` の数で階層を表現します。

## レベル2の見出し
### レベル3の見出し

# テキスト装飾

**太字**や*斜体*、~~取り消し線~~も使えます。

インラインコードは \`バッククォート\` で囲みます。例：\`const x = 1;\`

# リスト

## 順序なしリスト
- 項目1
- 項目2
  - ネストした項目
  - ネストした項目2
- 項目3

## 順序付きリスト
1. 最初の項目
2. 2番目の項目
3. 3番目の項目

# コードブロック

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
\`\`\`

# テーブル

| 言語 | 型システム | 用途 |
|------|-----------|------|
| JavaScript | 動的型付け | Web開発 |
| TypeScript | 静的型付け | 大規模Web開発 |
| Python | 動的型付け | データ分析、機械学習 |

# リンク

[Markdown公式サイト](https://www.markdownguide.org/)

# 引用

> これは引用です。
> 複数行にわたる引用も可能です。

以上がMarkdownの基本的な記法です。これらを組み合わせて、読みやすいドキュメントを作成できます。`,
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });

  console.log('✅ Created sample conversations:');
  console.log('   1. TypeScriptの基本:', conversation1.id, `(${conversation1.messages.length} messages)`);
  console.log('   2. Fibonacci関数の実装:', conversation2.id, `(${conversation2.messages.length} messages)`);
  console.log('   3. JavaScriptからTypeScriptへ:', conversation3.id, `(${conversation3.messages.length} messages)`);
  console.log('   4. Markdown記法のデモ:', conversation4.id, `(${conversation4.messages.length} messages)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
