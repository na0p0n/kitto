# CLAUDE.md — Kitto プロジェクト指示書

このファイルはClaude Codeが自動で読み込むプロジェクト固有の指示書です。
どのPCからアクセスしても、ここに書かれたルールに従って作業してください。

---

## ブランチルール（必須）

**git-flowに則ること。作業は必ずブランチを作成し、PRを通してマージすること。**

| ブランチ | 用途 | 派生元 | マージ先 |
|---|---|---|---|
| `main` | 本番リリース | `release/*` / `hotfix/*` | — |
| `develop` | 統合・dev環境 | `main` | — |
| `feature/*` | 機能追加 | `develop` | `develop` |
| `release/*` | リリース準備 | `develop` | `main` + `develop` |
| `hotfix/*` | 緊急修正 | `main` | `main` + `develop` |

### ブランチ命名例
- `feature/uuid-tool`
- `feature/warikan-tool`
- `hotfix/fix-cors-config`
- `release/v1.0.0`

### 作業フロー
1. `develop` から `feature/*` ブランチを切る
2. 変更をコミット
3. `feature/*` → `develop` へPRを作成
4. リリース時は `release/*` を経由して `main` へ

### デプロイトリガー
- **dev環境**: `develop` へのpush → ghcr.ioに `:dev` タグでpush
- **本番環境**: `v*.*.*` タグのpush → ghcr.ioにsemver + `:latest` でpush

---

## プロジェクト概要

**Kitto（きっと）** — きっといつか役に立つ、ちょっと便利でちょっと面白いツール集。

### 技術スタック
| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router, TypeScript) |
| バックエンド | Spring Boot 3.5 (Kotlin) |
| インフラ | Docker Compose / 自宅サーバー / nginx |
| イメージレジストリ | ghcr.io |

### ディレクトリ構成
```
kitto/
├── CLAUDE.md              ← このファイル
├── docker-compose.yml
├── frontend/              ← Next.js
│   ├── src/app/
│   │   ├── page.tsx       ← トップ（ツール一覧）
│   │   └── tools/
│   │       └── {tool}/    ← 各ツールページ
│   └── Dockerfile
├── backend/               ← Spring Boot (Kotlin)
│   ├── src/main/kotlin/com/kitto/backend/
│   │   ├── config/        ← CorsConfig等
│   │   └── tools/         ← ツールごとのController
│   ├── config/detekt/     ← 静的解析設定
│   └── Dockerfile
└── .github/workflows/
    ├── ci.yml             ← CI（全ブランチ）
    ├── deploy-dev.yml     ← dev deploy
    └── deploy-prod.yml    ← prod deploy
```

---

## 開発規約

### 新しいツールを追加するとき
1. バックエンド: `backend/src/main/kotlin/com/kitto/backend/tools/` に Controller を追加
2. フロントエンド: `frontend/src/app/tools/{tool-id}/page.tsx` を作成
3. トップページ: `frontend/src/app/page.tsx` の `TOOLS` 配列にエントリを追加

### バックエンド (Kotlin)
- エンドポイントは `/api/tools/{tool-id}/` 以下に定義
- CORSは `CorsConfig.kt` で管理（`kitto.cors.allowed-origins` プロパティ）
- detektの静的解析が必ずCIで実行される

### フロントエンド (Next.js)
- スタイルはCSS Modules（`*.module.css`）を使用
- クライアントコンポーネントには `"use client"` を明示
- API呼び出し先は `NEXT_PUBLIC_API_URL` 環境変数で切り替え

---

## ローカル起動

```bash
# バックエンド (port 8081)
cd backend && ./gradlew bootRun

# フロントエンド (port 3000)
cd frontend && npm run dev

# Docker Compose で両方まとめて
docker compose up --build
```

---

## GitHub

- リポジトリ: https://github.com/na0p0n/kitto
- gh CLI は未インストールのため、PRはURLをユーザーに案内する
