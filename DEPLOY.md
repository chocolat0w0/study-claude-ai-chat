# AI Code Assistant - デプロイガイド

このドキュメントでは、AI Code Assistantのデプロイ方法を説明します。

## クイックスタート

### ローカルでDockerを使って起動

```bash
# 1. 環境変数を設定
echo "ANTHROPIC_API_KEY=your_api_key" >> .env.local

# 2. Dockerで起動
make docker-up

# 3. ブラウザでアクセス
open http://localhost:3000
```

### Google Cloud Runにデプロイ

```bash
# 1. Google Cloud にログイン
gcloud auth login

# 2. プロジェクトID を設定
echo "PROJECT_ID=your-project-id" >> .env.local
gcloud config set project your-project-id

# 3. 必要なAPIを有効化
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Secret Managerにシークレットを設定
echo -n "your_anthropic_api_key" | gcloud secrets create ANTHROPIC_API_KEY --data-file=-
echo -n "mongodb+srv://..." | gcloud secrets create DATABASE_URL --data-file=-

# 5. デプロイ
make deploy
```

---

## 目次

1. [ローカル環境でのDocker起動](#ローカル環境でのdocker起動)
2. [Google Cloud Runへのデプロイ](#google-cloud-runへのデプロイ)
3. [環境変数の設定](#環境変数の設定)
4. [トラブルシューティング](#トラブルシューティング)

---

## ローカル環境でのDocker起動

### 前提条件

- Docker Desktop がインストールされていること
- `.env.local` に必要な環境変数が設定されていること

### 起動手順

1. **環境変数の設定**

   `.env.local` ファイルに以下を設定：

   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   ```

2. **Makeコマンドで起動（推奨）**

   ```bash
   # Dockerで起動
   make docker-up

   # Docker停止
   make docker-down

   # ボリュームも削除する場合
   make docker-clean
   ```

3. **アクセス**

   ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

### docker-composeコマンドを直接使う場合

```bash
# コンテナをビルドして起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d --build

# 停止
docker-compose down

# ボリュームも削除
docker-compose down -v
```

---

## Google Cloud Runへのデプロイ

### 前提条件

- Google Cloud アカウント
- Google Cloud CLI (`gcloud`) がインストールされていること
- プロジェクトが作成されていること
- 必要なAPIが有効化されていること

### 初期セットアップ

1. **Google Cloud CLIのインストール**

   ```bash
   # macOS
   brew install --cask gcloud-cli

   # または公式サイトからダウンロード
   # https://cloud.google.com/sdk/docs/install
   ```

2. **認証とプロジェクト設定**

   ```bash
   # Google Cloud にログイン
   gcloud auth login

   # プロジェクトを設定（gcloud コマンド全般で使用）
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **環境変数の設定（Makeコマンド用）**

   `.env.local` ファイルに以下を追加：

   ```env
   # Google Cloud プロジェクトID
   PROJECT_ID=YOUR_PROJECT_ID
   ```

4. **必要なAPIを有効化**

   ```bash
   # Cloud Run API
   gcloud services enable run.googleapis.com

   # Cloud Build API
   gcloud services enable cloudbuild.googleapis.com

   # Container Registry API
   gcloud services enable containerregistry.googleapis.com

   # Secret Manager API（環境変数管理用）
   gcloud services enable secretmanager.googleapis.com
   ```

### データベースのセットアップ

本番環境では MongoDB Atlas を使用することを推奨します。

1. **MongoDB Atlas でクラスタを作成**
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) にアクセス
   - 無料のM0クラスタを作成
   - ネットワークアクセスで `0.0.0.0/0` を許可（Cloud Run用）
   - データベースユーザーを作成
   - 接続文字列を取得

2. **接続文字列の形式**

   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ai_code_assistant?retryWrites=true&w=majority
   ```

### Secret Managerでの環境変数設定

機密情報はSecret Managerで管理します。

```bash
# DATABASE_URL を設定
echo -n "mongodb+srv://username:password@cluster.mongodb.net/ai_code_assistant" | \
  gcloud secrets create DATABASE_URL --data-file=-

# ANTHROPIC_API_KEY を設定
echo -n "your_anthropic_api_key" | \
  gcloud secrets create ANTHROPIC_API_KEY --data-file=-

# Secret Manager へのアクセス権限を付与
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding ANTHROPIC_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### デプロイ方法

#### 1. Makeコマンドでデプロイ（推奨）

`.env.local` に `PROJECT_ID` が設定されていることを確認してから：

```bash
# ビルドとデプロイを一度に実行
make deploy
```

これにより以下が自動実行されます：
1. Cloud Buildでイメージをビルド
2. Container Registryにプッシュ
3. Cloud Runにデプロイ

#### 2. GitHub連携の自動デプロイ

```bash
# Cloud Build トリガーを作成
gcloud builds triggers create github \
  --repo-name=your-repo-name \
  --repo-owner=your-github-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

設定後は `main` ブランチにプッシュするだけで自動デプロイされます。

#### 3. Cloud Buildを直接実行

```bash
# cloudbuild.yaml を使用してビルド・デプロイ
gcloud builds submit --config cloudbuild.yaml
```

#### 4. 手動デプロイ（低レベルコマンド）

個別のステップを実行したい場合：

```bash
# 1. イメージをビルドしてContainer Registryにプッシュ
make deploy-build

# 2. Cloud Runにデプロイ（deploy-buildが完了した後）
gcloud run deploy ai-code-assistant \
  --image gcr.io/$(grep PROJECT_ID .env.local | cut -d '=' -f2)/ai-code-assistant \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest
```

または、gcloud コマンドを直接使用：

```bash
# 1. イメージをビルド
docker build -t gcr.io/YOUR_PROJECT_ID/ai-code-assistant:latest .

# 2. Container Registry にプッシュ
docker push gcr.io/YOUR_PROJECT_ID/ai-code-assistant:latest

# 3. Cloud Run にデプロイ
gcloud run deploy ai-code-assistant \
  --image gcr.io/YOUR_PROJECT_ID/ai-code-assistant:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest
```

### デプロイ後の確認

```bash
# デプロイされたサービスのURLを取得
gcloud run services describe ai-code-assistant \
  --platform managed \
  --region asia-northeast1 \
  --format 'value(status.url)'

# ログを確認
gcloud run services logs read ai-code-assistant \
  --platform managed \
  --region asia-northeast1
```

---

## 環境変数の設定

### ローカル開発用（`.env.local`）

| 変数名              | 説明                     | 例                                       |
| ------------------- | ------------------------ | ---------------------------------------- |
| `ANTHROPIC_API_KEY` | Claude API キー          | `sk-ant-...`                             |
| `DATABASE_URL`      | MongoDB接続文字列        | `mongodb://localhost:27017/...`          |
| `PROJECT_ID`        | Google CloudプロジェクトID | `my-project-12345`                       |
| `NODE_ENV`          | 実行環境                 | `development`                            |
| `NEXT_PUBLIC_APP_URL` | アプリケーションURL      | `http://localhost:3000`                  |

### 本番環境用（Cloud Run）

本番環境ではSecret Managerで管理：

| 変数名              | 説明              | 設定方法            |
| ------------------- | ----------------- | ------------------- |
| `DATABASE_URL`      | MongoDB接続文字列 | Secret Manager      |
| `ANTHROPIC_API_KEY` | Claude API キー   | Secret Manager      |
| `NODE_ENV`          | 実行環境          | 環境変数（`production`） |

---

## トラブルシューティング

### Dockerコンテナが起動しない

```bash
# ログを確認
docker-compose logs app

# コンテナの状態を確認
docker-compose ps

# クリーンビルド
docker-compose down -v
docker-compose up --build
```

### Cloud Runでデプロイエラーが発生する

```bash
# Cloud Build のログを確認
gcloud builds list --limit=5

# 特定のビルドのログを詳細表示
gcloud builds log BUILD_ID

# Cloud Run のログを確認
gcloud run services logs read ai-code-assistant --limit=100
```

### データベース接続エラー

- MongoDB Atlasのネットワークアクセス設定を確認
- 接続文字列が正しいか確認
- データベースユーザーの認証情報を確認
- Secret Managerの設定を確認

### メモリ不足エラー

Cloud Runのメモリを増やす：

```bash
gcloud run services update ai-code-assistant \
  --memory 1Gi \
  --region asia-northeast1
```

### タイムアウトエラー

Cloud Runのタイムアウトを増やす：

```bash
gcloud run services update ai-code-assistant \
  --timeout 600 \
  --region asia-northeast1
```

---

## コスト管理

### 推奨設定（無料枠内で運用）

- Cloud Run: 最小インスタンス0、最大インスタンス1
- MongoDB Atlas: M0（無料）クラスタ
- Container Registry: イメージは定期的にクリーンアップ

### コスト削減のヒント

1. **不要なイメージの削除**

   ```bash
   # 古いイメージを一覧表示
   gcloud container images list-tags gcr.io/YOUR_PROJECT_ID/ai-code-assistant

   # 特定のイメージを削除
   gcloud container images delete gcr.io/YOUR_PROJECT_ID/ai-code-assistant:TAG
   ```

2. **最小インスタンス数を0に設定**
   - アクセスがない時はインスタンスが自動で停止
   - コールドスタートが発生するが、コストを抑えられる

3. **Cloud Buildのビルドキャッシュを活用**
   - `cloudbuild.yaml` で適切にキャッシュを設定

---

## セキュリティのベストプラクティス

1. **環境変数は必ずSecret Managerで管理**
2. **MongoDB Atlasのネットワークアクセスを必要最小限に制限**
3. **定期的に依存パッケージを更新**
4. **Cloud Runの認証を必要に応じて有効化**

---

## 参考リンク

- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Cloud Build ドキュメント](https://cloud.google.com/build/docs)
- [Secret Manager ドキュメント](https://cloud.google.com/secret-manager/docs)
- [MongoDB Atlas ドキュメント](https://www.mongodb.com/docs/atlas/)
