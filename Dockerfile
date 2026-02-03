# ベースイメージとして Node.js を使用
FROM node:22-alpine AS base

# 依存関係インストール用ステージ
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./
# Prisma スキーマもコピー（generate時に必要）
COPY prisma ./prisma/

# 依存関係をインストール
RUN npm ci --legacy-peer-deps

# Prisma Client を生成
RUN npx prisma generate

# ビルド用ステージ
FROM base AS builder
WORKDIR /app

# 依存関係を deps ステージからコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js のテレメトリーを無効化
ENV NEXT_TELEMETRY_DISABLED=1

# アプリケーションをビルド
RUN npm run build

# 本番環境用ステージ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# セキュリティのため非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ビルド成果物をコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma スキーマとクライアントをコピー
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# nextjs ユーザーに所有権を変更
RUN chown -R nextjs:nodejs /app

# nextjs ユーザーに切り替え
USER nextjs

# ポート3000を公開
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# アプリケーションを起動
CMD ["node", "server.js"]
