.PHONY: help install setup clean dev build start test test-watch test-coverage lint lint-fix format type-check db-generate db-push db-seed db-studio db-test docker-build docker-up docker-down docker-clean deploy deploy-build proxy

# デフォルトターゲット
.DEFAULT_GOAL := help

# 環境変数（.env.localから読み込み）
-include .env.local
export

NODE_ENV ?= development
PROJECT_ID ?= your-gcp-project-id
SERVICE_NAME ?= study-claude-ai-chat
REGION ?= asia-northeast1
REGISTRY ?= asia-northeast1-docker.pkg.dev/$(PROJECT_ID)/$(SERVICE_NAME)

## help: このヘルプメッセージを表示
help:
	@echo "利用可能なコマンド:"
	@echo ""
	@echo "【初期化】"
	@echo "  make install          - 依存関係をインストール"
	@echo "  make setup            - 初期セットアップ (install + db:generate)"
	@echo "  make clean            - ビルド成果物を削除"
	@echo ""
	@echo "【開発】"
	@echo "  make dev              - 開発サーバーを起動"
	@echo "  make db-studio        - Prisma Studioを起動"
	@echo ""
	@echo "【ビルド】"
	@echo "  make build            - プロダクションビルド"
	@echo "  make start            - プロダクションサーバーを起動"
	@echo ""
	@echo "【テスト】"
	@echo "  make test             - テストを実行"
	@echo "  make test-watch       - ウォッチモードでテスト"
	@echo "  make test-coverage    - カバレッジ付きでテスト"
	@echo ""
	@echo "【コード品質】"
	@echo "  make lint             - Lintチェック"
	@echo "  make lint-fix         - Lint自動修正"
	@echo "  make format           - コードフォーマット"
	@echo "  make type-check       - TypeScript型チェック"
	@echo "  make check-all        - すべてのチェック実行"
	@echo ""
	@echo "【データベース】"
	@echo "  make db-generate      - Prisma Clientを生成"
	@echo "  make db-push          - スキーマをDBにプッシュ"
	@echo "  make db-seed          - シードデータを投入"
	@echo "  make db-test          - DB接続をテスト"
	@echo ""
	@echo "【Docker】"
	@echo "  make docker-build     - Dockerイメージをビルド"
	@echo "  make docker-up        - Docker Composeで起動"
	@echo "  make docker-down      - Docker Composeで停止"
	@echo "  make docker-clean     - Dockerリソースを削除"
	@echo ""
	@echo "【デプロイ】"
	@echo "  make deploy           - Google Cloud Runにデプロイ"
	@echo "  make deploy-build     - デプロイ用イメージをビルド"
	@echo "  make proxy            - Cloud Runにプロキシ経由でアクセス"
	@echo ""

# ===================================
# 初期化
# ===================================

## install: 依存関係をインストール
install:
	@echo "📦 依存関係をインストール中..."
	npm install

## setup: 初期セットアップ
setup: install
	@echo "⚙️  初期セットアップ中..."
	npm run db:generate
	@echo "✅ セットアップ完了"

## clean: ビルド成果物を削除
clean:
	@echo "🧹 ビルド成果物を削除中..."
	rm -rf .next
	rm -rf dist
	rm -rf coverage
	@echo "✅ クリーンアップ完了"

# ===================================
# 開発
# ===================================

## dev: 開発サーバーを起動
dev:
	@echo "🚀 開発サーバーを起動中..."
	npm run dev

## db-studio: Prisma Studioを起動
db-studio:
	@echo "🎨 Prisma Studioを起動中..."
	npm run db:studio

# ===================================
# ビルド
# ===================================

## build: プロダクションビルド
build:
	@echo "🔨 プロダクションビルド中..."
	npm run build

## start: プロダクションサーバーを起動
start:
	@echo "🚀 プロダクションサーバーを起動中..."
	npm run start

# ===================================
# テスト
# ===================================

## test: テストを実行
test:
	@echo "🧪 テストを実行中..."
	npm run test

## test-watch: ウォッチモードでテスト
test-watch:
	@echo "👀 ウォッチモードでテスト中..."
	npm run test:watch

## test-coverage: カバレッジ付きでテスト
test-coverage:
	@echo "📊 カバレッジ付きでテスト中..."
	npm run test:coverage

# ===================================
# コード品質
# ===================================

## lint: Lintチェック
lint:
	@echo "🔍 Lintチェック中..."
	npm run lint

## lint-fix: Lint自動修正
lint-fix:
	@echo "🔧 Lint自動修正中..."
	npm run lint:fix

## format: コードフォーマット
format:
	@echo "✨ コードフォーマット中..."
	npm run format

## type-check: TypeScript型チェック
type-check:
	@echo "📝 TypeScript型チェック中..."
	npm run type-check

## check-all: すべてのチェック実行
check-all: lint type-check test
	@echo "✅ すべてのチェック完了"

# ===================================
# データベース
# ===================================

## db-generate: Prisma Clientを生成
db-generate:
	@echo "⚡ Prisma Clientを生成中..."
	npm run db:generate

## db-push: スキーマをDBにプッシュ
db-push:
	@echo "📤 スキーマをDBにプッシュ中..."
	npm run db:push

## db-seed: シードデータを投入
db-seed:
	@echo "🌱 シードデータを投入中..."
	npm run db:seed

## db-test: DB接続をテスト
db-test:
	@echo "🔌 DB接続をテスト中..."
	npm run db:test

# ===================================
# Docker
# ===================================

## docker-build: Dockerイメージをビルド
docker-build:
	@echo "🐳 Dockerイメージをビルド中..."
	docker build -t $(SERVICE_NAME):latest .

## docker-up: Docker Composeで起動
docker-up:
	@echo "🐳 Docker Composeで起動中..."
	docker-compose up -d

## docker-down: Docker Composeで停止
docker-down:
	@echo "🐳 Docker Composeで停止中..."
	docker-compose down

## docker-clean: Dockerリソースを削除
docker-clean:
	@echo "🧹 Dockerリソースを削除中..."
	docker-compose down -v
	docker rmi $(SERVICE_NAME):latest || true

# ===================================
# デプロイ
# ===================================

## deploy-build: デプロイ用イメージをビルド
deploy-build:
	@echo "🏗️  デプロイ用イメージをビルド中..."
	gcloud builds submit --tag $(REGISTRY)/app:latest

## deploy: Google Cloud Runにデプロイ
deploy: deploy-build
	@echo "🚀 Google Cloud Runにデプロイ中..."
	gcloud run deploy $(SERVICE_NAME) \
		--image $(REGISTRY)/app:latest \
		--platform managed \
		--region $(REGION) \
		--no-allow-unauthenticated \
		--memory 512Mi \
		--cpu 1 \
		--min-instances 0 \
		--max-instances 1 \
		--timeout 300 \
		--set-env-vars NODE_ENV=production \
		--set-secrets DATABASE_URL=DATABASE_URL:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest
	@echo "✅ デプロイ完了"
	@echo "💡 アクセスするには: make proxy"

## proxy: Cloud Runサービスにプロキシ経由でアクセス
proxy:
	@echo "🔗 プロキシを起動中... (http://localhost:8080)"
	gcloud run services proxy $(SERVICE_NAME) --region=$(REGION)
