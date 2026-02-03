# AI Code Assistant

コーディング支援に特化したAIチャットボットアプリケーション。

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + React + MUI
- **バックエンド**: Hono + Mastra
- **AI**: Claude API (Anthropic)
- **データベース**: MongoDB + Prisma
- **テスト**: Vitest + React Testing Library

## 必要要件

- Node.js 20+
- Docker (MongoDB用)
- Anthropic API Key

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd study-claude-ai-chat
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集してAPI Keyを設定:

```bash
ANTHROPIC_API_KEY=your-api-key-here
```

### 4. MongoDBの起動

```bash
docker compose up -d
```

### 5. データベースのセットアップ

```bash
# スキーマをDBに反映
npm run db:push

# (オプション) シードデータの投入
npm run db:seed
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

<http://localhost:3000> でアクセス可能。

## npm スクリプト

| コマンド              | 説明                   |
| --------------------- | ---------------------- |
| `npm run dev`         | 開発サーバー起動       |
| `npm run build`       | 本番ビルド             |
| `npm run start`       | 本番サーバー起動       |
| `npm run lint`        | ESLint実行             |
| `npm run format`      | Prettier実行           |
| `npm run test`        | テスト実行             |
| `npm run test:watch`  | テスト(ウォッチモード) |
| `npm run type-check`  | 型チェック             |
| `npm run db:generate` | Prisma Client生成      |
| `npm run db:push`     | スキーマをDBに反映     |
| `npm run db:seed`     | シードデータ投入       |
| `npm run db:studio`   | Prisma Studio起動      |
| `npm run db:test`     | DB接続テスト           |

## デプロイ (Google Cloud Run)

### デプロイ実行

```bash
make deploy
```

### デプロイ後のアクセス

Cloud Run は IAM 認証で保護されているため、プロキシ経由でアクセスします。

```bash
# プロキシ起動 → http://localhost:8080 でアクセス
make proxy
```

### MongoDB Atlas ネットワークアクセスの確認

MongoDB Atlas の Network Access で `0.0.0.0/0`（全IP許可）を設定している場合、**時間制限付き**で設定されます。
デプロイ後に接続エラーが発生した場合は、Atlas の Network Access で期限切れになっていないか確認してください。

1. [MongoDB Atlas](https://cloud.mongodb.com/) → Network Access を開く
2. `0.0.0.0/0` の期限が切れていれば「Edit」から再有効化する

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── api/[[...route]]/   # Hono API
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Reactコンポーネント
│   ├── chat/
│   ├── code/
│   └── common/
├── server/                 # サーバーサイドロジック
│   ├── routes/
│   └── hono.ts
├── mastra/                 # AIエージェント
│   ├── agents/
│   └── tools/
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ
├── types/                  # 型定義
└── __tests__/              # テスト
```

## ライセンス

MIT
