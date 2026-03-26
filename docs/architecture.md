# アーキテクチャ概要

## システム構成

```
[ブラウザ]
    ↓ HTTP
[nginx] (自宅サーバー・リバースプロキシ)
    ├── :3000 → [frontend コンテナ] Next.js
    └── :8081 → [backend コンテナ]  Spring Boot
```

## フロントエンド (Next.js)

- **フレームワーク**: Next.js 16 / App Router
- **言語**: TypeScript
- **スタイル**: CSS Modules
- **ポート**: 3000

### ページ構成
| パス | 概要 |
|---|---|
| `/` | トップページ（ツール一覧）|
| `/tools/{tool-id}` | 各ツールページ |

### 環境変数
| 変数 | 用途 | デフォルト |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | バックエンドAPIのベースURL | `http://localhost:8081` |

## バックエンド (Spring Boot / Kotlin)

- **フレームワーク**: Spring Boot 3.5
- **言語**: Kotlin 1.9
- **ビルド**: Gradle (Kotlin DSL)
- **ポート**: 8081（ホスト）/ 8080（コンテナ内）

### APIエンドポイント
| メソッド | パス | 概要 |
|---|---|---|
| GET | `/api/tools` | ツール一覧 |
| GET | `/api/tools/uuid/generate` | UUID v4 生成 |
| GET | `/actuator/health` | ヘルスチェック |

## Docker / デプロイ

### イメージ (ghcr.io)
| イメージ | タグ（dev）| タグ（prod）|
|---|---|---|
| `ghcr.io/na0p0n/kitto/backend` | `:dev` | `:v1.0.0`, `:latest` |
| `ghcr.io/na0p0n/kitto/frontend` | `:dev` | `:v1.0.0`, `:latest` |

### Dockerfile 構成（マルチステージ）
- **backend**: `eclipse-temurin:21-jdk-alpine`(build) → `eclipse-temurin:21-jre-alpine`(runtime)
- **frontend**: `node:22-alpine`(build) → `node:22-alpine`(runtime, standalone)

## CI/CD (GitHub Actions)

| ワークフロー | トリガー | 内容 |
|---|---|---|
| `ci.yml` | 全ブランチpush / PR | detekt・test・build（backend）+ lint・build（frontend）|
| `deploy-dev.yml` | `develop`へのpush | `:dev`タグでghcr.ioにpush |
| `deploy-prod.yml` | `v*.*.*`タグpush | semver+`:latest`でghcr.ioにpush + cosign署名 |
