# マルチモーダル機能セットアップガイド

このPRでは、チャットに画像添付機能を追加するマルチモーダル対応を実装しました。

## 実装内容

### 1. データベーススキーマの変更

新しく `MessageImage` モデルを追加しました:

```prisma
model MessageImage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  messageId String   @db.ObjectId
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  data      String   // Base64 encoded image data
  mimeType  String   // image/jpeg, image/png, etc.
  createdAt DateTime @default(now())
}
```

### 2. フロントエンド機能

- **画像添付ボタン**: ファイル選択ダイアログから画像を選択
- **ドラッグ&ドロップ**: 画像をチャット入力エリアにドロップ
- **クリップボード貼り付け**: Ctrl+V で画像を貼り付け
- **画像プレビュー**: 送信前に画像を確認
- **画像表示**: メッセージ内の画像を表示
- **画像拡大**: 画像クリックで拡大表示

### 3. バックエンド機能

- 画像データの受信と保存（Base64形式）
- 画像付きメッセージの取得
- Claude APIへの画像情報の通知（テキストベース）

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Prismaクライアントの再生成

```bash
npm run db:generate
```

### 3. データベーススキーマの更新

MongoDB を使用しているため、Prisma の db push を実行:

```bash
npm run db:push
```

### 4. 型チェックとLint

```bash
npm run type-check
npm run lint
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

## 使い方

1. チャット入力エリア左側の添付ボタンをクリックして画像を選択
2. または、画像ファイルを入力エリアにドラッグ&ドロップ
3. または、Ctrl+V でクリップボードから画像を貼り付け
4. プレビューで画像を確認し、不要な画像は削除ボタンで削除
5. メッセージを入力（画像のみの送信も可能）
6. 送信ボタンをクリックまたは Cmd/Ctrl + Enter で送信

## 制限事項

### ファイルサイズ
- 最大: 5MB/画像

### 対応フォーマット
- JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

### MongoDB 制限
- 1ドキュメントの最大サイズ: 16MB
- 大量の画像を添付する場合は注意が必要

## 今後の改善点

### Claude Vision API の直接統合

現在の実装では、画像の存在をテキストで通知していますが、Claude の Vision API を直接使用するには以下の変更が必要です:

1. **Mastra Agent の制限**: 現在の Mastra Agent は直接 Vision をサポートしていない可能性があります
2. **Anthropic SDK の直接使用**: より柔軟な実装のため、Anthropic SDK を直接使用することを検討
3. **メッセージフォーマットの変更**: Claude API の multimodal message format に準拠

例:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64ImageData,
          },
        },
        {
          type: 'text',
          text: 'この画像について教えてください',
        },
      ],
    },
  ],
});
```

### その他の改善案

- 画像の圧縮処理（送信前にリサイズ）
- サムネイル生成
- 画像のクラウドストレージ保存（MongoDBの制限回避）
- 複数画像の一括アップロード UI 改善
- 画像の alt テキスト入力機能

## トラブルシューティング

### MongoDB 接続エラー

MongoDB Atlas の Network Access が期限切れになっている可能性があります。CLAUDE.md の「MongoDB Atlas ネットワークアクセスについて」セクションを参照してください。

### 画像が表示されない

1. ブラウザのコンソールでエラーを確認
2. Base64 データが正しく保存されているか確認
3. mimeType が正しく設定されているか確認

### ファイルサイズエラー

5MB を超える画像はアップロードできません。画像を圧縮してから再度試してください。
