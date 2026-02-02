# AI Code Assistant - プロジェクト仕様書

## プロジェクト概要

コーディング支援に特化したAIチャットボットアプリケーション。
Claude APIを活用し、プログラミングに関する質問応答、コードレビュー、デバッグ支援などを行う。

## 技術スタック

### フロントエンド

- **フレームワーク**: Next.js (App Router)
- **UI ライブラリ**: React
- **コンポーネント**: MUI (Material UI)
- **スタイリング**: MUI のテーマシステム + Emotion
- **テーマ**: ダークモード固定

### バックエンド

- **API**: Next.js (App Router) + Hono
- **ORM**: Prisma.js
- **AIエージェント**: Mastra
- **AIモデル**: Claude-3-sonnet (Anthropic)
- **データベース**: MongoDB (Mongoose)

### テスト

- **ユニットテスト**: Vitest
- **コンポーネントテスト**: React Testing Library
- **テストカバレッジ**: 80%以上を目標

### インフラ

- **デプロイ先**: Google Cloud Run
- **コンテナ**: Docker

## 主要機能

### 1. チャット機能

- ストリーミング応答（リアルタイム表示）
- 会話履歴の保存・再開
- 新規チャット作成

### 2. コード表示機能

- シンタックスハイライト（複数言語対応）
- コードブロックのコピーボタン
- コード差分表示（diff形式）

### 3. Markdownレンダリング

- 見出し、リスト、テーブル等の表示
- コードブロックの適切な表示
- リンクの処理

### 4. 認証

- アプリレベルの認証機能なし
- Cloud Run の IAM 認証で保護（プロキシ経由でアクセス）

## ディレクトリ構成

```sh
ai-code-assistant/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   └── [[...route]]/  # Hono catch-all ルート
│   │   │       └── route.ts   # Hono アプリケーション
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # メインページ
│   ├── components/            # Reactコンポーネント
│   │   ├── chat/              # チャット関連
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatHistory.tsx
│   │   ├── code/              # コード表示関連
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── CopyButton.tsx
│   │   │   └── DiffViewer.tsx
│   │   └── common/            # 共通コンポーネント
│   ├── server/                # サーバーサイドロジック
│   │   ├── routes/            # Hono ルート定義
│   │   │   ├── index.ts       # ルート集約
│   │   │   └── chat.ts        # チャットAPI
│   │   └── hono.ts            # Hono アプリ初期化
│   ├── mastra/                # Mastra AIエージェント
│   │   ├── agents/            # エージェント定義
│   │   │   └── codeAssistant.ts
│   │   ├── tools/             # カスタムツール
│   │   └── index.ts           # Mastra 初期化
│   ├── hooks/                 # カスタムフック
│   ├── lib/                   # ユーティリティ・設定
│   │   ├── prisma.ts          # Prisma クライアント
│   │   └── theme.ts           # MUIテーマ設定
│   ├── types/                 # TypeScript型定義
│   └── __tests__/             # テストファイル
├── prisma/                    # Prisma 設定
│   ├── schema.prisma          # データベーススキーマ
│   └── seed.ts                # シードデータ
├── public/                    # 静的ファイル
├── Dockerfile                 # Dockerイメージ定義
├── docker-compose.yml         # ローカル開発用
├── .env.local                 # 環境変数（ローカル）
├── .env.example               # 環境変数テンプレート
├── vitest.config.ts           # Vitest設定
├── next.config.js             # Next.js設定
├── tsconfig.json              # TypeScript設定
└── package.json
```

## 環境変数

```sh
# Anthropic
ANTHROPIC_API_KEY=           # Claude API キー

# Database (Prisma + MongoDB)
DATABASE_URL=                # MongoDB接続文字列 (例: mongodb+srv://...)

# Application
NEXT_PUBLIC_APP_URL=         # アプリケーションURL
NODE_ENV=                    # 環境 (development / production)
```

## API設計

### POST /api/chat

チャットメッセージを送信し、AIからの応答をストリーミングで取得する。

**リクエスト:**

```json
{
  "message": "ユーザーのメッセージ",
  "conversationId": "会話ID（オプション）"
}
```

**レスポンス:**
Server-Sent Events (SSE) 形式でストリーミング

### GET /api/chat/history

会話履歴一覧を取得する。

### GET /api/chat/[conversationId]

特定の会話の詳細を取得する。

### DELETE /api/chat/[conversationId]

会話を削除する。

## データモデル

### Conversation

```typescript
interface Conversation {
  _id: ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message

```typescript
interface Message {
  _id: ObjectId;
  conversationId: ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
```

## コーディング規約

### 全般

- TypeScript strict モードを使用
- ESLint + Prettier でコード整形
- 関数コンポーネントと Hooks を使用
- 命名規則: コンポーネントは PascalCase、関数・変数は camelCase

### コンポーネント

- 1ファイル1コンポーネントを基本とする
- Props は interface で型定義
- MUI コンポーネントを積極的に活用

### テスト

- 各コンポーネントに対応するテストファイルを作成
- テストは実際の機能を検証すること
- `expect(true).toBe(true)` のような意味のないアサーションは禁止
- モックは必要最小限に留める

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番起動
npm run start

# テスト実行
npm run test

# テスト（ウォッチモード）
npm run test:watch

# Lint
npm run lint

# 型チェック
npm run type-check
```

## デプロイ

### Cloud Run へのデプロイ

```bash
# デプロイ（ビルド + デプロイ）
make deploy

# ビルドのみ
make deploy-build
```

### デプロイ後のアクセス

Cloud Run サービスは認証が必要な設定（`--no-allow-unauthenticated`）のため、直接 URL にアクセスできません。
以下のコマンドでプロキシ経由でアクセスしてください。

```bash
# プロキシを起動（http://localhost:8080 でアクセス可能）
make proxy

# または直接 gcloud コマンド
gcloud run services proxy study-claude-ai-chat --region=asia-northeast1
```

## 非機能要件

### パフォーマンス

- 初回ロード: 3秒以内
- ストリーミング応答: 最初のトークンまで2秒以内

### アクセシビリティ

- MUI のアクセシビリティ機能を活用
- キーボード操作対応

### セキュリティ

- API キーはサーバーサイドでのみ使用
- 入力値のサニタイズ
- Rate limiting の実装
