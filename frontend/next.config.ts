import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  // ローカル開発時のみ有効: /api/* をバックエンドへプロキシ
  // 本番は nginx が /api/* をバックエンドコンテナへルーティングする
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:8081"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
