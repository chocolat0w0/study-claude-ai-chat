# AI Code Assistant - 実行計画

## Phase 1: プロジェクト初期設定

- [ ] Next.js プロジェクト作成 (`create-next-app`)
- [ ] 必要なパッケージのインストール
  - [ ] MUI (`@mui/material`, `@emotion/react`, `@emotion/styled`)
  - [ ] Hono (`hono`, `@hono/node-server`)
  - [ ] Prisma (`prisma`, `@prisma/client`)
  - [ ] Mastra (`@mastra/core`)
  - [ ] Anthropic SDK (`@anthropic-ai/sdk`)
  - [ ] Markdown関連 (`react-markdown`, `remark-gfm`)
  - [ ] コードハイライト (`prism-react-renderer` or `highlight.js`)
  - [ ] 差分表示 (`react-diff-viewer-continued`)
- [ ] TypeScript 設定 (strict mode)
- [ ] ESLint + Prettier 設定
- [ ] Vitest + React Testing Library 設定
- [ ] ディレクトリ構成の作成
- [ ] 環境変数ファイル作成 (`.env.local`, `.env.example`)
- [ ] Git リポジトリ初期化 + `.gitignore` 設定

## Phase 2: データベース設定 (Prisma + MongoDB)

- [ ] Prisma 初期化 (`npx prisma init`)
- [ ] MongoDB Atlas クラスター作成（または Docker でローカル環境）
- [ ] `schema.prisma` でデータモデル定義
  - [ ] Conversation モデル
  - [ ] Message モデル
- [ ] Prisma Client 生成 (`npx prisma generate`)
- [ ] `src/lib/prisma.ts` - Prisma クライアントシングルトン作成
- [ ] データベース接続テスト

## Phase 3: バックエンド構築 (Hono + Mastra)

### 3.1 Hono セットアップ

- [ ] `src/server/hono.ts` - Hono アプリ初期化
- [ ] `src/app/api/[[...route]]/route.ts` - Next.js との統合
- [ ] エラーハンドリングミドルウェア
- [ ] CORS 設定

### 3.2 Mastra AIエージェント設定

- [ ] `src/mastra/index.ts` - Mastra 初期化
- [ ] `src/mastra/agents/codeAssistant.ts` - コーディング支援エージェント定義
  - [ ] システムプロンプト設定
  - [ ] Claude-3-sonnet モデル設定
- [ ] ストリーミングレスポンス対応

### 3.3 API ルート実装

- [ ] `src/server/routes/chat.ts` - チャット API
  - [ ] `POST /api/chat` - メッセージ送信 (ストリーミング)
  - [ ] `GET /api/chat/history` - 会話履歴一覧取得
  - [ ] `GET /api/chat/:conversationId` - 会話詳細取得
  - [ ] `DELETE /api/chat/:conversationId` - 会話削除
- [ ] `src/server/routes/index.ts` - ルート集約

## Phase 4: フロントエンド基盤構築

### 4.1 テーマ・レイアウト

- [ ] `src/lib/theme.ts` - MUI ダークテーマ設定
- [ ] `src/app/layout.tsx` - ThemeProvider 設定
- [ ] `src/app/page.tsx` - メインページレイアウト

### 4.2 共通コンポーネント

- [ ] `src/components/common/` - 共通 UI コンポーネント
  - [ ] Header
  - [ ] Sidebar (会話履歴リスト用)
  - [ ] LoadingSpinner

## Phase 5: チャット機能実装

### 5.1 チャット UI コンポーネント

- [ ] `src/components/chat/ChatInput.tsx` - メッセージ入力フォーム
  - [ ] テキストエリア
  - [ ] 送信ボタン
  - [ ] キーボードショートカット (Cmd/Ctrl + Enter)
- [ ] `src/components/chat/ChatMessage.tsx` - メッセージ表示
  - [ ] ユーザー / アシスタント メッセージの区別
  - [ ] アバター表示
  - [ ] タイムスタンプ
- [ ] `src/components/chat/ChatHistory.tsx` - 会話履歴サイドバー
  - [ ] 会話リスト表示
  - [ ] 新規チャット作成ボタン
  - [ ] 会話削除機能

### 5.2 チャット機能ロジック

- [ ] `src/hooks/useChat.ts` - チャットカスタムフック
  - [ ] メッセージ送信
  - [ ] ストリーミング受信処理
  - [ ] エラーハンドリング
- [ ] `src/hooks/useConversations.ts` - 会話管理フック
  - [ ] 会話一覧取得
  - [ ] 会話切り替え
  - [ ] 会話削除

## Phase 6: コード表示機能実装

- [ ] `src/components/code/CodeBlock.tsx` - コードブロック表示
  - [ ] シンタックスハイライト
  - [ ] 言語ラベル表示
- [ ] `src/components/code/CopyButton.tsx` - コピーボタン
  - [ ] クリップボードへのコピー
  - [ ] コピー完了フィードバック
- [ ] `src/components/code/DiffViewer.tsx` - 差分表示
  - [ ] 変更前後のコード比較表示

## Phase 7: Markdown レンダリング

- [ ] `src/components/chat/MarkdownRenderer.tsx` - Markdown 表示コンポーネント
  - [ ] 見出し、リスト、テーブル対応
  - [ ] コードブロックに `CodeBlock` コンポーネント使用
  - [ ] リンク処理
  - [ ] MUI テーマとの統合

## Phase 8: テスト実装

### 8.1 ユニットテスト

- [ ] `src/__tests__/lib/prisma.test.ts`
- [ ] `src/__tests__/hooks/useChat.test.ts`
- [ ] `src/__tests__/hooks/useConversations.test.ts`

### 8.2 コンポーネントテスト

- [ ] `src/__tests__/components/ChatInput.test.tsx`
- [ ] `src/__tests__/components/ChatMessage.test.tsx`
- [ ] `src/__tests__/components/CodeBlock.test.tsx`
- [ ] `src/__tests__/components/CopyButton.test.tsx`
- [ ] `src/__tests__/components/MarkdownRenderer.test.tsx`

### 8.3 API テスト

- [ ] `src/__tests__/server/routes/chat.test.ts`

## Phase 9: 品質向上・最適化

- [ ] Rate limiting 実装
- [ ] 入力値バリデーション・サニタイズ
- [ ] エラーバウンダリ実装
- [ ] ローディング状態の UX 改善
- [ ] キーボードアクセシビリティ確認
- [ ] パフォーマンス最適化
  - [ ] コンポーネントの適切なメモ化
  - [ ] バンドルサイズ確認

## Phase 10: デプロイ準備

- [ ] `Dockerfile` 作成
- [ ] `docker-compose.yml` 作成（ローカル開発用）
- [ ] Google Cloud Run 設定
  - [ ] Cloud Run サービス作成
  - [ ] 環境変数設定
  - [ ] デプロイパイプライン構築
- [ ] 本番環境テスト
- [ ] ドキュメント整備

---

## 完了基準

- [ ] 全ての主要機能が動作すること
- [ ] テストカバレッジ 80% 以上
- [ ] 初回ロード 3秒以内
- [ ] ストリーミング応答の初回トークン 2秒以内
- [ ] 本番環境へのデプロイ完了
