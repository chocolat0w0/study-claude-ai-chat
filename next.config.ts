import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker デプロイ用に standalone モードを有効化
  output: 'standalone',
};

export default nextConfig;
